import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const LiveChatModal = ({ 
  recipient, 
  onClose, 
  embedded = false, 
  docked = false, 
  isMinimized = false, 
  onMinimize = null, 
  onMaximize = null 
}) => {
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

  // Load chat history from localStorage on chatId change
  useEffect(() => {
    if (chatId) {
      const saved = localStorage.getItem(`skillexchange_chat_${chatId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setMessages(parsed);
        } catch (e) {
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [chatId]);

  useEffect(() => {
    if (socket && chatId) {
      console.log(`💬 Joining Socket Chat Room: chat_${chatId}`);
      socket.emit('join_chat', chatId);

      const handleReceiveMessage = (data) => {
        console.log('💬 Received message in chat modal:', data);
        setMessages((prev) => {
          // Prevent duplicates
          const isDuplicate = prev.some(
            (m) => m.senderId === data.senderId && m.text === data.text && m.timestamp === data.timestamp
          );
          if (isDuplicate) return prev;

          const updated = [...prev, data];
          localStorage.setItem(`skillexchange_chat_${chatId}`, JSON.stringify(updated));
          return updated;
        });
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

  // Minimized Floating Pill Badge
  if (docked && isMinimized) {
    return (
      <div style={styles.minimizedPill} className="glass-panel" onClick={onMaximize} title="Click to expand 1-on-1 live chat">
        <div style={styles.pillContent}>
          <span style={{ fontSize: '1.2rem' }}>💬</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.85rem', lineHeight: '1.2' }}>
              {recipientName}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#10b981' }}>⚡ Live Socket Connected</span>
          </div>
        </div>
        <button 
          style={styles.closeBtn} 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          title="Close Chat"
        >
          ✕
        </button>
      </div>
    );
  }

  const content = (
    <div style={embedded ? styles.embeddedModal : docked ? styles.dockedModal : styles.modal} className={embedded ? "" : "glass-panel"}>
      {/* Header */}
      {!embedded && (
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
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {onMinimize && (
              <button style={styles.actionBtn} onClick={onMinimize} title="Minimize Chat">
                _
              </button>
            )}
            <button style={styles.closeBtn} onClick={onClose} title="Close Chat">✕</button>
          </div>
        </div>
      )}

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
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '4px' }}>
                      <div style={styles.timestamp}>{msg.timestamp}</div>
                    </div>
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
  );

  if (embedded) {
    return content;
  }

  if (docked) {
    return (
      <div style={styles.dockedContainer}>
        {content}
      </div>
    );
  }

  return (
    <div style={styles.overlay}>
      {content}
    </div>
  );
};

const styles = {
  dockedContainer: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 2500,
    width: '380px',
    maxWidth: '90vw',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
    borderRadius: '16px',
    overflow: 'hidden'
  },
  dockedModal: {
    width: '100%',
    height: '480px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid var(--border-glass)',
    borderRadius: '16px',
    padding: '0',
    background: 'var(--bg-card)'
  },
  minimizedPill: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 2500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '12px 20px',
    borderRadius: '50px',
    border: '1px solid var(--primary)',
    background: 'rgba(15, 23, 42, 0.95)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  pillContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    padding: '2px 8px',
    lineHeight: '1'
  },
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
  embeddedModal: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    padding: '0'
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
