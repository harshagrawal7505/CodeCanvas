import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const { token } = useAuth(); // GET TOKEN FROM AUTH CONTEXT

  useEffect(() => {
    // Pass token in socket handshake
    const newSocket = io('http://localhost:3001', {
      auth: {
        token: token || null // Pass token or null for anonymous
      }
    });
    
    newSocket.on('connect', () => {
      console.log('✅ Connected to server:', newSocket.id);
      setConnected(true);
      setConnecting(false);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnecting(false);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [token]); // RECONNECT WHEN TOKEN CHANGES

  return (
    <SocketContext.Provider value={{ socket, connected, connecting }}>
      {children}
    </SocketContext.Provider>
  );
};