import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!user || !token) return;

    socketRef.current = io('/', { auth: { token }, transports: ['websocket'] });

    socketRef.current.on('leave:new', (data) => {
      setNotifications(prev => [{ id: Date.now(), type: 'info', ...data }, ...prev.slice(0, 9)]);
    });

    socketRef.current.on('leave:updated', (data) => {
      setNotifications(prev => [{ id: Date.now(), type: 'success', ...data }, ...prev.slice(0, 9)]);
    });

    return () => socketRef.current?.disconnect();
  }, [user]);

  const clearNotification = (id) => setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, notifications, clearNotification }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
