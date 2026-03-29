import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', textAlign: 'center', padding: '2rem',
    }}>
      {/* Ambient blob */}
      <div style={{
        position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
        filter: 'blur(50px)', pointerEvents: 'none',
      }} />

      <div style={{ fontSize: '6rem', marginBottom: '1rem', animation: 'fadeInUp 0.6s ease-out' }}>🍽️</div>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(3rem, 8vw, 6rem)',
        color: 'var(--text-1)', letterSpacing: '-0.04em', lineHeight: 1,
        marginBottom: '0.75rem', animation: 'fadeInUp 0.6s ease-out 0.1s both',
      }}>404</h1>
      <h2 style={{
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem',
        color: 'var(--text-2)', marginBottom: '0.75rem',
        animation: 'fadeInUp 0.6s ease-out 0.2s both',
      }}>
        This plate is empty
      </h2>
      <p style={{
        color: 'var(--text-4)', fontSize: '0.92rem', maxWidth: '400px', lineHeight: 1.7,
        marginBottom: '2rem', animation: 'fadeInUp 0.6s ease-out 0.3s both',
      }}>
        The page you're looking for doesn't exist or has been moved. Let's get you back to rescuing food.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', animation: 'fadeInUp 0.6s ease-out 0.4s both' }}>
        <Link to="/" className="btn btn-primary btn-lg">🏠 Back to Home</Link>
        <Link to="/donor" className="btn btn-secondary btn-lg">🍱 Donate Food</Link>
      </div>
      <div style={{
        marginTop: '3rem', fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
        color: 'var(--text-4)', letterSpacing: '0.05em',
        animation: 'fadeInUp 0.6s ease-out 0.5s both',
      }}>
        FoodBridge v2.0.0 · 8 ML Models · Made with ❤️ for Vashisht 3.0
      </div>
    </div>
  );
}
