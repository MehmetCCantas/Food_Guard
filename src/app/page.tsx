'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import styles from './landing.module.css';
import { 
    Utensils, 
    Sprout, 
    Rocket, 
    Eye, 
    UserPlus, 
    Package, 
    Handshake, 
    Map, 
    Bot, 
    MessageSquare, 
    BarChart3, 
    Bell, 
    Star, 
    Heart 
} from 'lucide-react';

export default function LandingPage() {
    const { isLoggedIn, isLoading } = useAuth();
    const router = useRouter();

    // If already logged in, redirect to dashboard
    useEffect(() => {
        if (!isLoading && isLoggedIn) {
            router.replace('/dashboard');
        }
    }, [isLoggedIn, isLoading, router]);

    // While checking auth, show nothing (avoids flash)
    if (isLoading) return null;
    if (isLoggedIn) return null;

    return (
        <div className={styles.landing}>
            {/* ---- Navbar ---- */}
            <nav className={styles.nav}>
                <div className={styles.navLogo}>
                    <Utensils size={24} className={styles.navLogoIcon} strokeWidth={2.5} />
                    <span>Food Guard</span>
                </div>
                <div className={styles.navActions}>
                    <Link href="/login" className={styles.navSignIn}>
                        Sign In
                    </Link>
                    <Link href="/register" className={styles.navSignUp}>
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* ---- Hero ---- */}
            <section className={styles.hero}>
                <div className={`${styles.heroGlow} ${styles.heroGlow1}`} />
                <div className={`${styles.heroGlow} ${styles.heroGlow2}`} />

                <div className={styles.heroContent}>
                    <div className={styles.heroBadge}>
                        <Sprout size={16} strokeWidth={2.5} />
                        <span>Fighting Food Waste Together</span>
                    </div>
                    <h1 className={styles.heroTitle}>
                        Share Surplus Food,{' '}
                        <span className={styles.heroTitleHighlight}>
                            Save Lives
                        </span>
                    </h1>
                    <p className={styles.heroDesc}>
                        Connect donors with those in need. Reduce food waste in your community 
                        by sharing meals that would otherwise go to waste — safely and easily.
                    </p>
                    <div className={styles.heroCta}>
                        <Link href="/register" className={styles.ctaPrimary}>
                            <Rocket size={18} />
                            <span>Start Sharing</span>
                        </Link>
                        <Link href="/login" className={styles.ctaSecondary}>
                            I Have an Account
                        </Link>
                    </div>
                    <div className={styles.heroGuestWrap}>
                        <Link href="/dashboard" className={styles.ctaGuest}>
                            <Eye size={16} />
                            <span>Giriş yapmadan keşfet</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ---- Stats ---- */}
            <section className={styles.statsBar}>
                <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                        <div className={styles.statNumber}>2,500+</div>
                        <div className={styles.statLabel}>Meals Shared</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statNumber}>800+</div>
                        <div className={styles.statLabel}>Active Donors</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statNumber}>1,200+</div>
                        <div className={styles.statLabel}>Recipients Helped</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statNumber}>50+</div>
                        <div className={styles.statLabel}>Communities</div>
                    </div>
                </div>
            </section>

            {/* ---- How It Works ---- */}
            <section className={styles.howItWorks}>
                <div className={styles.sectionLabel}>How It Works</div>
                <h2 className={styles.sectionTitle}>Simple Steps to Make an Impact</h2>
                <p className={styles.sectionDesc}>
                    Whether you&apos;re a restaurant owner with surplus food or someone in need, 
                    our platform makes connecting effortless.
                </p>

                <div className={styles.stepsGrid}>
                    <div className={styles.stepCard}>
                        <div className={styles.stepNumber}>1</div>
                        <span className={styles.stepIcon}>
                            <UserPlus size={36} strokeWidth={2} />
                        </span>
                        <h3 className={styles.stepTitle}>Create an Account</h3>
                        <p className={styles.stepDesc}>
                            Sign up as a donor or recipient. Restaurants, markets, and individuals 
                            can all contribute.
                        </p>
                    </div>

                    <div className={styles.stepCard}>
                        <div className={styles.stepNumber}>2</div>
                        <span className={styles.stepIcon}>
                            <Package size={36} strokeWidth={2} />
                        </span>
                        <h3 className={styles.stepTitle}>List or Browse Food</h3>
                        <p className={styles.stepDesc}>
                            Donors list surplus food with details, photos, and location. 
                            Recipients browse nearby listings on the map.
                        </p>
                    </div>

                    <div className={styles.stepCard}>
                        <div className={styles.stepNumber}>3</div>
                        <span className={styles.stepIcon}>
                            <Handshake size={36} strokeWidth={2} />
                        </span>
                        <h3 className={styles.stepTitle}>Connect & Share</h3>
                        <p className={styles.stepDesc}>
                            Request food, chat with donors, and arrange pickup. 
                            AI ensures food safety before every listing.
                        </p>
                    </div>
                </div>
            </section>

            {/* ---- Features ---- */}
            <section className={styles.features}>
                <div className={styles.featuresInner}>
                    <div className={styles.sectionLabel}>Platform Features</div>
                    <h2 className={styles.sectionTitle}>Everything You Need</h2>
                    <p className={styles.sectionDesc}>
                        A comprehensive platform designed for safe and efficient food sharing.
                    </p>

                    <div className={styles.featureGrid}>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <Map size={24} strokeWidth={2} />
                            </div>
                            <div className={styles.featureInfo}>
                                <h3 className={styles.featureTitle}>Interactive Map</h3>
                                <p className={styles.featureDesc}>
                                    Find nearby food listings on a real-time map. Filter by district, 
                                    category, and get directions instantly.
                                </p>
                            </div>
                        </div>

                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <Bot size={24} strokeWidth={2} />
                            </div>
                            <div className={styles.featureInfo}>
                                <h3 className={styles.featureTitle}>AI Food Safety</h3>
                                <p className={styles.featureDesc}>
                                    Every listing is analyzed by our AI to ensure food safety. 
                                    Risky items are automatically flagged or rejected.
                                </p>
                            </div>
                        </div>

                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <MessageSquare size={24} strokeWidth={2} />
                            </div>
                            <div className={styles.featureInfo}>
                                <h3 className={styles.featureTitle}>Real-time Chat</h3>
                                <p className={styles.featureDesc}>
                                    Communicate directly with donors or recipients through 
                                    our built-in messaging system.
                                </p>
                            </div>
                        </div>

                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <BarChart3 size={24} strokeWidth={2} />
                            </div>
                            <div className={styles.featureInfo}>
                                <h3 className={styles.featureTitle}>Impact Dashboard</h3>
                                <p className={styles.featureDesc}>
                                    Track community impact with stats, leaderboard, and see 
                                    how much food waste you&apos;ve helped prevent.
                                </p>
                            </div>
                        </div>

                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <Bell size={24} strokeWidth={2} />
                            </div>
                            <div className={styles.featureInfo}>
                                <h3 className={styles.featureTitle}>Smart Notifications</h3>
                                <p className={styles.featureDesc}>
                                    Get notified when new food is available nearby or when 
                                    someone requests your listing.
                                </p>
                            </div>
                        </div>

                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <Star size={24} strokeWidth={2} />
                            </div>
                            <div className={styles.featureInfo}>
                                <h3 className={styles.featureTitle}>Review System</h3>
                                <p className={styles.featureDesc}>
                                    Rate and review after each donation to build trust 
                                    and maintain community quality.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---- CTA ---- */}
            <section className={styles.cta}>
                <div className={styles.ctaBox}>
                    <h2 className={styles.ctaTitle}>Ready to Make a Difference?</h2>
                    <p className={styles.ctaDesc}>
                        Join thousands of donors and recipients already using Food Guard 
                        to reduce food waste in their communities.
                    </p>
                    <div className={styles.ctaButtons}>
                        <Link href="/register" className={styles.ctaPrimary}>
                            Create Free Account
                        </Link>
                        <Link href="/login" className={styles.ctaSecondary}>
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* ---- Footer ---- */}
            <footer className={styles.footer}>
                <p className={styles.footerText}>
                    © 2025 Food Guard Platform — Built with{' '}
                    <Heart size={14} className={styles.footerHeart} fill="#e74c3c" /> to fight food waste
                </p>
            </footer>
        </div>
    );
}
