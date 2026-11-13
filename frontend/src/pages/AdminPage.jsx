/* Owner-only dashboard at /admin. Never linked from the public navigation. */
import { useEffect, useState } from 'react';
import { PageHero, SectionHeading, Badge } from '../components/ui.jsx';
import { Link, useRouter } from '../lib/router.jsx';
import { useSeo } from '../lib/seo.js';
import { useAuth } from '../lib/auth.jsx';
import { api } from '../lib/api.js';
import { formatDate } from '../lib/format.js';

const formatStamp = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

function StatCard({ label, value, note }) {
  return (
    <div className="admin-stat">
      <span className="admin-stat-value">{value}</span>
      <span className="admin-stat-label">{label}</span>
      {note ? <span className="admin-stat-note">{note}</span> : null}
    </div>
  );
}

export function AdminPage() {
  const { user, ready } = useAuth();
  const { navigate } = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useSeo({
    title: 'Owner dashboard',
    description: 'Private owner dashboard.',
    path: '/admin',
  });

  useEffect(() => {
    if (ready && !user) navigate('/login', { replace: true });
  }, [ready, user, navigate]);

  useEffect(() => {
    if (!user || !user.is_admin) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);
    setError('');

    api.adminOverview()
      .then((payload) => {
        if (active) setData(payload);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Could not load the dashboard.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [user]);

  if (!ready || (!user && !error)) {
    return <PageHero eyebrow="Owner" title="Checking access." intro="One moment." />;
  }

  if (user && !user.is_admin) {
    return (
      <PageHero
        eyebrow="Restricted"
        title="This area is not available."
        intro="This dashboard is private to the site owner."
      >
        <Link className="btn" to="/">Back to home</Link>
      </PageHero>
    );
  }

  if (error) {
    return (
      <PageHero eyebrow="Owner" title="Dashboard unavailable." intro={error}>
        <Link className="btn" to="/portal">Back to portal</Link>
      </PageHero>
    );
  }

  if (loading || !data) {
    return <PageHero eyebrow="Owner" title="Loading dashboard." intro="Reading the latest activity." />;
  }

  const { totals, users, enquiries } = data;

  return (
    <>
      <PageHero
        eyebrow="Owner"
        title="Site overview."
        intro="Private view of accounts, sign-ins and enquiries. Only admin accounts can open this page."
      >
        <Link className="btn ghost" to="/portal">Your portal</Link>
      </PageHero>

      <section className="sec">
        <div className="w">
          <SectionHeading eyebrow="Totals" title="At a glance." />
          <div className="admin-stats">
            <StatCard label="Accounts" value={totals.accounts} note="Registered users" />
            <StatCard label="Users who signed in" value={totals.signed_in_users} note="At least once" />
            <StatCard label="Total sign-ins" value={totals.total_logins} note="All time" />
            <StatCard label="Active last 7 days" value={totals.active_last_7_days} note="Recent sign-ins" />
            <StatCard label="Enquiries" value={totals.enquiries} note={`${totals.enquiries_last_7_days} in the last 7 days`} />
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="w">
          <SectionHeading eyebrow="Accounts" title="Who has signed in." intro="Newest activity first. Passwords are never shown." />
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Username</th>
                  <th scope="col">Sign-ins</th>
                  <th scope="col">Last sign-in</th>
                  <th scope="col">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-empty">No accounts yet.</td>
                  </tr>
                ) : users.map((row) => (
                  <tr key={row.id}>
                    <td data-label="Name">{row.name}</td>
                    <td data-label="Username" className="admin-email">@{row.username}</td>
                    <td data-label="Sign-ins">{row.login_count}</td>
                    <td data-label="Last sign-in">{formatStamp(row.last_login_at)}</td>
                    <td data-label="Joined">{formatDate(row.created_at?.slice(0, 10))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="w">
          <SectionHeading eyebrow="Enquiries" title="Contact messages." intro="Everything sent through the website contact form." />
          <div className="admin-enquiries">
            {enquiries.length === 0 ? (
              <p className="portal-note">No enquiries yet.</p>
            ) : enquiries.map((item) => (
              <article className="admin-enquiry" key={item.id}>
                <div className="enquiry-top">
                  <strong>{item.name}</strong>
                  <Badge>{item.service}</Badge>
                </div>
                <span className="enquiry-date">{formatStamp(item.created_at)} · {item.email} · {item.phone}</span>
                <p>{item.message}</p>
                <span className="enquiry-contact">
                  {item.user_id ? `Linked account #${item.user_id}` : 'Guest submission'}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
