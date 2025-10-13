// src/contexts/NotificationsContext.tsx
import React, { createContext, useState, useCallback, useContext, ReactNode } from 'react';
import { UseNotificationsReturn, Notification } from '../types';

const NotificationsContext = createContext<UseNotificationsReturn>({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
});

export const useNotifications = (): UseNotificationsReturn => {
  return useContext(NotificationsContext);
};

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // The function that any component can call to show a message.
  // It adds a notification to our queue.
  const addNotification = useCallback((message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info'): void => {
    const id: number = new Date().getTime() + Math.random(); // Unique ID for the key
    const newNotification: Notification = { id, message, severity };
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const removeNotification = useCallback((id: number): void => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Pass down the state and the functions
  const value: UseNotificationsReturn = { notifications, addNotification, removeNotification };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
