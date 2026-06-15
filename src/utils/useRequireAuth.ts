'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Guest modunda işlem yapmaya çalışan kullanıcıyı login'e yönlendirir.
 * Kullanım: const requireAuth = useRequireAuth();
 *           requireAuth(() => doSomething());
 */
export function useRequireAuth() {
    const { isGuest, isLoggedIn } = useAuth();
    const router = useRouter();

    return function requireAuth(action: () => void) {
        if (!isLoggedIn || isGuest) {
            // Guest veya giriş yapmamış → login'e yönlendir
            router.push('/login');
            return;
        }
        action();
    };
}
