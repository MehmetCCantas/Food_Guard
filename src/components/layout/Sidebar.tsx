'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './Sidebar.module.css';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { 
    Home, 
    Package, 
    ShoppingBag, 
    MapPin, 
    ClipboardList, 
    BarChart2, 
    MessageSquare, 
    Settings, 
    ShieldAlert 
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();
    const { isDonor, isRecipient, isLoggedIn, isAdmin } = useAuth();
    const { totalUnread } = useChat();

    const menuItems = [
        { label: 'Dashboard', icon: Home, href: '/dashboard' },
        ...(isDonor ? [{ label: 'My Donations', icon: Package, href: '/my-donations' }] : []),
        ...(isRecipient ? [{ label: 'My Collections', icon: ShoppingBag, href: '/my-collections' }] : []),
        { label: 'Map View', icon: MapPin, href: '/map' },
        { label: 'Requests', icon: ClipboardList, href: '/requests' },
        { label: 'My Impact', icon: BarChart2, href: '/impact' },
        ...(isLoggedIn ? [{ label: 'Messages', icon: MessageSquare, href: '/chat', badge: totalUnread }] : []),
        ...(isLoggedIn ? [{ label: 'Settings', icon: Settings, href: '/settings' }] : []),
        ...(isAdmin ? [{ label: 'Admin Panel', icon: ShieldAlert, href: '/admin' }] : []),
    ];

    return (
        <aside className={styles.sidebar}>
            <ul className={styles.navList}>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                    const badge = 'badge' in item ? (item as { badge: number }).badge : 0;
                    const IconComponent = item.icon;
                    
                    return (
                        <li key={item.label + item.href}>
                            <Link
                                href={item.href}
                                className={isActive ? styles.navItemActive : styles.navItem}
                            >
                                <span className={styles.navIcon}>
                                    <IconComponent size={20} strokeWidth={2.2} />
                                </span>
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

