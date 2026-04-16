import { useState, useEffect } from 'react';
import { getPedidosCocina, actualizarEstadoPedido } from '../services/api';
import { io } from 'socket.io-client';

export default function Cocina({ usuario, onLogout }) {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
  cargarPedidos();

  const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000');
  socket.on('nuevo_pedido', (pedido) => {
    console.log('Nuevo pedido recibido:', pedido);
    cargarPedidos();
  });

  return () => socket.disconnect();
}, []);

  const cargarPedidos = async () => {
    try {
      const res = await getPedidosCocina();
      setPedidos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const cambiarEstado = async (id, estado) => {
    try {
      await actualizarEstadoPedido(id, estado);
      cargarPedidos();
    } catch (err) {
      console.error(err);
    }
  };

  const colorEstado = {
    pendiente: '#e94560',
    en_cocina: '#f39c12',
    listo: '#4caf50',
  };

  const estilos = {
    container: { minHeight: '100vh', background: '#1a1a2e', color: '#fff', padding: '1rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
    card: { background: '#16213e', borderRadius: '12px', padding: '1rem' },
    badge: (estado) => ({
      display: 'inline-block', padding: '0.2rem 0.6rem',
      borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold',
      background: colorEstado[estado], color: '#fff', marginBottom: '0.5rem'
    }),
    item: { background: '#0f3460', borderRadius: '6px', padding: '0.5rem', marginBottom: '0.3rem' },
    btnCocina: { background: '#f39c12', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 'bold', width: '100%', marginTop: '0.5rem' },
    btnListo: { background: '#4caf50', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 'bold', width: '100%', marginTop: '0.5rem' },
    btnLogout: { background: 'transparent', border: '1px solid #555', color: '#aaa', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer' },
    hora: { color: '#aaa', fontSize: '0.8rem', marginBottom: '0.5rem' },
    notas: { color: '#f39c12', fontSize: '0.85rem', marginTop: '0.3rem' }
  };

  // timezone fix America/Lima
  const formatHora = (fecha) => {
  const date = new Date(fecha);
  // Ajustar manualmente UTC-5 (Lima)
  date.setHours(date.getHours() - 5);
  return date.toLocaleTimeString('es-PE', { 
    hour: '2-digit', 
    minute: '2-digit'
  });
};

  return (
    <div style={estilos.container}>
      <div style={estilos.header}>
        <h2 style={{ margin: 0 }}>Cocina — {usuario.nombre}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button style={estilos.btnLogout} onClick={onLogout}>Salir</button>
        </div>
      </div>

      {cargando ? (
        <p style={{ color: '#aaa' }}>Cargando pedidos...</p>
      ) : pedidos.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '4rem', color: '#555' }}>
          <p style={{ fontSize: '3rem' }}>🍔</p>
          <p>Sin pedidos pendientes</p>
        </div>
      ) : (
        <div style={estilos.grid}>
          {pedidos.map(pedido => (
            <div key={pedido.id} style={estilos.card}>
              <div style={estilos.badge(pedido.estado)}>{pedido.estado.replace('_', ' ')}</div>
              <div style={estilos.hora}>Recibido a las {formatHora(pedido.created_at)}</div>

              {pedido.pedido_items?.map((item, i) => (
                <div key={i} style={estilos.item}>
                  <span style={{ fontWeight: 'bold' }}>{item.cantidad}x </span>
                  {item.productos?.nombre}
                  {item.personalizacion && (
                    <div style={{ color: '#aaa', fontSize: '0.8rem' }}>{item.personalizacion}</div>
                  )}
                </div>
              ))}

              {pedido.notas && (
                <div style={estilos.notas}>Nota: {pedido.notas}</div>
              )}

              {pedido.estado === 'pendiente' && (
                <button style={estilos.btnCocina} onClick={() => cambiarEstado(pedido.id, 'en_cocina')}>
                  Empezar a preparar
                </button>
              )}
              {pedido.estado === 'en_cocina' && (
                <button style={estilos.btnListo} onClick={() => cambiarEstado(pedido.id, 'listo')}>
                  Marcar como listo
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}