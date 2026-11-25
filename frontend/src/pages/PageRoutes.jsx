/* Route switch for every inner page. Home ("/") is rendered by App.jsx.
   Each group of pages is its own file that loads only when it is opened,
   so the home page downloads less JavaScript. */
import { Suspense, lazy } from 'react';
import { useRouter } from '../lib/router.jsx';

const page = (load, name) => lazy(() => load().then((m) => ({ default: m[name] })));
const company = () => import('./CompanyPages.jsx');
const news = () => import('./NewsPages.jsx');
const solutions = () => import('./SolutionPages.jsx');
const resources = () => import('./ResourcePages.jsx');
const cases = () => import('./CaseStudyPages.jsx');
const misc = () => import('./MiscPages.jsx');

const AboutPage = page(company, 'AboutPage');
const TeamPage = page(company, 'TeamPage');
const SafetyPage = page(company, 'SafetyPage');
const CertificationsPage = page(company, 'CertificationsPage');
const CareersPage = page(company, 'CareersPage');
const NewsPage = page(news, 'NewsPage');
const NewsArticlePage = page(news, 'NewsArticlePage');
const SolutionsOverviewPage = page(solutions, 'SolutionsOverviewPage');
const SolutionPage = page(solutions, 'SolutionPage');
const BlogPage = page(resources, 'BlogPage');
const BlogArticlePage = page(resources, 'BlogArticlePage');
const DocsPage = page(resources, 'DocsPage');
const FaqPage = page(resources, 'FaqPage');
const SafetyChecklistPage = page(resources, 'SafetyChecklistPage');
const SolarGuidePage = page(resources, 'SolarGuidePage');
const CaseStudiesPage = page(cases, 'CaseStudiesPage');
const CaseStudyPage = page(cases, 'CaseStudyPage');
const ContactPage = page(misc, 'ContactPage');
const NotFoundPage = page(misc, 'NotFoundPage');
const LoginPage = page(() => import('./LoginPage.jsx'), 'LoginPage');
const PortalPage = page(() => import('./PortalPage.jsx'), 'PortalPage');
const TrackPage = page(() => import('./TrackPage.jsx'), 'TrackPage');
const AdminPage = page(() => import('./AdminPage.jsx'), 'AdminPage');
const CookiesPage = page(() => import('./CookiesPage.jsx'), 'CookiesPage');
const areas = () => import('./AreaPages.jsx');
const AreasPage = page(areas, 'AreasPage');
const AreaPage = page(areas, 'AreaPage');

function Route() {
  const { path } = useRouter();

  if (path === '/about') return <AboutPage />;
  if (path === '/team') return <TeamPage />;
  if (path === '/safety') return <SafetyPage />;
  if (path === '/certifications') return <CertificationsPage />;
  if (path === '/careers') return <CareersPage />;

  if (path === '/solutions') return <SolutionsOverviewPage />;
  const solutionMatch = path.match(/^\/solutions\/([^/]+)$/);
  if (solutionMatch) return <SolutionPage slug={solutionMatch[1]} />;

  if (path === '/news') return <NewsPage />;
  const newsMatch = path.match(/^\/news\/([^/]+)$/);
  if (newsMatch) return <NewsArticlePage slug={newsMatch[1]} />;

  if (path === '/blog') return <BlogPage />;
  const blogMatch = path.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) return <BlogArticlePage slug={blogMatch[1]} />;

  if (path === '/case-studies') return <CaseStudiesPage />;
  const caseMatch = path.match(/^\/case-studies\/([^/]+)$/);
  if (caseMatch) return <CaseStudyPage slug={caseMatch[1]} />;

  if (path === '/docs') return <DocsPage />;
  if (path === '/faq') return <FaqPage />;
  if (path === '/resources/safety-checklist') return <SafetyChecklistPage />;
  if (path === '/resources/solar-guide') return <SolarGuidePage />;

  if (path === '/login' || path === '/register') return <LoginPage />;
  if (path === '/portal') return <PortalPage />;
  if (path === '/track') return <TrackPage />;
  if (path === '/admin') return <AdminPage />;
  if (path === '/cookies') return <CookiesPage />;

  if (path === '/areas') return <AreasPage />;
  const areaMatch = path.match(/^\/areas\/([^/]+)$/);
  if (areaMatch) return <AreaPage slug={areaMatch[1]} />;

  /* Nav compatibility: /projects and /contact must resolve too. */
  if (path === '/projects') return <CaseStudiesPage />;
  if (path === '/contact') return <ContactPage />;

  return <NotFoundPage />;
}

export function PageRoutes() {
  return (
    <Suspense fallback={<div className="page-loading" aria-busy="true" style={{ minHeight: '70vh' }} />}>
      <Route />
    </Suspense>
  );
}
