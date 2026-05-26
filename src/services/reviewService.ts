import { apiClient } from './apiClient';

export interface CreateReviewDto {
    rating: number;
    comment?: string;
}

export const reviewService = {
    async createReview(requestId: string, dto: CreateReviewDto) {
        return await apiClient.post<any>(`/reviews/request/${requestId}`, dto);
    }
};
