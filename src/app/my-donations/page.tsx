'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import styles from './my-donations.module.css';
import { Product, ProductCategory } from '@/types';
import { productService } from '@/services/productService';
import { useAuth } from '@/contexts/AuthContext';
import { resolveImageUrl } from '@/utils/imageUrl';

const LocationPicker = dynamic(() => import('@/components/donations/LocationPicker'), {
    ssr: false,
    loading: () => (
        <div style={{ 
            height: '250px', 
            background: 'var(--bg-main)', 
            borderRadius: 'var(--radius-md)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid var(--border-light)',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem'
        }}>
            ⏳ Loading map...
        </div>
    ),
});

const categoryLabels: Record<string, string> = {
    BAKERY: 'Bakery',
    VEGETABLE: 'Vegetable',
    MEAT: 'Meat',
    DRY_FOOD: 'Dry Food',
    OTHER: 'Other',
};

const categoryOptions: { value: ProductCategory; label: string }[] = [
    { value: ProductCategory.BAKERY, label: 'Bakery' },
    { value: ProductCategory.VEGETABLE, label: 'Vegetable' },
    { value: ProductCategory.MEAT, label: 'Meat' },
    { value: ProductCategory.DRY_FOOD, label: 'Dry Food' },
    { value: ProductCategory.OTHER, label: 'Other' },
];

const storageOptions = [
    { value: 'fridge', label: 'Fridge' },
    { value: 'room_temp', label: 'Room Temperature' },
    { value: 'unknown', label: 'Unknown' },
];

interface NewProductForm {
    title: string;
    description: string;
    category: ProductCategory;
    city: string;
    district: string;
    neighborhood: string;
    landmark: string;
    addressLine: string;
    postcode: string;
    directions: string;
    latitude: number;
    longitude: number;
    storageCondition: string;
    storageDurationHours: number;
    hasSmellChange: boolean;
    file: File | null;
}

const defaultForm: NewProductForm = {
    title: '',
    description: '',
    category: ProductCategory.OTHER,
    city: 'Istanbul',
    district: '',
    neighborhood: '',
    landmark: '',
    addressLine: '',
    postcode: '',
    directions: '',
    latitude: 41.0082,
    longitude: 28.9784,
    storageCondition: 'room_temp',
    storageDurationHours: 24,
    hasSmellChange: false,
    file: null,
};

const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function MyDonationsPage() {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<NewProductForm>(defaultForm);
    const [submitting, setSubmitting] = useState(false);
    const [aiRejection, setAiRejection] = useState<string | null>(null);
    const [locationConfirmed, setLocationConfirmed] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const closeModal = () => {
        setShowModal(false);
        setEditMode(false);
        setEditingId(null);
        setForm(defaultForm);
        setAiRejection(null);
        setLocationConfirmed(false);
    };

    const fullAddressString = `${form.landmark} ${form.neighborhood} ${form.district} ${form.city} ${form.addressLine} ${form.postcode}`;

    const fetchMyProducts = useCallback(async () => {
        setLoading(true);
        try {
            const myProducts = await productService.getMyProducts();
            setProducts(myProducts);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user) {
            fetchMyProducts();
        }
    }, [fetchMyProducts, user]);

    const handleSubmit = async () => {
        if (!form.title || !form.district) return;
        setSubmitting(true);
        setAiRejection(null);

        try {
            const productPayload = {
                title: form.title,
                description: form.description,
                category: form.category,
                city: form.city,
                district: form.district,
                neighborhood: form.neighborhood,
                landmark: form.landmark,
                addressLine: form.addressLine,
                postcode: form.postcode,
                directions: form.directions,
                latitude: form.latitude,
                longitude: form.longitude,
                storageCondition: form.storageCondition as any,
                storageDurationHours: form.storageDurationHours,
                hasSmellChange: form.hasSmellChange,
                file: form.file || undefined,
            };

            if (editMode && editingId) {
                await productService.updateProduct(editingId, productPayload);
            } else {
                await productService.createProduct(productPayload);
            }

            closeModal();
            fetchMyProducts();
        } catch (error) {
            console.error('Failed to create product:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('AI Analizi') || errorMessage.includes('AI Analysis') || errorMessage.includes('Forbidden') || errorMessage.includes('403')) {
                setAiRejection(errorMessage.replace('API Error: 403 Forbidden', '').trim() || 'AI analysis found this product unsafe. Please check the product details.');
            } else {
                alert('Failed to create listing. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this listing?')) return;
        try {
            await productService.deleteProduct(id);
            fetchMyProducts();
        } catch (error) {
            console.error('Failed to delete product:', error);
        }
    };

    const handleEdit = (product: Product) => {
        setEditMode(true);
        setEditingId(product.id);
        setForm({
            title: product.title || '',
            description: product.description || '',
            category: product.category || ProductCategory.OTHER,
            city: product.city || 'Istanbul',
            district: product.district || '',
            neighborhood: product.neighborhood || '',
            landmark: product.landmark || '',
            addressLine: product.addressLine || '',
            postcode: product.postcode || '',
            directions: product.directions || '',
            latitude: product.latitude || 41.0082,
            longitude: product.longitude || 28.9784,
            storageCondition: product.storageCondition || 'room_temp',
            storageDurationHours: product.storageDurationHours || 24,
            hasSmellChange: product.hasSmellChange || false,
            file: null, 
        });
        setLocationConfirmed(true);
        setShowModal(true);
    };

    const stats = {
        total: products.length,
    };

    return (
        <div>
            {/* Header */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>My Listings</h1>
                <button className={styles.addBtn} onClick={() => setShowModal(true)}>
                    <span className={styles.addBtnIcon}>+</span>
                    Add New Listing
                </button>
            </div>

            {/* Stats */}
            <div className={styles.statsBar}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>📊</div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.total}</span>
                        <span className={styles.statLabel}>Total Listings</span>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            {loading ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>⏳</div>
                    <p className={styles.emptyText}>Loading listings...</p>
                </div>
            ) : products.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📦</div>
                    <p className={styles.emptyText}>No listings yet</p>
                    <p className={styles.emptySubtext}>Click &quot;Add New Listing&quot; to share your first food item.</p>
                </div>
            ) : (
                <div className={styles.donationGrid}>
                    {products.map((product) => {
                        const imageUrl = resolveImageUrl(product.imageUrl);

                        return (
                            <div key={product.id} className={styles.donationCard}>
                                <img
                                    src={imageUrl}
                                    alt={product.title}
                                    className={styles.cardImage}
                                />
                                <div className={styles.cardBody}>
                                    <div className={styles.cardHeader}>
                                        <h3 className={styles.cardTitle}>{product.title}</h3>
                                        <span className={styles.statusAvailable}>
                                            {categoryLabels[product.category] || product.category}
                                        </span>
                                    </div>

                                    {product.description && (
                                        <p className={styles.cardDesc}>{product.description}</p>
                                    )}

                                    {product.warningMessage && (
                                        <div className={styles.warningBanner}>
                                            <span className={styles.warningIcon}>⚠️</span>
                                            <span>{product.warningMessage}</span>
                                        </div>
                                    )}

                                    <div className={styles.cardDetails}>
                                        <span className={styles.detailItem}>
                                            <span className={styles.detailIcon}>📍</span>
                                            {product.landmark && <strong style={{color: 'var(--primary)', marginRight: 5}}>{product.landmark},</strong>}
                                            {product.neighborhood && `${product.neighborhood}, `}
                                            {product.addressLine}, {product.postcode && `${product.postcode} `}
                                            {product.district}/{product.city}
                                        </span>
                                        {product.directions && (
                                            <span className={styles.detailItem} style={{fontSize: '0.8rem', color: 'var(--text-light)', borderLeft: '2px solid var(--border-medium)', paddingLeft: 8, marginTop: 4}}>
                                                <em>Directions: {product.directions}</em>
                                            </span>
                                        )}
                                        <span className={styles.detailItem}>
                                            <span className={styles.detailIcon}>📅</span>
                                            {formatDate(product.createdAt)}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className={styles.cardActions}>
                                        <button
                                            className={styles.addBtn}
                                            style={{ backgroundColor: 'var(--primary)', color: 'white', marginRight: '8px', flex: 1, padding: '8px 12px', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)' }}
                                            onClick={() => handleEdit(product)}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            className={styles.closeBtn}
                                            style={{ flex: 1, padding: '8px 12px', fontSize: '0.9rem' }}
                                            onClick={() => handleDelete(product.id)}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Product Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>{editMode ? 'Edit Listing' : 'Add New Listing'}</h2>
                            <button className={styles.modalClose} onClick={closeModal}>
                                ✕
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            {/* AI Rejection Alert */}
                            {aiRejection && (
                                <div className={styles.aiRejectionBox}>
                                    <div className={styles.aiRejectionIcon}>🚫</div>
                                    <div className={styles.aiRejectionContent}>
                                        <strong>AI Analysis Rejected</strong>
                                        <p>{aiRejection}</p>
                                    </div>
                                    <button className={styles.aiRejectionClose} onClick={() => setAiRejection(null)}>✕</button>
                                </div>
                            )}

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Title *</label>
                                <input
                                    className={styles.formInput}
                                    type="text"
                                    placeholder="e.g. Fresh Bread, Leftover Meals..."
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Category</label>
                                    <select
                                        className={styles.formSelect}
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
                                    >
                                        {categoryOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Storage</label>
                                    <select
                                        className={styles.formSelect}
                                        value={form.storageCondition}
                                        onChange={(e) => setForm({ ...form, storageCondition: e.target.value })}
                                    >
                                        {storageOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>City *</label>
                                    <input
                                        className={styles.formInput}
                                        type="text"
                                        value={form.city}
                                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>District *</label>
                                    <input
                                        className={styles.formInput}
                                        type="text"
                                        placeholder="e.g. Kadıköy"
                                        value={form.district}
                                        onChange={(e) => setForm({ ...form, district: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Address Detail (Street, Apt, etc.) *</label>
                                <input
                                    className={styles.formInput}
                                    type="text"
                                    placeholder="e.g. Moda Cd. No:123"
                                    value={form.addressLine}
                                    onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Confirm Location on Map *</label>
                                <LocationPicker
                                    initialLat={form.latitude}
                                    initialLng={form.longitude}
                                    addressToSearch={(form.addressLine.length > 3 || form.district.length > 2 || form.landmark.length > 2) ? fullAddressString : undefined}
                                    onChange={(lat, lng) => setForm({ ...form, latitude: lat, longitude: lng })}
                                    onAddressFetch={(data) => {
                                       setForm(prev => ({ 
                                           ...prev, 
                                           city: data.city || prev.city,
                                           district: data.district || prev.district,
                                           neighborhood: data.neighborhood || prev.neighborhood,
                                           landmark: data.landmark || prev.landmark,
                                           postcode: data.postcode || prev.postcode,
                                           addressLine: data.street ? `${data.street}${data.houseNumber ? ` No:${data.houseNumber}` : ''}` : data.shortAddress 
                                       }));
                                   }}
                               />
                                <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, cursor: 'pointer', background: 'var(--bg-main)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={locationConfirmed}
                                        onChange={(e) => setLocationConfirmed(e.target.checked)}
                                    />
                                    <span>Is this location correct on the map?</span>
                                </label>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Directions / Landmark (Optional)</label>
                                <textarea
                                    className={styles.formTextarea}
                                    style={{ height: '60px' }}
                                    placeholder="e.g. Next to the pink building, 2nd floor, or Corner of the street..."
                                    value={form.directions}
                                    onChange={(e) => setForm({ ...form, directions: e.target.value })}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Storage Duration (hours)</label>
                                <input
                                    className={styles.formInput}
                                    type="number"
                                    min="1"
                                    value={form.storageDurationHours}
                                    onChange={(e) => setForm({ ...form, storageDurationHours: parseInt(e.target.value) || 24 })}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Description</label>
                                <textarea
                                    className={styles.formTextarea}
                                    placeholder="Describe the food items..."
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Photo (optional)</label>
                                <input
                                    className={styles.formInput}
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg"
                                    onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={form.hasSmellChange}
                                        onChange={(e) => setForm({ ...form, hasSmellChange: e.target.checked })}
                                    />
                                    <span className={styles.formLabel} style={{ margin: 0 }}>Has smell change?</span>
                                </label>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button
                                className={styles.submitBtn}
                                onClick={handleSubmit}
                                disabled={!form.title || !form.district || !locationConfirmed || submitting}
                            >
                                {submitting ? '🔍 AI Analyzing...' : 'Create Listing'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
