'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { Conversation, Message } from '@/types';
import { chatService } from '@/services/chatService';
import { socketService } from '@/services/socketService';
import { useAuth } from './AuthContext';

interface ChatContextType {
    conversations: Conversation[];
    activeConversationId: string | null;
    messages: Message[];
    totalUnread: number;
    loadingMessages: boolean;
    setActiveConversation: (id: string | null) => void;
    sendMessage: (content: string) => Promise<void>;
    startConversation: (recipientId: string, productId?: string) => Promise<string>;
    refreshConversations: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const { user, isLoggedIn } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const prevConversationId = useRef<string | null>(null);

    const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);

    const refreshConversations = useCallback(async () => {
        if (!isLoggedIn) return;
        try {
            const data = await chatService.getConversations();
            setConversations(data);
        } catch {
            // Backend yoksa sessizce geç
        }
    }, [isLoggedIn]);

    // Socket bağlantısı
    useEffect(() => {
        if (!isLoggedIn || !user) return;
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        if (!token) return;

        socketService.connect(token, user.id);

        const offMessage = socketService.onMessage((msg: Message) => {
            // Aktif konuşmaya ait mesajsa ekle
            setMessages((prev) => {
                if (prev.some((m) => m.id === msg.id)) return prev;
                if (msg.conversationId === activeConversationId) {
                    return [...prev, msg];
                }
                return prev;
            });
            // Konuşma listesini güncelle (unread badge)
            setConversations((prev) =>
                prev.map((c) =>
                    c.id === msg.conversationId
                        ? {
                              ...c,
                              lastMessage: msg,
                              unreadCount:
                                  msg.conversationId !== activeConversationId
                                      ? (c.unreadCount ?? 0) + 1
                                      : 0,
                          }
                        : c
                )
            );
        });

        refreshConversations();

        return () => {
            offMessage();
        };
    }, [isLoggedIn, user, refreshConversations, activeConversationId]);

    // Aktif konuşma değişince mesajları yükle
    useEffect(() => {
        if (!activeConversationId) {
            setMessages([]);
            return;
        }

        // Önceki room'dan çık
        if (prevConversationId.current) {
            socketService.leaveConversation(prevConversationId.current);
        }
        prevConversationId.current = activeConversationId;
        socketService.joinConversation(activeConversationId);

        const load = async () => {
            setLoadingMessages(true);
            try {
                const data = await chatService.getMessages(activeConversationId);
                setMessages(data);
                await chatService.markAsRead(activeConversationId);
                // Unread count sıfırla
                setConversations((prev) =>
                    prev.map((c) => (c.id === activeConversationId ? { ...c, unreadCount: 0 } : c))
                );
            } finally {
                setLoadingMessages(false);
            }
        };
        load();
    }, [activeConversationId]);

    const sendMessage = useCallback(
        async (content: string) => {
            if (!activeConversationId || !content.trim()) return;
            const trimmed = content.trim();

            // Optimistic UI
            const optimistic: Message = {
                id: `opt-${Date.now()}`,
                conversationId: activeConversationId,
                senderId: user?.id ?? '',
                content: trimmed,
                createdAt: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, optimistic]);

            try {
                // Socket üzerinden gönder
                if (socketService.isConnected()) {
                    socketService.sendMessage(activeConversationId, trimmed);
                } else {
                    // HTTP fallback
                    const real = await chatService.sendMessage(activeConversationId, trimmed);
                    setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? real : m)));
                }
            } catch {
                // Başarısız olursa optimistic mesajı kaldır
                setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
            }
        },
        [activeConversationId, user]
    );

    const startConversation = useCallback(
        async (recipientId: string, productId?: string): Promise<string> => {
            const conv = await chatService.startConversation({ recipientId, productId });
            setConversations((prev) => {
                if (prev.some((c) => c.id === conv.id)) return prev;
                return [conv, ...prev];
            });
            setActiveConversationId(conv.id);
            return conv.id;
        },
        []
    );

    return (
        <ChatContext.Provider
            value={{
                conversations,
                activeConversationId,
                messages,
                totalUnread,
                loadingMessages,
                setActiveConversation: setActiveConversationId,
                sendMessage,
                startConversation,
                refreshConversations,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

export function useChat(): ChatContextType {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error('useChat must be used within ChatProvider');
    return ctx;
}
