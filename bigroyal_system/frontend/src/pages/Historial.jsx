import { useState, useEffect } from 'react';
import API from '../services/api';

export default function Historial({ onVolver }) {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const getFechaLima = () => {
  const now = new Date();
  now.setHours(now.getHours() - 5); // UTC-5 Lima
  return now.toISOString().split('T')[0];
};

const [fecha, setFecha] = useState(getFechaLima());
  const [expandido, setExpandido] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarHistorial();
  }, [fecha]);

  const cargarHistorial = async () => {
    setCargando(true);
    try {
      const res = await API.get(`/historial?fecha=${fecha}`);
      setPedidos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const colorEstado = {
    pendiente: '#e94560',
    en_cocina: '#f39c12',
    listo: '#4caf50',
    entregado: '#1D9E75',
    cancelado: '#555'
  };

  const totalDia = pedidos
    .filter(p => p.estado !== 'cancelado')
    .reduce((sum, p) => sum + parseFloat(p.total), 0);

  const pedidosFiltrados = pedidos.filter(p =>
    p.id.includes(busqueda) ||
    p.usuarios?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.estado.includes(busqueda.toLowerCase())
  );

  const formatHora = (fecha) => {
  const date = new Date(fecha);
  // Ajustar manualmente UTC-5 (Lima)
  date.setHours(date.getHours() - 5);
  return date.toLocaleTimeString('es-PE', { 
    hour: '2-digit', 
    minute: '2-digit'
  });
};

  const formatFecha = (fecha) =>
  new Date(fecha).toLocaleDateString('es-PE', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    timeZone: 'America/Lima'
  });

  const estilos = {
    container: { minHeight: '100vh', background: '#1a1a2e', color: '#fff', padding: '1rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
    btnVolver: { background: 'transparent', border: '1px solid #555', color: '#aaa', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer' },
    filtros: { display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' },
    input: { background: '#0f3460', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.5rem' },
    resumen: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' },
    kpiCard: { background: '#16213e', borderRadius: '12px', padding: '1rem', textAlign: 'center' },
    kpiValor: { fontSize: '1.5rem', fontWeight: 'bold', color: '#4caf50', margin: '0.3rem 0' },
    kpiLabel: { color: '#aaa', fontSize: '0.8rem' },
    tabla: { width: '100%', borderCollapse: 'collapse' },
    th: { background: '#16213e', padding: '0.75rem 1rem', textAlign: 'left', color: '#aaa', fontSize: '0.85rem' },
    td: { padding: '0.75rem 1rem', borderBottom: '1px solid #16213e', verticalAlign: 'top' },
    badge: (estado) => ({
      display: 'inline-block', padding: '0.2rem 0.6rem',
      borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold',
      background: colorEstado[estado] + '33', color: colorEstado[estado]
    }),
    btnDetalle: { background: '#0f3460', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.2rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem' },
    detalle: { background: '#0f3460', borderRadius: '8px', padding: '0.75rem', marginTop: '0.5rem' },
    itemDetalle: { display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontSize: '0.85rem', borderBottom: '1px solid #1a1a2e' },
  };

  return (
    <div style={estilos.container}>
      <div style={estilos.header}>
        <div>
          <h2 style={{ margin: 0 }}>Historial de pedidos</h2>
          <p style={{ color: '#aaa', margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>
            {pedidos.length} pedidos — {formatFecha(fecha + 'T12:00:00')}
          </p>
        </div>
        <button style={estilos.btnVolver} onClick={onVolver}>Volver</button>
      </div>

      {/* Filtros */}
      <div style={estilos.filtros}>
        <input
          style={estilos.input}
          type="date"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
        />
        <input
          style={{ ...estilos.input, width: '200px' }}
          placeholder="Buscar por cajero o estado..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <span style={{ color: '#aaa', fontSize: '0.85rem' }}>
          {pedidosFiltrados.length} resultados
        </span>
      </div>

      {/* Resumen del día */}
      <div style={estilos.resumen}>
        <div style={estilos.kpiCard}>
          <div style={estilos.kpiLabel}>Total del día</div>
          <div style={estilos.kpiValor}>S/. {totalDia.toFixed(2)}</div>
        </div>
        <div style={estilos.kpiCard}>
          <div style={estilos.kpiLabel}>Pedidos</div>
          <div style={estilos.kpiValor}>{pedidos.filter(p => p.estado !== 'cancelado').length}</div>
        </div>
        <div style={estilos.kpiCard}>
          <div style={estilos.kpiLabel}>Ticket promedio</div>
          <div style={estilos.kpiValor}>
            S/. {pedidos.length > 0 ? (totalDia / pedidos.filter(p => p.estado !== 'cancelado').length || 0).toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      {/* Tabla */}
      {cargando ? (
        <p style={{ color: '#aaa' }}>Cargando historial...</p>
      ) : pedidosFiltrados.length === 0 ? (
        <p style={{ color: '#555', textAlign: 'center', marginTop: '3rem' }}>No hay pedidos para esta fecha</p>
      ) : (
        <table style={estilos.tabla}>
          <thead>
            <tr>
              <th style={estilos.th}>Hora</th>
              <th style={estilos.th}>Cajero</th>
              <th style={estilos.th}>Canal</th>
              <th style={estilos.th}>Estado</th>
              <th style={estilos.th}>Total</th>
              <th style={estilos.th}>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {pedidosFiltrados.map(p => (
              <>
                <tr key={p.id}>
                  <td style={estilos.td}>{formatHora(p.created_at)}</td>
                  <td style={estilos.td}>{p.usuarios?.nombre || '—'}</td>
                  <td style={{ ...estilos.td, color: '#aaa' }}>{p.canal}</td>
                  <td style={estilos.td}>
                    <span style={estilos.badge(p.estado)}>
                      {p.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ ...estilos.td, color: '#4caf50', fontWeight: 'bold' }}>
                    S/. {parseFloat(p.total).toFixed(2)}
                  </td>
                  <td style={estilos.td}>
                    <button
                      style={estilos.btnDetalle}
                      onClick={() => setExpandido(expandido === p.id ? null : p.id)}>
                      {expandido === p.id ? 'Ocultar' : 'Ver'}
                    </button>
                  </td>
                </tr>
                {expandido === p.id && (
                  <tr key={p.id + '-detalle'}>
                    <td colSpan={6} style={{ ...estilos.td, paddingTop: 0 }}>
                      <div style={estilos.detalle}>
                        {p.pedido_items?.map((item, i) => (
                          <div key={i} style={estilos.itemDetalle}>
                            <span>{item.cantidad}x {item.productos?.nombre}
                              {item.personalizacion && <span style={{ color: '#f39c12' }}> — {item.personalizacion}</span>}
                            </span>
                            <span style={{ color: '#4caf50' }}>S/. {(item.cantidad * item.precio_unitario).toFixed(2)}</span>
                          </div>
                        ))}
                        {p.notas && (
                          <div style={{ color: '#f39c12', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                            Nota: {p.notas}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}