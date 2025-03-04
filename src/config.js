const config = {
    region: process.env.REACT_APP_AWS_REGION || 'eu-west-2',
    lexBotId: process.env.REACT_APP_LEX_BOT_ID,
    lexBotAliasId: process.env.REACT_APP_LEX_BOT_ALIAS_ID,
    lexLocaleId: process.env.REACT_APP_LEX_LOCALE_ID || 'en_US',
  };
  
  export default config;