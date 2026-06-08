'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Navbar.module.css';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useChat } from '@/contexts/ChatContext';
import { useTheme } from '@/contexts/ThemeContext';
import { NotificationType } from '@/types';
import { 
    Bell, 
    MessageSquare, 
    Inbox, 
    CheckCircle, 
    XCircle, 
    User, 
    Settings, 
    Package, 
    ShoppingBag, 
    ClipboardList, 
    BarChart2, 
    LogOut,
    BellOff,
    ChevronDown,
    Sparkles,
    Sun,
    Moon
} from 'lucide-react';

const notifIcons: Record<NotificationType, React.ComponentType<any>> = {
    [NotificationType.NEW_MESSAGE]: MessageSquare,
    [NotificationType.NEW_REQUEST]: Inbox,
    [NotificationType.REQUEST_ACCEPTED]: CheckCircle,
    [NotificationType.REQUEST_REJECTED]: XCircle,
};

export default function Navbar() {
    const { user, isLoggedIn, isLoading, logout, isDonor, isRecipient } = useAuth();
    const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
    const { totalUnread: chatUnread } = useChat();
    const { theme, toggleTheme } = useTheme();

    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifPanel, setShowNotifPanel] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifPanel(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        setShowDropdown(false);
        router.push('/login');
    };

    const totalBadge = unreadCount + chatUnread;

    return (
        <nav className={styles.navbar}>
            <Link href="/dashboard" className={styles.logo}>
                <Sparkles size={20} className={styles.logoIcon} />
                <span>Food Guard</span>
            </Link>

            <div className={styles.navCenter}>
                {isLoggedIn && isDonor && (
                    <Link href="/my-donations" className={styles.navLink}>
                        <Package size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                        <span>My Listings</span>
                    </Link>
                )}
            </div>

            <div className={styles.navRight}>
                <button
                    className={styles.themeToggleBtn}
                    onClick={toggleTheme}
                    aria-label="Toggle Dark Mode"
                    title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                >
                    {theme === 'dark' ? (
                        <Sun size={20} className={styles.themeIcon} strokeWidth={2.2} />
                    ) : (
                        <Moon size={20} className={styles.themeIcon} strokeWidth={2.2} />
                    )}
                </button>

                {isLoading ? (
                    <div style={{ width: 100 }} />
                ) : isLoggedIn && user ? (
                    <>
                        {/* ---- Bildirim Çanı ---- */}
                        <div className={styles.notifWrapper} ref={notifRef}>
                            <button
                                className={styles.notifBtn}
                                onClick={() => {
                                    setShowNotifPanel(!showNotifPanel);
                                    setShowDropdown(false);
                                }}
                                aria-label="Notifications"
                            >
                                <Bell className={styles.bellIcon} size={20} strokeWidth={2.2} />
                                {totalBadge > 0 && (
                                    <span className={styles.notifBadge}>
                                        {totalBadge > 99 ? '99+' : totalBadge}
                                    </span>
                                )}
                            </button>

                            {showNotifPanel && (
                                <div className={styles.notifPanel}>
                                    <div className={styles.notifPanelHeader}>
                                        <span className={styles.notifPanelTitle}>
                                            <Bell size={16} style={{ marginRight: '6px', color: 'var(--primary)', verticalAlign: 'middle' }} />
                                            Notifications
                                        </span>
                                        {unreadCount > 0 && (
                                            <button className={styles.markAllBtn} onClick={markAllRead}>
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>

                                    <div className={styles.notifList}>
                                        {notifications.length === 0 ? (
                                            <div className={styles.notifEmpty}>
                                                <BellOff size={32} strokeWidth={1.5} style={{ color: 'var(--text-light)', marginBottom: '4px' }} />
                                                <p>No notifications yet</p>
                                            </div>
                                        ) : (
                                            notifications.slice(0, 20).map((notif) => {
                                                const IconComp = notifIcons[notif.type] || Bell;
                                                return (
                                                    <div
                                                        key={notif.id}
                                                        className={`${styles.notifItem} ${!notif.isRead ? styles.notifUnread : ''}`}
                                                        onClick={() => {
                                                            markRead(notif.id);
                                                            if (notif.link) router.push(notif.link);
                                                            setShowNotifPanel(false);
                                                        }}
                                                    >
                                                        <span className={styles.notifIcon}>
                                                            <IconComp size={20} strokeWidth={2} style={{ color: 'var(--primary)' }} />
                                                        </span>
                                                        <div className={styles.notifContent}>
                                                            <div className={styles.notifTitle}>{notif.title}</div>
                                                            <div className={styles.notifBody}>{notif.body}</div>
                                                            <div className={styles.notifTime}>
                                                                {new Date(notif.createdAt).toLocaleTimeString('en-US', {
                                                                    hour: '2-digit', minute: '2-digit'
                                                                })}
                                                            </div>
                                                        </div>
                                                        {!notif.isRead && <span className={styles.unreadDot} />}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ---- Profil Dropdown ---- */}
                        <div className={styles.profileWrapper} ref={dropdownRef}>
                            <button
                                className={styles.profileBtn}
                                onClick={() => {
                                    setShowDropdown(!showDropdown);
                                    setShowNotifPanel(false);
                                }}
                            >
                                <div className={styles.avatar}>
                                    <span className={styles.avatarInitial}>
                                        {(user.firstName || user.fullName || '?').charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className={styles.userName}>
                                    {user.firstName && user.lastName
                                        ? `${user.firstName} ${user.lastName}`
                                        : user.fullName}
                                </span>
                                <ChevronDown className={styles.chevron} size={14} strokeWidth={2.5} />
                            </button>

                            {showDropdown && (
                                <div className={styles.dropdown}>
                                    <div className={styles.dropdownHeader}>
                                        <div className={styles.dropdownAvatar}>
                                            <span className={styles.avatarInitial}>
                                                {(user.firstName || user.fullName || '?').charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <div className={styles.dropdownName}>
                                                {user.firstName && user.lastName
                                                    ? `${user.firstName} ${user.lastName}`
                                                    : user.fullName}
                                            </div>
                                            <div className={styles.dropdownEmail}>{user.email}</div>
                                        </div>
                                    </div>

                                    <div className={styles.dropdownDivider} />

                                    <Link href="/profile" className={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                                        <span className={styles.dropdownItemLabel}>
                                            <User size={16} strokeWidth={2} className={styles.menuIcon} />
                                            My Profile
                                        </span>
                                    </Link>
                                    <Link href="/settings" className={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                                        <span className={styles.dropdownItemLabel}>
                                            <Settings size={16} strokeWidth={2} className={styles.menuIcon} />
                                            Settings
                                        </span>
                                    </Link>
                                    <Link href="/chat" className={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                                        <span className={styles.dropdownItemLabel}>
                                            <MessageSquare size={16} strokeWidth={2} className={styles.menuIcon} />
                                            My Messages
                                        </span>
                                        {chatUnread > 0 && (
                                            <span className={styles.dropdownBadge}>{chatUnread}</span>
                                        )}
                                    </Link>

                                    {isDonor && (
                                        <Link href="/my-donations" className={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                                            <span className={styles.dropdownItemLabel}>
                                                <Package size={16} strokeWidth={2} className={styles.menuIcon} />
                                                My Listings
                                            </span>
                                        </Link>
                                    )}
                                    {isRecipient && (
                                        <Link href="/my-collections" className={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                                            <span className={styles.dropdownItemLabel}>
                                                <ShoppingBag size={16} strokeWidth={2} className={styles.menuIcon} />
                                                My Collections
                                            </span>
                                        </Link>
                                    )}
                                    <Link href="/requests" className={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                                        <span className={styles.dropdownItemLabel}>
                                            <ClipboardList size={16} strokeWidth={2} className={styles.menuIcon} />
                                            Requests
                                        </span>
                                    </Link>
                                    <Link href="/impact" className={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                                        <span className={styles.dropdownItemLabel}>
                                            <BarChart2 size={16} strokeWidth={2} className={styles.menuIcon} />
                                            My Impact
                                        </span>
                                    </Link>

                                    <div className={styles.dropdownDivider} />
                                    <button className={styles.dropdownLogout} onClick={handleLogout}>
                                        <LogOut size={16} strokeWidth={2} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                        <span>Log Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <Link href="/login" className={styles.signInBtn}>Sign In</Link>
                        <Link href="/register" className={styles.signUpBtn}>Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
}
