import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const LiveChatModal = ({ recipient, onClose }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Extract string IDs cleanly
  const recipientId = typeof recipient === 'object' ? (recipient._id || recipient.id) : recipient;
  const userId = user ? (user._id || user.id) : null;
  const recipientName = typeof recipient === 'object' ? recipient.name : 'Chat Partner';
  const recipientRole = typeof recipient === 'object' ? recipient.role : null;

  // Generate a unique chat room ID for these two users
  const chatId = userId && recipientId 
    ? [String(userId), String(recipientId)].sort().join('_')
    : null;

  useEffect(() => {
    if (socket && chatId) {
      console.log(`💬 Joining Socket Chat Room: chat_${chatId}`);
      socket.emit('join_chat', chatId);

      const handleReceiveMessage = (data) => {
        console.log('💬 Received message in chat modal:', data);
        setMessages((prev) => [...prev, data]);
      };

      socket.on('receive_message', handleReceiveMessage);

      return () => {
        socket.off('receive_message', handleReceiveMessage);
      };
    }
  }, [socket, chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !socket || !chatId || !user) return;

    const msgData = {
      chatId,
      senderId: String(userId),
      senderName: user.name || 'User',
      receiverId: String(recipientId),
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    socket.emit('send_message', msgData);
    setInputText('');
  };

  if (!recipient) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} className="glass-panel">
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.recipientInfo}>
            <span style={styles.avatar}>💬</span>
            <div>
              <h3 style={styles.name}>{recipientName}</h3>
              <p style={styles.role}>
                {recipientRole ? recipientRole.replace('_', ' ') : 'Live Session Chat'}
              </p>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Message Container */}
        <div style={styles.messagesContainer}>
          {messages.length === 0 ? (
            <div style={styles.emptyState}>
              <p>💬 Start a real-time conversation!</p>
              <span style={styles.subtext}>Messages are delivered instantly via Socket.io.</span>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = String(msg.senderId) === String(userId);
              return (
                <div 
                  key={index} 
                  style={{
                    ...styles.messageRow,
                    justifyContent: isMe ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div 
                    style={{
                      ...styles.messageBubble,
                      background: isMe ? 'var(--primary)' : 'var(--bg-card)',
                      color: isMe ? '#ffffff' : 'var(--text-primary)',
                      border: isMe ? 'none' : '1px solid var(--border-glass)'
                    }}
                  >
                    {!isMe && <div style={styles.senderLabel}>{msg.senderName}</div>}
                    <div>{msg.text}</div>
                    <div style={styles.timestamp}>{msg.timestamp}</div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} style={styles.inputForm}>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Type your message..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={styles.input}
            autoFocus
          />
          <button type="submit" className="btn btn-primary" style={styles.sendBtn}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  modal: {
    width: '100%',
    maxWidth: '460px',
    height: '540px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid var(--border-glass)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    borderRadius: '16px',
    padding: '0'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-glass)',
    background: 'var(--bg-secondary)'
  },
  recipientInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatar: {
    fontSize: '1.4rem'
  },
  name: {
    margin: 0,
    fontSize: '1rem',
    color: 'var(--text-primary)',
    fontWeight: '700'
  },
  role: {
    margin: 0,
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    textTransform: 'capitalize'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '4px 8px'
  },
  messagesContainer: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  emptyState: {
    textAlign: 'center',
    color: 'var(--text-secondary)',
    margin: 'auto 0',
    padding: '20px'
  },
  subtext: {
    fontSize: '0.75rem',
    display: 'block',
    marginTop: '6px',
    opacity: 0.7
  },
  messageRow: {
    display: 'flex',
    width: '100%'
  },
  messageBubble: {
    maxWidth: '80%',
    padding: '10px 14px',
    borderRadius: '12px',
    fontSize: '0.9rem',
    lineHeight: '1.4',
    wordBreak: 'break-word'
  },
  senderLabel: {
    fontSize: '0.7rem',
    fontWeight: '700',
    marginBottom: '3px',
    opacity: 0.8
  },
  timestamp: {
    fontSize: '0.65rem',
    textAlign: 'right',
    marginTop: '4px',
    opacity: 0.7
  },
  inputForm: {
    display: 'flex',
    gap: '8px',
    padding: '12px 16px',
    borderTop: '1px solid var(--border-glass)',
    background: 'var(--bg-secondary)'
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    fontSize: '0.9rem'
  },
  sendBtn: {
    padding: '10px 18px',
    fontSize: '0.85rem'
  }
};

export default LiveChatModal;
