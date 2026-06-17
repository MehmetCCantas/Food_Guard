// ==========================================
// FoodGuard Platform — TypeScript Type Definitions
// NestJS backend DTO'ları ile uyumlu
// ==========================================

// ---- User Types ----

export enum UserRole {
    DONOR = 'DONOR',
    INDIVIDUAL_RECIPIENT = 'INDIVIDUAL_RECIPIENT',
    ORGANIZATIONAL_RECIPIENT = 'ORGANIZATIONAL_RECIPIENT',
    ADMIN = 'ADMIN',
}

export enum VerificationStatus {
    UNVERIFIED = 'UNVERIFIED',
    PENDING = 'PENDING',
    VERIFIED = 'VERIFIED',
    REJECTED = 'REJECTED',
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: UserRole;
    phoneNumber: string;
    address: string;
    city?: string;
    district?: string;
    status: VerificationStatus;
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
    ratingScore?: number;
    ratingCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

// ---- Product (Donation) Types ----

export enum ProductCategory {
    BAKERY = 'BAKERY',
    VEGETABLE = 'VEGETABLE',
    MEAT = 'MEAT',
    DRY_FOOD = 'DRY_FOOD',
    OTHER = 'OTHER',
}

export enum StorageCondition {
    FRIDGE = 'fridge',
    ROOM_TEMP = 'room_temp',
    UNKNOWN = 'unknown',
}

export interface Product {
    id: string;
    title: string;
    description?: string;
    category: ProductCategory;
    city: string;
    district: string;
    neighborhood?: string;
    landmark?: string;
    addressLine?: string;
    postcode?: string;
    directions?: string;
    latitude: number;
    longitude: number;
    storageCondition: StorageCondition;
    storageDurationHours: number;
    hasSmellChange: boolean;
    imageUrl?: string;
    warningMessage?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    donor?: User;
    donorId?: string;
}

// ---- Product Filters ----

export interface ProductFilters {
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    category?: ProductCategory | 'all';
    search?: string;
    page?: number;
    limit?: number;
}

// ---- Request Types ----

export enum RequestStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
}

export interface DonationRequest {
    id: string;
    product?: Product;
    productId?: string;
    recipient?: User;
    recipientId?: string;
    message?: string;
    quantity?: number;
    status: RequestStatus;
    createdAt?: string;
    updatedAt?: string;
}

// ---- Chat / Messaging Types ----

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    sender?: User;
    content: string;
    createdAt: string;
    isRead?: boolean;
}

export interface Conversation {
    id: string;
    productId?: string;
    product?: Product;
    participants: User[];
    lastMessage?: Message;
    unreadCount?: number;
    createdAt: string;
    updatedAt: string;
}

// ---- Notification Types ----

export enum NotificationType {
    NEW_MESSAGE = 'NEW_MESSAGE',
    NEW_REQUEST = 'NEW_REQUEST',
    REQUEST_ACCEPTED = 'REQUEST_ACCEPTED',
    REQUEST_REJECTED = 'REQUEST_REJECTED',
}

export interface AppNotification {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    isRead: boolean;
    createdAt: string;
    link?: string;
}

// ---- Pagination ----

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

// ---- Auth Types ----

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}

export interface RegisterDto {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    phoneNumber: string;
    city: string;
    district: string;
}
