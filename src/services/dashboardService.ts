// ==========================================
// Dashboard Service — Stats & Leaderboard API
// ==========================================

import { apiClient } from './apiClient';

export interface PlatformStats {
    totalDonors: number;
    totalRecipients: number;
    totalFoodSaved: number;
    overallPlatformRating: number;
}

export interface LeaderboardEntry {
    id: string;
    fullName: string;
    ratingScore: number;
    completedDonations: number;
}

export const dashboardService = {
    /**
     * GET /dashboard/stats
     * Platform istatistikleri
     */
    async getStats(): Promise<PlatformStats> {
        return apiClient.get<PlatformStats>('/dashboard/stats');
    },

    /**
     * GET /dashboard/leaderboard
     * En iyi donörler sıralaması
     */
    async getLeaderboard(): Promise<LeaderboardEntry[]> {
        return apiClient.get<LeaderboardEntry[]>('/dashboard/leaderboard');
    },
};
