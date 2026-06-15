'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './profile.module.css';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { User, UserRole } from '@/types';

const roleLabels: Record<string, string> = {
    DONOR: '🏪 Donor',
    INDIVIDUAL_RECIPIENT: '👤 Individual Recipient',
    ORGANIZATIONAL_RECIPIENT: '🏢 Organizational Recipient',
    ADMIN: '⚙️ Admin',
};

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState<Partial<User>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setEditForm({
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                address: user.address,
            });
        }
    }, [user]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await userService.updateProfile({
                fullName: editForm.fullName,
                phoneNumber: editForm.phoneNumber,
                address: editForm.address,
            });
            await refreshUser();
            setEditMode(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (user) {
            setEditForm({
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                address: user.address,
            });
        }
        setEditMode(false);
    };

    const handleEdit = () => {
        if (user) {
            setEditForm({
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                address: user.address,
            });
        }
        setEditMode(true);
    };

    if (!user) {
        return (
            <div className={styles.loginGuard}>
                <div className={styles.loginGuardCard}>
                    <div className={styles.loginGuardIcon}>🔐</div>
                    <h1 className={styles.loginGuardTitle}>Profile Page</h1>
                    <p className={styles.loginGuardDesc}>
                        You need to log in to view and edit your personal information.
                    </p>
                    <div className={styles.loginGuardActions}>
                        <a href="/login" className={styles.loginGuardBtn}>
                            Log In
                        </a>
                        <a href="/register" className={styles.loginGuardBtnSecondary}>
                            Create Account
                        </a>
                    </div>
                    <p className={styles.loginGuardNote}>
                        Don't have an account?{' '}
                        <a href="/register" className={styles.loginGuardLink}>
                            Sign up for free →
                        </a>
                    </p>
                </div>
            </div>
        );
    }


    return (
        <div>
            <h1 className={styles.pageTitle}>My Profile</h1>

            <div className={styles.profileLayout}>
                {/* ---- Sidebar ---- */}
                <div className={styles.profileSidebar}>
                    <div className={styles.avatarLarge}>
                        <span className={styles.avatarLargeInitial}>
                            {user.fullName.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className={styles.profileName}>{user.fullName}</div>
                    <div className={styles.profileEmail}>{user.email}</div>
                    <div className={styles.roleBadge}>{roleLabels[user.role] || user.role}</div>
                    {(user.ratingCount ?? 0) > 0 && (
                        <div style={{ marginTop: '12px', fontSize: '1.1rem', fontWeight: 600, color: '#f59e0b' }}>
                            ⭐ {Number(user.ratingScore).toFixed(1)} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400 }}>({user.ratingCount} reviews)</span>
                        </div>
                    )}
                </div>

                {/* ---- Main Content ---- */}
                <div className={styles.profileMain}>
                    {/* Personal Information */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Personal Information</h2>
                            {!editMode && (
                                <button className={styles.editBtn} onClick={handleEdit}>
                                    ✏️ Edit
                                </button>
                            )}
                        </div>
                        <div className={styles.sectionBody}>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Full Name</label>
                                    {editMode ? (
                                        <input
                                            className={styles.formInput}
                                            value={editForm.fullName || ''}
                                            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                        />
                                    ) : (
                                        <div className={styles.formValue}>{user.fullName}</div>
                                    )}
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Email</label>
                                    <div className={styles.formValue}>{user.email}</div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Phone</label>
                                    {editMode ? (
                                        <input
                                            className={styles.formInput}
                                            value={editForm.phoneNumber || ''}
                                            onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                                        />
                                    ) : (
                                        <div className={styles.formValue}>{user.phoneNumber || '-'}</div>
                                    )}
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Role</label>
                                    <div className={styles.formValue}>{roleLabels[user.role] || user.role}</div>
                                </div>
                            </div>

                            {editMode && (
                                <div className={styles.saveActions}>
                                    <button className={styles.cancelBtn} onClick={handleCancel}>
                                        Cancel
                                    </button>
                                    <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Address */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Address</h2>
                            {!editMode && (
                                <button className={styles.editBtn} onClick={handleEdit}>
                                    ✏️ Edit
                                </button>
                            )}
                        </div>
                        <div className={styles.sectionBody}>
                            <div className={styles.formGroup}>
                                {editMode ? (
                                    <input
                                        className={styles.formInput}
                                        value={editForm.address || ''}
                                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                        placeholder="Enter your address"
                                    />
                                ) : (
                                    <div className={styles.formValue}>{user.address || '-'}</div>
                                )}
                            </div>

                            {editMode && (
                                <div className={styles.saveActions}>
                                    <button className={styles.cancelBtn} onClick={handleCancel}>
                                        Cancel
                                    </button>
                                    <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Account Info */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Account</h2>
                        </div>
                        <div className={styles.sectionBody}>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Status</label>
                                    <div className={styles.formValue}>{user.status}</div>
                                </div>
                                {user.createdAt && (
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Member Since</label>
                                        <div className={styles.formValue}>
                                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
