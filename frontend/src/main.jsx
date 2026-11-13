import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { RouterProvider } from './lib/router.jsx';
import { AuthProvider } from './lib/auth.jsx';
import './styles.css';
import './pages.css';
import './login.css';
import './liquid.css';
import './nav-menu.css';
import './i18n.css';
import './theme.css';
import './nav-morph.css';
import './login-modal.css';
import './chat-assistant.css';
import './services-stack.css';
import './lib/i18n.js';
import './lib/liquid.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </RouterProvider>
  </StrictMode>,
);
