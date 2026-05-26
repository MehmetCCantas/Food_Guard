'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './settings.module.css';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { authService } from '@/services/authService';
import { User } from '@/types';

const roleLabels: Record<string, string> = {
    DONOR: '🏪 Donor',
    INDIVIDUAL_RECIPIENT: '👤 Individual Recipient',
    ORGANIZATIONAL_RECIPIENT: '🏢 Organizational Recipient',
    ADMIN: '⚙️ Admin',
};

interface FormData {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: string;
}

export default function SettingsPage() {
    const { user, refreshUser } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState<FormData>({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: '',
    });
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [verifyingEmail, setVerifyingEmail] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationSent, setVerificationSent] = useState(false);
    const [verificationLoading, setVerificationLoading] = useState(false);

    const [verifyingPhone, setVerifyingPhone] = useState(false);
    const [phoneVerificationCode, setPhoneVerificationCode] = useState('');
    const [phoneVerificationLoading, setPhoneVerificationLoading] = useState(false);

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
                phoneNumber: user.phoneNumber || '',
                address: user.address || '',
            });
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
        try {
            await userService.updateProfile({
                firstName: form.firstName,
                lastName: form.lastName,
                phoneNumber: form.phoneNumber,
                address: form.address,
            });
            await refreshUser();
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError('Failed to save. Please try again.');
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

    const handleSendVerification = async () => {
        setVerificationLoading(true);
        setError(null);
        try {
            await authService.sendVerificationEmail();
            setVerificationSent(true);
            setVerifyingEmail(true);
            alert('Verification code sent! (Check backend console for the mock code)');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send verification email.');
        } finally {
            setVerificationLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (verificationCode.length !== 6) return;
        setVerificationLoading(true);
        setError(null);
        try {
            await authService.verifyEmail(verificationCode);
            await refreshUser();
            setVerifyingEmail(false);
            setVerificationSent(false);
            setVerificationCode('');
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid or expired verification code.');
        } finally {
            setVerificationLoading(false);
        }
    };

    const handleSendPhoneVerification = async () => {
        if (!form.phoneNumber || form.phoneNumber.length < 10) {
            setError("Please enter a valid phone number (e.g. +905...) and save changes first.");
            return;
        }
        setPhoneVerificationLoading(true);
        setError(null);
        try {
            await authService.sendPhoneVerification();
            setVerifyingPhone(true);
            alert('MOCK SMS Verification code sent! (Check backend console)');
        } catch (err: any) {
            console.error(err);
            setError('Failed to send SMS: ' + (err.response?.data?.message || err.message));
        } finally {
            setPhoneVerificationLoading(false);
        }
    };

    const handleVerifyPhoneCode = async () => {
        if (phoneVerificationCode.length < 6) return;
        setPhoneVerificationLoading(true);
        setError(null);
        try {
            await authService.verifyPhone(phoneVerificationCode);
            await refreshUser();
            
            setVerifyingPhone(false);
            setPhoneVerificationCode('');
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid SMS code or verification failed.');
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

                    {/* TODO(Verification): Uncomment and complete email/phone verification flow when the app is ready for production.
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>🛡️ Security & Verification</h2>
                        <div className={styles.verificationBox}>
                            <div className={styles.verificationHeader}>
                                <div>
                                    <h3 className={styles.verificationTitle}>Email Verification</h3>
                                    <p className={styles.verificationDesc}>
                                        Verify your email to build trust in the community.
                                    </p>
                                </div>
                                {user.isEmailVerified ? (
                                    <div className={styles.badgeVerified}>✅ Verified</div>
                                ) : (
                                    <div className={styles.badgeUnverified}>❌ Unverified</div>
                                )}
                            </div>

                            {!user.isEmailVerified && (
                                <div className={styles.verificationAction}>
                                    {!verifyingEmail ? (
                                        <button 
                                            className={styles.secondaryBtn} 
                                            onClick={handleSendVerification}
                                            disabled={verificationLoading}
                                        >
                                            {verificationLoading ? 'Sending...' : 'Verify My Email'}
                                        </button>
                                    ) : (
                                        <div className={styles.verificationInputGroup}>
                                            <input 
                                                type="text" 
                                                maxLength={6}
                                                placeholder="Enter 6-digit code"
                                                className={styles.input}
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                            />
                                            <button 
                                                className={styles.saveBtn}
                                                onClick={handleVerifyCode}
                                                disabled={verificationLoading || verificationCode.length !== 6}
                                            >
                                                {verificationLoading ? 'Verifying...' : 'Submit Code'}
                                            </button>
                                            <button 
                                                className={styles.cancelBtn}
                                                onClick={() => setVerifyingEmail(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className={styles.verificationHeader} style={{ marginTop: '24px' }}>
                                <div>
                                    <h3 className={styles.verificationTitle}>Phone Verification</h3>
                                    <p className={styles.verificationDesc}>
                                        Verify your phone number for secure pickups.
                                    </p>
                                </div>
                                {user.isPhoneVerified ? (
                                    <div className={styles.badgeVerified}>✅ Verified</div>
                                ) : (
                                    <div className={styles.badgeUnverified}>❌ Unverified</div>
                                )}
                            </div>

                            {!user.isPhoneVerified && (
                                <div className={styles.verificationAction}>
                                    {!verifyingPhone ? (
                                        <button 
                                            className={styles.secondaryBtn} 
                                            onClick={handleSendPhoneVerification}
                                            disabled={phoneVerificationLoading}
                                        >
                                            {phoneVerificationLoading ? 'Sending SMS...' : 'Verify My Phone'}
                                        </button>
                                    ) : (
                                        <div className={styles.verificationInputGroup}>
                                            <input 
                                                type="text" 
                                                maxLength={6}
                                                placeholder="Enter 6-digit SMS code"
                                                className={styles.input}
                                                value={phoneVerificationCode}
                                                onChange={(e) => setPhoneVerificationCode(e.target.value)}
                                            />
                                            <button 
                                                className={styles.saveBtn}
                                                onClick={handleVerifyPhoneCode}
                                                disabled={phoneVerificationLoading || phoneVerificationCode.length < 6}
                                            >
                                                {phoneVerificationLoading ? 'Verifying...' : 'Submit Code'}
                                            </button>
                                            <button 
                                                className={styles.cancelBtn}
                                                onClick={() => setVerifyingPhone(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                    */}

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

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Email</label>
                            <input
                                className={`${styles.input} ${styles.inputDisabled}`}
                                type="email"
                                value={user.email}
                                disabled
                            />
                            <span className={styles.fieldHint}>Email cannot be changed</span>
                        </div>

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
