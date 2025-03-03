Lex Chatbot Testing Application


This application provides a simple interface to test Amazon Lex chatbot, with support for text conversations and document processing.

Features

Text-based conversations with your Lex bot
Document upload capability for PDF and image files
AWS Amplify authentication
Environment variables for secure configuration

Setup Instructions
Create a .env.local file for local development:

REACT_APP_AWS_REGION=eu-west-2
REACT_APP_LEX_BOT_ID=your-lex-bot-id
REACT_APP_LEX_BOT_ALIAS_ID=alias-id
REACT_APP_LEX_LOCALE_ID=en_US


Deployment with AWS Amplify
Add the following environment variables in the Amplify Console:

REACT_APP_AWS_REGION: AWS region where your Lex bot is deployed
REACT_APP_LEX_BOT_ID: Your Amazon Lex bot ID
REACT_APP_LEX_BOT_ALIAS_ID: Your Amazon Lex bot alias ID
REACT_APP_LEX_LOCALE_ID: Locale ID for your Lex bot 

