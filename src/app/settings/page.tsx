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
                            {saving ? '⏳ Saving...' : '💾 Save Changes'}
                        </button>
                    </div>

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
