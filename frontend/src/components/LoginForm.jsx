/* The sign-in / create-account form. Used by the full /login page on large
   screens and by the pop-up (LoginModal) on small screens. */
import { useEffect, useRef, useState } from 'react';
import { Link } from '../lib/router.jsx';
import { useAuth } from '../lib/auth.jsx';

const USERNAME_RE = /^[A-Za-z0-9._-]+$/;

function validate({ mode, fullName, username, password }) {
  const name = username.trim();

  if (mode === 'signup' && !fullName.trim()) {
    return 'Enter your full name.';
  }
  if (!name) {
    return 'Enter your username.';
  }
  if (name.length < 3 || name.length > 30) {
    return 'Usernames must be between 3 and 30 characters.';
  }
  if (!USERNAME_RE.test(name)) {
    return 'Usernames can only use letters, numbers, dots, hyphens and underscores.';
  }
  if (password.length < 8) {
    return 'Passwords must be at least 8 characters.';
  }
  return '';
}

export default function LoginForm({ initialMode = 'login', onSuccess, onNavigate, idPrefix = 'login', titleAs: TitleTag = 'h1' }) {
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState(initialMode);
  const [values, setValues] = useState({ fullName: '', username: '', password: '' });
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const timerRef = useRef(0);



  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const onChange = (event) => {
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    if (error) setError('');
  };

  const switchMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
    setError('');
    setShowPassword(false);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (busy || done) return;

    const message = validate({ mode, ...values });
    if (message) {
      setError(message);
      return;
    }

    setError('');
    setBusy(true);

    try {
      if (mode === 'login') {
        await signIn(values.username.trim(), values.password, remember);
      } else {
        await signUp(values.fullName.trim(), values.username.trim(), values.password);
      }
      setDone(true);
      timerRef.current = window.setTimeout(() => onSuccess?.(), 1000);
    } catch (err) {
      const firstField = err.errors && Object.values(err.errors)[0];
      setError(
        Array.isArray(firstField)
          ? firstField[0]
          : err.message || 'Something went wrong. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  const isLogin = mode === 'login';
  const submitLabel = isLogin ? 'Sign in' : 'Create account';
  const busyLabel = isLogin ? 'Signing in…' : 'Creating account…';

  return (
    <div className="login-form-wrap">
      <TitleTag className="login-title" id={`${idPrefix}-title`}>{isLogin ? 'Welcome back' : 'Create your account'}</TitleTag>
      <p className="login-intro">
        {isLogin
          ? 'Sign in to track your quotes, bookings and test certificates.'
          : 'Set up an account to keep everything in one place.'}
      </p>

      {done ? (
        <div className="login-success">
          <span className="login-spinner" aria-hidden="true" />
          <p role="status">Signed in. Taking you to the home page…</p>
        </div>
      ) : (
        <form className="login-form" onSubmit={onSubmit} noValidate>
          {!isLogin ? (
            <label className="login-field" htmlFor={`${idPrefix}-fullName`}>
              <span>Full name</span>
              <input
                id={`${idPrefix}-fullName`}
                name="fullName"
                type="text"
                value={values.fullName}
                onChange={onChange}
                autoComplete="name"
                placeholder="e.g. Kasun Perera"
                required
              />
            </label>
          ) : null}

          <label className="login-field" htmlFor={`${idPrefix}-username`}>
            <span>Username</span>
            <input
              id={`${idPrefix}-username`}
              name="username"
              type="text"
              value={values.username}
              onChange={onChange}
              autoComplete="username"
              placeholder="your.username"
              minLength={3}
              maxLength={30}
              required
            />
          </label>

          <label className="login-field" htmlFor={`${idPrefix}-password`}>
            <span>Password</span>
            <span className="login-password">
              <input
                id={`${idPrefix}-password`}
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                onChange={onChange}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                placeholder={isLogin ? 'Your password' : 'At least 8 characters'}
                minLength={8}
                required
              />
              <button
                type="button"
                className="login-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </span>
          </label>

          {isLogin ? (
            <div className="login-row">
              <label className="login-check">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link className="login-forgot" to="/contact" onClick={onNavigate}>Forgot password?</Link>
            </div>
          ) : null}

          {error ? <p className="login-error" role="alert">{error}</p> : null}

          <button className="login-submit" type="submit" disabled={busy}>
            {busy ? (
              <>
                <span className="login-spinner" aria-hidden="true" />
                {busyLabel}
              </>
            ) : submitLabel}
          </button>

          <p className="login-alt">
            {isLogin ? (
              <>
                New to Synnex?{' '}
                <button type="button" className="login-switch" onClick={switchMode}>
                  Create account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" className="login-switch" onClick={switchMode}>
                  Sign in
                </button>
              </>
            )}
          </p>
        </form>
      )}
    </div>
  );
}
