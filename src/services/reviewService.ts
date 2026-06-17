import { apiClient } from './apiClient';

export interface CreateReviewDto {
    rating: number;
    comment?: string;
}

export interface ReviewDto {
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    recipientId: string;
    donorId: string;
}

export const reviewService = {
    async createReview(requestId: string, dto: CreateReviewDto) {
        return await apiClient.post<any>(`/reviews/request/${requestId}`, dto);
    },
    async getDonorReviews(donorId: string): Promise<ReviewDto[]> {
        const res = await apiClient.get<ReviewDto[]>(`/reviews/donor/${donorId}`);
        return res.data;
    },
};
