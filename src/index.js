import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Amplify } from 'aws-amplify';

// Configure Amplify without Auth
Amplify.configure({
  // Disable Auth for now
  Auth: {
    // This ensures Auth is included but not fully configured
    // which prevents "Auth.Cognito is undefined" error
    region: process.env.REACT_APP_AWS_REGION || 'eu-west-2',
    mandatorySignIn: false
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();