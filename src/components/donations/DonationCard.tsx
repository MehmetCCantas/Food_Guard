'use client';

import styles from './DonationCard.module.css';
import { Product, ProductCategory } from '@/types';
import { requestService } from '@/services/requestService';
import { chatService } from '@/services/chatService';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { resolveImageUrl } from '@/utils/imageUrl';

interface DonationCardProps {
    product: Product;
    onRequestSuccess?: () => void;
}

const categoryLabels: Record<string, string> = {
    BAKERY: '🍞 Bakery',
    VEGETABLE: '🥬 Vegetable',
    MEAT: '🥩 Meat',
    DRY_FOOD: '🥫 Dry Food',
    OTHER: '📦 Other',
};

export default function DonationCard({ product, onRequestSuccess }: DonationCardProps) {
    const { user, isRecipient, isLoggedIn } = useAuth();
    const router = useRouter();
    const [requesting, setRequesting] = useState(false);
    const [requested, setRequested] = useState(() => {
        if (typeof window !== 'undefined') {
            const reqs = localStorage.getItem('mock_requests');
            if (reqs) {
                const parsed = JSON.parse(reqs);
                return parsed.some((r: any) => r.productId === product.id);
            }
        }
        return false;
    });
    const [messaging, setMessaging] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const isOwnListing = product.donorId === user?.id;

    const handleRequest = async () => {
        if (!isLoggedIn) {
            setShowLoginModal(true);
            return;
        }
        setRequesting(true);
        try {
            await requestService.createRequest(product.id, { message: 'I would like to request this food.' });
            setRequested(true);
            // Note: if onRequestSuccess triggers a list refresh,
            // the component may re-mount and reset local state.
            // Bu nedenle sadece lokal state'i true yapmak şimdilik deneyimi iyileştirir.
        } catch (error) {
            console.error('Request failed:', error);
            alert('Failed to submit request. Please try again.');
        } finally {
            setRequesting(false);
        }
    };

    const handleMessage = async () => {
        if (!isLoggedIn) {
            setShowLoginModal(true);
            return;
        }
        if (!product.donorId) return;
        setMessaging(true);
        try {
            const conv = await chatService.startConversation({
                recipientId: product.donorId,
                recipientName: product.donor?.fullName || 'Donor User',
                productId: product.id,
            });
            router.push(`/chat?conversationId=${conv.id}`);
        } catch (error) {
            console.error('Could not start conversation:', error);
            // Fallback: redirect to chat page
            router.push(`/chat`);
        } finally {
            setMessaging(false);
        }
    };

    const verifiedUrl = resolveImageUrl(product.imageUrl);

    return (
        <div className={styles.card}>
            {/* Login Modal Overlay */}
            {showLoginModal && (
                <div
                    className={styles.loginModalOverlay}
                    onClick={() => setShowLoginModal(false)}
                >
                    <div
                        className={styles.loginModal}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.loginModalIcon}>🔐</div>
                        <h3 className={styles.loginModalTitle}>Login Required</h3>
                        <p className={styles.loginModalDesc}>
                            You need to log in to your account to perform this action.
                        </p>
                        <div className={styles.loginModalActions}>
                            <button
                                className={styles.loginModalBtn}
                                onClick={() => router.push('/login')}
                            >
                                Log In
                            </button>
                            <button
                                className={styles.loginModalBtnSecondary}
                                onClick={() => router.push('/register')}
                            >
                                Sign Up
                            </button>
                        </div>
                        <button
                            className={styles.loginModalClose}
                            onClick={() => setShowLoginModal(false)}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.imageWrapper}>
                <img
                    src={verifiedUrl}
                    alt={product.title}
                    className={styles.image}
                />
            </div>
            <div className={styles.body}>
                <h3 className={styles.title}>{product.title}</h3>
                {product.description && (
                    <p className={styles.description}>{product.description}</p>
                )}
                <div className={styles.details}>
                    <span className={styles.category}>
                        {categoryLabels[product.category] || product.category}
                    </span>
                    <span className={styles.location}>
                        📍 {product.landmark && <strong style={{color: 'var(--primary)', marginRight: 5}}>{product.landmark},</strong>}
                        {product.neighborhood && `${product.neighborhood}, `}
                        {product.addressLine}, {product.postcode && `${product.postcode} `}
                        {product.district}/{product.city}
                    </span>
                </div>
                {product.warningMessage && (
                    <div className={styles.warningBanner}>
                        <span>⚠️</span>
                        <span>{product.warningMessage}</span>
                    </div>
                )}
                <div className={styles.footer}>
                    {/* Giriş yapılmamış misafir: butonlar görünür ama tıklayınca modal */}
                    {!isLoggedIn && (
                        <>
                            <button
                                className={styles.requestBtn}
                                onClick={handleRequest}
                            >
                                🤝 Request
                            </button>
                            <button
                                className={styles.messageBtn}
                                onClick={handleMessage}
                            >
                                💬 Message
                            </button>
                        </>
                    )}

                    {/* Alıcı ise: Request + Mesaj butonu */}
                    {isLoggedIn && isRecipient && !isOwnListing && (
                        <>
                            {requested ? (
                                <button className={styles.requestedBtn} disabled>
                                    ✓ Requested
                                </button>
                            ) : (
                                <button
                                    className={styles.requestBtn}
                                    onClick={handleRequest}
                                    disabled={requesting}
                                >
                                    {requesting ? 'Sending...' : '🤝 Request'}
                                </button>
                            )}
                            <button
                                className={styles.messageBtn}
                                onClick={handleMessage}
                                disabled={messaging}
                            >
                                {messaging ? '...' : '💬 Message'}
                            </button>
                        </>
                    )}

                    {/* If not the owner, show view-only tag */}
                    {isLoggedIn && !isRecipient && !isOwnListing && (
                        <span className={styles.viewOnlyTag}>👀 View Only</span>
                    )}
                </div>
            </div>
        </div>
    );
}
