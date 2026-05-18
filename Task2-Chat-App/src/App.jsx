import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, User, Wifi, WifiOff } from 'lucide-react';
import './App.css';

function App() {
  // Load initial messages from localStorage or default to empty array
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('chat_history');
    if (savedMessages) {
      try {
        return JSON.parse(savedMessages);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [inputValue, setInputValue] = useState('');
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const ws = useRef(null);
  const chatAreaRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
    // Save messages to localStorage whenever they change
    localStorage.setItem('chat_history', JSON.stringify(messages));
  }, [messages, isTyping]);

  useEffect(() => {
    if (isJoined) {
      // Connect to a public WebSocket echo server
      // Since it's an echo server, it will send back whatever we send
      ws.current = new WebSocket('wss://ws.postman-echo.com/raw');

      ws.current.onopen = () => {
        setIsConnected(true);
        setMessages(prev => [...prev, { id: Date.now(), type: 'system', text: 'Connected to chat server' }]);
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        setMessages(prev => [...prev, { id: Date.now(), type: 'system', text: 'Disconnected from server' }]);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Only show messages that aren't from us (simulating another user)
          // Since it's an echo server, we'll pretend our own echoed messages are from "Echo Bot"
          if (data.sender === username) {
             // We'll simulate a delayed response from a bot to make it feel real
             setIsTyping(true);
             setTimeout(() => {
               setIsTyping(false);
               setMessages(prev => [...prev, {
                 id: Date.now() + Math.random(),
                 type: 'received',
                 sender: 'Echo Bot',
                 text: data.text,
                 time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
               }]);
             }, 1000 + Math.random() * 1500);
          }
        } catch (e) {
          console.error("Failed to parse message", e);
        }
      };

      return () => {
        if (ws.current) {
          ws.current.close();
        }
      };
    }
  }, [isJoined, username]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setIsJoined(true);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim() && isConnected) {
      const newMsg = {
        id: Date.now(),
        type: 'sent',
        sender: username,
        text: inputValue.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      // Update local UI immediately
      setMessages(prev => [...prev, newMsg]);
      
      // Send to server
      ws.current.send(JSON.stringify(newMsg));
      setInputValue('');
    }
  };

  return (
    <div className="app-container">
      {!isJoined ? (
        <div className="connection-overlay">
          <div className="connection-box">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div className="header-icon" style={{ width: '60px', height: '60px', borderRadius: '16px' }}>
                <MessageSquare size={32} />
              </div>
            </div>
            <h2>Join the Chat</h2>
            <form onSubmit={handleJoin}>
              <div className="input-group">
                <label>Enter your username to continue</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    placeholder="E.g., Alex" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                    autoFocus
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={!username.trim()}>
                Start Chatting
              </button>
            </form>
          </div>
        </div>
      ) : null}

      <header className="chat-header">
        <div className="header-info">
          <div className="header-icon">
            <MessageSquare size={20} />
          </div>
          <div className="header-text">
            <h1>Global Room</h1>
            <div className="status-indicator">
              <div className={`status-dot ${isConnected ? 'connected' : ''}`}></div>
              {isConnected ? 'Connected' : 'Connecting...'}
            </div>
          </div>
        </div>
        <div>
           {isConnected ? <Wifi size={20} color="var(--accent)" /> : <WifiOff size={20} color="var(--error)" />}
        </div>
      </header>

      <div className="chat-area" ref={chatAreaRef}>
        <div className="system-message">Welcome to the chat room, {username}!</div>
        
        {messages.map((msg) => {
          if (msg.type === 'system') {
            return <div key={msg.id} className="system-message">{msg.text}</div>;
          }
          
          return (
            <div key={msg.id} className={`message-wrapper ${msg.type}`}>
              <div className="message-sender">{msg.type === 'sent' ? 'You' : msg.sender}</div>
              <div className="message-bubble">
                {msg.text}
                <span className="message-time">{msg.time}</span>
              </div>
            </div>
          );
        })}
        
        {isTyping && (
          <div className="message-wrapper received">
            <div className="message-sender">Echo Bot</div>
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}
      </div>

      <form className="input-area" onSubmit={handleSendMessage}>
        <div className="message-input-wrapper">
          <input 
            type="text" 
            placeholder="Type a message..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={!isConnected || !isJoined}
          />
        </div>
        <button 
          type="submit" 
          className="send-button"
          disabled={!inputValue.trim() || !isConnected}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

export default App;
