/* ==========================================================================
   /track — clients follow their own jobs step by step.

   Logged out: a prompt to log in (or create an account), and they come back
   here afterwards. Logged in: each of their jobs with the five steps, the date
   each step was finished, the team's note, and site photos.
   Jobs are created and updated by the owner in /admin.
   ========================================================================== */
import { useCallback, useEffect, useState } from 'react';
import { PageHero } from '../components/ui.jsx';
import { Link, useRouter } from '../lib/router.jsx';
import { useSeo } from '../lib/seo.js';
import { useAuth } from '../lib/auth.jsx';
import { api, apiUrl } from '../lib/api.js';
import { rememberReturn } from '../lib/afterLogin.js';
import { JOB_STEPS, stepState, formatStepDate } from '../lib/jobSteps.js';
import '../track.css';

const STATE_LABEL = { done: 'Done', now: 'In progress', next: 'Up next' };

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

function JobCard({ job, onOpenPhoto }) {
  const done = job.completed_steps;
  const finished = done >= JOB_STEPS.length;
  const status = finished ? 'Completed' : JOB_STEPS[done];
  const meta = [job.location, job.service].filter(Boolean).join(' · ');

  return (
    <article className="tk-job">
      <header className="tk-job-head">
        <div>
          <h2 className="tk-job-title">{job.title}</h2>
          {meta ? <p className="tk-job-meta">{meta}</p> : null}
        </div>
        <span className={`tk-status${finished ? ' is-done' : ''}`}>{status}</span>
      </header>

      <div className="tk-progress" aria-label={`${done} / ${JOB_STEPS.length}`}>
        <div className="tk-progress-bar"><i style={{ width: `${(done / JOB_STEPS.length) * 100}%` }} /></div>
        <span className="tk-progress-count"><b>{done}</b> / {JOB_STEPS.length}</span>
      </div>

      <ol className="tk-steps">
        {JOB_STEPS.map((title, i) => {
          const state = finished ? 'done' : stepState(i, done);
          const photos = job.photos.filter((p) => p.step === i);
          const note = job.step_notes[i];
          const date = formatStepDate(job.step_dates[i]);
          return (
            <li key={title} className={`tk-step is-${state}`}>
              <span className="tk-dot" aria-hidden="true">{state === 'done' ? <Tick /> : <b>{i + 1}</b>}</span>
              <div className="tk-step-body">
                <div className="tk-step-top">
                  <h3>{title}</h3>
                  <span className={`tk-tag tk-tag-${state}`}>{STATE_LABEL[state]}</span>
                  {date ? <time className="tk-date">{date}</time> : null}
                </div>
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
        })}
      </ol>
    </article>
  );
}

export function TrackPage() {
  const { user, ready } = useAuth();
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState(null);
  const closePhoto = useCallback(() => setPhoto(null), []);

  useSeo({
    title: 'Track my job',
    description: 'Follow your Synnex Technology job step by step, with notes and site photos.',
    path: '/track',
  });

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    setError('');
    api.myJobs()
      .then((data) => { if (active) setJobs(data.jobs || []); })
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

            {jobs && jobs.map((job) => <JobCard key={job.id} job={job} onOpenPhoto={setPhoto} />)}
          </div>
        </section>
      )}

      {photo ? <Lightbox photo={photo} onClose={closePhoto} /> : null}
    </>
  );
}
