'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);

    const validate = (): boolean => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setApiError('');

        if (!validate()) return;

        setLoading(true);
        try {
            await login(email, password);
            router.push('/dashboard');
        } catch (error) {
            console.error('Login failed:', error);
            setApiError('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Left Branding Panel */}
            <div className={styles.brandPanel}>
                <div className={styles.brandLogo}>🍽️</div>
                <h1 className={styles.brandTitle}>FoodGuard Platform</h1>
                <p className={styles.brandSubtitle}>
                    Share surplus food with those in need. Reduce waste, feed communities.
                </p>
                <div className={styles.brandStats}>
                    <div className={styles.stat}>
                        <div className={styles.statNumber}>2,500+</div>
                        <div className={styles.statLabel}>Meals Shared</div>
                    </div>
                    <div className={styles.stat}>
                        <div className={styles.statNumber}>800+</div>
                        <div className={styles.statLabel}>Active Donors</div>
                    </div>
                    <div className={styles.stat}>
                        <div className={styles.statNumber}>50+</div>
                        <div className={styles.statLabel}>Communities</div>
                    </div>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className={styles.formPanel}>
                <div className={styles.formWrapper}>
                    <h2 className={styles.formTitle}>Welcome Back</h2>
                    <p className={styles.formSubtitle}>Sign in to your account to continue</p>

                    {apiError && (
                        <div className={styles.apiError}>
                            <span>⚠️</span> {apiError}
                        </div>
                    )}

                    <form className={styles.form} onSubmit={handleSubmit} noValidate>
                        <div className={styles.inputGroup}>
                            <label className={styles.label} htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                className={errors.email ? styles.inputError : styles.input}
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: undefined })); }}
                                autoComplete="email"
                            />
                            {errors.email && <span className={styles.errorText}>⚠ {errors.email}</span>}
                        </div>

                        <div className={styles.inputGroup}>
                            <div className={styles.passwordHeader}>
                                <label className={styles.label} htmlFor="password">Password</label>
                                <Link href="/forgot-password" className={styles.forgotPasswordLink}>
                                    Forgot Password?
                                </Link>
                            </div>
                            <input
                                id="password"
                                type="password"
                                className={errors.password ? styles.inputError : styles.input}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: undefined })); }}
                                autoComplete="current-password"
                            />
                            {errors.password && <span className={styles.errorText}>⚠ {errors.password}</span>}
                        </div>

                        <button
                            type="submit"
                            className={loading ? styles.submitBtnLoading : styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? (
                                <><span className={styles.spinner} /> Signing In...</>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <p className={styles.switchText}>
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className={styles.switchLink}>
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
