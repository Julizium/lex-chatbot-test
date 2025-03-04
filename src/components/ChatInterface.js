import React, { useState, useEffect, useRef } from 'react';
import './ChatInterface.css';

// Import AWS SDK for direct API calls instead of Amplify
// This avoids dependency on the ever-changing Amplify API
import { LexRuntimeV2Client, RecognizeTextCommand } from "@aws-sdk/client-lex-runtime-v2";

// Create a unique session ID that persists for the session
const sessionId = "session-" + Math.random().toString(36).substring(2, 10);

// Create Lex client - using environment variables from Amplify
const lexClient = new LexRuntimeV2Client({ 
  region: process.env.REACT_APP_AWS_REGION || 'eu-west-2'
  // Credentials will be picked up from Cognito Identity Pool
});

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
  }, []);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Send text message to Lex
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
    
    try {
      console.log("Sending message to Lex:", inputText);
      
      // Use direct AWS SDK call to Lex
      const params = {
        botId: process.env.REACT_APP_LEX_BOT_ID,
        botAliasId: process.env.REACT_APP_LEX_BOT_ALIAS_ID,
        localeId: process.env.REACT_APP_LEX_LOCALE_ID || 'en_US',
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
    } finally {
      setIsLoading(false);
    }
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