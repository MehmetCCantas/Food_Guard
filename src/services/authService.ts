// ==========================================
// Auth Service — NestJS Backend Uyumlu
// ==========================================

import { apiClient } from './apiClient';
import { LoginResponse, RegisterDto, User, UserRole, VerificationStatus } from '@/types';

export const authService = {
    /**
     * User login — POST /auth/login
     */
    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await apiClient.post<LoginResponse>('/auth/login', {
            email,
            password,
        });

        if (typeof window !== 'undefined') {
            if (response.accessToken) {
                localStorage.setItem('access_token', response.accessToken);
            }
            if (response.refreshToken) {
                localStorage.setItem('refresh_token', response.refreshToken);
            }
        }
        return response;
    },

    /**
     * User registration — POST /users/register
     * Backend bekliyor: { email, fullName, password, city, district }
     */
    async register(dto: RegisterDto): Promise<{ message: string; data: RegisterDto }> {
        // Backend DTO'suna dönüştür
        const backendDto = {
            email: dto.email,
            fullName: dto.fullName,
            password: dto.password,
            city: dto.city,
            district: dto.district,
            role: dto.role,
        };
        return await apiClient.post<{ message: string; data: RegisterDto }>('/users/register', backendDto);
    },

    /**
     * User logout — POST /auth/logout
     */
    async logout(): Promise<void> {
        try {
            await apiClient.post('/auth/logout');
        } catch {
            // Ignore errors on logout
        } finally {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('mock_session_user');
                localStorage.removeItem('mock_conversations');
                Object.keys(localStorage).forEach((key) => {
                    if (key.startsWith('mock_messages_')) {
                        localStorage.removeItem(key);
                    }
                });
            }
        }
    },

    /**
     * Token refresh — POST /auth/refresh
     */
    async refreshToken(): Promise<{ accessToken: string }> {
        const response = await apiClient.post<{ accessToken: string }>('/auth/refresh', {});
        if (typeof window !== 'undefined' && response.accessToken) {
            localStorage.setItem('access_token', response.accessToken);
        }
        return response;
    },

    /**
     * Token var mı kontrol et
     */
    isAuthenticated(): boolean {
        if (typeof window === 'undefined') return false;
        return !!localStorage.getItem('access_token');
    },

    /**
     * Send email verification code — POST /auth/send-verification-email
     */
    async sendVerificationEmail(): Promise<{ message: string }> {
        return await apiClient.post('/auth/send-verification-email', {});
    },

    /**
     * Verify email with code — POST /auth/verify-email
     */
    async verifyEmail(code: string): Promise<{ message: string }> {
        return await apiClient.post('/auth/verify-email', { code });
    },

    /**
     * Send phone verification code (MOCK) — POST /auth/send-phone-verification
     */
    async sendPhoneVerification(): Promise<{ message: string }> {
        return await apiClient.post('/auth/send-phone-verification', {});
    },

    /**
     * Verify phone with code (MOCK / Firebase Token) — POST /auth/verify-phone
     */
    async verifyPhone(idToken: string): Promise<{ message: string }> {
        return await apiClient.post('/auth/verify-phone', { idToken });
    },

    /**
     * Change password — POST /auth/change-password
     */
    async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
        return await apiClient.post('/auth/change-password', { currentPassword, newPassword });
    },

    /**
     * Forgot password — POST /auth/forgot-password
     */
    async forgotPassword(email: string): Promise<{ message: string }> {
        return await apiClient.post('/auth/forgot-password', { email });
    },

    /**
     * Reset password — POST /auth/reset-password
     */
    async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
        return await apiClient.post('/auth/reset-password', { token, newPassword });
    },
};
