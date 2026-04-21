'use client';

import { useAuth } from '@/contexts/AuthContext';
import styles from './impact.module.css';

export default function ImpactPage() {
    const { user, isDonor } = useAuth();

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
                    <div className={styles.statValue}>12.5 kg</div>
                    <div className={styles.statLabel}>CO2 Offset</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>🍽️</div>
                    <div className={styles.statValue}>24</div>
                    <div className={styles.statLabel}>Meals Saved</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>💧</div>
                    <div className={styles.statValue}>150 L</div>
                    <div className={styles.statLabel}>Water Saved</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>🤝</div>
                    <div className={styles.statValue}>8</div>
                    <div className={styles.statLabel}>People Helped</div>
                </div>
            </div>

            <section className={styles.badgesSection}>
                <h2 className={styles.sectionTitle}>Badges & Achievements</h2>
                <div className={styles.badgesGrid}>
                    <div className={styles.badgeCard}>
                        <div className={styles.badgeIcon}>🌱</div>
                        <div className={styles.badgeName}>Early Bird</div>
                        <p className={styles.badgeDesc}>Joined in the first month!</p>
                    </div>
                    <div className={styles.badgeCard}>
                        <div className={styles.badgeIcon}>🌟</div>
                        <div className={styles.badgeName}>High Rated</div>
                        <p className={styles.badgeDesc}>Maintain a 4.5+ rating.</p>
                    </div>
                    <div className={styles.badgeCard}>
                        <div className={styles.badgeIcon}>🥘</div>
                        <div className={styles.badgeName}>Meal Master</div>
                        <p className={styles.badgeDesc}>Shared over 10 meals.</p>
                    </div>
                </div>
            </section>

            <section className={styles.historySection}>
                <h2 className={styles.sectionTitle}>Recent Activity</h2>
                <div className={styles.activityList}>
                    <div className={styles.activityItem}>
                        <div className={styles.activityDot} />
                        <div className={styles.activityContent}>
                            <div className={styles.activityText}>
                                {isDonor ? 'Shared "Fresh Tomatoes"' : 'Received "Fresh Tomatoes"'}
                            </div>
                            <div className={styles.activityDate}>2 days ago</div>
                        </div>
                    </div>
                    <div className={styles.activityItem}>
                        <div className={styles.activityDot} />
                        <div className={styles.activityContent}>
                            <div className={styles.activityText}>
                                Completed profile setup
                            </div>
                            <div className={styles.activityDate}>1 week ago</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
