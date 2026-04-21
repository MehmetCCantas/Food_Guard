'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Navbar.module.css';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useChat } from '@/contexts/ChatContext';
import { NotificationType, AppNotification } from '@/types';

const notifIcons: Record<NotificationType, string> = {
    [NotificationType.NEW_MESSAGE]: '💬',
    [NotificationType.NEW_REQUEST]: '📬',
    [NotificationType.REQUEST_ACCEPTED]: '✅',
    [NotificationType.REQUEST_REJECTED]: '❌',
};

export default function Navbar() {
    const { user, isLoggedIn, isLoading, logout, isDonor, isRecipient } = useAuth();
    const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
    const { totalUnread: chatUnread } = useChat();

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
                🌿 Food Guard
            </Link>

            <div className={styles.navCenter}>
                {isLoggedIn && isDonor && (
                    <Link href="/my-donations" className={styles.navLink}>
                        📦 My Listings
                    </Link>
                )}
            </div>

            <div className={styles.navRight}>
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
                                aria-label="Bildirimler"
                            >
                                <svg
                                    className={styles.bellIcon}
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    width="20"
                                    height="20"
                                >
                                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                                </svg>
                                {totalBadge > 0 && (
                                    <span className={styles.notifBadge}>
                                        {totalBadge > 99 ? '99+' : totalBadge}
                                    </span>
                                )}
                            </button>

                            {showNotifPanel && (
                                <div className={styles.notifPanel}>
                                    <div className={styles.notifPanelHeader}>
                                        <span className={styles.notifPanelTitle}>🔔 Bildirimler</span>
                                        {unreadCount > 0 && (
                                            <button className={styles.markAllBtn} onClick={markAllRead}>
                                                Tümünü okundu işaretle
                                            </button>
                                        )}
                                    </div>

                                    <div className={styles.notifList}>
                                        {notifications.length === 0 ? (
                                            <div className={styles.notifEmpty}>
                                                <span>🔕</span>
                                                <p>Henüz bildirim yok</p>
                                            </div>
                                        ) : (
                                            notifications.slice(0, 20).map((notif) => (
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
                                                        {notifIcons[notif.type] || '🔔'}
                                                    </span>
                                                    <div className={styles.notifContent}>
                                                        <div className={styles.notifTitle}>{notif.title}</div>
                                                        <div className={styles.notifBody}>{notif.body}</div>
                                                        <div className={styles.notifTime}>
                                                            {new Date(notif.createdAt).toLocaleTimeString('tr-TR', {
                                                                hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </div>
                                                    </div>
                                                    {!notif.isRead && <span className={styles.unreadDot} />}
                                                </div>
                                            ))
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
                                <span className={styles.chevron}>▾</span>
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
                                        👤 Profilim
                                    </Link>
                                    <Link href="/settings" className={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                                        ⚙️ Ayarlar
                                    </Link>
                                    <Link href="/chat" className={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                                        💬 Mesajlarım
                                        {chatUnread > 0 && (
                                            <span className={styles.dropdownBadge}>{chatUnread}</span>
                                        )}
                                    </Link>

                                    {isDonor && (
                                        <Link href="/my-donations" className={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                                            📦 İlanlarım
                                        </Link>
                                    )}
                                    {isRecipient && (
                                        <Link href="/my-collections" className={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                                            🛍️ Koleksiyonlarım
                                        </Link>
                                    )}
                                    <Link href="/requests" className={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                                        📋 Talepler
                                    </Link>
                                    <Link href="/impact" className={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                                        📊 Etkileşimim
                                    </Link>

                                    <div className={styles.dropdownDivider} />
                                    <button className={styles.dropdownLogout} onClick={handleLogout}>
                                        🚪 Çıkış Yap
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
