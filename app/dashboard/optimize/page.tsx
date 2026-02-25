"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/types';

export default function OptimizePage() {
    const { user } = useAuth();
    const [jobDescription, setJobDescription] = useState('');
    const [adaptationTone, setAdaptationTone] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<UserProfile | null>(null);
    const [error, setError] = useState('');
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const targetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            getDoc(doc(db, 'users', user.uid)).then(docSnap => {
                if (docSnap.exists() && docSnap.data().profile) {
                    setProfile(docSnap.data().profile);
                }
            });
        }
    }, [user]);

    const handleOptimize = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) {
            setError('Por favor, completa tu perfil primero antes de optimizar.');
            return;
        }
        if (!jobDescription.trim()) {
            setError('Debes ingresar la descripción de la oferta laboral.');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await fetch('/api/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile, jobDescription, adaptationTone })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al optimizar el CV');
            }

            setResult(data.optimizedProfile);

            // Save to History
            if (user) {
                await addDoc(collection(db, 'users', user.uid, 'history'), {
                    jobDescription,
                    optimizedProfile: data.optimizedProfile,
                    createdAt: new Date().toISOString()
                });
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Hubo un error al procesar tu solicitud.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        window.print();
    };

    return (
        <div>
            <h2 style={{ marginBottom: '1.5rem', marginTop: 0 }}>Optimizar Currículum</h2>

            {!profile && (
                <div style={{ padding: '1rem', backgroundColor: '#fffbeb', color: '#b45309', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #fde68a' }}>
                    Para poder optimizar tu CV necesitas completar tu perfil profesional. Ve a "Mi Perfil".
                </div>
            )}

            {error && (
                <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #fecaca' }}>
                    {error}
                </div>
            )}

            <div className="card">
                <form onSubmit={handleOptimize}>
                    <label className="label">Descripción de la Oferta Laboral</label>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        Pega aquí el texto completo de la oferta de trabajo. Nuestro sistema resaltará tus habilidades y experiencia para hacer match con los requerimientos (Sistemas ATS).
                    </p>
                    <textarea
                        className="textarea"
                        rows={8}
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Requisitos: 3 años de experiencia en React. Conocimientos en Node.js y bases de datos NoSQL..."
                        required
                        disabled={loading || !profile}
                    ></textarea>

                    <label className="label" style={{ marginTop: '1rem' }}>Tono de Adaptación (Opcional)</label>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        Indica instrucciones específicas para adaptar tu CV, por ejemplo: "Tono formal y corporativo", "Perfil muy técnico y Senior", o cualquier enfoque específico que necesites.
                    </p>
                    <input
                        type="text"
                        className="input"
                        value={adaptationTone}
                        onChange={(e) => setAdaptationTone(e.target.value)}
                        placeholder="Ej: Destacar amplia experiencia en liderazgo y gestión de proyectos..."
                        disabled={loading || !profile}
                    />

                    <button type="submit" className="btn" style={{ width: '100%', fontSize: '1.1rem', padding: '0.8rem' }} disabled={loading || !profile}>
                        {loading ? 'Analizando oferta y optimizando perfil...' : 'Generar CV Optimizado'}
                    </button>
                </form>
            </div>

            {result && (
                <div style={{ marginTop: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>Resultado Optimizado</h3>
                        <button onClick={handleDownloadPDF} className="btn btn-secondary">Descargar PDF</button>
                    </div>

                    {/* CV Preview Container */}
                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div ref={targetRef} id="cv-preview-container" style={{ padding: '40px', backgroundColor: '#fff', color: '#000', fontFamily: 'Arial, sans-serif', lineHeight: '1.6' }}>

                            {/* Header */}
                            <div style={{ borderBottom: '2px solid var(--primary-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                                <h1 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '2.5rem' }}>{result.personalInfo.fullName}</h1>
                                <div style={{ color: '#555', fontSize: '0.95rem' }}>
                                    {result.personalInfo.location && <span>📍 {result.personalInfo.location} | </span>}
                                    {result.personalInfo.phone && <span>📱 {result.personalInfo.phone} | </span>}
                                    {user?.email && <span>✉️ {user.email}</span>}
                                </div>
                                {(result.personalInfo.linkedIn || result.personalInfo.github || result.personalInfo.portfolio) && (
                                    <div style={{ color: '#555', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                                        {result.personalInfo.linkedIn && <span style={{ marginRight: '1rem' }}>🔗 <a href={result.personalInfo.linkedIn} target="_blank" rel="noopener noreferrer">{result.personalInfo.linkedIn.replace(/^https?:\/\//, '')}</a></span>}
                                        {result.personalInfo.github && <span style={{ marginRight: '1rem' }}>💻 <a href={result.personalInfo.github} target="_blank" rel="noopener noreferrer">{result.personalInfo.github.replace(/^https?:\/\//, '')}</a></span>}
                                        {result.personalInfo.portfolio && <span>💼 <a href={result.personalInfo.portfolio} target="_blank" rel="noopener noreferrer">{result.personalInfo.portfolio.replace(/^https?:\/\//, '')}</a></span>}
                                    </div>
                                )}
                            </div>

                            {/* Summary */}
                            {result.personalInfo.summary && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h3 style={{ color: 'var(--primary-color)', textTransform: 'uppercase', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Resumen Profesional</h3>
                                    <p style={{ margin: 0 }}>{result.personalInfo.summary}</p>
                                </div>
                            )}

                            {/* Experience */}
                            {result.experience && result.experience.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h3 style={{ color: 'var(--primary-color)', textTransform: 'uppercase', fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Experiencia Laboral</h3>
                                    {result.experience.map((exp: any, idx: number) => (
                                        <div key={idx} style={{ marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                <strong style={{ fontSize: '1.1rem' }}>{exp.role}</strong>
                                                <span style={{ color: '#666', fontSize: '0.9rem' }}>{exp.years}</span>
                                            </div>
                                            <div style={{ fontWeight: '500', color: '#444', marginBottom: '0.5rem' }}>{exp.company}</div>
                                            <div style={{ margin: 0, whiteSpace: 'pre-line', paddingLeft: '1rem' }}>
                                                {exp.description}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Education */}
                            {result.education && result.education.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h3 style={{ color: 'var(--primary-color)', textTransform: 'uppercase', fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Educación</h3>
                                    {result.education.map((edu: any, idx: number) => (
                                        <div key={idx} style={{ marginBottom: '0.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                <strong>{edu.degree}</strong>
                                                <span style={{ color: '#666', fontSize: '0.9rem' }}>{edu.year}</span>
                                            </div>
                                            <div style={{ color: '#444' }}>{edu.institution}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Skills */}
                            {result.skills && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h3 style={{ color: 'var(--primary-color)', textTransform: 'uppercase', fontSize: '1.2rem', marginBottom: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Habilidades Clave</h3>
                                    <p style={{ margin: 0 }}>{result.skills}</p>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
