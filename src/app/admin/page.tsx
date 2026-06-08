'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './admin.module.css';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/apiClient';
import { User, Product, DonationRequest, UserRole } from '@/types';

type AdminTab = 'users' | 'listings' | 'requests';

export default function AdminPage() {
    const { user, isAdmin, isLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<AdminTab>('users');
    const [users, setUsers] = useState<User[]>([]);
    const [listings, setListings] = useState<Product[]>([]);
    const [requests, setRequests] = useState<DonationRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        try {
            const data = await apiClient.get<User[]>('/admin/users');
            setUsers(Array.isArray(data) ? data : []);
        } catch {
            console.warn('Could not fetch users (admin endpoint may not exist yet)');
            setUsers([]);
        }
    }, []);

    const fetchListings = useCallback(async () => {
        try {
            const response = await apiClient.get<{ data: Product[] }>('/products/nearby', {
                latitude: '41.0082',
                longitude: '28.9784',
                radiusKm: '1000',
                limit: '200',
            });
            setListings(response.data || []);
        } catch {
            console.warn('Could not fetch listings');
            setListings([]);
        }
    }, []);

    const fetchRequests = useCallback(async () => {
        try {
            const data = await apiClient.get<DonationRequest[]>('/requests/incoming');
            setRequests(Array.isArray(data) ? data : []);
        } catch {
            console.warn('Could not fetch requests');
            setRequests([]);
        }
    }, []);

    useEffect(() => {
        if (!isAdmin) return;
        setLoading(true);
        Promise.all([fetchUsers(), fetchListings(), fetchRequests()])
            .finally(() => setLoading(false));
    }, [isAdmin, fetchUsers, fetchListings, fetchRequests]);

    const handleDeleteListing = async (id: string) => {
        if (!confirm('Are you sure you want to delete this listing?')) return;
        try {
            await apiClient.delete(`/products/${id}`);
            setListings(prev => prev.filter(l => l.id !== id));
        } catch {
            alert('Failed to delete listing.');
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Are you sure you want to remove this user?')) return;
        try {
            await apiClient.delete(`/users/${id}`);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch {
            alert('Failed to delete user.');
        }
    };

    // ---- Access check ----
    if (isLoading) return null;

    if (!isAdmin) {
        return (
            <div className={styles.adminContainer}>
                <div className={styles.accessDenied}>
                    <div className={styles.accessDeniedIcon}>🚫</div>
                    <h2 className={styles.accessDeniedTitle}>Access Denied</h2>
                    <p className={styles.accessDeniedText}>
                        You do not have permission to view this page. Only administrators can access the admin panel.
                    </p>
                </div>
            </div>
        );
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'DONOR': return <span className={styles.roleDonor}>Donor</span>;
            case 'ADMIN': return <span className={styles.roleAdmin}>Admin</span>;
            default: return <span className={styles.roleRecipient}>Recipient</span>;
        }
    };

    const getStatusBadge = (status?: string, verificationStatus?: string) => {
        const val = status || verificationStatus;
        switch (val?.toUpperCase()) {
            case 'VERIFIED': return <span className={styles.statusActive}>Verified</span>;
            case 'PENDING': return <span className={styles.statusPending}>Pending</span>;
            case 'UNVERIFIED': return <span className={styles.statusInactive}>Unverified</span>;
            default: return <span className={styles.statusInactive}>{val || 'Unknown'}</span>;
        }
    };

    const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

    return (
        <div className={styles.adminContainer}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>🛡️ Admin Panel</h1>
                <p className={styles.pageSubtitle}>Manage users, listings, and platform activity</p>
            </div>

            {/* ---- Stats ---- */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIconUsers}>👥</div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{users.length}</span>
                        <span className={styles.statLabel}>Total Users</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIconListings}>📦</div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{listings.length}</span>
                        <span className={styles.statLabel}>Active Listings</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIconRequests}>📋</div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{requests.length}</span>
                        <span className={styles.statLabel}>Total Requests</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIconMessages}>🏪</div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{users.filter(u => u.role === UserRole.DONOR).length}</span>
                        <span className={styles.statLabel}>Donors</span>
                    </div>
                </div>
            </div>

            {/* ---- Tabs ---- */}
            <div className={styles.tabs}>
                <button className={activeTab === 'users' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('users')}>
                    👥 Users ({users.length})
                </button>
                <button className={activeTab === 'listings' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('listings')}>
                    📦 Listings ({listings.length})
                </button>
                <button className={activeTab === 'requests' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('requests')}>
                    📋 Requests ({requests.length})
                </button>
            </div>

            {/* ---- Content ---- */}
            {loading ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>⏳</div>
                    <p className={styles.emptyText}>Loading data...</p>
                </div>
            ) : (
                <>
                    {/* Users Table */}
                    {activeTab === 'users' && (
                        <div className={styles.tableWrapper}>
                            {users.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>👥</div>
                                    <p className={styles.emptyText}>No users found</p>
                                </div>
                            ) : (
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Joined</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id}>
                                                <td><strong>{u.fullName || `${u.firstName} ${u.lastName}`}</strong></td>
                                                <td>{u.email}</td>
                                                <td>{getRoleBadge(u.role)}</td>
                                                <td>{getStatusBadge(u.status, (u as any).verificationStatus)}</td>
                                                <td>{formatDate(u.createdAt)}</td>
                                                <td>
                                                    {u.id !== user?.id && (
                                                        <button className={styles.actionBtnDanger} onClick={() => handleDeleteUser(u.id)}>
                                                            Remove
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* Listings Table */}
                    {activeTab === 'listings' && (
                        <div className={styles.tableWrapper}>
                            {listings.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>📦</div>
                                    <p className={styles.emptyText}>No listings found</p>
                                </div>
                            ) : (
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Category</th>
                                            <th>Location</th>
                                            <th>Donor</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {listings.map(l => (
                                            <tr key={l.id}>
                                                <td><strong>{l.title}</strong></td>
                                                <td><span className={styles.roleBadge}>{l.category}</span></td>
                                                <td>{l.district && l.city ? `${l.district}, ${l.city}` : l.city || '—'}</td>
                                                <td>{l.donor?.fullName || '—'}</td>
                                                <td>{formatDate(l.createdAt)}</td>
                                                <td>
                                                    <button className={styles.actionBtnDanger} onClick={() => handleDeleteListing(l.id)}>
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* Requests Table */}
                    {activeTab === 'requests' && (
                        <div className={styles.tableWrapper}>
                            {requests.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>📋</div>
                                    <p className={styles.emptyText}>No requests found</p>
                                </div>
                            ) : (
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Listing</th>
                                            <th>Recipient</th>
                                            <th>Message</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.map(r => (
                                            <tr key={r.id}>
                                                <td><strong>{r.product?.title || r.productId || '—'}</strong></td>
                                                <td>{r.recipient?.fullName || r.recipientId || '—'}</td>
                                                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {r.message || '—'}
                                                </td>
                                                <td>{getStatusBadge(r.status)}</td>
                                                <td>{formatDate(r.createdAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
