import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeApplications } from '@core/process/initApps';

// Initialize all core application manifests immediately on module load
initializeApplications();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Fatal: Root container #root not found in document.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
