'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Guest modunda işlem yapmaya çalışan kullanıcıyı login'e yönlendirir.
 * Kullanım: const requireAuth = useRequireAuth();
 *           requireAuth(() => doSomething());
 */
export function useRequireAuth() {
    const { isLoggedIn } = useAuth();
    const router = useRouter();

    return function requireAuth(action: () => void) {
        if (!isLoggedIn) {
            router.push('/login');
            return;
        }
        action();
    };
}
