import React from 'react';
import ReactDOM from 'react-dom/client';
import { initClientSecurity } from './utils/security';
import App from './App';

// Initialise security before rendering
initClientSecurity();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
