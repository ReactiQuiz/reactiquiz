// src/contexts/NotificationsContext.tsx
/**
 * Notifications Context
 * 
 * This context provides global notification management functionality.
 * It manages a queue of notifications (success, error, warning, info) that can
 * be displayed throughout the application and automatically removed.
 */
import React, { createContext, useState, useCallback, useContext, ReactNode } from 'react';
import { UseNotificationsReturn, Notification } from '../types';

/**
 * Notifications Context
 * 
 * Creates the React context for notifications. Provides default empty values
 * for when context is used outside provider (fallback).
 */
const NotificationsContext = createContext<UseNotificationsReturn>({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
});

/**
 * useNotifications Hook
 * 
 * Custom hook to access the notifications context.
 * Provides notifications array and functions to add/remove notifications.
 * 
 * @returns {UseNotificationsReturn} Notifications context value
 */
export const useNotifications = (): UseNotificationsReturn => {
  return useContext(NotificationsContext);
};

/**
 * NotificationsProviderProps Interface
 * 
 * Props for the NotificationsProvider component.
 */
interface NotificationsProviderProps {
  children: ReactNode; // Child components that will have access to notifications
}

/**
 * Notifications Provider Component
 * 
 * Provides notifications context to the application.
 * Manages notification queue state and provides functions to add/remove notifications.
 * 
 * Features:
 * - Notification queue management
 * - Add notifications with severity levels (success, error, warning, info)
 * - Remove notifications by ID
 * - Unique ID generation for each notification
 * 
 * @param {NotificationsProviderProps} props - Component props
 * @returns {JSX.Element} Notifications provider with context value
 */
export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  /**
   * Add Notification
   * 
   * Adds a new notification to the queue with a unique ID.
   * Generates ID using timestamp and random number for uniqueness.
   * 
   * @param {string} message - Notification message text
   * @param {'success' | 'error' | 'warning' | 'info'} [severity='info'] - Notification severity level
   */
  const addNotification = useCallback((message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info'): void => {
    const id: number = new Date().getTime() + Math.random(); // Unique ID for the key
    const newNotification: Notification = { id, message, severity };
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  /**
   * Remove Notification
   * 
   * Removes a notification from the queue by its ID.
   * 
   * @param {number} id - Unique notification ID to remove
   */
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
