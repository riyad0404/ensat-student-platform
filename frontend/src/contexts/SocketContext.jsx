import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      
      const newSocket = io('http://localhost:5000', {
        withCredentials: true, // Important pour partager les cookies de session
        transports: ['websocket'] // Force websocket pour la performance
      });

      // Signaler que l'utilisateur est connecté dès la connexion Socket
      newSocket.on('connect', () => {
        newSocket.emit('user_connected', user.iduser || user.id);
      });

      setSocket(newSocket);

      return () => newSocket.close();
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};