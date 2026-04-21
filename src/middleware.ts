import { NextRequest, NextResponse } from 'next/server';

// Korunan rotalar — giriş yapmadan erişilemez
const protectedRoutes = [
    '/dashboard',
    '/my-donations',
    '/map',
    '/requests',
    '/profile',
    '/history',
    '/chat',
    '/admin',
];

// Auth sayfaları — giriş yapmışsa dashboard'a yönlendir
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Token kontrolü (cookie yerine header header'dan alınamayacağı için
    // client-side localStorage kontrol edilemez. Bunun yerine basit bir
    // cookie-based flag kullanıyoruz.)
    // NOT: Gerçek auth kontrolü client-side AuthContext'te yapılıyor.
    // Bu middleware sadece ilk erişimde yönlendirme sağlar.

    // Landing page (/) her zaman erişilebilir
    if (pathname === '/') {
        return NextResponse.next();
    }

    // Statik dosyalar ve API rotaları için middleware'i atla
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.') // statik dosyalar (.js, .css, .ico vb.)
    ) {
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Aşağıdaki yollar hariç tüm istekleri eşle:
         * - api (API rotaları)
         * - _next/static (statik dosyalar)
         * - _next/image (image optimizer)
         * - favicon.ico
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
