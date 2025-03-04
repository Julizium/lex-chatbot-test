import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

let reportWebVitals;
try {
  reportWebVitals = require('./reportWebVitals').default;
} catch (e) {
  reportWebVitals = () => {};
  console.warn('reportWebVitals.js not found, performance reporting disabled');
}

console.log('Starting index.js');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();