/* ==========================================================================
   AdminJobs — owner tool in /admin to manage what clients see on /track.

   Create a job for a client account, tick steps on/off (each step is dated
   when ticked), write a note per step, add or remove site photos per step,
   edit the job details or delete the job.
   ========================================================================== */
import { useEffect, useState } from 'react';
import { api, apiUrl } from '../lib/api.js';
import { JOB_STEPS, stepState, formatStepDate } from '../lib/jobSteps.js';
import '../admin-jobs.css';

const SERVICES = [
  'Residential wiring',
  'Commercial and industrial',
  'Design and load calculation',
  'Solar PV systems',
  'Panel boards and distribution',
  'Maintenance and inspections',
  'Generator and UPS setup',
];

/* Phone photos are often 4–8 MB: shrink to max 1600px JPEG before uploading. */
async function shrinkPhoto(file, max = 1600) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => { canvas.toBlob(resolve, 'image/jpeg', 0.82); });
    if (!blob) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'photo'}.jpg`, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

function JobEditor({ job, onChange, onDeleted }) {
  const [details, setDetails] = useState({ title: job.title, location: job.location || '', service: job.service || '' });
  const [notes, setNotes] = useState(job.step_notes.map((n) => n || ''));
  const [captions, setCaptions] = useState(['', '', '', '', '']);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setDetails({ title: job.title, location: job.location || '', service: job.service || '' });
    setNotes(job.step_notes.map((n) => n || ''));
  }, [job.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const run = async (label, fn, okText) => {
    setBusy(label);
    setErr('');
    setMsg('');
    try {
      const res = await fn();
      if (res?.job) onChange(res.job);
      if (okText) setMsg(okText);
    } catch (e) {
      setErr(e.message || 'Something went wrong.');
    } finally {
      setBusy('');
    }
  };

  const toggleStep = (i) => {
    const completed = i < job.completed_steps ? i : i + 1;
    run(`step${i}`, () => api.updateJob(job.id, { completed_steps: completed }));
  };

  const saveNotes = () => run('notes', () => api.updateJob(job.id, { step_notes: notes }), 'Notes saved');
  const saveDetails = () => run('details', () => api.updateJob(job.id, details), 'Details saved');

  const addPhotos = async (step, files) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    await run(`photo${step}`, async () => {
      let last = null;
      for (const original of list) {
        const file = await shrinkPhoto(original);
        const form = new FormData();
        form.append('step', String(step));
        form.append('photo', file);
        if (captions[step].trim()) form.append('caption', captions[step].trim());
        last = await api.uploadJobPhoto(job.id, form);
      }
      return last;
    }, list.length > 1 ? `${list.length} photos added` : 'Photo added');
    setCaptions((c) => c.map((v, k) => (k === step ? '' : v)));
  };

  const removePhoto = (photoId) => run(`del${photoId}`, () => api.deleteJobPhoto(photoId), 'Photo removed');

  const deleteJob = async () => {
    setBusy('delete');
    try {
      await api.deleteJob(job.id);
      onDeleted(job.id);
    } catch (e) {
      setErr(e.message || 'Could not delete the job.');
      setBusy('');
    }
  };

  const notesChanged = notes.some((n, i) => (n || '') !== (job.step_notes[i] || ''));

  return (
    <div className="aj-editor">
      <div className="aj-details">
        <label>Job title<input value={details.title} onChange={(e) => setDetails({ ...details, title: e.target.value })} maxLength={160} /></label>
        <label>Location<input value={details.location} onChange={(e) => setDetails({ ...details, location: e.target.value })} maxLength={160} /></label>
        <label>Service
          <input list="aj-services" value={details.service} onChange={(e) => setDetails({ ...details, service: e.target.value })} maxLength={160} />
        </label>
        <button type="button" className="btn ghost aj-small" onClick={saveDetails} disabled={busy === 'details' || !details.title.trim()}>
          {busy === 'details' ? 'Saving…' : 'Save details'}
        </button>
      </div>

      <ol className="aj-steps">
        {JOB_STEPS.map((title, i) => {
          const state = stepState(i, job.completed_steps);
          const photos = job.photos.filter((p) => p.step === i);
          return (
            <li key={title} className={`aj-step is-${state}`}>
              <button
                type="button"
                className="aj-tick"
                onClick={() => toggleStep(i)}
                disabled={busy.startsWith('step')}
                aria-pressed={state === 'done'}
                title={state === 'done' ? 'Untick this step' : 'Mark this step done'}
              >
                {state === 'done' ? '✓' : i + 1}
              </button>
              <div className="aj-step-body">
                <div className="aj-step-top">
                  <strong>{title}</strong>
                  <span className="aj-state">{state === 'done' ? `Done ${formatStepDate(job.step_dates[i])}` : state === 'now' ? 'In progress' : 'Not started'}</span>
                </div>
                <textarea
                  rows={2}
                  placeholder="Note for the client (optional)"
                  value={notes[i]}
                  maxLength={1000}
                  onChange={(e) => setNotes(notes.map((n, k) => (k === i ? e.target.value : n)))}
                />
                <div className="aj-photos">
                  {photos.map((p) => (
                    <figure key={p.id} className="aj-photo">
                      <img src={apiUrl(p.url)} alt={p.caption || ''} loading="lazy" />
                      <button type="button" onClick={() => removePhoto(p.id)} disabled={busy === `del${p.id}`} aria-label="Remove photo">×</button>
                      {p.caption ? <figcaption>{p.caption}</figcaption> : null}
                    </figure>
                  ))}
                </div>
                <div className="aj-upload">
                  <input
                    className="aj-caption"
                    placeholder="Photo caption (optional)"
                    value={captions[i]}
                    maxLength={200}
                    onChange={(e) => setCaptions(captions.map((c, k) => (k === i ? e.target.value : c)))}
                  />
                  <label className={`btn ghost aj-small${busy === `photo${i}` ? ' is-busy' : ''}`}>
                    {busy === `photo${i}` ? 'Uploading…' : 'Add photos'}
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => { addPhotos(i, e.target.files); e.target.value = ''; }} />
                  </label>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="aj-actions">
        <button type="button" className="btn aj-small" onClick={saveNotes} disabled={busy === 'notes' || !notesChanged}>
          {busy === 'notes' ? 'Saving…' : notesChanged ? 'Save notes' : 'Notes saved'}
        </button>
        {msg ? <span className="aj-ok" role="status">{msg}</span> : null}
        {err ? <span className="aj-err" role="alert">{err}</span> : null}
        <span className="aj-spacer" />
        {confirmDelete ? (
          <span className="aj-confirm">
            Delete this job and its photos?
            <button type="button" className="aj-danger" onClick={deleteJob} disabled={busy === 'delete'}>Yes, delete</button>
            <button type="button" className="aj-link" onClick={() => setConfirmDelete(false)}>Cancel</button>
          </span>
        ) : (
          <button type="button" className="aj-link aj-link-danger" onClick={() => setConfirmDelete(true)}>Delete job</button>
        )}
      </div>
    </div>
  );
}

export default function AdminJobs() {
  const [clients, setClients] = useState([]);
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const [form, setForm] = useState({ user_id: '', title: '', location: '', service: '' });
  const [creating, setCreating] = useState(false);
  const [formErr, setFormErr] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([api.adminClients(), api.adminJobs()])
      .then(([c, j]) => {
        if (!active) return;
        setClients(c.clients || []);
        setJobs(j.jobs || []);
      })
      .catch((e) => { if (active) setError(e.message || 'Could not load jobs.'); });
    return () => { active = false; };
  }, []);

  const replaceJob = (job) => setJobs((list) => list.map((j) => (j.id === job.id ? job : j)));
  const removeJob = (id) => setJobs((list) => list.filter((j) => j.id !== id));

  const createJob = async (event) => {
    event.preventDefault();
    setCreating(true);
    setFormErr('');
    try {
      const { job } = await api.createJob({ ...form, user_id: Number(form.user_id) });
      setJobs((list) => [job, ...list]);
      setOpenId(job.id);
      setForm({ user_id: '', title: '', location: '', service: '' });
    } catch (e) {
      setFormErr(e.message || 'Could not create the job.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="aj">
      <datalist id="aj-services">{SERVICES.map((s) => <option key={s} value={s} />)}</datalist>

      <form className="aj-new" onSubmit={createJob}>
        <h3>New job</h3>
        <div className="aj-new-grid">
          <label>Client account
            <select required value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })}>
              <option value="">Choose a client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name} (@{c.username})</option>
              ))}
            </select>
          </label>
          <label>Job title<input required placeholder="Rooftop solar PV system" value={form.title} maxLength={160} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
          <label>Location<input placeholder="Nugegoda" value={form.location} maxLength={160} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
          <label>Service<input list="aj-services" placeholder="Solar PV systems" value={form.service} maxLength={160} onChange={(e) => setForm({ ...form, service: e.target.value })} /></label>
        </div>
        <div className="aj-new-foot">
          <button type="submit" className="btn" disabled={creating}>{creating ? 'Creating…' : 'Create job'}</button>
          {formErr ? <span className="aj-err" role="alert">{formErr}</span> : null}
          <span className="aj-hint">The client must have an account first: ask them to sign up on the website.</span>
        </div>
      </form>

      {error ? <p className="aj-err" role="alert">{error}</p> : null}
      {!error && jobs === null ? <p className="portal-note">Loading jobs…</p> : null}
      {jobs && jobs.length === 0 ? <p className="portal-note">No jobs yet. Create the first one above.</p> : null}

      <div className="aj-list">
        {jobs && jobs.map((job) => {
          const open = openId === job.id;
          const finished = job.completed_steps >= JOB_STEPS.length;
          return (
            <article key={job.id} className={`aj-job${open ? ' is-open' : ''}`}>
              <button type="button" className="aj-job-head" onClick={() => setOpenId(open ? null : job.id)} aria-expanded={open}>
                <span className="aj-job-main">
                  <strong>{job.title}</strong>
                  <span>{job.client ? `${job.client.name} (@${job.client.username})` : 'Unknown client'}{job.location ? ` · ${job.location}` : ''}</span>
                </span>
                <span className={`aj-badge${finished ? ' is-done' : ''}`}>
                  {finished ? 'Completed' : `${job.completed_steps}/5 · ${JOB_STEPS[job.completed_steps]}`}
                </span>
                <span className="aj-chev" aria-hidden="true">{open ? '−' : '+'}</span>
              </button>
              {open ? <JobEditor job={job} onChange={replaceJob} onDeleted={removeJob} /> : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
