'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './dashboard.module.css';
import DonationCard from '@/components/donations/DonationCard';
import DonationFilters from '@/components/donations/DonationFilters';
import { Product, ProductFilters } from '@/types';
import { productService } from '@/services/productService';
import { requestService } from '@/services/requestService';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { 
    Package, 
    Store, 
    ClipboardList, 
    MessageSquare, 
    Utensils 
} from 'lucide-react';

export default function DashboardPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filters, setFilters] = useState<ProductFilters>({});
    const [loading, setLoading] = useState(true);
    const { isDonor, user } = useAuth();
    const { totalUnread } = useChat();
    const [requestCount, setRequestCount] = useState(0);
    
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await productService.getNearbyProducts(filters);
            setProducts(response.data || []);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const fetchDashboardData = useCallback(async () => {
        try {
            // Donor: gelen talepleri say, Recipient: kendi taleplerini say
            const reqs = isDonor
                ? await requestService.getIncomingRequests(1, 100)
                : await requestService.getMyRequests(1, 100);
            setRequestCount(reqs.data?.length || 0);
        } catch (error) {
            console.error('Failed to fetch request counts:', error);
        }
    }, [isDonor]);


    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleFilterChange = (newFilters: ProductFilters) => {
        setFilters(newFilters);
    };

    return (
        <div className="animate-fade-in">
            {/* Platform Stats Cards */}
            <div className={styles.statsSection}>
                <div className={styles.statsGrid}>
                    {isDonor && (
                        <div className={styles.statCard}>
                            <div className={styles.statIconWrap}>
                                <Package size={22} className={styles.iconPrimary} />
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>
                                    {loading ? '—' : products.filter(p => p.donorId === user?.id).length}
                                </span>
                                <span className={styles.statLabel}>Aktif İlanlarım</span>
                            </div>
                        </div>
                    )}

                    {!isDonor && (
                        <div className={styles.statCard}>
                            <div className={styles.statIconWrap}>
                                <Store size={22} className={styles.iconPrimary} />
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>
                                    {loading ? '—' : products.length}
                                </span>
                                <span className={styles.statLabel}>Mevcut İlanlar</span>
                            </div>
                        </div>
                    )}
                    <div className={styles.statCard}>
                        <div className={`${styles.statIconWrap} ${styles.statIconBlue}`}>
                            <ClipboardList size={22} className={styles.iconBlue} />
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>
                                {requestCount}
                            </span>
                            <span className={styles.statLabel}>{isDonor ? 'Gelen Talepler' : 'Taleplerim'}</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={`${styles.statIconWrap} ${styles.statIconYellow}`}>
                            <MessageSquare size={22} className={styles.iconYellow} />
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>
                                {totalUnread || 0}
                            </span>
                            <span className={styles.statLabel}>Okunmamış Mesajlar</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Listings Header */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{isDonor ? 'İlanlarım' : 'Mevcut Gıda İlanları'}</h1>
                <DonationFilters filters={filters} onFilterChange={handleFilterChange} />
            </div>

            {loading ? (
                <div className={styles.skeletonGrid}>
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className={styles.skeletonCard}>
                            <div className={styles.skeletonImage} />
                            <div className={styles.skeletonBody}>
                                <div className={styles.skeletonTitle} />
                                <div className={styles.skeletonText} />
                                <div className={styles.skeletonMeta} />
                                <div className={styles.skeletonButtons} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className={styles.emptyState}>
                    <Utensils size={48} strokeWidth={1.5} className={styles.emptyIconSvg} />
                    <p className={styles.emptyText}>İlan bulunamadı</p>
                    <p className={styles.emptySubtext}>Filtrelerinizi ayarlamayı deneyin veya daha sonra tekrar kontrol edin.</p>
                </div>
            ) : (
                <div className={styles.donationGrid}>
                    {products.map((product) => (
                        <DonationCard
                            key={product.id}
                            product={product}
                            onRequestSuccess={() => fetchProducts()}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

