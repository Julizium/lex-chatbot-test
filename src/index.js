import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Amplify } from 'aws-amplify';
import { AmplifyAuthenticator } from '@aws-amplify/ui-react';

// Configure Amplify
Amplify.configure({
  Auth: {
    // These values will be replaced by environment variables in Amplify Console
    region: process.env.REACT_APP_AWS_REGION || 'eu-west-2',
    userPoolId: process.env.REACT_APP_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AmplifyAuthenticator>
      <App />
    </AmplifyAuthenticator>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();