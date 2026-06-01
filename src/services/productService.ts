// ==========================================
// Product Service — NestJS /api/v1/products endpoint
// ==========================================

import { apiClient } from './apiClient';
import { Product, ProductFilters, PaginatedResponse, ProductCategory } from '@/types';

/**
 * Get local products from localStorage
 */
const getLocalProducts = (): Product[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('mock_products');
    return stored ? JSON.parse(stored) : [];
};

/**
 * Save product to localStorage
 */
const saveLocalProduct = (product: Product) => {
    if (typeof window === 'undefined') return;
    const products = getLocalProducts();
    localStorage.setItem('mock_products', JSON.stringify([product, ...products]));
};

export const productService = {
    /**
     * Yakındaki ürünleri getir — GET /products/nearby
     * Fallback to LocalStorage if backend fails or in mock mode
     */
    async getNearbyProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
        try {
            const params: Record<string, string> = {};
            params.latitude = (filters?.latitude ?? 41.0082).toString();
            params.longitude = (filters?.longitude ?? 28.9784).toString();
            params.radiusKm = (filters?.radiusKm ?? 50).toString();

            if (filters?.category && filters.category !== 'all') params.category = filters.category;
            if (filters?.page) params.page = filters.page.toString();
            if (filters?.limit) params.limit = filters.limit.toString();

            return await apiClient.get<PaginatedResponse<Product>>('/products/nearby', params);
        } catch (error) {
            // Backend bağlı değilse localStorage mock verisine düş
            console.warn('Backend connection failed, using local mock data.');
            let localData = getLocalProducts();
            if (filters?.category && filters.category !== 'all') {
                localData = localData.filter(p => p.category === filters.category);
            }
            return {
                data: localData,
                meta: {
                    total: localData.length,
                    page: filters?.page || 1,
                    limit: filters?.limit || 10,
                    totalPages: 1
                }
            };
        }
    },

    async getMyProducts(): Promise<Product[]> {
        try {
            return await apiClient.get<Product[]>('/products/my-donations');
        } catch (error) {
            console.warn('Failed to get my donations from backend, fallback to local');
            // Mock fallback returns anything authored locally
            return getLocalProducts();
        }
    },

    async getProductById(id: string): Promise<Product> {
        // Check local first
        const local = getLocalProducts().find(p => p.id === id);
        if (local) return local;
        return apiClient.get<Product>(`/products/${id}`);
    },

    async createProduct(data: {
        title: string;
        description?: string;
        category: string;
        city: string;
        district: string;
        neighborhood?: string;
        landmark?: string;
        addressLine?: string;
        postcode?: string;
        directions?: string;
        latitude: number;
        longitude: number;
        storageCondition: string;
        storageDurationHours: number;
        hasSmellChange: boolean;
        file?: File;
    }): Promise<Product> {
        const formData = new FormData();
        formData.append('title', data.title);
        if (data.description) formData.append('description', data.description);
        formData.append('category', data.category);
        formData.append('city', data.city);
        formData.append('district', data.district);
        formData.append('latitude', data.latitude.toString());
        formData.append('longitude', data.longitude.toString());
        formData.append('storageCondition', data.storageCondition);
        formData.append('storageDurationHours', data.storageDurationHours.toString());
        formData.append('hasSmellChange', data.hasSmellChange.toString());
        if (data.file) formData.append('file', data.file);

        return await apiClient.postMultipart<Product>('/products', formData);
    },

    async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
        return apiClient.patch<Product>(`/products/${id}`, data);
    },

    async deleteProduct(id: string): Promise<void> {
        try {
            await apiClient.delete<void>(`/products/${id}`);
        } catch (error) {
            // Backend bağlı değilse sadece local'dan sil
            console.warn('Could not delete from backend, removing locally.');
            const products = getLocalProducts().filter(p => p.id !== id);
            localStorage.setItem('mock_products', JSON.stringify(products));
        }
    },
};
