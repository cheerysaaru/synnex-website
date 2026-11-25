/* ==========================================================================
   /track — clients follow their own jobs step by step.

   Logged out: a prompt to log in (or create an account), and they come back
   here afterwards. Logged in: each of their jobs with the five steps, the date
   each step was finished, the team's note, and site photos.
   Jobs are created and updated by the owner in /admin.
   ========================================================================== */
import { useCallback, useEffect, useRef, useState } from 'react';
import { PageHero } from '../components/ui.jsx';
import { Link, useRouter } from '../lib/router.jsx';
import { useSeo } from '../lib/seo.js';
import { useAuth } from '../lib/auth.jsx';
import { api, apiUrl } from '../lib/api.js';
import { rememberReturn } from '../lib/afterLogin.js';
import { JOB_STEPS, formatStepDate } from '../lib/jobSteps.js';
import { BANK, formatLKR, paymentGates, stepStateWithPayments, jobStatus, DEPOSIT_GATE, FINAL_GATE } from '../lib/payment.js';
import { company } from '../data/site-data.js';
import '../track.css';

const STATE_LABEL = { done: 'Done', now: 'In progress', next: 'Up next', locked: 'Locked' };
const LOCK_HINT = { deposit: 'Starts after the deposit is paid', final: 'After the full payment is received' };

function Tick() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

function LoginGate() {
  const { navigate } = useRouter();
  const go = (path) => {
    rememberReturn('/track');
    navigate(path);
  };
  return (
    <section className="sec">
      <div className="w">
        <div className="tk-gate">
          <span className="tk-gate-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
          <h2>Log in to track your job</h2>
          <p>Your job's progress, notes and site photos are private. Log in with your Synnex account to see them.</p>
          <div className="tk-gate-actions">
            <button type="button" className="btn" onClick={() => go('/login')}>Log in</button>
            <button type="button" className="btn ghost" onClick={() => go('/register')}>Create an account</button>
          </div>
          <p className="tk-gate-small">
            No job with us yet? <Link to="/contact">Send an enquiry</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

function Lightbox({ photo, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="tk-lightbox" role="dialog" aria-modal="true" aria-label={photo.caption || 'Site photo'} onClick={onClose}>
      <figure onClick={(e) => e.stopPropagation()}>
        <img src={apiUrl(photo.url)} alt={photo.caption || ''} />
        {photo.caption ? <figcaption>{photo.caption}</figcaption> : null}
        <button type="button" className="tk-lightbox-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </figure>
    </div>
  );
}

function PaymentDialog({ job, gate, onClose }) {
  const [copied, setCopied] = useState(false);
  const title = gate.kind === 'deposit' ? 'Pay your deposit' : 'Pay the final balance';
  const amount = formatLKR(gate.amount);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const details = `${BANK.bank}\nAccount name: ${BANK.holder}\nAccount number: ${BANK.account}\nAmount: ${amount}\nReference: ${gate.reference}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(details);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  const message = `Hello Synnex, I have paid ${amount} for "${job.title}". Reference: ${gate.reference}. Receipt attached.`;

  return (
    <div className="tk-pay-overlay" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="tk-pay" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="tk-pay-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <h2>{title}</h2>
        <dl className="tk-pay-sum">
          <div><dt>Amount</dt><dd className="tk-pay-amount">{amount}</dd></div>
          <div><dt>Reference</dt><dd><b>{gate.reference}</b></dd></div>
        </dl>
        <div className="tk-pay-bank">
          <span className="tk-pay-label">Bank transfer</span>
          <dl>
            <div><dt>Bank</dt><dd>{BANK.bank}</dd></div>
            <div><dt>Account name</dt><dd>{BANK.holder}</dd></div>
            <div><dt>Account number</dt><dd><b>{BANK.account}</b></dd></div>
          </dl>
        </div>
        <p className="tk-pay-note">Please write the reference on your transfer, then send us the receipt. We confirm payments within one working day and your next steps unlock.</p>
        <div className="tk-pay-actions">
          <a className="btn" href={`https://wa.me/${company.whatsapp}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer">Send receipt on WhatsApp</a>
          <button type="button" className="btn ghost" onClick={copy}>{copied ? 'Copied' : 'Copy details'}</button>
        </div>
        <p className="tk-pay-small">Or email the receipt to <a href={`${company.emailHref}?subject=${encodeURIComponent(`Payment ${gate.reference}`)}`}>{company.email}</a></p>
      </div>
    </div>
  );
}

function PaymentCheckpoint({ gate, onPay }) {
  const label = gate.kind === 'deposit' ? `Deposit (${gate.percent}%)` : `Final payment (${gate.percent}%)`;
  const hint = {
    due: gate.kind === 'deposit' ? 'Payment due. Work starts once we receive it.' : 'Payment due before handover.',
    upcoming: gate.kind === 'deposit' ? 'Due after the quote is approved.' : 'Due before handover.',
    paid: `Paid ${formatStepDate(gate.paidAt)}`,
  }[gate.state];

  return (
    <li className={`tk-gate-item is-${gate.state}`}>
      <span className="tk-coin" aria-hidden="true">
        {gate.state === 'paid' ? <Tick /> : (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M7 15h3" /></svg>
        )}
      </span>
      <div className="tk-gate-card">
        <div className="tk-gate-top">
          <strong>{label}</strong>
          {gate.amount !== null ? <span className="tk-gate-amount">{formatLKR(gate.amount)}</span> : null}
        </div>
        <span className="tk-gate-hint">{hint}</span>
        {gate.state === 'due' && gate.amount !== null ? (
          <button type="button" className="btn tk-pay-btn" onClick={() => onPay(gate)}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /></svg>
            Payment
          </button>
        ) : null}
        {gate.state === 'due' && gate.amount === null ? <span className="tk-gate-hint">We will add the amount shortly.</span> : null}
      </div>
    </li>
  );
}

function JobCard({ job, onOpenPhoto }) {
  const done = job.completed_steps;
  const status = jobStatus(job);
  const gates = paymentGates(job);
  const [paying, setPaying] = useState(null);
  const closePay = useCallback(() => setPaying(null), []);
  const quote = job.payment?.quote_amount;
  const meta = [job.location, job.service, quote ? `Quote ${formatLKR(quote)}` : null].filter(Boolean).join(' · ');

  return (
    <article className="tk-job">
      <header className="tk-job-head">
        <div>
          <h2 className="tk-job-title">{job.title}</h2>
          {meta ? <p className="tk-job-meta">{meta}</p> : null}
        </div>
        <span className={`tk-status is-${status.tone}`}>{status.text}</span>
      </header>

      <div className="tk-progress" aria-label={`${done} / ${JOB_STEPS.length}`}>
        <div className="tk-progress-bar"><i style={{ width: `${(done / JOB_STEPS.length) * 100}%` }} /></div>
        <span className="tk-progress-count"><b>{done}</b> / {JOB_STEPS.length}</span>
      </div>

      <ol className="tk-steps">
        {JOB_STEPS.map((title, i) => {
          const state = stepStateWithPayments(i, job);
          const lockHint = state === 'locked' ? LOCK_HINT[i === FINAL_GATE ? 'final' : 'deposit'] : '';
          const photos = job.photos.filter((p) => p.step === i);
          const note = job.step_notes[i];
          const date = formatStepDate(job.step_dates[i]);
          const step = (
            <li key={title} className={`tk-step is-${state}`}>
              <span className="tk-dot" aria-hidden="true">
                {state === 'done' ? <Tick /> : state === 'locked' ? (
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
                ) : <b>{i + 1}</b>}
              </span>
              <div className="tk-step-body">
                <div className="tk-step-top">
                  <h3>{title}</h3>
                  <span className={`tk-tag tk-tag-${state}`}>{STATE_LABEL[state]}</span>
                  {date ? <time className="tk-date">{date}</time> : null}
                </div>
                {lockHint ? <p className="tk-lock-hint">{lockHint}</p> : null}
                {note ? <p className="tk-note">{note}</p> : null}
                {photos.length ? (
                  <div className="tk-photos">
                    {photos.map((p) => (
                      <button type="button" key={p.id} className="tk-photo" onClick={() => onOpenPhoto(p)} aria-label={p.caption || 'Open photo'}>
                        <img src={apiUrl(p.url)} alt={p.caption || ''} loading="lazy" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </li>
          );
          if (i === DEPOSIT_GATE - 1) return [step, <PaymentCheckpoint key="deposit" gate={gates.deposit} onPay={setPaying} />];
          if (i === FINAL_GATE) return [<PaymentCheckpoint key="final" gate={gates.final} onPay={setPaying} />, step];
          return step;
        })}
      </ol>
      {paying ? <PaymentDialog job={job} gate={paying} onClose={closePay} /> : null}
    </article>
  );
}

/* Which job to open first: one waiting on a payment, then one in progress, then the newest. */
function pickDefaultJob(jobs) {
  const due = jobs.find((j) => jobStatus(j).tone === 'due');
  const live = jobs.find((j) => jobStatus(j).tone === 'live');
  return (due || live || jobs[0]).id;
}

/* Dropdown shown when a client has more than one job: one job is open at a time. */
function JobPicker({ jobs, selectedId, onSelect }) {
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(0);
  const wrapRef = useRef(null);
  const listRef = useRef(null);
  const selected = jobs.find((j) => j.id === selectedId) || jobs[0];
  const status = jobStatus(selected);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.querySelectorAll('[role="option"]')[focus]?.focus();
  }, [open, focus]);

  const toggle = () => {
    setFocus(Math.max(0, jobs.findIndex((j) => j.id === selected.id)));
    setOpen((v) => !v);
  };
  const choose = (id) => { onSelect(id); setOpen(false); wrapRef.current?.querySelector('.tk-pick-btn')?.focus(); };
  const onListKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocus((f) => (f + 1) % jobs.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setFocus((f) => (f - 1 + jobs.length) % jobs.length); }
    else if (e.key === 'Home') { e.preventDefault(); setFocus(0); }
    else if (e.key === 'End') { e.preventDefault(); setFocus(jobs.length - 1); }
    else if (e.key === 'Escape' || e.key === 'Tab') { setOpen(false); if (e.key === 'Escape') wrapRef.current?.querySelector('.tk-pick-btn')?.focus(); }
  };

  return (
    <div className={`tk-pick${open ? ' is-open' : ''}`} ref={wrapRef}>
      <div className="tk-pick-label">
        <span>Your jobs</span>
        <b className="tk-pick-count">{jobs.length}</b>
      </div>
      <button
        type="button"
        className="tk-pick-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
        onKeyDown={(e) => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!open) toggle(); } }}
      >
        <span className="tk-pick-main">
          <span className="tk-pick-title">{selected.title}</span>
          <span className="tk-pick-sub">{[selected.location, `${selected.completed_steps} / ${JOB_STEPS.length}`].filter(Boolean).join(' · ')}</span>
        </span>
        <span className={`tk-status is-${status.tone}`}>{status.text}</span>
        <svg className="tk-pick-chev" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {open ? (
        <ul className="tk-pick-list" role="listbox" aria-label="Choose a job" ref={listRef} onKeyDown={onListKey}>
          {jobs.map((job, i) => {
            const st = jobStatus(job);
            const isSel = job.id === selected.id;
            return (
              <li
                key={job.id}
                role="option"
                aria-selected={isSel}
                tabIndex={i === focus ? 0 : -1}
                className={`tk-pick-opt${isSel ? ' is-selected' : ''}`}
                onClick={() => choose(job.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(job.id); } }}
              >
                <span className="tk-pick-main">
                  <span className="tk-pick-title">{job.title}</span>
                  <span className="tk-pick-sub">{[job.location, `${job.completed_steps} / ${JOB_STEPS.length}`].filter(Boolean).join(' · ')}</span>
                </span>
                <span className={`tk-status is-${st.tone}`}>{st.text}</span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export function TrackPage() {
  const { user, ready } = useAuth();
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const closePhoto = useCallback(() => setPhoto(null), []);

  useSeo({
    noindex: true,
    title: 'Track my job',
    description: 'Follow your Synnex Technology job step by step, with notes and site photos.',
    path: '/track',
  });

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    setError('');
    api.myJobs()
      .then((data) => {
        if (!active) return;
        const list = data.jobs || [];
        setJobs(list);
        setSelectedId((cur) => (list.some((j) => j.id === cur) ? cur : list.length ? pickDefaultJob(list) : null));
      })
      .catch((err) => { if (active) setError(err.message || 'Could not load your jobs.'); });
    return () => { active = false; };
  }, [user]);

  return (
    <>
      <PageHero
        eyebrow="Track my job"
        title="Follow your job, step by step."
        intro="See where your job is, what we have done and photos from site."
      />

      {!ready ? (
        <section className="sec"><div className="w"><p className="tk-loading" role="status">Loading…</p></div></section>
      ) : !user ? (
        <LoginGate />
      ) : (
        <section className="sec">
          <div className="w tk-wrap">
            {error ? <p className="auth-error" role="alert">{error}</p> : null}
            {!error && jobs === null ? <p className="tk-loading" role="status">Loading your jobs…</p> : null}

            {jobs && jobs.length === 0 ? (
              <div className="tk-empty">
                <h2>No jobs to track yet</h2>
                <p>When we start work for you, your job will appear here with every step, our notes and site photos.</p>
                <Link className="btn" to="/contact">Send an enquiry</Link>
              </div>
            ) : null}

            {jobs && jobs.length > 1 ? <JobPicker jobs={jobs} selectedId={selectedId} onSelect={setSelectedId} /> : null}
            {jobs && jobs.length > 0 ? (() => {
              const job = jobs.find((j) => j.id === selectedId) || jobs[0];
              return <JobCard key={job.id} job={job} onOpenPhoto={setPhoto} />;
            })() : null}
          </div>
        </section>
      )}

      {photo ? <Lightbox photo={photo} onClose={closePhoto} /> : null}
    </>
  );
}
