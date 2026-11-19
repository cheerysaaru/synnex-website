import { Suspense, lazy, useState } from "react";
import { HashRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { Lock, LogIn, RefreshCw, ShieldX } from "lucide-react";
import ErrorBoundary from "./components/ErrorBoundary";
import { AppShell } from "./components/AppShell";
import { Wordmark } from "./components/Brand";
import { Button, Spinner } from "./components/ui";
import { AppProvider, useApp } from "./lib/app";
import { goToLogin, logout } from "./lib/api";
import type { DocType } from "./types";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const DocumentsList = lazy(() => import("./pages/DocumentsList"));
const Editor = lazy(() => import("./pages/Editor"));
const Customers = lazy(() => import("./pages/Customers"));
const Catalog = lazy(() => import("./pages/Catalog"));
const SettingsPage = lazy(() => import("./pages/Settings"));

function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner />
    </div>
  );
}

/* Shown until the website's admin login is confirmed by the API. */
function AccessGate() {
  const { gate, reconnect, settings } = useApp();
  const [busy, setBusy] = useState(false);
  const copy = {
    login: { icon: <Lock className="h-4 w-4" />, title: "Admin login required", text: "Log in with your Synnex admin account to open quotations and invoices." },
    forbidden: { icon: <ShieldX className="h-4 w-4" />, title: "No access", text: "This account cannot open quotations. Log out and sign in with the admin account." },
    offline: { icon: <RefreshCw className="h-4 w-4" />, title: "Cannot reach the server", text: "Check your internet connection and try again." },
  }[gate || "login"];
  return (
    <div className="flex min-h-screen items-center justify-center bg-frame px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-2xl">
        <Wordmark name={settings.company.name} light={false} small="Quotations & invoices" />
        <h1 className="mt-6 flex items-center gap-2 text-lg font-semibold">
          {copy.icon} {copy.title}
        </h1>
        <p className="mt-2 text-sm text-mute">{copy.text}</p>
        {gate === "login" ? (
          <Button variant="primary" className="mt-5 w-full" icon={<LogIn className="h-4 w-4" />} onClick={goToLogin}>
            Log in
          </Button>
        ) : gate === "forbidden" ? (
          <Button variant="primary" className="mt-5 w-full" onClick={() => logout()}>
            Log out
          </Button>
        ) : (
          <Button
            variant="primary"
            className="mt-5 w-full"
            loading={busy}
            onClick={async () => {
              setBusy(true);
              await reconnect();
              setBusy(false);
            }}
          >
            Try again
          </Button>
        )}
        <a href="/" className="mt-4 block text-center text-sm text-mute underline">Back to the website</a>
      </div>
    </div>
  );
}

function NewDoc() {
  const { type } = useParams();
  if (!["quotation", "invoice", "letter"].includes(type || "")) return <Navigate to="/" replace />;
  return <Editor key={`new-${type}`} newType={type as DocType} />;
}

function EditDoc() {
  const { id } = useParams();
  return <Editor key={id} id={id} />;
}

function Routed() {
  const { ready, gate } = useApp();
  if (!ready) return <Loading />;
  if (gate) return <AccessGate />;
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/new/:type" element={<NewDoc />} />
        <Route path="/doc/:id" element={<EditDoc />} />
        <Route
          path="*"
          element={
            <AppShell>
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/quotations" element={<DocumentsList type="quotation" />} />
                  <Route path="/invoices" element={<DocumentsList type="invoice" />} />
                  <Route path="/letters" element={<DocumentsList type="letter" />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/items" element={<Catalog />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  {/* links from the previous version */}
                  <Route path="/quotation/new" element={<Navigate to="/new/quotation" replace />} />
                  <Route path="/invoice/new" element={<Navigate to="/new/invoice" replace />} />
                  <Route path="/document/new" element={<Navigate to="/new/letter" replace />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </AppShell>
          }
        />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <HashRouter>
          <Routed />
        </HashRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}
