/* Standalone /login page: split video + white form panel, with in-place signup. */
import { useEffect } from 'react';
import { Link, useRouter } from '../lib/router.jsx';
import { useSeo } from '../lib/seo.js';
import { useAuth } from '../lib/auth.jsx';
import LoginForm from '../components/LoginForm.jsx';

export function LoginPage() {
  const { user, loading } = useAuth();
  const { path, navigate } = useRouter();

  useSeo({
    title: 'Sign in',
    description: 'Sign in to track your quotes, bookings and test certificates with Synnex Technology.',
    path: '/login',
  });

  /* Already signed in? Send the visitor straight home (never back to /login). */
  useEffect(() => {
    if (!loading && user) navigate('/', { replace: true });
  }, [loading, user, navigate]);

  return (
    <div className="login-page">
      <div className="login-visual">
        <img
          className="login-poster"
          src="/images/login-hero.jpg"
          alt=""
          aria-hidden="true"
        />
        <video
          className="login-video"
          src="/videos/login-hero.mp4"
          poster="/images/login-hero.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />

        <div className="login-top">
          <span className="login-brand">Synnex Technology</span>
          <span className="login-kicker">Electrical engineering</span>
        </div>

        <div className="login-caption">
          <p className="login-line">Engineering you can stand behind.</p>
          <p className="login-sub">
            Track your quotes, bookings and test certificates in one place.
          </p>
        </div>
      </div>

      <div className="login-panel">
        <Link className="login-back" to="/">← Back to home</Link>

        <LoginForm
          initialMode={path === '/register' ? 'signup' : 'login'}
          onSuccess={() => navigate('/', { replace: true })}
        />
      </div>
    </div>
  );
}
