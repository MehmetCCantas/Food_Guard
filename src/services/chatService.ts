import { apiClient } from './apiClient';
import { Conversation, Message, PaginatedResponse } from '@/types';

export const chatService = {
    async getConversations(): Promise<Conversation[]> {
        return apiClient.get<Conversation[]>('/chat/conversations');
    },

    async getMessages(conversationId: string, page = 1, limit = 50): Promise<Message[]> {
        const res = await apiClient.get<Message[] | PaginatedResponse<Message>>(`/chat/history/${conversationId}`);
        return Array.isArray(res) ? res : ((res as PaginatedResponse<Message>).data || []);
    },

    async startConversation(dto: { recipientId: string; recipientName?: string; productId?: string }): Promise<Conversation> {
        return apiClient.post<Conversation>('/chat/conversations', {
            recipientId: dto.recipientId,
            productId: dto.productId,
        });
    },

    async sendMessage(conversationId: string, content: string): Promise<Message> {
        return apiClient.post<Message>(`/chat/conversations/${conversationId}/messages`, { content });
    },

    async markAsRead(conversationId: string): Promise<void> {
        return apiClient.patch<void>(`/chat/conversations/${conversationId}/read`);
    },
};
