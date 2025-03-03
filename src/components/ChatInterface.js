import React, { useState, useEffect, useRef } from 'react';
import { LexRuntimeV2 } from 'aws-sdk';
import config from '../config';
import './ChatInterface.css';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);
  const [lexClient, setLexClient] = useState(null);

  // Create a Lex client on component mount
  useEffect(() => {
    const setupLexClient = async () => {
      try {
        // Create Lex client without Cognito
        const client = new LexRuntimeV2({
          region: config.region,
          // Use anonymous/unauthenticated access (for now)
          // This requires IAM permissions on the Lex bot
        });
        
        setLexClient(client);
        
        // Generate a unique session ID
        setSessionId(generateSessionId());
        
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
      
      const response = await lexClient.recognizeText(params);
      
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
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle file upload for document processing
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !lexClient) return;
    
    const fileMessage = {
      type: 'user',
      content: `Uploaded document: ${file.name}`,
      timestamp: new Date().toISOString(),
      isFile: true
    };
    
    setMessages(prevMessages => [...prevMessages, fileMessage]);
    setIsLoading(true);
    
    try {
      // Convert file to base64
      const base64Content = await fileToBase64(file);
      
      // Call Lex with the document
      const params = {
        botId: config.lexBotId,
        botAliasId: config.lexBotAliasId,
        localeId: config.lexLocaleId,
        sessionId: sessionId,
        requestAttributes: {
          'x-amz-lex-document': base64Content
        }
      };
      
      // For document processing, we'll send a text message to trigger the appropriate intent
      params.text = "Process this document";
      
      const response = await lexClient.recognizeText(params);
      
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
            content: 'I couldn\'t process that document. Please try a different format.',
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      
      const errorMessage = {
        type: 'bot',
        content: 'Sorry, there was an error processing your document. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Extract the base64 data from data URL
        const base64Content = reader.result.split(',')[1];
        resolve(base64Content);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };
  
  // Handle input text change
  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim() && lexClient) {
      sendTextMessage();
    }
  };
  
  // Handle key press (Enter to send)
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
              {message.isFile ? (
                <div className="file-message">
                  <i className="file-icon">📄</i> {message.content}
                </div>
              ) : (
                message.content
              )}
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
        
        <label className="file-upload-button">
          <input
            type="file"
            onChange={handleFileUpload}
            accept=".pdf,.jpg,.jpeg,.png"
            disabled={isLoading || !lexClient}
          />
          📎
        </label>
      </form>
    </div>
  );
};

export default ChatInterface;