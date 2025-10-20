import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Import Google Material Icons
const linkElement = document.createElement('link');
linkElement.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
linkElement.rel = 'stylesheet';
document.head.appendChild(linkElement);

// Import Google Fonts
const fontLinkElement = document.createElement('link');
fontLinkElement.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@500;600;700&display=swap';
fontLinkElement.rel = 'stylesheet';
document.head.appendChild(fontLinkElement);

// Set document title
document.title = 'AIDA - AI Digital Assistant';

// TEMPORANEAMENTE DISABILITATO - Debug errori
// Mostriamo TUTTI gli errori per debugging
window.addEventListener('unhandledrejection', function(event) {
  // NON preveniamo più gli errori - li vogliamo vedere!
  // event.preventDefault(); // COMMENTATO PER DEBUG

  const reason = event.reason;
  const errorMessage = reason?.message || String(reason);

  // Log di TUTTI gli errori per debug
  console.error('🔴 Unhandled Promise Rejection:', errorMessage, reason);
});

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
