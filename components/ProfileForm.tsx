"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/types';

export default function ProfileForm() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile>({
        personalInfo: { fullName: '', phone: '', location: '', summary: '', linkedIn: '', github: '', portfolio: '' },
        education: [],
        experience: [],
        skills: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            const fetchProfile = async () => {
                try {
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists() && docSnap.data().profile) {
                        setProfile(docSnap.data().profile);
                    }
                } catch (error) {
                    console.error("Error fetching profile", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchProfile();
        }
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSaving(true);
        setMessage('');

        try {
            await setDoc(doc(db, 'users', user.uid), { profile }, { merge: true });
            setMessage('Perfil guardado exitosamente.');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Error saving profile", error);
            setMessage('Error al guardar el perfil.');
        } finally {
            setSaving(false);
        }
    };

    const addEducation = () => {
        setProfile(prev => ({
            ...prev,
            education: [...prev.education, { id: Date.now().toString(), institution: '', degree: '', year: '' }]
        }));
    };

    const removeEducation = (id: string) => {
        setProfile(prev => ({
            ...prev,
            education: prev.education.filter(e => e.id !== id)
        }));
    };

    const addExperience = () => {
        setProfile(prev => ({
            ...prev,
            experience: [...prev.experience, { id: Date.now().toString(), company: '', role: '', description: '', years: '' }]
        }));
    };

    const removeExperience = (id: string) => {
        setProfile(prev => ({
            ...prev,
            experience: prev.experience.filter(e => e.id !== id)
        }));
    };

    if (loading) return <div>Cargando perfil...</div>;

    return (
        <div className="card">
            <h3 style={{ marginTop: 0 }}>Información de tu Currículum</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Completa este formulario. Usaremos esta información como base para que la Inteligencia Artificial adapte tu perfil a las ofertas laborales.
            </p>

            {message && (
                <div style={{ padding: '0.75rem', backgroundColor: message.includes('Error') ? '#fef2f2' : '#f0fdf4', color: message.includes('Error') ? '#b91c1c' : '#15803d', borderRadius: '8px', marginBottom: '1.5rem', border: `1px solid ${message.includes('Error') ? '#fecaca' : '#bbf7d0'}` }}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSave}>
                {/* Personal Info */}
                <section style={{ marginBottom: '2.5rem' }}>
                    <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Datos Personales</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        <div>
                            <label className="label">Nombre Completo</label>
                            <input type="text" className="input" value={profile.personalInfo.fullName} onChange={e => setProfile({ ...profile, personalInfo: { ...profile.personalInfo, fullName: e.target.value } })} required />
                        </div>
                        <div>
                            <label className="label">Teléfono</label>
                            <input type="text" className="input" value={profile.personalInfo.phone} onChange={e => setProfile({ ...profile, personalInfo: { ...profile.personalInfo, phone: e.target.value } })} />
                        </div>
                        <div>
                            <label className="label">Ubicación (Ciudad, País)</label>
                            <input type="text" className="input" value={profile.personalInfo.location} onChange={e => setProfile({ ...profile, personalInfo: { ...profile.personalInfo, location: e.target.value } })} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                        <div>
                            <label className="label">LinkedIn (Opcional)</label>
                            <input type="url" className="input" value={profile.personalInfo.linkedIn || ''} onChange={e => setProfile({ ...profile, personalInfo: { ...profile.personalInfo, linkedIn: e.target.value } })} placeholder="https://linkedin.com/in/..." />
                        </div>
                        <div>
                            <label className="label">GitHub (Opcional)</label>
                            <input type="url" className="input" value={profile.personalInfo.github || ''} onChange={e => setProfile({ ...profile, personalInfo: { ...profile.personalInfo, github: e.target.value } })} placeholder="https://github.com/..." />
                        </div>
                        <div>
                            <label className="label">Portafolio (Opcional)</label>
                            <input type="url" className="input" value={profile.personalInfo.portfolio || ''} onChange={e => setProfile({ ...profile, personalInfo: { ...profile.personalInfo, portfolio: e.target.value } })} placeholder="https://tusitio.com" />
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        <label className="label">Resumen Profesional</label>
                        <textarea className="textarea" rows={3} value={profile.personalInfo.summary} onChange={e => setProfile({ ...profile, personalInfo: { ...profile.personalInfo, summary: e.target.value } })} placeholder="Breve descripción de tu perfil..."></textarea>
                    </div>
                </section>

                {/* Work Experience */}
                <section style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0 }}>Experiencia Laboral</h4>
                        <button type="button" onClick={addExperience} className="btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}>+ Agregar</button>
                    </div>

                    {profile.experience.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No has agregado experiencia laboral aún.</p>}

                    {profile.experience.map((exp, index) => (
                        <div key={exp.id} style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <strong style={{ color: 'var(--text-muted)' }}>Experiencia {index + 1}</strong>
                                <button type="button" onClick={() => removeExperience(exp.id)} style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontSize: '0.9rem' }}>Eliminar</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <div>
                                    <label className="label">Empresa</label>
                                    <input type="text" className="input" style={{ marginBottom: 0 }} value={exp.company} onChange={e => {
                                        const newExp = [...profile.experience];
                                        newExp[index].company = e.target.value;
                                        setProfile({ ...profile, experience: newExp });
                                    }} required />
                                </div>
                                <div>
                                    <label className="label">Rol / Puesto</label>
                                    <input type="text" className="input" style={{ marginBottom: 0 }} value={exp.role} onChange={e => {
                                        const newExp = [...profile.experience];
                                        newExp[index].role = e.target.value;
                                        setProfile({ ...profile, experience: newExp });
                                    }} required />
                                </div>
                                <div>
                                    <label className="label">Años (ej. 2018 - 2022)</label>
                                    <input type="text" className="input" style={{ marginBottom: 0 }} value={exp.years} onChange={e => {
                                        const newExp = [...profile.experience];
                                        newExp[index].years = e.target.value;
                                        setProfile({ ...profile, experience: newExp });
                                    }} required />
                                </div>
                            </div>
                            <div style={{ marginTop: '1rem' }}>
                                <label className="label">Descripción de responsabilidades / Logros</label>
                                <textarea className="textarea" rows={3} style={{ marginBottom: 0 }} value={exp.description} onChange={e => {
                                    const newExp = [...profile.experience];
                                    newExp[index].description = e.target.value;
                                    setProfile({ ...profile, experience: newExp });
                                }} required></textarea>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Education */}
                <section style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0 }}>Antecedentes Académicos</h4>
                        <button type="button" onClick={addEducation} className="btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}>+ Agregar</button>
                    </div>

                    {profile.education.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No has agregado antecedentes académicos aún.</p>}

                    {profile.education.map((edu, index) => (
                        <div key={edu.id} style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <strong style={{ color: 'var(--text-muted)' }}>Educación {index + 1}</strong>
                                <button type="button" onClick={() => removeEducation(edu.id)} style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontSize: '0.9rem' }}>Eliminar</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <div>
                                    <label className="label">Institución</label>
                                    <input type="text" className="input" style={{ marginBottom: 0 }} value={edu.institution} onChange={e => {
                                        const newEdu = [...profile.education];
                                        newEdu[index].institution = e.target.value;
                                        setProfile({ ...profile, education: newEdu });
                                    }} required />
                                </div>
                                <div>
                                    <label className="label">Título / Carrera</label>
                                    <input type="text" className="input" style={{ marginBottom: 0 }} value={edu.degree} onChange={e => {
                                        const newEdu = [...profile.education];
                                        newEdu[index].degree = e.target.value;
                                        setProfile({ ...profile, education: newEdu });
                                    }} required />
                                </div>
                                <div>
                                    <label className="label">Año (ej. 2017 - 2021)</label>
                                    <input type="text" className="input" style={{ marginBottom: 0 }} value={edu.year} onChange={e => {
                                        const newEdu = [...profile.education];
                                        newEdu[index].year = e.target.value;
                                        setProfile({ ...profile, education: newEdu });
                                    }} required />
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Skills */}
                <section style={{ marginBottom: '2.5rem' }}>
                    <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Habilidades</h4>
                    <div>
                        <label className="label">Tus habilidades principales (separadas por coma)</label>
                        <input type="text" className="input" value={profile.skills} onChange={e => setProfile({ ...profile, skills: e.target.value })} placeholder="Ej: React, Node.js, Agile, Liderazgo..." />
                    </div>
                </section>

                <button type="submit" className="btn" style={{ width: '100%', fontSize: '1.1rem', padding: '0.8rem' }} disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar Perfil'}
                </button>
            </form>
        </div>
    );
}
