/* Private portal: recent company updates + the signed-in user's enquiries. */
import { useEffect, useMemo, useState } from 'react';
import { PageHero, SectionHeading, Card, Badge, CTABand } from '../components/ui.jsx';
import { Link, useRouter } from '../lib/router.jsx';
import { useSeo } from '../lib/seo.js';
import { useAuth } from '../lib/auth.jsx';
import { api } from '../lib/api.js';
import { formatDate } from '../lib/format.js';
import { news, blog } from '../data/site-data.js';

const formatStamp = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export function PortalPage() {
  const { user, ready, logout } = useAuth();
  const { navigate } = useRouter();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useSeo({
    title: 'Your portal',
    description: 'Recent Synnex Technology updates and the enquiries you have sent.',
    path: '/portal',
  });

  useEffect(() => {
    if (ready && !user) navigate('/login', { replace: true });
  }, [ready, user, navigate]);

  useEffect(() => {
    if (!user) return undefined;

    let active = true;
    setLoading(true);
    setError('');

    api.myEnquiries()
      .then((data) => {
        if (active) setEnquiries(data.enquiries || []);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Could not load your enquiries.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [user]);

  const updates = useMemo(
    () => [
      ...news.posts.map((post) => ({ ...post, base: '/news', kind: 'Company update' })),
      ...blog.posts.map((post) => ({ ...post, base: '/blog', kind: 'Article' })),
    ]
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .slice(0, 6),
    [],
  );

  if (!ready || !user) {
    return (
      <PageHero eyebrow="Portal" title="Loading your account." intro="One moment while we check your session." />
    );
  }

  const onLogout = async () => {
    await logout();
  };

  return (
    <>
      <PageHero eyebrow="Portal" title={`Welcome back, ${user.fullName || user.name}.`} intro={`@${user.username}`}>
        {user.is_admin ? <Link className="btn ghost" to="/admin">Owner dashboard</Link> : null}
        <button className="btn ghost" type="button" onClick={onLogout}>Log out</button>
      </PageHero>

      <section className="sec">
        <div className="w portal-grid">
          <div>
            <SectionHeading eyebrow="Updates" title="Recent company updates." intro="News and field notes from the team." />
            <div className="update-list">
              {updates.map((post) => (
                <Card key={`${post.base}-${post.slug}`} href={`${post.base}/${post.slug}`} className="update-item">
                  <div className="update-meta">
                    <Badge>{post.kind}</Badge>
                    <span>{formatDate(post.date)}</span>
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                </Card>
              ))}
            </div>
            <p className="portal-links">
              <Link to="/news">All news</Link>
              <Link to="/blog">All articles</Link>
            </p>
          </div>

          <div>
            <SectionHeading eyebrow="Your account" title="My enquiries." intro="Messages you have sent through our contact form." />

            {loading ? <p className="portal-note" role="status">Loading your enquiries…</p> : null}
            {error ? <p className="auth-error" role="alert">{error}</p> : null}

            {!loading && !error && enquiries.length === 0 ? (
              <div className="portal-empty">
                <p>You have not sent an enquiry yet.</p>
                <Link className="btn" to="/contact">Send an enquiry</Link>
              </div>
            ) : null}

            <div className="enquiry-list">
              {enquiries.map((item) => (
                <article className="enquiry-item" key={item.id}>
                  <div className="enquiry-top">
                    <strong>{item.service}</strong>
                    <Badge tone="badge-ok">Received</Badge>
                  </div>
                  <span className="enquiry-date">Sent {formatStamp(item.created_at)}</span>
                  <p>{item.message}</p>
                  <span className="enquiry-contact">Reply to {item.email}</span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTABand intro="Need to add details to an enquiry? Call or WhatsApp the team directly." />
    </>
  );
}
