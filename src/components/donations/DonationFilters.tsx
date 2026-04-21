'use client';

import styles from './DonationFilters.module.css';
import { ProductFilters, ProductCategory } from '@/types';

interface DonationFiltersProps {
    filters: ProductFilters;
    onFilterChange: (filters: ProductFilters) => void;
}

const categoryOptions: { value: ProductCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All Types' },
    { value: ProductCategory.BAKERY, label: '🍞 Bakery' },
    { value: ProductCategory.VEGETABLE, label: '🥬 Vegetable' },
    { value: ProductCategory.MEAT, label: '🥩 Meat' },
    { value: ProductCategory.DRY_FOOD, label: '🥫 Dry Food' },
    { value: ProductCategory.OTHER, label: '📦 Other' },
];

export default function DonationFilters({ filters, onFilterChange }: DonationFiltersProps) {
    return (
        <div className={styles.filtersBar}>
            <select
                className={styles.select}
                value={filters.category || 'all'}
                onChange={(e) =>
                    onFilterChange({ ...filters, category: e.target.value as ProductCategory | 'all' })
                }
            >
                {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>

            <select
                className={styles.select}
                value={filters.radiusKm?.toString() || ''}
                onChange={(e) =>
                    onFilterChange({ ...filters, radiusKm: e.target.value ? Number(e.target.value) : undefined })
                }
            >
                <option value="">All Distances</option>
                <option value="1">Within 1 Km</option>
                <option value="3">Within 3 Km</option>
                <option value="5">Within 5 Km</option>
                <option value="10">Within 10 Km</option>
            </select>
        </div>
    );
}
