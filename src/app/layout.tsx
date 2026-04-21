import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { AuthProvider } from '@/contexts/AuthContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

export const metadata: Metadata = {
    title: 'Food Guard — Surplus Food Sharing Platform',
    description: 'Surplus food sharing platform. Reduce food waste, help your community.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <NotificationProvider>
                        <ChatProvider>
                            <Navbar />
                            <div style={{
                                display: 'flex',
                                paddingTop: 'var(--navbar-height)',
                                minHeight: '100vh',
                            }}>
                                <Sidebar />
                                <main style={{
                                    marginLeft: 'var(--sidebar-width)',
                                    flex: 1,
                                    padding: '28px 32px',
                                    minHeight: 'calc(100vh - var(--navbar-height))',
                                }}>
                                    {children}
                                </main>
                            </div>
                        </ChatProvider>
                    </NotificationProvider>
                </AuthProvider>
            </body>
        </html>
    );
}

