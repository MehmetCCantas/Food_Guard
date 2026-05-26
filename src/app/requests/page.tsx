'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './requests.module.css';
import { DonationRequest, RequestStatus } from '@/types';
import { requestService } from '@/services/requestService';
import { reviewService } from '@/services/reviewService';
import { useAuth } from '@/contexts/AuthContext';

const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getStatusClass = (status: RequestStatus) => {
    switch (status) {
        case RequestStatus.PENDING: return styles.statusPending;
        case RequestStatus.ACCEPTED: return styles.statusAccepted;
        case RequestStatus.REJECTED: return styles.statusRejected;
        case RequestStatus.COMPLETED: return styles.statusCompleted;
        default: return styles.statusPending;
    }
};

export default function RequestsPage() {
    const { user, isDonor, isRecipient } = useAuth();
    const [requests, setRequests] = useState<DonationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>(isDonor ? 'incoming' : 'outgoing');

    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewRequest, setReviewRequest] = useState<DonationRequest | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            let response;
            if (activeTab === 'incoming') {
                response = await requestService.getIncomingRequests(1, 100);
            } else {
                response = await requestService.getMyRequests(1, 100);
            }
            setRequests(response.data || []);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        if (user) {
            fetchRequests();
        }
    }, [fetchRequests, user]);

    const handleAccept = async (requestId: string) => {
        try {
            await requestService.acceptRequest(requestId);
            fetchRequests();
        } catch (error) {
            console.error('Failed to accept request:', error);
        }
    };

    const handleReject = async (requestId: string) => {
        try {
            await requestService.rejectRequest(requestId);
            fetchRequests();
        } catch (error) {
            console.error('Failed to reject request:', error);
        }
    };

    const handleComplete = async (requestId: string) => {
        try {
            await requestService.completeRequest(requestId);
            fetchRequests();
        } catch (error) {
            console.error('Failed to complete request:', error);
        }
    };

    const handleOpenReview = (request: DonationRequest) => {
        setReviewRequest(request);
        setRating(5);
        setComment('');
        setReviewModalOpen(true);
    };

    const handleSubmitReview = async () => {
        if (!reviewRequest) return;
        setSubmittingReview(true);
        try {
            await reviewService.createReview(reviewRequest.id, { rating, comment });
            setReviewModalOpen(false);
            setReviewRequest(null);
            alert('Review submitted successfully!');
        } catch (error) {
            console.error('Failed to submit review:', error);
            alert('Failed to submit review. You may have already reviewed this.');
        } finally {
            setSubmittingReview(false);
        }
    };

    const pendingCount = requests.filter(r => r.status === RequestStatus.PENDING).length;

    return (
        <div>
            {/* Header */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Requests</h1>

                {/* Tab Switcher */}
                <div className={styles.tabSwitcher}>
                    {isDonor && (
                        <button
                            className={activeTab === 'incoming' ? styles.tabActive : styles.tab}
                            onClick={() => setActiveTab('incoming')}
                        >
                            Incoming
                            {pendingCount > 0 && (
                                <span className={styles.tabBadge}>{pendingCount}</span>
                            )}
                        </button>
                    )}
                    <button
                        className={activeTab === 'outgoing' ? styles.tabActive : styles.tab}
                        onClick={() => setActiveTab('outgoing')}
                    >
                        My Requests
                    </button>
                </div>
            </div>

            {/* Requests List */}
            {loading ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>⏳</div>
                    <p className={styles.emptyText}>Loading requests...</p>
                </div>
            ) : requests.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        {activeTab === 'incoming' ? '📬' : '📤'}
                    </div>
                    <p className={styles.emptyText}>
                        {activeTab === 'incoming'
                            ? 'No incoming requests'
                            : 'You haven\'t made any requests yet'}
                    </p>
                    <p className={styles.emptySubtext}>
                        {activeTab === 'incoming'
                            ? 'When someone requests your food, it will appear here.'
                            : 'Browse the dashboard to find and request available food.'}
                    </p>
                </div>
            ) : (
                <div className={styles.requestsList}>
                    {requests.map((request) => (
                        <div key={request.id} className={styles.requestCard}>
                            <div className={styles.requestInfo}>
                                <div className={styles.requestTitle}>
                                    {request.product?.title || 'Food Request'}
                                </div>
                                <div className={styles.requestMeta}>
                                    <span className={styles.requestPerson}>
                                        {activeTab === 'incoming' ? '👤' : '🏪'}{' '}
                                        {activeTab === 'incoming'
                                            ? request.recipient?.fullName || 'Recipient'
                                            : request.product?.donor?.fullName || 'Donor'}
                                    </span>
                                    {request.quantity && (
                                        <span className={styles.requestQuantity}>
                                            📦 {request.quantity}
                                        </span>
                                    )}
                                    <span className={styles.requestDate}>
                                        {formatDate(request.createdAt)}
                                    </span>
                                </div>
                                {request.message && (
                                    <div className={styles.requestMessage}>
                                        &quot;{request.message}&quot;
                                    </div>
                                )}
                            </div>

                            <div className={styles.requestStatus}>
                                <span className={getStatusClass(request.status)}>
                                    {request.status}
                                </span>
                            </div>

                            {/* Actions for Donors */}
                            {activeTab === 'incoming' && request.status === RequestStatus.PENDING && (
                                <div className={styles.actions}>
                                    <button
                                        className={styles.acceptBtn}
                                        onClick={() => handleAccept(request.id)}
                                    >
                                        ✓ Accept
                                    </button>
                                    <button
                                        className={styles.rejectBtn}
                                        onClick={() => handleReject(request.id)}
                                    >
                                        ✕ Reject
                                    </button>
                                </div>
                            )}

                            {activeTab === 'outgoing' && request.status === RequestStatus.ACCEPTED && (
                                <div className={styles.actions}>
                                    <button
                                        className={styles.completeBtn}
                                        onClick={() => handleComplete(request.id)}
                                    >
                                        ✓ Mark Complete
                                    </button>
                                </div>
                            )}

                            {activeTab === 'outgoing' && request.status === RequestStatus.COMPLETED && (
                                <div className={styles.actions}>
                                    <button
                                        className={styles.reviewBtn}
                                        onClick={() => handleOpenReview(request)}
                                    >
                                        ⭐ Review Donor
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Review Modal */}
            {reviewModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setReviewModalOpen(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Rate your experience</h2>
                            <button className={styles.modalClose} onClick={() => setReviewModalOpen(false)}>×</button>
                        </div>
                        <div className={styles.starRating}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={star <= rating ? styles.starActive : styles.star}
                                    onClick={() => setRating(star)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <textarea
                            className={styles.reviewTextarea}
                            placeholder="Add a comment (optional)..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            maxLength={500}
                        />
                        <button
                            className={styles.submitReviewBtn}
                            onClick={handleSubmitReview}
                            disabled={submittingReview}
                        >
                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
