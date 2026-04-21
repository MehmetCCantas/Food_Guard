'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './dashboard.module.css';
import DonationCard from '@/components/donations/DonationCard';
import DonationFilters from '@/components/donations/DonationFilters';
import { Product, ProductFilters } from '@/types';
import { productService } from '@/services/productService';
import { dashboardService, PlatformStats, LeaderboardEntry } from '@/services/dashboardService';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filters, setFilters] = useState<ProductFilters>({});
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(false);
    // Remove leaderboard and activeView as they are no longer needed
    const { isDonor, isRecipient, user } = useAuth();
    
    // Additional hooks for realistic counts
    const { totalUnread } = require('@/contexts/ChatContext').useChat();
    // For requests count, we can mock it or leave a placeholder if context isn't readily available, but I'll use 0 as default since it requires fetching
    const [requestCount, setRequestCount] = useState(0);
    
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await productService.getNearbyProducts(filters);
            setProducts(response.data || []);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const fetchDashboardData = useCallback(async () => {
        // Just fetch requests to calculate realistic counts
        try {
            const { requestService } = await import('@/services/requestService');
            const reqs = await requestService.getMyRequests(1, 100);
            setRequestCount(reqs.data?.length || 0);
        } catch (error) {
            console.error('Failed to fetch request counts:', error);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleFilterChange = (newFilters: ProductFilters) => {
        setFilters(newFilters);
    };

    const getMedalEmoji = (index: number) => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return `#${index + 1}`;
    };

    return (
        <div>
            {/* Platform Stats Cards */}
            <div className={styles.statsSection}>
                <div className={styles.statsGrid}>
                    {isDonor && (
                        <div className={styles.statCard}>
                            <div className={styles.statIconWrap}>
                                <span className={styles.statIcon}>📦</span>
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>
                                    {loading ? '—' : products.filter(p => p.donorId === user?.id).length}
                                </span>
                                <span className={styles.statLabel}>My Active Listings</span>
                            </div>
                        </div>
                    )}

                    {!isDonor && (
                        <div className={styles.statCard}>
                            <div className={styles.statIconWrap}>
                                <span className={styles.statIcon}>🏪</span>
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>
                                    {loading ? '—' : products.length}
                                </span>
                                <span className={styles.statLabel}>Available Listings</span>
                            </div>
                        </div>
                    )}
                    <div className={styles.statCard}>
                        <div className={`${styles.statIconWrap} ${styles.statIconBlue}`}>
                            <span className={styles.statIcon}>📋</span>
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>
                                {requestCount}
                            </span>
                            <span className={styles.statLabel}>{isDonor ? 'Incoming Requests' : 'My Requests'}</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={`${styles.statIconWrap} ${styles.statIconYellow}`}>
                            <span className={styles.statIcon}>💬</span>
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>
                                {totalUnread || 0}
                            </span>
                            <span className={styles.statLabel}>Unread Messages</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Listings Header */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{isDonor ? 'My Listings' : 'Available Food Listings'}</h1>
                <DonationFilters filters={filters} onFilterChange={handleFilterChange} />
            </div>

            {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner} />
                            <span>Loading listings...</span>
                        </div>
                    ) : products.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🍽️</div>
                            <p className={styles.emptyText}>No listings found</p>
                            <p className={styles.emptySubtext}>Try adjusting your filters or check back later.</p>
                        </div>
                    ) : (
                        <div className={styles.donationGrid}>
                            {products.map((product) => (
                                <DonationCard
                                    key={product.id}
                                    product={product}
                                    onRequestSuccess={() => fetchProducts()}
                                />
                            ))}
                        </div>
                    )}
        </div>
    );
}
