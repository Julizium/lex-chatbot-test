import React, { useState, useEffect, useRef } from 'react';
import { LexRuntimeV2Client, RecognizeTextCommand } from "@aws-sdk/client-lex-runtime-v2";
import config from '../config';
import './ChatInterface.css';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [lexClient, setLexClient] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Create a Lex client on component mount
  useEffect(() => {
    const setupLexClient = async () => {
      try {
        console.log("Setting up Lex client with config:", {
          region: config.region,
          botId: config.lexBotId,
          botAliasId: config.lexBotAliasId,
          localeId: config.lexLocaleId
        });
        
        // Create Lex client
        const client = new LexRuntimeV2Client({
          region: config.region
        });
        
        setLexClient(client);
        
        // Generate a unique session ID
        const newSessionId = generateSessionId();
        setSessionId(newSessionId);
        
        // Add welcome message
        setMessages([
          {
            type: 'bot',
            content: 'Hello! How can I help you today?',
            timestamp: new Date().toISOString()
          }
        ]);
      } catch (error) {
        console.error('Error setting up Lex client:', error);
      }
    };
    
    setupLexClient();
  }, []);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Generate a random session ID
  const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Send text message to Lex
  const sendTextMessage = async () => {
    if (!inputText.trim() || !lexClient) return;
    
    const userMessage = {
      type: 'user',
      content: inputText,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      const params = {
        botId: config.lexBotId,
        botAliasId: config.lexBotAliasId,
        localeId: config.lexLocaleId,
        sessionId: sessionId,
        text: inputText
      };
      
      console.log("Sending message to Lex with params:", params);
      
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
            content: 'I didn\'t understand that. Could you try again?',
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
  
  // Handle input change and form submission (rest of the component remains similar)
  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim() && lexClient) {
      sendTextMessage();
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim() && lexClient) {
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
          disabled={isLoading || !lexClient}
        />
        <button 
          type="submit" 
          disabled={!inputText.trim() || isLoading || !lexClient}
          className="send-button"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;