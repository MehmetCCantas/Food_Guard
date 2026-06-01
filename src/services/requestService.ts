// ==========================================
// Request Service — NestJS /api/v1/requests endpoint
// ==========================================

import { apiClient } from './apiClient';
import { DonationRequest, PaginatedResponse, RequestStatus } from '@/types';

/**
 * Get internal mock requests
 */
const getLocalRequests = (): DonationRequest[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('mock_requests');
    return stored ? JSON.parse(stored) : [];
};

/**
 * Save mock request
 */
const saveLocalRequest = (request: DonationRequest) => {
    if (typeof window === 'undefined') return;
    const requests = getLocalRequests();
    localStorage.setItem('mock_requests', JSON.stringify([request, ...requests]));
};

export const requestService = {
    /**
     * Ürün için talep oluştur — POST /requests/products/:productId
     */
    async createRequest(productId: string, dto: { message?: string; quantity?: number }): Promise<DonationRequest> {
        // Mock request creation logic
        const mockRequest: DonationRequest = {
            id: `req-${Date.now()}`,
            productId: productId,
            status: RequestStatus.PENDING,
            message: dto.message,
            quantity: dto.quantity,
            createdAt: new Date().toISOString(),
        };

        saveLocalRequest(mockRequest);

        try {
            return await apiClient.post<DonationRequest>(`/requests/products/${productId}`, dto);
        } catch (error) {
            console.warn('Backend request failed, saved locally.');
            return mockRequest;
        }
    },

    /**
     * Benim taleplerim — GET /requests/my-requests
     */
    async getMyRequests(page = 1, limit = 20): Promise<PaginatedResponse<DonationRequest>> {
        try {
            return await apiClient.get<PaginatedResponse<DonationRequest>>('/requests/my-requests', {
                page: page.toString(),
                limit: limit.toString(),
            });
        } catch (error) {
            // Backend bağlı değilse localStorage mock verisine düş
            console.warn('Backend requests fetch failed, using local fallback.');
            const localData = getLocalRequests();
            return {
                data: localData,
                meta: { total: localData.length, page, limit, totalPages: 1 }
            };
        }
    },

    /**
     * Gelen talepler (Donor view) — GET /requests/incoming
     */
    async getIncomingRequests(page = 1, limit = 20): Promise<PaginatedResponse<DonationRequest>> {
        try {
            return await apiClient.get<PaginatedResponse<DonationRequest>>('/requests/incoming', {
                page: page.toString(),
                limit: limit.toString(),
            });
        } catch (error) {
            console.warn('Backend incoming requests fetch failed, using local fallback.');
            // Only return local mocks for now
            const localReqs = getLocalRequests();
            const backendData = localReqs.filter(r => r.status === RequestStatus.PENDING); // Basic fallback mock logic
            return {
                data: backendData,
                meta: {
                    total: backendData.length,
                    page,
                    limit,
                    totalPages: 1
                }
            };
        }
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
        try {
            await apiClient.patch<void>(`/requests/${requestId}/accept`);
        } catch (error) {
            // Backend bağlı değilse local güncelle
            console.warn('Backend accept failed, updating locally.');
            const requests = getLocalRequests();
            const req = requests.find(r => r.id === requestId);
            if (req) {
                req.status = RequestStatus.ACCEPTED;
                localStorage.setItem('mock_requests', JSON.stringify(requests));
            }
        }
    },

    /**
     * Talebi reddet — PATCH /requests/:id/reject
     */
    async rejectRequest(requestId: string): Promise<void> {
        try {
            await apiClient.patch<void>(`/requests/${requestId}/reject`);
        } catch (error) {
            // Backend bağlı değilse local güncelle
            console.warn('Backend reject failed, updating locally.');
            const requests = getLocalRequests();
            const req = requests.find(r => r.id === requestId);
            if (req) {
                req.status = RequestStatus.REJECTED;
                localStorage.setItem('mock_requests', JSON.stringify(requests));
            }
        }
    },

    /**
     * Talebi tamamla — PATCH /requests/:id/complete
     */
    async completeRequest(requestId: string): Promise<void> {
        try {
            await apiClient.patch<void>(`/requests/${requestId}/complete`);
        } catch (error) {
            // Backend bağlı değilse local güncelle
            console.warn('Backend complete failed, updating locally.');
            const requests = getLocalRequests();
            const req = requests.find(r => r.id === requestId);
            if (req) {
                req.status = RequestStatus.COMPLETED;
                localStorage.setItem('mock_requests', JSON.stringify(requests));
            }
        }
    },
};
