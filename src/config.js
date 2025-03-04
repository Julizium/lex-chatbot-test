import { Amplify } from 'aws-amplify';

const config = {
  region: process.env.REACT_APP_AWS_REGION || 'eu-west-2',

  // Lex Bot configuration
  lexBotId: process.env.REACT_APP_LEX_BOT_ID,
  lexBotAliasId: process.env.REACT_APP_LEX_BOT_ALIAS_ID,
  lexLocaleId: process.env.REACT_APP_LEX_LOCALE_ID || 'en_US',
};

// Configure AWS Amplify without Auth
Amplify.configure(config);

export default config;
