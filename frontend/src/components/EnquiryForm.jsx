/* ==========================================================================
   EnquiryForm — the enquiry form used on the home page and the Contact page.

   Sends through api.submitEnquiry (emailed to hello@synnex-technology.com,
   and saved to the backend when it is online). After sending, the form is
   replaced in the same card by a large "Thank you" and a small
   "Submit another enquiry" link. Styles live in home.css (.hm-form,
   .hm-thanks) and need an ancestor with class "hm".
   ========================================================================== */
import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';

const DEFAULT_SERVICES = [
  'Residential wiring',
  'Commercial and industrial',
  'Design and load calculation',
  'Solar PV systems',
  'Panel boards and distribution',
  'Maintenance and inspections',
  'Generator and UPS setup',
];

const plain = (key, fallback) => fallback;

export default function EnquiryForm({ services = DEFAULT_SERVICES, tr = plain }) {
  const blankForm = { name: '', email: '', phone: '', service: services[0], message: '' };
  const [form, setForm] = useState(blankForm);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState('');
  const [cardHeight, setCardHeight] = useState(0);
  const formRef = useRef(null);
  const thanksRef = useRef(null);

  useEffect(() => {
    if (sent && thanksRef.current) thanksRef.current.focus({ preventScroll: true });
  }, [sent]);

  const updateForm = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSending(true);
    setFormError('');
    try {
      await api.submitEnquiry({ ...form });
      if (formRef.current) setCardHeight(formRef.current.offsetHeight);
      setSent(true);
      setForm(blankForm);
    } catch (error) {
      setFormError(error.message || tr('form.error', 'Could not send your enquiry. Please call us instead.'));
    } finally {
      setSending(false);
    }
  };

  const sendAnother = () => {
    setSent(false);
    setFormError('');
  };

  if (sent) {
    return (
      <div className="hm-form hm-thanks" role="status" style={cardHeight ? { minHeight: cardHeight } : undefined}>
        <span className="hm-thanks-tick" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </span>
        <h3 className="hm-thanks-title" tabIndex={-1} ref={thanksRef}>Thank you</h3>
        <p className="hm-thanks-text">Your enquiry has been sent. We will call you back soon, usually within one working day.</p>
        <button type="button" className="hm-thanks-again" onClick={sendAnother}>Submit another enquiry</button>
      </div>
    );
  }

  return (
    <form className="hm-form" onSubmit={handleSubmit} ref={formRef}>
      <label>
        {tr('form.label.name', 'Your name')}
        <input name="name" value={form.name} onChange={updateForm} required autoComplete="name" />
      </label>
      <div className="hm-form-pair">
        <label>
          {tr('form.label.phone', 'Phone number')}
          <input name="phone" type="tel" value={form.phone} onChange={updateForm} required autoComplete="tel" />
        </label>
        <label>
          {tr('form.label.email', 'Email address')}
          <input name="email" type="email" value={form.email} onChange={updateForm} required autoComplete="email" />
        </label>
      </div>
      <label>
        {tr('form.label.service', 'What do you need help with?')}
        <select name="service" value={form.service} onChange={updateForm}>
          {services.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
      </label>
      <label>
        {tr('form.label.message', 'Tell us a little more')}
        <textarea name="message" rows="3" value={form.message} onChange={updateForm} />
      </label>
      <button className="hm-pill hm-pill-dark" type="submit" disabled={sending}>
        {sending ? tr('form.sending', 'Sending…') : tr('form.submit', 'Send enquiry')}
      </button>
      {formError ? <p className="hm-err" role="alert">{formError}</p> : null}
    </form>
  );
}
