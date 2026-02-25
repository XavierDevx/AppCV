"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/types';

interface HistoryItem {
    id: string;
    jobDescription: string;
    optimizedProfile: UserProfile;
    createdAt: string;
}

export default function HistoryPage() {
    const { user } = useAuth();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchHistory = async () => {
                try {
                    const q = query(collection(db, 'users', user.uid, 'history'), orderBy('createdAt', 'desc'));
                    const querySnapshot = await getDocs(q);
                    const docs: HistoryItem[] = [];
                    querySnapshot.forEach((doc) => {
                        docs.push({ id: doc.id, ...doc.data() } as HistoryItem);
                    });
                    setHistory(docs);
                } catch (error) {
                    console.error("Error fetching history", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchHistory();
        }
    }, [user]);

    const handleDelete = async (id: string) => {
        if (!user || !confirm('¿Estás seguro de eliminar este CV del historial?')) return;
        try {
            await deleteDoc(doc(db, 'users', user.uid, 'history', id));
            setHistory(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error("Error al eliminar", error);
        }
    };

    if (loading) return <div>Cargando historial...</div>;

    return (
        <div>
            <h2 style={{ marginBottom: '1.5rem', marginTop: 0 }}>Historial de Currículums</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Aquí puedes encontrar todos los currículums que has optimizado anteriormente.
            </p>

            {history.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <p>No tienes ningún CV generado aún.</p>
                    <a href="/dashboard/optimize" className="btn btn-secondary" style={{ marginTop: '1rem' }}>Ir a Optimizar CV</a>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {history.map((item) => (
                        <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', marginBottom: 0 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                    {new Date(item.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    Resumen Modificado: {item.optimizedProfile.personalInfo.summary.substring(0, 80)}...
                                </h4>
                                <div style={{ backgroundColor: '#f8fafc', padding: '0.8rem', borderRadius: '6px', fontSize: '0.85rem', color: '#555', marginBottom: '1rem', height: '80px', overflow: 'hidden' }}>
                                    <strong>Oferta:</strong> {item.jobDescription.substring(0, 100)}...
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                                <button onClick={() => alert('Para ver el PDF debes ir a Generar de nuevo. (En un caso real guardaríamos el HTML o reenviaríamos a la vista)')} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Ver Detalle</button>
                                <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Eliminar</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
