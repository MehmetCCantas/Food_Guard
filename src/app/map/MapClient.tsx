'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { resolveImageUrl } from '@/utils/imageUrl';
// Local type that matches the adapted shape from map/page.tsx
interface MapDonation {
    id: string;
    title: string;
    description?: string;
    imageUrl: string;
    foodType: string;
    quantity: string;
    quantityNum: number;
    quantityUnit: string;
    distance: string;
    distanceKm: number;
    expiryDate: string;
    donorId: string;
    donorName: string;
    latitude: number;
    longitude: number;
    neighborhood?: string;
    landmark?: string;
    addressLine?: string;
    postcode?: string;
    directions?: string;
    donationType: string;
    status: string;
    createdAt: string;
    city?: string;
    district?: string;
}

interface MapClientProps {
    donations: MapDonation[];
    center: [number, number];
    zoom: number;
    onMarkerClick?: (donation: MapDonation) => void;
}

export interface MapClientHandle {
    flyTo: (lat: number, lng: number, zoom?: number) => void;
    openPopup: (donationId: string) => void;
}

const getMarkerIcon = (donation: MapDonation, isHighlighted = false) => {
    const isNearExpiry = donation.donationType === 'near_expiry';
    const color = isNearExpiry ? '#E85D3A' : '#DC4C4C';
    const size = isHighlighted ? 50 : 40;
    const emoji = (() => {
        switch (donation.foodType) {
            case 'dairy': return '🥛';
            case 'bakery': return '🍞';
            case 'cooked_meal': return '🍲';
            case 'fresh_produce': return '🥬';
            case 'soup': return '🍜';
            default: return '🍽️';
        }
    })();

    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div style="
                background: ${color};
                color: white;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                width: ${size}px;
                height: ${size}px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                border: ${isHighlighted ? '3px' : '2px'} solid white;
                transition: all 0.3s ease;
            ">
                <span style="transform: rotate(45deg); font-size: ${isHighlighted ? 20 : 16}px;">${emoji}</span>
            </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size - 2],
    });
};

const formatExpiryDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Expires today';
    if (diffDays === 1) return 'Expires in 1 day';
    return `Expires in ${diffDays} days`;
};

const MapClient = forwardRef<MapClientHandle, MapClientProps>(
    function MapClient({ donations, center, zoom, onMarkerClick }, ref) {
        const mapRef = useRef<L.Map | null>(null);
        const mapContainerRef = useRef<HTMLDivElement>(null);
        const markersRef = useRef<L.LayerGroup | null>(null);
        const markerMapRef = useRef<Map<string, L.Marker>>(new Map());

        // Expose flyTo and openPopup methods to parent
        useImperativeHandle(ref, () => ({
            flyTo: (lat: number, lng: number, zoomLevel = 16) => {
                if (mapRef.current) {
                    mapRef.current.flyTo([lat, lng], zoomLevel, {
                        duration: 1.2,
                        easeLinearity: 0.25,
                    });
                }
            },
            openPopup: (donationId: string) => {
                const marker = markerMapRef.current.get(donationId);
                if (marker) {
                    marker.openPopup();
                }
            },
        }));

        // Initialize map
        useEffect(() => {
            if (!mapContainerRef.current) return;

            // React 18 StrictMode fix for Leaflet
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
            if ((mapContainerRef.current as any)._leaflet_id) {
                (mapContainerRef.current as any)._leaflet_id = null;
            }

            mapRef.current = L.map(mapContainerRef.current, {
                center,
                zoom,
                zoomControl: false,
            });

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
                maxZoom: 20,
                subdomains: 'abcd',
            }).addTo(mapRef.current);

            // Add zoom control to bottom-right
            L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

            markersRef.current = L.layerGroup().addTo(mapRef.current);

            return () => {
                if (mapRef.current) {
                    mapRef.current.remove();
                    mapRef.current = null;
                }
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        // Update markers when donations change
        useEffect(() => {
            if (!mapRef.current || !markersRef.current) return;

            markersRef.current.clearLayers();
            markerMapRef.current.clear();

            donations.forEach((donation) => {
                if (donation.latitude && donation.longitude) {
                    const marker = L.marker(
                        [donation.latitude, donation.longitude],
                        { icon: getMarkerIcon(donation) }
                    );

                    const badgeColor = donation.donationType === 'near_expiry' ? '#E85D3A' : '#DC4C4C';
                    const badgeLabel = donation.donationType === 'near_expiry' ? 'Near Expiry' : 'Leftover';
                    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${donation.latitude},${donation.longitude}`;

                    marker.bindPopup(`
                        <div style="min-width: 200px; font-family: 'Inter', sans-serif;">
                            <h3 style="margin: 0 0 6px; font-size: 14px; font-weight: 700; color: #2D2D2D;">
                                ${donation.title}
                            </h3>
                            <span style="
                                display: inline-block;
                                padding: 2px 8px;
                                border-radius: 12px;
                                font-size: 11px;
                                font-weight: 600;
                                color: white;
                                background: ${badgeColor};
                            ">${badgeLabel}</span>
                            <p style="margin: 8px 0 4px; font-size: 13px; color: #2D2D2D; font-weight: 600;">
                                📍 ${donation.distance} • ${formatExpiryDate(donation.expiryDate)}
                            </p>
                            <p style="margin: 0 0 8px; font-size: 11px; color: #888; font-style: italic; line-height: 1.4;">
                                🏢 ${[
                                    donation.landmark ? `<strong style="color:var(--primary)">${donation.landmark}</strong>` : null,
                                    donation.neighborhood,
                                    donation.addressLine,
                                    donation.postcode,
                                    (donation.district || donation.city) ? `${donation.district || ''}${donation.district && donation.city ? '/' : ''}${donation.city || ''}` : null
                                ].filter(Boolean).join(', ')}
                            </p>
                            ${donation.directions ? `
                            <p style="margin: 0 0 10px; padding: 4px 8px; background: rgba(0,0,0,0.03); border-radius: 6px; font-size: 10px; color: #6B6B6B; border-left: 2px solid var(--primary-light);">
                                📝 <em>${donation.directions}</em>
                            </p>
                            ` : ''}
                            <p style="margin: 0 0 10px; font-size: 12px; color: #6B6B6B;">
                                👤 ${donation.donorName || 'Anonymous'}
                            </p>
                            <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="
                                display: inline-flex;
                                align-items: center;
                                gap: 6px;
                                padding: 6px 14px;
                                border-radius: 20px;
                                background: linear-gradient(135deg, #DC4C4C, #B83B3B);
                                color: white;
                                font-size: 12px;
                                font-weight: 600;
                                text-decoration: none;
                                box-shadow: 0 2px 6px rgba(198,112,48,0.3);
                                transition: all 0.2s ease;
                            ">
                                🧭 Get Directions
                            </a>
                        </div>
                    `);

                    marker.on('click', () => {
                        if (onMarkerClick) onMarkerClick(donation);
                    });

                    markersRef.current!.addLayer(marker);
                    markerMapRef.current.set(donation.id, marker);
                }
            });
        }, [donations, onMarkerClick]);

        return (
            <div
                ref={mapContainerRef}
                style={{ width: '100%', height: '100%', borderRadius: '12px' }}
            />
        );
    }
);

export default MapClient;
