// src/contexts/NotificationsContext.js
import React, { createContext, useState, useCallback, useContext } from 'react';

const NotificationsContext = createContext({
  addNotification: () => {},
});

export const useNotifications = () => {
  return useContext(NotificationsContext);
};

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // The function that any component can call to show a message.
  // It adds a notification to our queue.
  const addNotification = useCallback((message, severity = 'info') => {
    const id = new Date().getTime() + Math.random(); // Unique ID for the key
    setNotifications(prev => [...prev, { id, message, severity }]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Pass down the state and the functions
  const value = { notifications, addNotification, removeNotification };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};