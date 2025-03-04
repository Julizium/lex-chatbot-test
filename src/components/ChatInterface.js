import React, { useState, useEffect, useRef } from 'react';
import { LexRuntimeV2Client, RecognizeTextCommand } from "@aws-sdk/client-lex-runtime-v2";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import './ChatInterface.css';

// Create a unique session ID that persists for the session
const sessionId = "session-" + Math.random().toString(36).substring(2, 10);

// Get configuration from environment variables
const config = {
  region: process.env.REACT_APP_AWS_REGION,
  identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID,
  lexBotId: process.env.REACT_APP_LEX_BOT_ID,
  lexBotAliasId: process.env.REACT_APP_LEX_BOT_ALIAS_ID,
  lexLocaleId: process.env.REACT_APP_LEX_LOCALE_ID,
};

console.log("Config:", config);

// Create Lex client with credentials from Cognito Identity Pool
const lexClient = new LexRuntimeV2Client({ 
  region: config.region,
  credentials: fromCognitoIdentityPool({
    clientConfig: { region: config.region },
    identityPoolId: config.identityPoolId
  })
});

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useEcho, setUseEcho] = useState(false); // Flag to use echo mode if Lex fails
  const messagesEndRef = useRef(null);
  
  // Add welcome message on mount
  useEffect(() => {
    setMessages([
      {
        type: 'bot',
        content: 'Hello! I am a test chat! Say Hi back!',
        timestamp: new Date().toISOString()
      }
    ]);
    
    // Test Lex connectivity on startup
    testLexConnection();
  }, []);
  
  // Test Lex connectivity
  const testLexConnection = async () => {
    try {
      const params = {
        botId: config.lexBotId,
        botAliasId: config.lexBotAliasId,
        localeId: config.lexLocaleId,
        sessionId: sessionId,
        text: "test"
      };
      
      console.log("Testing Lex connection with params:", params);
      
      const command = new RecognizeTextCommand(params);
      await lexClient.send(command);
      
      console.log("Lex connection test successful");
      setUseEcho(false);
    } catch (error) {
      console.error("Lex connection test failed:", error);
      console.log("Falling back to echo mode");
      setUseEcho(true);
    }
  };
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Send text message
  const sendTextMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMessage = {
      type: 'user',
      content: inputText,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    if (useEcho) {
      // Simple echo mode for fallback
      setTimeout(() => {
        const botMessage = {
          type: 'bot',
          content: `You said: "${inputText}"`,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prevMessages => [...prevMessages, botMessage]);
        setIsLoading(false);
      }, 1000);
    } else {
      // Lex integration
      try {
        console.log("Sending message to Lex:", inputText);
        
        const params = {
          botId: config.lexBotId,
          botAliasId: config.lexBotAliasId,
          localeId: config.lexLocaleId,
          sessionId: sessionId,
          text: inputText
        };
        
        console.log("Lex parameters:", params);
        
        const command = new RecognizeTextCommand(params);
        const response = await lexClient.send(command);
        
        console.log("Received response from Lex:", response);
        
        if (response.messages && response.messages.length > 0) {
          const botMessages = response.messages.map(message => ({
            type: 'bot',
            content: message.content,
            timestamp: new Date().toISOString()
          }));
          
          setMessages(prevMessages => [...prevMessages, ...botMessages]);
        } else {
          // Handle empty response
          setMessages(prevMessages => [
            ...prevMessages, 
            {
              type: 'bot',
              content: "I didn't understand that. Could you try again?",
              timestamp: new Date().toISOString()
            }
          ]);
        }
      } catch (error) {
        console.error('Error communicating with Lex:', error);
        
        const errorMessage = {
          type: 'bot',
          content: `Sorry, there was an error: ${error.message}`,
          timestamp: new Date().toISOString(),
          isError: true
        };
        
        setMessages(prevMessages => [...prevMessages, errorMessage]);
        
        // Fall back to echo mode if Lex fails
        setUseEcho(true);
      }
    }
    
    setIsLoading(false);
  };
  
  // Handle input change and form submission
  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      sendTextMessage();
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim()) {
        sendTextMessage();
      }
    }
  };
  
  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.type} ${message.isError ? 'error' : ''}`}
          >
            <div className="message-content">
              {message.content}
            </div>
            <div className="message-timestamp">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot loading">
            <div className="loading-indicator">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="chat-input-container" onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={isLoading}
        />
        
        <button 
          type="submit" 
          disabled={!inputText.trim() || isLoading}
          className="send-button"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;