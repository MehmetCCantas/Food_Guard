'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface AddressData {
    city?: string;
    district?: string;
    neighborhood?: string;
    street?: string;
    houseNumber?: string;
    landmark?: string;
    postcode?: string;
    shortAddress: string;
}

interface LocationPickerProps {
    initialLat: number;
    initialLng: number;
    onChange: (lat: number, lng: number) => void;
    onAddressFetch?: (data: AddressData) => void;
    addressToSearch?: string;
}

export default function LocationPicker({ initialLat, initialLng, onChange, onAddressFetch, addressToSearch }: LocationPickerProps) {
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    const fetchAddressFromCoords = async (lat: number, lng: number) => {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`;
            const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
            const data = await res.json();
            
            if (data && data.address && onAddressFetch) {
                const addr = data.address;
                const city = addr.province || addr.city || addr.state || '';
                const district = addr.town || addr.borough || addr.district || '';
                const neighborhood = addr.suburb || addr.neighbourhood || addr.village || addr.quarter || '';
                const street = addr.road || '';
                const houseNumber = addr.house_number || '';
                const postcode = addr.postcode || '';
                
                // POI Detection: Extract building, amenity, shop, or landmark names
                const landmark = data.name || addr.amenity || addr.shop || addr.building || addr.tourism || addr.historic || addr.leisure || '';
                
                // Formulate shortAddress for the single field back-up
                const displayName = data.display_name || '';
                const parts = displayName.split(',');
                const shortAddress = parts.slice(0, 3).join(',').trim();

                onAddressFetch({
                    city,
                    district,
                    neighborhood,
                    street,
                    houseNumber,
                    landmark,
                    postcode,
                    shortAddress
                });
            }
        } catch (err) {
            console.warn('Reverse geocoding failed:', err);
        }
    };

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                mapRef.current?.flyTo([latitude, longitude], 17);
                markerRef.current?.setLatLng([latitude, longitude]);
                onChange(latitude, longitude);
                fetchAddressFromCoords(latitude, longitude);
            },
            (err) => {
                console.warn('Geolocation error:', err);
                alert('Could not get your location. Please check permissions.');
            }
        );
    };

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        mapRef.current = L.map(mapContainerRef.current, {
            center: [initialLat, initialLng],
            zoom: 14,
            zoomControl: true,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapRef.current);

        const customIcon = L.divIcon({
            className: 'custom-picker-marker',
            html: `<div style="background: #D45D44; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3.5px solid white; box-shadow: 0 4px 15px rgba(212, 93, 68, 0.4); display: flex; align-items: center; justify-content: center;"><span style="transform: rotate(45deg); font-size: 16px;">📍</span></div>`,
            iconSize: [34, 34],
            iconAnchor: [17, 34],
        });

        markerRef.current = L.marker([initialLat, initialLng], {
            draggable: true,
            icon: customIcon,
        }).addTo(mapRef.current);

        markerRef.current.on('dragend', () => {
            const pos = markerRef.current!.getLatLng();
            onChange(pos.lat, pos.lng);
            fetchAddressFromCoords(pos.lat, pos.lng);
        });

        mapRef.current.on('click', (e) => {
            const { lat, lng } = e.latlng;
            markerRef.current!.setLatLng([lat, lng]);
            onChange(lat, lng);
            fetchAddressFromCoords(lat, lng);
        });

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Handle address searching (Forward Geocoding)
    useEffect(() => {
        if (!addressToSearch || !mapRef.current) return;

        const timer = setTimeout(async () => {
            try {
                const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressToSearch)}`;
                const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
                const data = await res.json();
                
                if (data && data.length > 0) {
                    const { lat, lon } = data[0];
                    const newLat = parseFloat(lat);
                    const newLng = parseFloat(lon);
                    
                    mapRef.current?.flyTo([newLat, newLng], 16);
                    markerRef.current?.setLatLng([newLat, newLng]);
                    onChange(newLat, newLng);
                }
            } catch (err) {
                console.warn('Geocoding failed:', err);
            }
        }, 1200); // 1.2s Debounce

        return () => clearTimeout(timer);
    }, [addressToSearch]);

    return (
        <div style={{ position: 'relative', marginTop: '8px' }}>
            <div 
                ref={mapContainerRef} 
                style={{ width: '100%', height: '250px', borderRadius: '14px', border: '1px solid #EFE9E4' }}
            />
            <button
                type="button"
                onClick={handleLocateMe}
                style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    zIndex: 1000,
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#FFFFFF',
                    border: '1px solid var(--border-light)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#F9F9F7'}
                onMouseOut={(e) => e.currentTarget.style.background = '#FFFFFF'}
                title="Find My Location"
            >
                🎯
            </button>
            <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                zIndex: 1000,
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '10px',
                color: '#6B6B6B',
                pointerEvents: 'none',
                border: '1px solid rgba(0,0,0,0.05)'
            }}>
                Drag marker to pinpoint
            </div>
        </div>
    );
}
