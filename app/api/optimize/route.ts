import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

let genai: GoogleGenAI | null = null;
try {
    if (process.env.GEMINI_API_KEY) {
        genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
} catch (e) {
    console.warn("No Gemini API key found yet.");
}

export async function POST(req: Request) {
    try {
        const { profile, jobDescription, adaptationTone } = await req.json();

        if (!profile || !jobDescription) {
            return NextResponse.json({ error: 'Faltan datos requeridos (perfil u oferta laboral)' }, { status: 400 });
        }

        const sysPrompt = `Eres un experto optimizador de currículums para sistemas ATS (Applicant Tracking Systems). 
Recibirás el perfil actual del candidato en formato JSON y la descripción de la oferta laboral a la que aspira.
Tu tarea es modificar el perfil para alinearlo PERFECTAMENTE con los requisitos de la oferta, utilizando las palabras clave correctas.
Debes mantener la estructura exacta del JSON original del perfil.
Específicamente:
1. Mejora el "summary" (Resumen Profesional) para destacar las habilidades requeridas.
2. Reescribe la "description" de las experiencias laborales usando viñetas (bullet points: "• ") que destaquen logros relacionados con la oferta.
3. Actualiza el string de "skills" para priorizar e incluir aquellas requeridas por la oferta que el candidato podría de manera realista poseer dado su historial.

REGLAS:
- NO inventes experiencia que no existe, solo reformula y reenfoca la existente.
- Devuelve ÚNICAMENTE un objeto JSON válido que responda la misma estructura de la interfaz "UserProfile".
- Formato exacto JSON, sin bloque de código markdown ni texto adicional.`;

        const userMessage = `
PERFIL DEL CANDIDATO (JSON):
${JSON.stringify(profile, null, 2)}

OFERTA LABORAL:
${jobDescription}

${adaptationTone ? `INSTRUCCIONES ADICIONALES DE TONO O ADAPTACIÓN:\n${adaptationTone}` : ''}
`;

        if (!process.env.GEMINI_API_KEY || !genai) {
            // Mock response if no API KEY for UI testing
            return NextResponse.json({
                optimizedProfile: {
                    ...profile,
                    personalInfo: { ...profile.personalInfo, summary: "[MOCK API KEY MISSING] " + profile.personalInfo.summary },
                    experience: profile.experience.map((e: any) => ({ ...e, description: "• Logro adaptado falso\n• Otro bullet point\n" + e.description })),
                    skills: "[MOCK] " + profile.skills
                }
            });
        }

        const response = await genai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { role: 'user', parts: [{ text: sysPrompt + '\n\n' + userMessage }] }
            ],
            config: {
                temperature: 0.3,
                responseMimeType: 'application/json',
            }
        });

        const textPayload = response.text;
        if (!textPayload) throw new Error("Empty response from Gemini");

        const optimizedProfile = JSON.parse(textPayload);

        return NextResponse.json({ optimizedProfile });

    } catch (error: any) {
        console.error("Optimization error:", error);
        return NextResponse.json({ error: 'Hubo un error comunicándose con la IA.' }, { status: 500 });
    }
}
