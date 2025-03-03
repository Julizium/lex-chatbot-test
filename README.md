Lex Chatbot Testing Application


This application provides a simple interface to test Amazon Lex chatbot, with support for text conversations and document processing.

Features

Text-based conversations with your Lex bot
Document upload capability for PDF and image files
AWS Amplify authentication
Environment variables for secure configuration

Setup Instructions
Create a .env.local file for local development:

REACT_APP_AWS_REGION=us-east-1
REACT_APP_LEX_BOT_ID=your-lex-bot-id
REACT_APP_LEX_BOT_ALIAS_ID=your-lex-bot-alias-id
REACT_APP_LEX_LOCALE_ID=en_US
REACT_APP_USER_POOL_ID=your-user-pool-id
REACT_APP_USER_POOL_CLIENT_ID=your-user-pool-client-id


Deployment with AWS Amplify
Add the following environment variables in the Amplify Console:

REACT_APP_AWS_REGION: AWS region where your Lex bot is deployed
REACT_APP_LEX_BOT_ID: Your Amazon Lex bot ID
REACT_APP_LEX_BOT_ALIAS_ID: Your Amazon Lex bot alias ID
REACT_APP_LEX_LOCALE_ID: Locale ID for your Lex bot 
REACT_APP_USER_POOL_ID: Cognito User Pool ID
REACT_APP_USER_POOL_CLIENT_ID: Cognito User Pool Web Client ID
