import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

const typeConfig = {
  success: { bg: '#15803d', border: '#166534', icon: '✓' },
  error:   { bg: '#dc2626', border: '#991b1b', icon: '✕' },
  warning: { bg: '#b45309', border: '#92400e', icon: '⚠' },
  info:    { bg: '#4f46e5', border: '#3730a3', icon: 'ℹ' },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info:    (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={containerStyle}>
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const cfg = typeConfig[toast.type] || typeConfig.info;
  return (
    <div
      className="animate-fadeInUp"
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: 'white',
        padding: '14px 16px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.22)',
        maxWidth: '380px',
        width: '100%',
        cursor: 'pointer',
        userSelect: 'none',
        pointerEvents: 'all',
      }}
      onClick={onClose}
    >
      <span style={{ fontSize: '1rem', fontWeight: '700', flexShrink: 0, marginTop: '1px' }}>
        {cfg.icon}
      </span>
      <span style={{ fontSize: '0.9rem', lineHeight: '1.5', flex: 1 }}>
        {toast.message}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: 0, flexShrink: 0
        }}
      >
        ✕
      </button>
    </div>
  );
};

const containerStyle = {
  position: 'fixed',
  top: '24px',
  right: '24px',
  zIndex: 99999,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  pointerEvents: 'none',
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context.toast;
};

export default ToastContext;
