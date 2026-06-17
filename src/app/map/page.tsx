'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import styles from './map.module.css';
import { Product, ProductCategory } from '@/types';
import { productService } from '@/services/productService';
import { useAuth } from '@/contexts/AuthContext';
import type { MapClientHandle } from './MapClient';

// Dynamic import — Leaflet requires window object
const MapClient = dynamic(() => import('./MapClient'), {
    ssr: false,
    loading: () => (
        <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Loading map...</span>
        </div>
    ),
});



const categoryOptions = [
    { value: 'all', label: 'All' },
    { value: ProductCategory.BAKERY, label: 'Bakery' },
    { value: ProductCategory.VEGETABLE, label: 'Vegetable' },
    { value: ProductCategory.MEAT, label: 'Meat' },
    { value: ProductCategory.DRY_FOOD, label: 'Dry Food' },
    { value: ProductCategory.OTHER, label: 'Other' },
];

export default function MapPage() {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [city, setCity] = useState('all');
    const [district, setDistrict] = useState('all');
    const [activeCategory, setActiveCategory] = useState('all');
    const [mapType, setMapType] = useState<'map' | 'satellite'>('map');
    const [isLoaded, setIsLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const mapRef = useRef<MapClientHandle>(null);
    const { user } = useAuth();

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const hasSetInitialLocation = useRef(false);

    // Fetch products from backend
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await productService.getNearbyProducts({ limit: 100 });
                setAllProducts(response.data || []);
            } catch (error) {
                console.error('Failed to fetch products for map:', error);
                setAllProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const normalizeStr = (str: string) => {
        return str.toLowerCase()
            .replace(/ı/g, 'i').replace(/ü/g, 'u')
            .replace(/ş/g, 's').replace(/ö/g, 'o')
            .replace(/ç/g, 'c').replace(/ğ/g, 'g');
    };

    const dynamicCities = useMemo(() => {
        const cities = new Set<string>();
        allProducts.forEach(p => {
            if (p.city) cities.add(p.city);
        });
        
        const options = Array.from(cities).map(c => ({
            value: normalizeStr(c),
            label: c
        }));
        options.sort((a,b) => a.label.localeCompare(b.label));
        return [{ value: 'all', label: 'All Cities' }, ...options];
    }, [allProducts]);

    const dynamicDistricts = useMemo(() => {
        const dists = new Set<string>();
        allProducts.forEach(p => {
            if (p.district && (city === 'all' || normalizeStr(p.city || '') === city)) {
                dists.add(p.district);
            }
        });
        
        const options = Array.from(dists).map(d => ({
            value: normalizeStr(d),
            label: d
        }));
        options.sort((a, b) => a.label.localeCompare(b.label));

        return [{ value: 'all', label: 'All Districts' }, ...options];
    }, [allProducts, city]);

    const filteredProducts = useMemo(() => {
        let filtered = [...allProducts];

        if (city !== 'all') {
            filtered = filtered.filter((p) => {
                if (!p.city) return false;
                return normalizeStr(p.city).includes(normalizeStr(city));
            });
        }

        if (district !== 'all') {
            filtered = filtered.filter((p) => {
                if (!p.district) return false;
                return normalizeStr(p.district).includes(normalizeStr(district));
            });
        }

        if (activeCategory !== 'all') {
            filtered = filtered.filter((p) => p.category === activeCategory);
        }

        return filtered;
    }, [allProducts, city, district, activeCategory]);

    const handleMarkerClick = useCallback((product: Product) => {
        const el = document.getElementById(`listing-${product.id}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.style.boxShadow = '0 0 0 2px var(--primary)';
            setTimeout(() => {
                el.style.boxShadow = '';
            }, 2000);
        }
    }, []);

    const handleViewClick = useCallback((product: Product) => {
        if (product.latitude && product.longitude && mapRef.current) {
            mapRef.current.flyTo(product.latitude, product.longitude, 16);
            setTimeout(() => {
                mapRef.current?.openPopup(product.id);
            }, 1300);
        }
    }, []);

    const handleDirections = useCallback((product: Product) => {
        if (product.latitude && product.longitude) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${product.latitude},${product.longitude}`;
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }, []);

    // Map center: Istanbul
    const mapCenter: [number, number] = [41.0082, 28.9784];

    // Adapt products to the format MapClient expects (Donation-like shape)
    const mapDonations = filteredProducts.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=300&fit=crop',
        foodType: p.category?.toLowerCase() || 'other',
        quantity: '',
        quantityNum: 0,
        quantityUnit: '',
        distance: '',
        distanceKm: 0,
        expiryDate: p.createdAt || '',
        donorId: p.donorId || '',
        donorName: p.donor?.fullName || '',
        latitude: p.latitude,
        longitude: p.longitude,
        neighborhood: p.neighborhood,
        landmark: p.landmark,
        addressLine: p.addressLine,
        postcode: p.postcode,
        directions: p.directions,
        donationType: 'leftover' as const,
        status: (p.status || 'available') as 'available',
        createdAt: p.createdAt || '',
    }));

    const categoryLabels: Record<string, string> = {
        BAKERY: 'Bakery',
        VEGETABLE: 'Vegetable',
        MEAT: 'Meat',
        DRY_FOOD: 'Dry Food',
        OTHER: 'Other',
    };

    return (
        <div>
            <h1 className={styles.pageTitle}>Map View</h1>

            <div className={styles.mapLayout}>
                {/* ---- Map ---- */}
                <div className={styles.mapContainer}>
                    <div className={styles.mapTypeToggle}>
                        <button
                            className={mapType === 'map' ? styles.mapTypeBtnActive : styles.mapTypeBtn}
                            onClick={() => setMapType('map')}
                        >
                            Map
                        </button>
                        <button
                            className={mapType === 'satellite' ? styles.mapTypeBtnActive : styles.mapTypeBtn}
                            onClick={() => setMapType('satellite')}
                        >
                            Satellite
                        </button>
                    </div>

                    <button className={styles.fullscreenBtn} title="Fullscreen">
                        ⛶
                    </button>

                    {isLoaded && (
                        <MapClient
                            ref={mapRef}
                            donations={mapDonations}
                            center={mapCenter}
                            zoom={12}
                            onMarkerClick={(d: any) => handleMarkerClick(filteredProducts.find(p => p.id === d.id)!)}
                        />
                    )}
                </div>

                {/* ---- Right Panel ---- */}
                <div className={styles.rightPanel}>
                    {/* Filter Section */}
                    <div className={styles.filterSection}>
                        <div className={styles.filterTitle}>Filter Section</div>
                        <div className={styles.filterGrid}>
                            <div className={styles.filterGroup}>
                                <label className={styles.filterLabel}>City:</label>
                                <select
                                    className={styles.filterSelect}
                                    value={city}
                                    onChange={(e) => { 
                                        setCity(e.target.value); 
                                        setDistrict('all'); 
                                    }}
                                >
                                    {dynamicCities.map((c) => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.filterGroup}>
                                <label className={styles.filterLabel}>District:</label>
                                <select
                                    className={styles.filterSelect}
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                    disabled={dynamicDistricts.length <= 1 && district === 'all'}
                                >
                                    {dynamicDistricts.map((d) => (
                                        <option key={d.value} value={d.value}>{d.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className={styles.typeTags}>
                            {categoryOptions.map((cat) => (
                                <button
                                    key={cat.value}
                                    className={activeCategory === cat.value ? styles.typeTagActive : styles.typeTag}
                                    onClick={() => setActiveCategory(cat.value)}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Listings Section */}
                    <div className={styles.listingsSection}>
                        <div className={styles.listingsTitle}>
                            Listings ({filteredProducts.length})
                        </div>

                        <div className={styles.listingsScroll}>
                            {loading ? (
                                <div className={styles.emptyListings}>
                                    <div className={styles.emptyIcon}>⏳</div>
                                    <p>Loading listings...</p>
                                </div>
                            ) : filteredProducts.length === 0 ? (
                                <div className={styles.emptyListings}>
                                    <div className={styles.emptyIcon}>🔍</div>
                                    <p>No listings found for current filters</p>
                                </div>
                            ) : (
                                filteredProducts.map((product) => {
                                    const apiBase = process.env.NEXT_PUBLIC_API_URL 
                                        ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '') 
                                        : 'http://localhost:3001';
                                    
                                    const rawImageUrl = product.imageUrl || '';
                                    const isAbsoluteUrl = rawImageUrl.startsWith('http') || rawImageUrl.startsWith('blob:');
                                    const isValidString = rawImageUrl.includes('/') || rawImageUrl.includes('.');
                                    let imageUrl = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=300&fit=crop';
                                    if (rawImageUrl && (isAbsoluteUrl || isValidString)) {
                                        imageUrl = isAbsoluteUrl ? rawImageUrl : `${apiBase}${rawImageUrl.startsWith('/') ? '' : '/'}${rawImageUrl}`;
                                    }

                                    const isOwner = product.donorId === user?.id;

                                    return (
                                        <div
                                            key={product.id}
                                            id={`listing-${product.id}`}
                                            className={styles.listingCard}
                                        >
                                            <div className={styles.listingCardTop}>
                                                <Image
                                                    src={imageUrl}
                                                    alt={product.title}
                                                    width={64}
                                                    height={64}
                                                    className={styles.listingImage}
                                                    unoptimized
                                                />
                                                <div className={styles.listingInfo}>
                                                    <div className={styles.listingName} title={product.title}>
                                                        {product.title}
                                                    </div>
                                                    <div className={styles.listingMeta}>
                                                        <span className={styles.badgeLeftover}>
                                                            {categoryLabels[product.category] || product.category}
                                                        </span>
                                                        <span className={styles.listingDistance}>
                                                            📍 {product.city}, {product.district}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={styles.cardActions}>
                                                {/* Action Buttons for Map View */}
                                                {!isOwner && (
                                                    <>
                                                        <button
                                                            className={styles.requestBtn}
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                const { requestService } = await import('@/services/requestService');
                                                                try {
                                                                    await requestService.createRequest(product.id, { message: 'I would like to request this food.' });
                                                                    alert('Request sent successfully!');
                                                                } catch (err) {
                                                                    alert('Failed to send request.');
                                                                }
                                                            }}
                                                            title="Request Food"
                                                        >
                                                            🤝 Request
                                                        </button>

                                                        <button
                                                            className={styles.actionBtn}
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                const { chatService } = await import('@/services/chatService');
                                                                try {
                                                                    const conv = await chatService.startConversation({ 
                                                                        recipientId: product.donorId!,
                                                                        recipientName: product.donor?.fullName || 'Donor User'
                                                                    });
                                                                    window.location.href = `/chat?conversationId=${conv.id}`;
                                                                } catch (err) {
                                                                    alert('Failed to start chat.');
                                                                }
                                                            }}
                                                            title="Message Donor"
                                                        >
                                                            💬 Message
                                                        </button>
                                                    </>
                                                )}

                                                <button
                                                    className={styles.actionBtn}
                                                    onClick={() => handleViewClick(product)}
                                                    title="Show on map"
                                                >
                                                    📍 View
                                                </button>
                                                <button
                                                    className={styles.actionBtn}
                                                    onClick={() => handleDirections(product)}
                                                    title="Get directions in Google Maps"
                                                >
                                                    🧭 Directions
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
