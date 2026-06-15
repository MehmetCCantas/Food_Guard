'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, RegisterDto, UserRole } from '@/types';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (dto: RegisterDto) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<boolean>;
    isDonor: boolean;
    isRecipient: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Backend UserResponseDto → frontend User alanlarını normalize et */
function normalizeUser(raw: Record<string, unknown>): User {
    return {
        id: raw.id as string,
        email: raw.email as string,
        firstName: raw.firstName as string | undefined ?? (raw.fullName as string)?.split(' ')[0] ?? '',
        lastName: raw.lastName as string | undefined ?? (raw.fullName as string)?.split(' ').slice(1).join(' ') ?? '',
        fullName: raw.fullName as string | undefined ?? `${raw.firstName ?? ''} ${raw.lastName ?? ''}`.trim(),
        role: (raw.role as UserRole) ?? UserRole.INDIVIDUAL_RECIPIENT,
        status: (raw.status ?? raw.verificationStatus) as string,
        phoneNumber: raw.phoneNumber as string | undefined,
        address: (raw.address ?? raw.addressText ?? raw.city) as string | undefined,
        city: (raw.city as string) || undefined,
        district: (raw.district as string) || undefined,
        isEmailVerified: (raw.isEmailVerified as boolean) ?? false,
        isPhoneVerified: (raw.isPhoneVerified as boolean) ?? false,
        createdAt: raw.createdAt as string | undefined,
    } as User;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isLoggedIn = !!user;
    const isDonor = user?.role === UserRole.DONOR;
    const isRecipient =
        user?.role === UserRole.INDIVIDUAL_RECIPIENT ||
        user?.role === UserRole.ORGANIZATIONAL_RECIPIENT;
    const isAdmin = user?.role === UserRole.ADMIN;

    const refreshUser = useCallback(async (): Promise<boolean> => {
        try {
            const raw = await userService.getProfile();
            setUser(normalizeUser(raw as unknown as Record<string, unknown>));
            return true;
        } catch {
            setUser(null);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
            }
            return false;
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            if (typeof window !== 'undefined' && localStorage.getItem('access_token')) {
                await refreshUser();
            }
            setIsLoading(false);
        };
        init();
    }, [refreshUser]);

    const login = async (email: string, password: string) => {
        await authService.login(email, password);
        const success = await refreshUser();
        if (!success) {
            throw new Error('Failed to fetch user profile after login');
        }
    };

    const register = async (dto: RegisterDto) => {
        await authService.register(dto);
        try {
            await authService.login(dto.email, dto.password);
            await refreshUser();
        } catch {
            // sessizce geç
        }
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoggedIn,
                isLoading,
                login,
                register,
                logout,
                refreshUser,
                isDonor,
                isRecipient,
                isAdmin,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
