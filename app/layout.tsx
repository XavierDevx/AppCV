import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'ATS CV Optimizer',
  description: 'Optimizador de Currículums para sistemas ATS usando IA',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <header className="header">
            <div className="container" style={{ padding: '0 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="logo">ATS CV Optimizer</div>
              <nav className="nav-links">
                <a href="/">Inicio</a>
                <a href="/dashboard">Mi Cuenta</a>
              </nav>
            </div>
          </header>
          <main className="container">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
