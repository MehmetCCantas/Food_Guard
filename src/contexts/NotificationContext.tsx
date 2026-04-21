'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppNotification, NotificationType } from '@/types';
import { socketService } from '@/services/socketService';
import { useAuth } from './AuthContext';

interface NotificationContextType {
    notifications: AppNotification[];
    unreadCount: number;
    markAllRead: () => void;
    markRead: (id: string) => void;
    addNotification: (n: AppNotification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { isLoggedIn, user } = useAuth();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const addNotification = useCallback((n: AppNotification) => {
        setNotifications((prev) => [n, ...prev].slice(0, 50)); // max 50
    }, []);

    const markRead = useCallback((id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
    }, []);

    const markAllRead = useCallback(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }, []);

    // Socket'ten gelen bildirimleri dinle
    useEffect(() => {
        if (!isLoggedIn || !user) return;
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        
        if (token) {
            socketService.connect(token, user.id);
        }

        const off = socketService.onNotification((notification) => {
            addNotification(notification);
            // Browser native notification (izin varsa)
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                new Notification(notification.title, { body: notification.body });
            }
        });

        return () => { off(); };
    }, [isLoggedIn, addNotification]);

    return (
        <NotificationContext.Provider
            value={{ notifications, unreadCount, markAllRead, markRead, addNotification }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications(): NotificationContextType {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
    return ctx;
}
