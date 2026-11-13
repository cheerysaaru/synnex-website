/* Dependency-free client router: History API + context. */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const RouterContext = createContext(null);

const normalize = (p) => {
  const clean = String(p || '/').split('?')[0].replace(/\/+$/, '');
  return clean || '/';
};

export function RouterProvider({ children }) {
  const [path, setPath] = useState(() => normalize(window.location.pathname));

  useEffect(() => {
    const onPop = () => setPath(normalize(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to, { replace = false } = {}) => {
    if (typeof to !== 'string') return;
    if (to.startsWith('#')) {
      const el = document.querySelector(to);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (to.startsWith('http') || to.startsWith('mailto:') || to.startsWith('tel:')) {
      window.location.href = to;
      return;
    }
    const url = new URL(to, window.location.origin);
    const samePath = normalize(url.pathname) === normalize(window.location.pathname);
    window.history[replace ? 'replaceState' : 'pushState']({}, '', url.pathname + url.search + url.hash);
    setPath(normalize(url.pathname));
    if (samePath && url.hash) {
      const el = document.querySelector(url.hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  const isHome = path === '/';
  const isFront = path === '/';

  const value = useMemo(() => ({ path, navigate, isHome, isFront }), [path, navigate, isHome, isFront]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used inside RouterProvider');
  return ctx;
}

export function Link({ to, children, onClick, ...rest }) {
  const { navigate } = useRouter();
  const handle = (event) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (typeof to !== 'string') return;
    if (to.startsWith('http') || to.startsWith('mailto:') || to.startsWith('tel:')) return;
    event.preventDefault();
    navigate(to);
  };
  return (
    <a href={to} onClick={handle} {...rest}>
      {children}
    </a>
  );
}
