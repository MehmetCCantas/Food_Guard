'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './settings.module.css';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { authService } from '@/services/authService';
import { User } from '@/types';
import { firebaseAuth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

const roleLabels: Record<string, string> = {
    DONOR: '🏪 Donor',
    INDIVIDUAL_RECIPIENT: '👤 Individual Recipient',
    ORGANIZATIONAL_RECIPIENT: '🏢 Organizational Recipient',
    ADMIN: '⚙️ Admin',
};

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
}

export default function SettingsPage() {
    const { user, refreshUser } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState<FormData>({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
    });
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Doğrulama gereken alanları takip et
    const [emailNeedsVerification, setEmailNeedsVerification] = useState(false);
    const [phoneNeedsVerification, setPhoneNeedsVerification] = useState(false);

    const [verifyingEmail, setVerifyingEmail] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationLoading, setVerificationLoading] = useState(false);

    const [verifyingPhone, setVerifyingPhone] = useState(false);
    const [phoneVerificationCode, setPhoneVerificationCode] = useState('');
    const [phoneVerificationLoading, setPhoneVerificationLoading] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                address: user.address || '',
            });
            // Kullanıcı verisi yenilenince doğrulama uyarılarını temizle
            setEmailNeedsVerification(false);
            setPhoneNeedsVerification(false);
        }
    }, [user]);

    const handleSave = async () => {
        if (!form.firstName.trim()) {
            setError('First name is required.');
            return;
        }
        setSaving(true);
        setError(null);
        setSuccess(false);

        const emailChanged = form.email.trim() !== (user?.email || '');
        const phoneChanged = form.phoneNumber.trim() !== (user?.phoneNumber || '');

        try {
            const payload: Partial<User> = {
                firstName: form.firstName,
                lastName: form.lastName,
                phoneNumber: form.phoneNumber,
                address: form.address,
            };
            if (emailChanged) payload.email = form.email.trim();

            await userService.updateProfile(payload);
            await refreshUser();
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);

            // Değişen alanlar için doğrulama akışını otomatik tetikle
            if (emailChanged) {
                setEmailNeedsVerification(true);
                try {
                    await authService.sendVerificationEmail();
                    setVerifyingEmail(true);
                } catch (e) {
                    console.warn('Email verification send failed:', e);
                }
            }
            if (phoneChanged && form.phoneNumber.length >= 10) {
                // Reset Firebase verifier so user gets a fresh SMS flow
                if (recaptchaVerifierRef.current) {
                    recaptchaVerifierRef.current.clear();
                    recaptchaVerifierRef.current = null;
                }
                setConfirmationResult(null);
                setPhoneVerificationCode('');
                setVerifyingPhone(false);
                // Panel is always visible — user will click "Send SMS Code" manually
            }
        } catch (err: any) {
            if (emailChanged && (err?.response?.status === 400 || err?.response?.status === 422)) {
                setError('Failed to update email address. The backend may not support this operation.');
            } else {
                setError('Failed to save. Please try again.');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') return;
        setDeleting(true);
        try {
            await userService.deleteAccount();
            await authService.logout();
            router.push('/');
        } catch (err) {
            setError('Failed to delete account. Please try again.');
            setDeleting(false);
        }
    };

    // Email: resend code
    const handleResendEmailVerification = async () => {
        setVerificationLoading(true);
        setError(null);
        try {
            await authService.sendVerificationEmail();
            setVerifyingEmail(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send verification email.');
        } finally {
            setVerificationLoading(false);
        }
    };

    // Email: verify code
    const handleVerifyCode = async () => {
        if (verificationCode.length !== 6) return;
        setVerificationLoading(true);
        setError(null);
        try {
            await authService.verifyEmail(verificationCode);
            await refreshUser();
            setVerifyingEmail(false);
            setEmailNeedsVerification(false);
            setVerificationCode('');
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid or expired verification code.');
        } finally {
            setVerificationLoading(false);
        }
    };

    // Phone: Send SMS via Firebase
    const handleResendPhoneVerification = async () => {
        const phoneNum = form.phoneNumber.trim();
        if (!phoneNum || phoneNum.length < 10) {
            setError('Please enter a valid phone number (e.g. +90 555 123 4567)');
            return;
        }
        setPhoneVerificationLoading(true);
        setError(null);
        try {
            const formattedPhone = phoneNum.startsWith('+') ? phoneNum : `+90${phoneNum.replace(/^0/, '')}`;

            // Create verifier only once — reuse on subsequent calls
            if (!firebaseAuth) {
                setError('Phone verification is not configured.');
                return;
            }
            if (!recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
                    size: 'invisible',
                    callback: () => {},
                });
            }

            const result = await signInWithPhoneNumber(firebaseAuth!, formattedPhone, recaptchaVerifierRef.current);
            setConfirmationResult(result);
            setVerifyingPhone(true);
            setPhoneNeedsVerification(true);
        } catch (err: any) {
            console.error('Firebase phone auth error:', err);
            setError('Failed to send SMS: ' + (err?.message || 'Unknown error'));
            // Only clear verifier on actual error
            if (recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current.clear();
                recaptchaVerifierRef.current = null;
            }
        } finally {
            setPhoneVerificationLoading(false);
        }
    };

    // Phone: Confirm code + send Firebase ID Token to backend
    const handleVerifyPhoneCode = async () => {
        if (!confirmationResult || phoneVerificationCode.length < 6) return;
        setPhoneVerificationLoading(true);
        setError(null);
        try {
            const result = await confirmationResult.confirm(phoneVerificationCode);
            const idToken = await result.user.getIdToken();
            await authService.verifyPhone(idToken);
            await refreshUser();
            setVerifyingPhone(false);
            setPhoneNeedsVerification(false);
            setPhoneVerificationCode('');
            setConfirmationResult(null);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || err?.message || 'Invalid SMS code or verification failed.');
        } finally {
            setPhoneVerificationLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordForm.currentPassword || !passwordForm.newPassword) {
            setError('Please fill in all password fields.');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
            setError('New passwords do not match.');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            setError('New password must be at least 6 characters long.');
            return;
        }

        setPasswordSaving(true);
        setError(null);
        setPasswordSuccess(false);

        try {
            await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
            setPasswordSuccess(true);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
            setTimeout(() => setPasswordSuccess(false), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to change password. Please check your current password.');
        } finally {
            setPasswordSaving(false);
        }
    };

    if (!user) {
        return (
            <div className={styles.container}>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Please sign in.
                </p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>⚙️ Settings</h1>
                <p className={styles.pageSubtitle}>Update your account information</p>
            </div>

            <div className={styles.settingsLayout}>
                {/* ---- Left: Profile Summary ---- */}
                <aside className={styles.profileCard}>
                    <div className={styles.avatar}>
                        <span className={styles.avatarInitial}>
                            {(user.firstName || user.fullName || '?').charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className={styles.profileName}>{user.fullName}</div>
                    <div className={styles.profileEmail}>{user.email}</div>
                    <div className={styles.roleBadge}>{roleLabels[user.role] || user.role}</div>
                    <div className={styles.accountStatus}>
                        <span className={styles.statusDot} />
                        {user.status}
                    </div>
                </aside>

                {/* ---- Right: Form ---- */}
                <div className={styles.formArea}>
                    {success && (
                        <div className={styles.successBanner}>
                            ✅ Changes saved successfully!
                        </div>
                    )}
                    {error && (
                        <div className={styles.errorBanner}>
                            ❌ {error}
                        </div>
                    )}

                    {/* Personal Info */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>👤 Personal Information</h2>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>First Name *</label>
                                <input
                                    className={styles.input}
                                    type="text"
                                    value={form.firstName}
                                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                    placeholder="Your first name"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Last Name</label>
                                <input
                                    className={styles.input}
                                    type="text"
                                    value={form.lastName}
                                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                    placeholder="Your last name"
                                />
                            </div>
                        </div>

                        {/* Email — editable */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Email
                                {emailNeedsVerification && (
                                    <span className={styles.pendingBadge}>⚠️ Verification required</span>
                                )}
                            </label>
                            <input
                                className={styles.input}
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="Your email address"
                            />
                            <span className={styles.fieldHint}>If you change it, you will need to verify your new address.</span>
                        </div>

                        {/* Email Verification Status — always visible */}
                        <div className={styles.verificationPanel}>
                            <div className={styles.verificationPanelHeader}>
                                <span className={styles.verificationPanelIcon}>📧</span>
                                <div style={{ flex: 1 }}>
                                    <div className={styles.verificationPanelTitle}>Email Verification</div>
                                    <div className={styles.verificationPanelDesc}>
                                        {user.isEmailVerified
                                            ? '✅ Your email address is verified.'
                                            : verifyingEmail
                                                ? 'Enter the 6-digit code sent to your email.'
                                                : 'Your email is not verified yet. Click below to receive a code.'}
                                    </div>
                                </div>
                                {user.isEmailVerified && (
                                    <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap' }}>✔ Verified</span>
                                )}
                            </div>
                            {!user.isEmailVerified && (
                                verifyingEmail ? (
                                    <div className={styles.verificationInputGroup}>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            placeholder="6-digit code"
                                            className={styles.input}
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                        />
                                        <button
                                            className={styles.saveBtn}
                                            onClick={handleVerifyCode}
                                            disabled={verificationLoading || verificationCode.length !== 6}
                                        >
                                            {verificationLoading ? '⏳ Verifying...' : '✓ Verify Code'}
                                        </button>
                                        <button
                                            className={styles.cancelBtn}
                                            onClick={() => setVerifyingEmail(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        className={styles.secondaryBtn}
                                        onClick={handleResendEmailVerification}
                                        disabled={verificationLoading}
                                    >
                                        {verificationLoading ? '⏳ Sending...' : '📨 Send Verification Email'}
                                    </button>
                                )
                            )}
                        </div>

                        {/* Phone */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Phone</label>
                            <input
                                className={styles.input}
                                type="tel"
                                value={form.phoneNumber}
                                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                                placeholder="+90 5XX XXX XX XX"
                            />
                        </div>

                        {/* Invisible reCAPTCHA container required by Firebase */}
                        <div id="recaptcha-container" />

                        {/* Phone Verification — always visible */}
                        <div className={styles.verificationPanel}>
                            <div className={styles.verificationPanelHeader}>
                                <span className={styles.verificationPanelIcon}>📱</span>
                                <div style={{ flex: 1 }}>
                                    <div className={styles.verificationPanelTitle}>Phone Verification</div>
                                    <div className={styles.verificationPanelDesc}>
                                        {user.isPhoneVerified
                                            ? '✅ Your phone number is verified.'
                                            : verifyingPhone
                                                ? 'Enter the 6-digit SMS code sent to your phone.'
                                                : 'Enter your phone number above, then click Send SMS.'}
                                    </div>
                                </div>
                                {user.isPhoneVerified && (
                                    <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap' }}>✔ Verified</span>
                                )}
                            </div>
                            {!user.isPhoneVerified && (
                                verifyingPhone ? (
                                    <div className={styles.verificationInputGroup}>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            placeholder="6-digit SMS code"
                                            className={styles.input}
                                            value={phoneVerificationCode}
                                            onChange={(e) => setPhoneVerificationCode(e.target.value.replace(/\D/g, ''))}
                                        />
                                        <button
                                            className={styles.saveBtn}
                                            onClick={handleVerifyPhoneCode}
                                            disabled={phoneVerificationLoading || phoneVerificationCode.length < 6}
                                        >
                                            {phoneVerificationLoading ? '⏳ Verifying...' : '✓ Verify Code'}
                                        </button>
                                        <button
                                            className={styles.cancelBtn}
                                            onClick={() => { setVerifyingPhone(false); setPhoneVerificationCode(''); }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        className={styles.secondaryBtn}
                                        onClick={handleResendPhoneVerification}
                                        disabled={phoneVerificationLoading}
                                    >
                                        {phoneVerificationLoading ? '⏳ Sending SMS...' : '📱 Send SMS Code'}
                                    </button>
                                )
                            )}
                            {!user.isPhoneVerified && process.env.NODE_ENV === 'development' && (
                                <div style={{ marginTop: '12px' }}>
                                    <button
                                        type="button"
                                        className={styles.cancelBtn}
                                        style={{ borderColor: '#eab308', color: '#d97706', width: '100%', fontSize: '13px', fontWeight: 600 }}
                                        onClick={async () => {
                                            setPhoneVerificationLoading(true);
                                            setError(null);
                                            try {
                                                await authService.verifyPhone('mock-phone-token');
                                                await refreshUser();
                                                setSuccess(true);
                                                setTimeout(() => setSuccess(false), 3000);
                                            } catch (err: any) {
                                                setError(err.response?.data?.message || 'Bypass failed.');
                                            } finally {
                                                setPhoneVerificationLoading(false);
                                            }
                                        }}
                                    >
                                        ⚠️ Bypass Phone Verification (DEV ONLY)
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Address */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>📍 Address</h2>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Your Address</label>
                            <textarea
                                className={styles.textarea}
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                placeholder="Enter your address..."
                                rows={3}
                            />
                        </div>
                    </section>

                    {/* Account (Read-Only) */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>🔐 Account</h2>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Role</label>
                                <div className={styles.readonlyField}>{roleLabels[user.role] || user.role}</div>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Status</label>
                                <div className={styles.readonlyField}>{user.status}</div>
                            </div>
                            {user.createdAt && (
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Member Since</label>
                                    <div className={styles.readonlyField}>
                                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Save */}
                    <div className={styles.formActions}>
                        <button
                            className={styles.saveBtn}
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? '⏳ Saving...' : '💾 Save Profile Changes'}
                        </button>
                    </div>

                    {/* Security: Change Password */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>🔑 Change Password</h2>
                        {passwordSuccess && (
                            <div className={styles.successBanner} style={{ marginBottom: '16px' }}>
                                ✅ Password updated successfully!
                            </div>
                        )}
                        <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                            <label className={styles.label}>Current Password</label>
                            <input
                                className={styles.input}
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                placeholder="Enter current password"
                            />
                        </div>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>New Password</label>
                                <input
                                    className={styles.input}
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Confirm New Password</label>
                                <input
                                    className={styles.input}
                                    type="password"
                                    value={passwordForm.confirmNewPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                        <div className={styles.formActions} style={{ marginTop: '16px' }}>
                            <button
                                className={styles.secondaryBtn}
                                onClick={handleChangePassword}
                                disabled={passwordSaving}
                            >
                                {passwordSaving ? '⏳ Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </section>

                    {/* ---- Danger Zone: Delete Account ---- */}
                    <section className={styles.dangerZone}>
                        <h2 className={styles.dangerTitle}>⚠️ Danger Zone</h2>
                        <p className={styles.dangerDesc}>
                            Once you delete your account, there is no going back. All your data, listings, 
                            and messages will be permanently removed.
                        </p>
                        
                        {!showDeleteConfirm ? (
                            <button 
                                className={styles.deleteAccountBtn}
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                🗑️ Delete My Account
                            </button>
                        ) : (
                            <div className={styles.deleteConfirmBox}>
                                <p className={styles.deleteConfirmText}>
                                    Type <strong>DELETE</strong> to confirm account deletion:
                                </p>
                                <input
                                    className={styles.deleteConfirmInput}
                                    type="text"
                                    placeholder="Type DELETE here"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    autoFocus
                                />
                                <div className={styles.deleteConfirmActions}>
                                    <button
                                        className={styles.deleteConfirmCancel}
                                        onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className={styles.deleteConfirmSubmit}
                                        onClick={handleDeleteAccount}
                                        disabled={deleteConfirmText !== 'DELETE' || deleting}
                                    >
                                        {deleting ? '⏳ Deleting...' : '🗑️ Permanently Delete'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
