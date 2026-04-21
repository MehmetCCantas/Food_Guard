'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Auth gerektirmeyen sayfalar
const publicRoutes = ['/', '/login', '/register'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isLoggedIn, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isPublicRoute = publicRoutes.includes(pathname);

    useEffect(() => {
        if (isLoading) return; // henüz yükleniyor, bekle

        if (!isLoggedIn && !isPublicRoute) {
            // Giriş yapmamış + korunan sayfa → login'e yönlendir
            router.replace('/login');
        }

        if (isLoggedIn && (pathname === '/login' || pathname === '/register')) {
            // Giriş yapmış + auth sayfası → dashboard'a yönlendir
            router.replace('/dashboard');
        }
    }, [isLoggedIn, isLoading, isPublicRoute, pathname, router]);

    // Loading durumunda spinner göster
    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'var(--bg-main)',
            }}>
                <div style={{
                    width: 40,
                    height: 40,
                    border: '3px solid var(--border-light)',
                    borderTopColor: 'var(--primary)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
            </div>
        );
    }

    // Yetkisiz kullanıcıyı korunan sayfada gösterme
    if (!isLoggedIn && !isPublicRoute) {
        return null;
    }

    return <>{children}</>;
}
