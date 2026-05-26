'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { requestService } from '@/services/requestService';
import { DonationRequest, RequestStatus } from '@/types';
import styles from './impact.module.css';

export default function ImpactPage() {
    const { user, isDonor } = useAuth();
    const [loading, setLoading] = useState(true);
    const [mealsSaved, setMealsSaved] = useState(0);
    const [co2Offset, setCo2Offset] = useState('0.0');
    const [waterSaved, setWaterSaved] = useState(0);
    const [peopleHelped, setPeopleHelped] = useState(0);
    const [recentActivity, setRecentActivity] = useState<DonationRequest[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch requests depending on role
            let res;
            if (isDonor) {
                res = await requestService.getIncomingRequests(1, 100);
            } else {
                res = await requestService.getMyRequests(1, 100);
            }
            
            const reqs = res.data || [];
            
            // Completed requests only for stats
            const completed = reqs.filter(r => r.status === RequestStatus.COMPLETED);
            
            // Calculate meals
            let meals = 0;
            const uniquePeople = new Set<string>();
            
            completed.forEach(req => {
                meals += (req.quantity || 1);
                if (isDonor && req.recipient?.id) {
                    uniquePeople.add(req.recipient.id);
                } else if (!isDonor && req.product?.donor?.id) {
                    uniquePeople.add(req.product.donor.id);
                }
            });

            setMealsSaved(meals);
            setCo2Offset((meals * 1.25).toFixed(1)); // 1.25 kg CO2 per meal
            setWaterSaved(meals * 400); // 400 L water per meal
            setPeopleHelped(uniquePeople.size > 0 ? uniquePeople.size : meals); // fallback

            // Recent activity (Last 5 completed or accepted)
            const recent = reqs
                .filter(r => r.status === RequestStatus.COMPLETED || r.status === RequestStatus.ACCEPTED)
                .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
                .slice(0, 5);
            setRecentActivity(recent);

        } catch (error) {
            console.error('Failed to fetch impact stats:', error);
        } finally {
            setLoading(false);
        }
    }, [isDonor]);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, fetchData]);

    // Badges logic
    const hasEarlyBird = user?.createdAt ? (new Date().getTime() - new Date(user.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000) : false;
    const hasHighRated = (user?.ratingScore ?? 0) >= 4.5 && (user?.ratingCount ?? 0) > 0;
    const hasMealMaster = mealsSaved >= 10;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>My Impact</h1>
                <p className={styles.subtitle}>
                    See the difference you&apos;re making in the community and the environment.
                </p>
            </header>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>🌍</div>
                    <div className={styles.statValue}>{loading ? '-' : co2Offset} kg</div>
                    <div className={styles.statLabel}>CO2 Offset</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>🍽️</div>
                    <div className={styles.statValue}>{loading ? '-' : mealsSaved}</div>
                    <div className={styles.statLabel}>Meals Saved</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>💧</div>
                    <div className={styles.statValue}>{loading ? '-' : waterSaved} L</div>
                    <div className={styles.statLabel}>Water Saved</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>🤝</div>
                    <div className={styles.statValue}>{loading ? '-' : peopleHelped}</div>
                    <div className={styles.statLabel}>People Helped</div>
                </div>
            </div>

            <section className={styles.badgesSection}>
                <h2 className={styles.sectionTitle}>Badges & Achievements</h2>
                <div className={styles.badgesGrid}>
                    <div className={`${styles.badgeCard} ${!hasEarlyBird ? styles.badgeDisabled : ''}`} style={{ opacity: hasEarlyBird ? 1 : 0.4 }}>
                        <div className={styles.badgeIcon}>🌱</div>
                        <div className={styles.badgeName}>Early Bird</div>
                        <p className={styles.badgeDesc}>Joined in the first month!</p>
                    </div>
                    <div className={`${styles.badgeCard} ${!hasHighRated ? styles.badgeDisabled : ''}`} style={{ opacity: hasHighRated ? 1 : 0.4 }}>
                        <div className={styles.badgeIcon}>🌟</div>
                        <div className={styles.badgeName}>High Rated</div>
                        <p className={styles.badgeDesc}>Maintain a 4.5+ rating.</p>
                    </div>
                    <div className={`${styles.badgeCard} ${!hasMealMaster ? styles.badgeDisabled : ''}`} style={{ opacity: hasMealMaster ? 1 : 0.4 }}>
                        <div className={styles.badgeIcon}>🥘</div>
                        <div className={styles.badgeName}>Meal Master</div>
                        <p className={styles.badgeDesc}>Shared over 10 meals.</p>
                    </div>
                </div>
            </section>

            <section className={styles.historySection}>
                <h2 className={styles.sectionTitle}>Recent Activity</h2>
                <div className={styles.activityList}>
                    {recentActivity.length === 0 && !loading && (
                        <p style={{ color: 'var(--text-secondary)' }}>No recent activity to show yet.</p>
                    )}
                    {recentActivity.map(activity => (
                        <div key={activity.id} className={styles.activityItem}>
                            <div className={styles.activityDot} />
                            <div className={styles.activityContent}>
                                <div className={styles.activityText}>
                                    {isDonor 
                                        ? `Shared "${activity.product?.title || 'food'}"` 
                                        : `Received "${activity.product?.title || 'food'}"`}
                                </div>
                                <div className={styles.activityDate}>
                                    {new Date(activity.updatedAt || activity.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <div className={styles.activityItem}>
                        <div className={styles.activityDot} />
                        <div className={styles.activityContent}>
                            <div className={styles.activityText}>
                                Completed profile setup
                            </div>
                            <div className={styles.activityDate}>
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
