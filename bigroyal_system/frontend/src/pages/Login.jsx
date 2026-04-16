import { useState } from 'react';
import { login } from '../services/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    try {
      const res = await login(email, password);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
      onLogin(res.data.usuario);
    } catch (err) {
      setError('Email o contraseña incorrectos');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center',
      alignItems: 'center', height: '100vh',
      backgroundColor: '#1a1a2e'
    }}>
      <div style={{
        background: '#16213e', padding: '2rem',
        borderRadius: '12px', width: '320px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '0.5rem' }}>
          Big Royal
        </h2>
        <p style={{ color: '#888', textAlign: 'center', marginBottom: '1.5rem' }}>
          Sistema de gestión
        </p>

        {error && (
          <p style={{
            color: '#ff6b6b', background: '#2a1a1a',
            padding: '0.5rem', borderRadius: '6px',
            marginBottom: '1rem', textAlign: 'center'
          }}>{error}</p>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%', padding: '0.75rem',
              marginBottom: '1rem', borderRadius: '8px',
              border: '1px solid #333', background: '#0f3460',
              color: '#fff', fontSize: '1rem', boxSizing: 'border-box'
            }}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              width: '100%', padding: '0.75rem',
              marginBottom: '1.5rem', borderRadius: '8px',
              border: '1px solid #333', background: '#0f3460',
              color: '#fff', fontSize: '1rem', boxSizing: 'border-box'
            }}
          />
          <button
            type="submit"
            disabled={cargando}
            style={{
              width: '100%', padding: '0.75rem',
              backgroundColor: '#e94560', border: 'none',
              borderRadius: '8px', color: '#fff',
              fontSize: '1rem', cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {cargando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}