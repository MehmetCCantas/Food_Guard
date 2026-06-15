// ==========================================
// Request Service — NestJS /api/v1/requests endpoint
// ==========================================

import { apiClient } from './apiClient';
import { DonationRequest, PaginatedResponse } from '@/types';

export const requestService = {
    /**
     * Ürün için talep oluştur — POST /requests/products/:productId
     */
    async createRequest(productId: string, dto: { message?: string; quantity?: number }): Promise<DonationRequest> {
        return await apiClient.post<DonationRequest>(`/requests/products/${productId}`, dto);
    },

    /**
     * Benim taleplerim — GET /requests/my-requests
     */
    async getMyRequests(page = 1, limit = 20): Promise<PaginatedResponse<DonationRequest>> {
        return await apiClient.get<PaginatedResponse<DonationRequest>>('/requests/my-requests', {
            page: page.toString(),
            limit: limit.toString(),
        });
    },

    /**
     * Gelen talepler (Donor view) — GET /requests/incoming
     */
    async getIncomingRequests(page = 1, limit = 20): Promise<PaginatedResponse<DonationRequest>> {
        return await apiClient.get<PaginatedResponse<DonationRequest>>('/requests/incoming', {
            page: page.toString(),
            limit: limit.toString(),
        });
    },

    /**
     * Bir ürüne gelen talepler (donor view) — GET /requests/products/:productId
     */
    async getProductRequests(productId: string, page = 1, limit = 20): Promise<PaginatedResponse<DonationRequest>> {
        return apiClient.get<PaginatedResponse<DonationRequest>>(`/requests/products/${productId}`, {
            page: page.toString(),
            limit: limit.toString(),
        });
    },

    /**
     * Talebi kabul et — PATCH /requests/:id/accept
     */
    async acceptRequest(requestId: string): Promise<void> {
        await apiClient.patch<void>(`/requests/${requestId}/accept`);
    },

    /**
     * Talebi reddet — PATCH /requests/:id/reject
     */
    async rejectRequest(requestId: string): Promise<void> {
        await apiClient.patch<void>(`/requests/${requestId}/reject`);
    },

    /**
     * Talebi tamamla — PATCH /requests/:id/complete
     */
    async completeRequest(requestId: string): Promise<void> {
        await apiClient.patch<void>(`/requests/${requestId}/complete`);
    },
};
