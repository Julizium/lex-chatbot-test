// src/aws-config.js
import { Amplify } from 'aws-amplify';

const awsConfig = {
  Auth: {
    // For unauthenticated users
    identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID, 
    region: process.env.REACT_APP_AWS_REGION || 'eu-west-2',
  },
  Interactions: {
    bots: {
      LexBot: {
        name: 'LexBot', // Just a label for Amplify to use
        alias: '$LATEST',
        region: process.env.REACT_APP_AWS_REGION || 'eu-west-2',
        botId: process.env.REACT_APP_LEX_BOT_ID,
        localeId: process.env.REACT_APP_LEX_LOCALE_ID || 'en_US',
        botAliasId: process.env.REACT_APP_LEX_BOT_ALIAS_ID,
        providerName: 'AWSLexV2Provider'
      }
    }
  },
  // Add Storage configuration if you need file uploads
  Storage: {
    AWSS3: {
      bucket: process.env.REACT_APP_S3_BUCKET_NAME,
      region: process.env.REACT_APP_AWS_REGION || 'eu-west-2',
    }
  }
};

// Configure Amplify with our settings
Amplify.configure(awsConfig);

export default awsConfig;