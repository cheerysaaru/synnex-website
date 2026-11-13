/* Route switch for every inner page. Home ("/") is rendered by App.jsx. */
import { useRouter } from '../lib/router.jsx';
import { AboutPage, TeamPage, SafetyPage, CertificationsPage, CareersPage } from './CompanyPages.jsx';
import { NewsPage, NewsArticlePage } from './NewsPages.jsx';
import { SolutionsOverviewPage, SolutionPage } from './SolutionPages.jsx';
import { BlogPage, BlogArticlePage, DocsPage, FaqPage, SafetyChecklistPage, SolarGuidePage } from './ResourcePages.jsx';
import { CaseStudiesPage, CaseStudyPage } from './CaseStudyPages.jsx';
import { ContactPage, NotFoundPage } from './MiscPages.jsx';
import { LoginPage } from './LoginPage.jsx';
import { PortalPage } from './PortalPage.jsx';
import { AdminPage } from './AdminPage.jsx';

export function PageRoutes() {
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
  if (path === '/admin') return <AdminPage />;

  /* Nav compatibility: /projects and /contact must resolve too. */
  if (path === '/projects') return <CaseStudiesPage />;
  if (path === '/contact') return <ContactPage />;

  return <NotFoundPage />;
}
