'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './register.module.css';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, RegisterDto } from '@/types';

interface FormErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    role?: string;
    phoneNumber?: string;
    address?: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<UserRole | ''>('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        if (!firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }
        if (!lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

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

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!role) {
            newErrors.role = 'Please select a role';
        }

        if (!phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        }

        if (!address.trim()) {
            newErrors.address = 'Address is required';
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
            const dto: RegisterDto = {
                firstName,
                lastName,
                email,
                password,
                role: role as UserRole,
                phoneNumber,
                address,
            };
            await register(dto);
            router.push('/dashboard');
        } catch (error) {
            console.error('Registration failed:', error);
            setApiError('Registration failed. This email may already be in use.');
        } finally {
            setLoading(false);
        }
    };

    const clearError = (field: keyof FormErrors) => {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    return (
        <div className={styles.container}>
            {/* Left Branding Panel */}
            <div className={styles.brandPanel}>
                <div className={styles.brandLogo}>🌱</div>
                <h1 className={styles.brandTitle}>Join Food Guard</h1>
                <p className={styles.brandSubtitle}>
                    Be part of a community that fights food waste and feeds those in need.
                </p>
                <div className={styles.features}>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>🤝</span>
                        <span>Connect with donors & recipients nearby</span>
                    </div>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>📍</span>
                        <span>Find food donations on an interactive map</span>
                    </div>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>♻️</span>
                        <span>Reduce food waste, help the environment</span>
                    </div>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>🔒</span>
                        <span>Secure and easy-to-use platform</span>
                    </div>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className={styles.formPanel}>
                <div className={styles.formWrapper}>
                    <h2 className={styles.formTitle}>Create Account</h2>
                    <p className={styles.formSubtitle}>Fill in the details to get started</p>

                    {apiError && (
                        <div className={styles.apiError}>
                            <span>⚠️</span> {apiError}
                        </div>
                    )}

                    <form className={styles.form} onSubmit={handleSubmit} noValidate>
                        {/* Name Fields */}
                        <div className={styles.row}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label} htmlFor="firstName">First Name</label>
                                <input
                                    id="firstName"
                                    type="text"
                                    className={errors.firstName ? styles.inputError : styles.input}
                                    placeholder="John"
                                    value={firstName}
                                    onChange={(e) => { setFirstName(e.target.value); clearError('firstName'); }}
                                />
                                {errors.firstName && <span className={styles.errorText}>⚠ {errors.firstName}</span>}
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label} htmlFor="lastName">Last Name</label>
                                <input
                                    id="lastName"
                                    type="text"
                                    className={errors.lastName ? styles.inputError : styles.input}
                                    placeholder="Doe"
                                    value={lastName}
                                    onChange={(e) => { setLastName(e.target.value); clearError('lastName'); }}
                                />
                                {errors.lastName && <span className={styles.errorText}>⚠ {errors.lastName}</span>}
                            </div>
                        </div>

                        {/* Email */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label} htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                className={errors.email ? styles.inputError : styles.input}
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                                autoComplete="email"
                            />
                            {errors.email && <span className={styles.errorText}>⚠ {errors.email}</span>}
                        </div>

                        {/* Phone Number */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label} htmlFor="phoneNumber">Phone Number</label>
                            <input
                                id="phoneNumber"
                                type="tel"
                                className={errors.phoneNumber ? styles.inputError : styles.input}
                                placeholder="+90 555 123 4567"
                                value={phoneNumber}
                                onChange={(e) => { setPhoneNumber(e.target.value); clearError('phoneNumber'); }}
                                autoComplete="tel"
                            />
                            {errors.phoneNumber && <span className={styles.errorText}>⚠ {errors.phoneNumber}</span>}
                        </div>

                        {/* Address */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label} htmlFor="address">Address</label>
                            <input
                                id="address"
                                type="text"
                                className={errors.address ? styles.inputError : styles.input}
                                placeholder="City, District, Street..."
                                value={address}
                                onChange={(e) => { setAddress(e.target.value); clearError('address'); }}
                                autoComplete="street-address"
                            />
                            {errors.address && <span className={styles.errorText}>⚠ {errors.address}</span>}
                        </div>

                        {/* Password */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label} htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                className={errors.password ? styles.inputError : styles.input}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                                autoComplete="new-password"
                            />
                            {errors.password && <span className={styles.errorText}>⚠ {errors.password}</span>}
                        </div>

                        {/* Confirm Password */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label} htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                className={errors.confirmPassword ? styles.inputError : styles.input}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); clearError('confirmPassword'); }}
                                autoComplete="new-password"
                            />
                            {errors.confirmPassword && <span className={styles.errorText}>⚠ {errors.confirmPassword}</span>}
                        </div>

                        {/* Role Selection */}
                        <div className={styles.roleGroup}>
                            <label className={styles.label}>I want to...</label>
                            <div className={styles.roleOptions}>
                                <div
                                    className={role === UserRole.DONOR ? styles.roleOptionActive : styles.roleOption}
                                    onClick={() => { setRole(UserRole.DONOR); clearError('role'); }}
                                >
                                    <span className={styles.roleIcon}>🍲</span>
                                    <span className={styles.roleLabel}>Donate Food</span>
                                    <span className={styles.roleDesc}>Share surplus food with those in need</span>
                                </div>
                                <div
                                    className={role === UserRole.INDIVIDUAL_RECIPIENT ? styles.roleOptionActive : styles.roleOption}
                                    onClick={() => { setRole(UserRole.INDIVIDUAL_RECIPIENT); clearError('role'); }}
                                >
                                    <span className={styles.roleIcon}>🙏</span>
                                    <span className={styles.roleLabel}>Receive Food</span>
                                    <span className={styles.roleDesc}>Find food donations nearby</span>
                                </div>
                            </div>
                            {errors.role && <span className={styles.errorText}>⚠ {errors.role}</span>}
                        </div>

                        <button
                            type="submit"
                            className={loading ? styles.submitBtnLoading : styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? (
                                <><span className={styles.spinner} /> Creating Account...</>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <p className={styles.switchText}>
                        Already have an account?{' '}
                        <Link href="/login" className={styles.switchLink}>
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
