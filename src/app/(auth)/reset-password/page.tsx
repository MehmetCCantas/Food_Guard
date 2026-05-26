'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../login/login.module.css';
import { authService } from '@/services/authService';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setApiError('Invalid or missing reset token.');
        }
    }, [token]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setApiError('');
        setError('');
        setSuccessMessage('');

        if (!token) {
            setApiError('Invalid or missing reset token.');
            return;
        }

        if (!password) {
            setError('Password is required');
            return;
        } else if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword(token, password);
            setSuccessMessage('Password successfully reset. You can now login.');
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err: any) {
            console.error('Reset password failed:', err);
            setApiError(err.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.formWrapper}>
            <h2 className={styles.formTitle}>Set New Password</h2>
            <p className={styles.formSubtitle}>Enter your new password below</p>

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
                    <label className={styles.label} htmlFor="password">New Password</label>
                    <input
                        id="password"
                        type="password"
                        className={error ? styles.inputError : styles.input}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        disabled={!token || !!successMessage}
                    />
                    {error && <span className={styles.errorText}>⚠ {error}</span>}
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label} htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        className={error ? styles.inputError : styles.input}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                        disabled={!token || !!successMessage}
                    />
                </div>

                <button
                    type="submit"
                    className={loading ? styles.submitBtnLoading : styles.submitBtn}
                    disabled={loading || !token || !!successMessage}
                >
                    {loading ? (
                        <><span className={styles.spinner} /> Resetting...</>
                    ) : (
                        'Reset Password'
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
    );
}

export default function ResetPasswordPage() {
    return (
        <div className={styles.container}>
            {/* Left Branding Panel */}
            <div className={styles.brandPanel}>
                <div className={styles.brandLogo}>🍽️</div>
                <h1 className={styles.brandTitle}>Food Guard Platform</h1>
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
                <Suspense fallback={<div>Loading...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
