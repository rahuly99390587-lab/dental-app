import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global reset styles
const globalStyles = `
  *, *::before, *::after {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  input:focus, select:focus, textarea:focus, button:focus {
    outline: 2px solid #0f4c81;
    outline-offset: 2px;
  }
  button:hover:not(:disabled) {
    filter: brightness(1.06);
  }
  input[type="date"]::-webkit-inner-spin-button,
  input[type="date"]::-webkit-calendar-picker-indicator {
    cursor: pointer;
    opacity: 0.7;
  }
`;

const styleEl = document.createElement('style');
styleEl.textContent = globalStyles;
document.head.appendChild(styleEl);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
