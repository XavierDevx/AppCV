export default function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Destaca en cada oferta laboral</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--text-muted)' }}>
        Nuestra inteligencia artificial adapta y optimiza tu currículum para que supere
        los sistemas ATS, aumentando tus posibilidades de conseguir esa entrevista.
      </p>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
        <h2>¿Cómo funciona?</h2>
        <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}><strong>1.</strong> Crea tu cuenta y completa tu perfil profesional.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>2.</strong> Pega la descripción de la oferta laboral que te interesa.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>3.</strong> Nuestra IA ajustará tu experiencia y habilidades para que coincidan con la oferta.</li>
          <li><strong>4.</strong> Descarga tu currículum en PDF, ¡listo para enviar!</li>
        </ul>
        <div style={{ textAlign: 'center' }}>
          <a href="/register" className="btn" style={{ marginRight: '1rem' }}>Comenzar Ahora</a>
          <a href="/login" className="btn btn-secondary">Iniciar Sesión</a>
        </div>
      </div>
    </div>
  );
}
