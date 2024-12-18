import ReactGA4 from 'react-ga4';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'
import App from './App.tsx'

// Google Analytics başlatma
if (!import.meta.env.DEV) {
  ReactGA4.initialize(import.meta.env.VITE_GA_MEASUREMENT_ID);
} else {
  console.log('Google Analytics development modunda devre dışı');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
