'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../login/login.module.css';
import { authService } from '@/services/authService';

export default function ForgotPasswordPage() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setApiError('');
        setError('');
        setSuccessMessage('');

        if (!email.trim()) {
            setError('Email is required');
            return;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email');
            return;
        }

        setLoading(true);
        try {
            await authService.forgotPassword(email);
            setSuccessMessage('If an account with that email exists, a password reset link has been sent.');
        } catch (err: any) {
            console.error('Forgot password failed:', err);
            setApiError(err.message || 'An error occurred. Please try again.');
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
                    <h2 className={styles.formTitle}>Reset Password</h2>
                    <p className={styles.formSubtitle}>Enter your email to receive a password reset link</p>

                    {apiError && (
                        <div className={styles.apiError}>
                            <span>⚠️</span> {apiError}
                        </div>
                    )}

                    {successMessage && (
                        <div className={styles.apiError} style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)', borderColor: 'rgba(46, 204, 113, 0.3)', color: '#27ae60' }}>
                            <span>✅</span> {successMessage}
                        </div>
                    )}

                    <form className={styles.form} onSubmit={handleSubmit} noValidate>
                        <div className={styles.inputGroup}>
                            <label className={styles.label} htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                className={error ? styles.inputError : styles.input}
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                autoComplete="email"
                            />
                            {error && <span className={styles.errorText}>⚠ {error}</span>}
                        </div>

                        <button
                            type="submit"
                            className={loading ? styles.submitBtnLoading : styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? (
                                <><span className={styles.spinner} /> Sending...</>
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>
                    </form>

                    <p className={styles.switchText}>
                        Remember your password?{' '}
                        <Link href="/login" className={styles.switchLink}>
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
