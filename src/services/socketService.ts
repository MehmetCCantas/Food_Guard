// ==========================================
// Socket Service — Socket.io singleton
// NestJS backend ile real-time mesajlaşma
// ==========================================

import { io, Socket } from 'socket.io-client';
import { Message, AppNotification } from '@/types';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

class SocketService {
    private chatSocket: Socket | null = null;
    private notifSocket: Socket | null = null;

    connect(token: string, userId?: string) {
        if (this.chatSocket?.connected && this.notifSocket?.connected) return;

        // Chat Namespace
        if (!this.chatSocket?.connected) {
            this.chatSocket = io(`${SOCKET_URL}/chat`, {
                auth: { token },
                query: userId ? { userId } : {},
                transports: ['websocket', 'polling'],
            });
            this.chatSocket.on('connect', () => console.log('[Chat Socket] Connected:', this.chatSocket?.id));
            this.chatSocket.on('disconnect', (reason) => console.log('[Chat Socket] Disconnected:', reason));
            this.chatSocket.on('connect_error', (err) => console.warn('[Chat Socket] Connection error:', err.message));
        }

        // Notification Namespace (Root)
        if (!this.notifSocket?.connected) {
            this.notifSocket = io(`${SOCKET_URL}`, {
                auth: { token }, // NotificationGateway uses auth.token
                transports: ['websocket', 'polling'],
            });
            this.notifSocket.on('connect', () => console.log('[Notif Socket] Connected:', this.notifSocket?.id));
            this.notifSocket.on('disconnect', (reason) => console.log('[Notif Socket] Disconnected:', reason));
            this.notifSocket.on('connect_error', (err) => console.warn('[Notif Socket] Connection error:', err.message));
        }
    }

    disconnect() {
        if (this.chatSocket) {
            this.chatSocket.disconnect();
            this.chatSocket = null;
        }
        if (this.notifSocket) {
            this.notifSocket.disconnect();
            this.notifSocket = null;
        }
    }

    getSocket(): Socket | null {
        return this.chatSocket;
    }

    isConnected(): boolean {
        return this.chatSocket?.connected ?? false;
    }

    // Belirli bir konuşmaya katıl (room)
    joinConversation(conversationId: string) {
        this.chatSocket?.emit('joinConversation', { conversationId });
    }

    // Konuşmadan ayrıl
    leaveConversation(conversationId: string) {
        this.chatSocket?.emit('leaveConversation', { conversationId });
    }

    // Socket üzerinden mesaj gönder
    sendMessage(conversationId: string, content: string) {
        this.chatSocket?.emit('sendMessage', { conversationId, content });
    }

    // Gelen mesajları dinle
    onMessage(handler: (message: Message) => void) {
        this.chatSocket?.on('newMessage', handler);
        return () => this.chatSocket?.off('newMessage', handler);
    }

    // Bildirimleri dinle
    onNotification(handler: (notification: AppNotification) => void) {
        this.notifSocket?.on('notification', handler);
        return () => this.notifSocket?.off('notification', handler);
    }

    // Kullanıcı yazıyor event'i
    emitTyping(conversationId: string) {
        this.chatSocket?.emit('typing', { conversationId });
    }

    onTyping(handler: (data: { userId: string; conversationId: string }) => void) {
        this.chatSocket?.on('userTyping', handler);
        return () => this.chatSocket?.off('userTyping', handler);
    }
}

// Singleton
export const socketService = new SocketService();
