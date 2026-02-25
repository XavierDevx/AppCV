"use client";
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Cargando...</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div>
                    <h2 style={{ margin: 0 }}>Panel de Control</h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Hola, {user.email}</p>
                </div>
                <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>Cerrar Sesión</button>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <aside style={{ flex: '1', minWidth: '200px', maxWidth: '250px' }}>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <a href="/dashboard/profile" className="btn btn-secondary" style={{ textAlign: 'left', border: 'none', borderLeft: '4px solid var(--primary-color)', borderRadius: '0', backgroundColor: '#f8fafc' }}>Mi Perfil</a>
                        <a href="/dashboard/optimize" className="btn btn-secondary" style={{ textAlign: 'left', border: 'none', borderLeft: '4px solid transparent', borderRadius: '0' }}>Optimizar CV</a>
                        <a href="/dashboard/history" className="btn btn-secondary" style={{ textAlign: 'left', border: 'none', borderLeft: '4px solid transparent', borderRadius: '0' }}>Historial</a>
                    </nav>
                </aside>

                <section style={{ flex: '3', minWidth: '300px' }}>
                    {children}
                </section>
            </div>
        </div>
    );
}
