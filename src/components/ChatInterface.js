import React, { useState, useEffect, useRef } from 'react';
import { Interactions, Storage } from 'aws-amplify';
import './ChatInterface.css';
import '../aws-config'; // Import AWS configuration

// Create a unique session ID that persists for the session
const sessionId = "session-" + Math.random().toString(36).substring(2, 10);

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
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
  
  // Handle file selection
  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };
  
  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    
    try {
    // 1. Upload file to S3
    const fileName = `${Date.now()}-${selectedFile.name}`;
    const result = await Storage.put(
        `uploads/${sessionId}/${fileName}`, 
        selectedFile, 
        {
        contentType: selectedFile.type,
        }
    );
    
    console.log('File uploaded successfully:', result);
    
    // Add file message to chat
    const fileMessage = {
        type: 'user',
        content: `File uploaded: ${selectedFile.name}`,
        timestamp: new Date().toISOString(),
        isFile: true,
        fileName: selectedFile.name,
        fileKey: result.key
    };
    
    setMessages(prevMessages => [...prevMessages, fileMessage]);
    
    // 2. Read the file content for processing
    let fileContent = '';
    
    // Read file content based on type
    if (selectedFile.type.includes('text') || 
        selectedFile.type.includes('json') || 
        selectedFile.type.includes('csv')) {
        // For text-based files
        const reader = new FileReader();
        fileContent = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsText(selectedFile);
        });
    } else if (selectedFile.type.includes('image') || 
                selectedFile.type.includes('pdf') || 
                selectedFile.type.includes('application')) {
        // For binary files (images, PDFs, etc.)
        const reader = new FileReader();
        const base64Content = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(selectedFile);
        });
        
        // Extract base64 content (remove data URL prefix)
        fileContent = base64Content.split(',')[1];
    }
    
    // 3. Send the document to Lex with the ProcessDocument intent
    console.log("Sending document to Lex");
    
    const sessionAttributes = {
        'documentName': selectedFile.name,
        'documentType': selectedFile.type
    };
    
    const requestAttributes = {
        'x-amz-lex-document': fileContent
    };
    
    // Send to Lex using ProcessDocument intent
    const response = await Interactions.send('LexBot', "Process this document", {
        sessionAttributes,
        requestAttributes
    });
    
    console.log("Received document processing response from Lex:", response);
    
    if (response.message) {
        // Handle response from Lex
        const botMessage = {
        type: 'bot',
        content: response.message,
        timestamp: new Date().toISOString()
        };
        
        setMessages(prevMessages => [...prevMessages, botMessage]);
    }
    
    // Clear selected file
    setSelectedFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    
    } catch (error) {
    console.error('Error processing file:', error);
    
    const errorMessage = {
        type: 'bot',
        content: `Sorry, there was an error processing your file: ${error.message}`,
        timestamp: new Date().toISOString(),
        isError: true
    };
    
    setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
    setIsLoading(false);
    }
  };

  // Send text message to Lex
  const sendTextMessage = async (text = inputText, isSystem = false) => {
    const messageText = text || inputText;
    if (!messageText.trim()) return;
    
    if (!isSystem) {
      const userMessage = {
        type: 'user',
        content: messageText,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInputText('');
    }
    
    setIsLoading(true);
    
    try {
      console.log("Sending message to Lex:", messageText);
      
      // Use Amplify Interactions to send the message to Lex
      const response = await Interactions.send('LexBot', messageText);
      
      console.log("Received response from Lex:", response);
      
      if (response.message) {
        // Handle response from Lex
        const botMessage = {
          type: 'bot',
          content: response.message,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prevMessages => [...prevMessages, botMessage]);
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
  
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.type} ${message.isError ? 'error' : ''} ${message.isFile ? 'file' : ''}`}
          >
            <div className="message-content">
              {message.isFile ? (
                <>
                  <div className="file-icon">📎</div>
                  <div className="file-details">
                    <div className="file-name">{message.fileName}</div>
                    <div className="file-info">Uploaded successfully</div>
                  </div>
                </>
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
          disabled={isLoading}
        />
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <button 
          type="button" 
          onClick={openFileSelector}
          className="file-button"
          disabled={isLoading}
        >
          📎
        </button>
        
        {selectedFile && (
          <button 
            type="button" 
            onClick={handleFileUpload}
            className="upload-button"
            disabled={isLoading}
          >
            Upload
          </button>
        )}
        
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