/* Small-screen sign-in: a pop-up sheet over the current page instead of the
   full-screen /login layout. Large screens keep the /login page. */
import { useEffect, useRef } from 'react';
import LoginForm from './LoginForm.jsx';

export default function LoginModal({ open, initialMode = 'login', onClose, onSuccess }) {
  const sheetRef = useRef(null);
  const lastFocus = useRef(null);

  /* lock page scroll, close on Escape, keep focus inside, restore focus after */
  useEffect(() => {
    if (!open) return undefined;
    lastFocus.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusFirst = window.setTimeout(() => {
      sheetRef.current?.querySelector('input, button')?.focus();
    }, 60);

    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !sheetRef.current) return;
      const items = [...sheetRef.current.querySelectorAll('a[href], button:not([disabled]), input, select, textarea')];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      window.clearTimeout(focusFirst);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      lastFocus.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="lm" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="lm-sheet" ref={sheetRef} role="dialog" aria-modal="true" aria-labelledby="lm-form-title">
        <span className="lm-grab" aria-hidden="true" />
        <button type="button" className="lm-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <LoginForm
          key={initialMode}
          idPrefix="lm-form"
          titleAs="h2"
          initialMode={initialMode}
          onSuccess={onSuccess}
          onNavigate={onClose}
        />
      </div>
    </div>
  );
}
