import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Caja from './pages/Caja';
import Cocina from './pages/Cocina';

export default function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem('usuario');
    if (u) setUsuario(JSON.parse(u));
  }, []);

  const handleLogin = (u) => setUsuario(u);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  if (!usuario) return <Login onLogin={handleLogin} />;

  if (usuario.rol === 'planchero') return <Cocina usuario={usuario} onLogout={handleLogout} />;

  return <Caja usuario={usuario} onLogout={handleLogout} />;
}