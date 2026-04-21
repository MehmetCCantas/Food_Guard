'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './Sidebar.module.css';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';

export default function Sidebar() {
    const pathname = usePathname();
    const { isDonor, isRecipient, isLoggedIn, isAdmin } = useAuth();
    const { totalUnread } = useChat();

    const menuItems = [
        { label: 'Dashboard', icon: '🏠', href: '/dashboard' },
        ...(isDonor ? [{ label: 'My Donations', icon: '📦', href: '/my-donations' }] : []),
        ...(isRecipient ? [{ label: 'My Collections', icon: '🛍️', href: '/my-collections' }] : []),
        { label: 'Map View', icon: '📍', href: '/map' },
        { label: 'Requests', icon: '📋', href: '/requests' },
        { label: 'My Impact', icon: '📊', href: '/impact' },
        ...(isLoggedIn ? [{ label: 'Messages', icon: '💬', href: '/chat', badge: totalUnread }] : []),
        ...(isLoggedIn ? [{ label: 'Settings', icon: '⚙️', href: '/settings' }] : []),
        ...(isAdmin ? [{ label: 'Admin Panel', icon: '🛡️', href: '/admin' }] : []),
    ];

    return (
        <aside className={styles.sidebar}>
            <ul className={styles.navList}>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                    const badge = 'badge' in item ? (item as { badge: number }).badge : 0;
                    return (
                        <li key={item.label + item.href}>
                            <Link
                                href={item.href}
                                className={isActive ? styles.navItemActive : styles.navItem}
                            >
                                <span className={styles.navIcon}>{item.icon}</span>
                                <span>{item.label}</span>
                                {badge > 0 && (
                                    <span style={{
                                        marginLeft: 'auto',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        fontSize: '0.62rem',
                                        fontWeight: 700,
                                        borderRadius: '50px',
                                        padding: '1px 6px',
                                        minWidth: 18,
                                        textAlign: 'center',
                                    }}>
                                        {badge}
                                    </span>
                                )}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
}
