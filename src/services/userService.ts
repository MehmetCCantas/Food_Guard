// ==========================================
// User Service — NestJS /api/v1/users endpoint
// Backend endpoints: GET /users/me, PATCH /users/me
// ==========================================

import { apiClient } from './apiClient';
import { User } from '@/types';

export const userService = {
    /**
     * Profil getir — GET /users/me
     */
    async getProfile(): Promise<User> {
        return await apiClient.get<User>('/users/me');
    },

    /**
     * Get specific user profile (public info) — GET /users/:id/profile
     */
    async getUserProfile(id: string): Promise<User> {
        try {
            return await apiClient.get<User>(`/users/${id}/profile`);
        } catch (error) {
            console.error('Failed to grab public profile', error);
            throw error;
        }
    },

    /**
     * Profil güncelle — PATCH /users/me
     */
    async updateProfile(data: Partial<User>): Promise<User> {
        return await apiClient.patch<User>('/users/me', data);
    },

    /**
     * Delete account — DELETE /users/me
     */
    async deleteAccount(): Promise<void> {
        await apiClient.delete('/users/me');
    },
};
