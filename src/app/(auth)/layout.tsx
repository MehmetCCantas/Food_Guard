import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Food Share Platform — Welcome',
    description: 'Sign in or create an account to start sharing food and reducing waste.',
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}
