'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './collections.module.css';
import { DonationRequest, RequestStatus } from '@/types';
import { requestService } from '@/services/requestService';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
};

export default function MyCollectionsPage() {
    const { user, isRecipient } = useAuth();
    const [requests, setRequests] = useState<DonationRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCollections = useCallback(async () => {
        setLoading(true);
        try {
            const response = await requestService.getMyRequests(1, 100);
            // Show only accepted or completed items
            const collections = (response.data || []).filter(r => 
                r.status === RequestStatus.ACCEPTED || r.status === RequestStatus.COMPLETED
            );
            setRequests(collections);
        } catch (error) {
            console.error('Failed to fetch collections:', error);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchCollections();
        }
    }, [fetchCollections, user]);

    if (!isRecipient && !loading) {
        return <div className={styles.error}>This page is only for recipient accounts.</div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>My Collections</h1>
                <p className={styles.subtitle}>
                    Track the food items you&apos;ve successfully claimed and received.
                </p>
            </header>

            {loading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                    <span>Loading your collections...</span>
                </div>
            ) : requests.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🛍️</div>
                    <p className={styles.emptyText}>No items collected yet</p>
                    <p className={styles.emptySubtext}>
                        Browse the map and request food items to see them here.
                    </p>
                    <Link href="/map" className={styles.browseBtn}>
                        Browse Map
                    </Link>
                </div>
            ) : (
                <div className={styles.collectionsGrid}>
                    {requests.map((request) => (
                        <div key={request.id} className={styles.collectionCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.productInfo}>
                                    <h3 className={styles.productTitle}>
                                        {request.product?.title || 'Unknown Item'}
                                    </h3>
                                    <p className={styles.donorName}>
                                        Shared by {request.product?.donor?.fullName || 'Donor'}
                                    </p>
                                </div>
                                <div className={`${styles.statusBadge} ${
                                    request.status === RequestStatus.COMPLETED ? styles.statusCompleted : styles.statusAccepted
                                }`}>
                                    {request.status}
                                </div>
                            </div>

                            <div className={styles.cardDetails}>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Quantity</span>
                                    <span className={styles.detailValue}>{request.quantity || 1} item(s)</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Requested on</span>
                                    <span className={styles.detailValue}>{formatDate(request.createdAt)}</span>
                                </div>
                            </div>

                            <div className={styles.cardFooter}>
                                <Link 
                                    href={`/requests?id=${request.id}`} 
                                    className={styles.viewDetailsBtn}
                                >
                                    View Conversation
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
