import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const s = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    s.on('connect', () => {
      console.log('[Socket] Connected to ArogyaGrid real-time gateway');
    });

    s.on('alert:critical', (data) => {
      console.warn('[Socket Alert]', data);
      setAlerts(prev => [data, ...prev.slice(0, 9)]);
    });

    setSocket(s);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      s.disconnect();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const dismissAlert = (index) => {
    setAlerts(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <SocketContext.Provider value={{ socket, alerts, isOnline, dismissAlert }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
