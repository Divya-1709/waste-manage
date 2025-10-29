import React, { useState } from 'react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I help you with waste management today?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'user' }]);
      setInput('');
      // Simulate bot response
      setTimeout(() => {
        setMessages(prev => [...prev, { text: 'Thank you for your message. Our team will get back to you soon!', sender: 'bot' }]);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div style={styles.container}>
      {isOpen && (
        <div style={styles.chatWindow}>
          <div style={styles.header}>
            <span>SmartWaste Chatbot</span>
            <button onClick={toggleChat} style={styles.closeButton}>×</button>
          </div>
          <div style={styles.messages}>
            {messages.map((msg, index) => (
              <div key={index} style={msg.sender === 'bot' ? styles.botMessage : styles.userMessage}>
                {msg.text}
              </div>
            ))}
          </div>
          <div style={styles.inputContainer}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              style={styles.input}
            />
            <button onClick={sendMessage} style={styles.sendButton}>Send</button>
          </div>
        </div>
      )}
      <button onClick={toggleChat} style={styles.chatButton}>
        💬
      </button>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 1000,
  },
  chatButton: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2E7D32, #388E3C)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    transition: 'transform 0.3s ease',
  },
  chatWindow: {
    position: 'absolute',
    bottom: '80px',
    right: '0',
    width: '300px',
    height: '400px',
    background: 'white',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    background: 'linear-gradient(135deg, #2E7D32, #388E3C)',
    color: 'white',
    padding: '10px 15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: 'bold',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer',
  },
  messages: {
    flex: 1,
    padding: '10px',
    overflowY: 'auto',
  },
  botMessage: {
    background: '#f1f1f1',
    padding: '8px 12px',
    borderRadius: '10px',
    marginBottom: '10px',
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  userMessage: {
    background: '#2E7D32',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '10px',
    marginBottom: '10px',
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  inputContainer: {
    display: 'flex',
    padding: '10px',
    borderTop: '1px solid #ddd',
  },
  input: {
    flex: 1,
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    marginRight: '10px',
  },
  sendButton: {
    padding: '8px 15px',
    background: '#2E7D32',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default Chatbot;
