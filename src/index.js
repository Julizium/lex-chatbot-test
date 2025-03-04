import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Amplify } from 'aws-amplify';

// Configure Amplify
Amplify.configure({
  // Use Amplify's automatic auth configuration
  // This will leverage the IAM credentials provided by Amplify's hosting service
  Auth: {
    region: process.env.REACT_APP_AWS_REGION || 'eu-west-2',
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();