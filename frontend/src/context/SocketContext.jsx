import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, setUser } = useAuth();
  const toast = useToast();

  useEffect(() => {
    // Determine socket target endpoint
    const targetUrl = (typeof window !== 'undefined' && (window.location.port === '5173' || window.location.port === '3000'))
      ? 'http://localhost:5000'
      : window.location.origin;

    const socketInstance = io(targetUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Socket.io connected to server:', socketInstance.id);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Join user room whenever logged in user changes
  useEffect(() => {
    if (socket && user) {
      const uid = user._id || user.id;
      if (uid) {
        socket.emit('join_user', uid);

        const handleStatusUpdate = (data) => {
          if (toast && toast.info) {
            toast.info(data.message || `Status updated: ${data.status}`);
          }
          setUser((prev) => (prev ? { ...prev, mentorStatus: data.status, role: data.role } : prev));
        };

        socket.on('mentor_status_updated', handleStatusUpdate);

        return () => {
          socket.off('mentor_status_updated', handleStatusUpdate);
        };
      }
    }
  }, [socket, user, setUser, toast]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
