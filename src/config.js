// Configuration that uses environment variables
// These will be set in the AWS Amplify Console

const config = {
    // AWS Region
    region: process.env.REACT_APP_AWS_REGION || 'eu-west-2',
    
    // Lex Bot configuration
    lexBotId: process.env.REACT_APP_LEX_BOT_ID,
    lexBotAliasId: process.env.REACT_APP_LEX_BOT_ALIAS_ID,
    
    // Default locale for Lex Bot
    lexLocaleId: process.env.REACT_APP_LEX_LOCALE_ID || 'en_US',
  };
  
  export default config;