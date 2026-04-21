// ==========================================
// Image URL Helper — resolves product image URLs
// Handles backend relative paths, absolute URLs, and fallbacks
// ==========================================

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=300&fit=crop';

/**
 * Resolves a product image URL to a fully qualified URL.
 * - If the URL is already absolute (http/https/blob), returns it as-is.
 * - If the URL is a relative path from the backend, prepends the API base URL.
 * - If the URL is empty/invalid, returns a fallback placeholder.
 */
export function resolveImageUrl(rawUrl?: string | null): string {
    if (!rawUrl || rawUrl.trim() === '') return FALLBACK_IMAGE;

    // Already an absolute URL
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('blob:')) {
        return rawUrl;
    }

    // Data URI
    if (rawUrl.startsWith('data:')) {
        return rawUrl;
    }

    // Relative path from backend — prepend API base
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1').replace('/api/v1', '').replace('/api', '');
    const separator = rawUrl.startsWith('/') ? '' : '/';
    return `${apiBase}${separator}${rawUrl}`;
}

export { FALLBACK_IMAGE };
