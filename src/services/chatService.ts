// ==========================================
// Chat Service — NestJS /api/v1/conversations
// ==========================================

import { apiClient } from './apiClient';
import { Conversation, Message, PaginatedResponse } from '@/types';

// Orijinal mock data fallback logigi
const getLocalConversations = (): Conversation[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('mock_conversations');
    return stored ? JSON.parse(stored) : [];
};

const saveLocalConversation = (conv: Conversation) => {
    if (typeof window === 'undefined') return;
    const convs = getLocalConversations();
    const existingIndex = convs.findIndex(c => c.id === conv.id);
    if (existingIndex > -1) {
        convs[existingIndex] = conv;
    } else {
        convs.unshift(conv);
    }
    localStorage.setItem('mock_conversations', JSON.stringify(convs));
};

const getLocalMessages = (convId: string): Message[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`mock_messages_${convId}`);
    return stored ? JSON.parse(stored) : [];
};

const saveLocalMessage = (convId: string, msg: Message) => {
    if (typeof window === 'undefined') return;
    const msgs = getLocalMessages(convId);
    msgs.push(msg);
    localStorage.setItem(`mock_messages_${convId}`, JSON.stringify(msgs));
};

export const chatService = {
    async getConversations(): Promise<Conversation[]> {
        // Backend does not have a Conversations list endpoint right now.
        // We rely on localStorage for the sidebar list.
        return getLocalConversations();
    },

    async getMessages(conversationId: string, page = 1, limit = 50): Promise<Message[]> {
        let backendData: Message[] = [];
        try {
            // Our socket routes consider conversationId internally as otherUserId
            const res = await apiClient.get<Message[] | PaginatedResponse<Message>>(`/chat/history/${conversationId}`);
            backendData = Array.isArray(res) ? res : ((res as PaginatedResponse<Message>).data || []);
        } catch (error) {
            console.warn('Could not fetch messages from API, using locals:', error);
        }
        
        const local = getLocalMessages(conversationId);
        const combined = [...local, ...backendData.filter(b => !local.some(l => l.id === b.id))];
        return combined;
    },

    async startConversation(dto: { recipientId: string; recipientName?: string; productId?: string }): Promise<Conversation> {
        try {
            // Because our socket implementation maps conversationId = receiverId, 
            // we will directly use recipientId as the convention until full DB Conversations exist.
            const convs = getLocalConversations();
            const existing = convs.find(c => c.id === dto.recipientId);
            if (existing) return existing;

            let finalName = dto.recipientName;
            if (!finalName || finalName === 'Donor User' || finalName === 'Partner User') {
                try {
                    const { userService } = await import('./userService');
                    const userProfile = await userService.getUserProfile(dto.recipientId);
                    if (userProfile && (userProfile.fullName || userProfile.firstName)) {
                        finalName = userProfile.fullName || `${userProfile.firstName} ${userProfile.lastName || ''}`.trim();
                    }
                } catch (error) {
                    console.warn('Could not fetch exact public profile for chat participant, falling back.');
                }
            }

            const newConv: Conversation = {
                id: dto.recipientId,
                productId: dto.productId,
                updatedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                unreadCount: 0,
                participants: [
                    { id: dto.recipientId, fullName: finalName || 'Partner User', avatarUrl: '' } as any
                ]
            };
            saveLocalConversation(newConv);
            return newConv;
        } catch (error) {
            console.warn('Fallback error in startConversation:', error);
            throw error;
        }
    },

    async sendMessage(conversationId: string, content: string): Promise<Message> {
        try {
            return await apiClient.post<Message>(`/conversations/${conversationId}/messages`, { content });
        } catch (error) {
            console.warn('Backend send message failed, falling back to mock');
            const newMsg: Message = {
                id: `msg_${Date.now()}`,
                conversationId,
                senderId: 'me', // Will be overridden in Context usually, but sufficient for UI
                content,
                createdAt: new Date().toISOString(),
                isRead: true
            };
            saveLocalMessage(conversationId, newMsg);

            // Update conversation snippet
            const convs = getLocalConversations();
            const conv = convs.find(c => c.id === conversationId);
            if (conv) {
                conv.lastMessage = newMsg;
                conv.updatedAt = newMsg.createdAt;
                saveLocalConversation(conv);
            }

            return newMsg;
        }
    },

    async markAsRead(conversationId: string): Promise<void> {
        try {
            await apiClient.patch<void>(`/conversations/${conversationId}/read`);
        } catch {
            const convs = getLocalConversations();
            const conv = convs.find(c => c.id === conversationId);
            if (conv) {
                conv.unreadCount = 0;
                saveLocalConversation(conv);
            }
        }
    },
};
