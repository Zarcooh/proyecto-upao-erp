import { useState, useEffect } from 'react';
import API from '../services/api';

export default function Dashboard({ usuario, onVolver }) {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDashboard();
    const intervalo = setInterval(cargarDashboard, 30000);
    return () => clearInterval(intervalo);
  }, []);

  const cargarDashboard = async () => {
    try {
      const res = await API.get('/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const estilos = {
    container: { minHeight: '100vh', background: '#1a1a2e', color: '#fff', padding: '1rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' },
    grid2: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' },
    kpiCard: { background: '#16213e', borderRadius: '12px', padding: '1.2rem', textAlign: 'center' },
    kpiValor: { fontSize: '2rem', fontWeight: 'bold', color: '#4caf50', margin: '0.5rem 0' },
    kpiLabel: { color: '#aaa', fontSize: '0.85rem' },
    card: { background: '#16213e', borderRadius: '12px', padding: '1.2rem' },
    cardTitle: { color: '#aaa', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 'bold' },
    sedeItem: { display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #0f3460' },
    productoItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #0f3460' },
    badge: { background: '#0f3460', borderRadius: '20px', padding: '0.2rem 0.6rem', fontSize: '0.8rem', color: '#4caf50', fontWeight: 'bold' },
    alertaItem: { display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #2a1a1a', color: '#e94560' },
    btnVolver: { background: 'transparent', border: '1px solid #555', color: '#aaa', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer' },
    btnRefresh: { background: '#0f3460', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer' },
  };

  if (cargando) return (
    <div style={{ ...estilos.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#aaa' }}>Cargando dashboard...</p>
    </div>
  );

  return (
    <div style={estilos.container}>
      <div style={estilos.header}>
        <div>
          <h2 style={{ margin: 0 }}>Panel del dueño</h2>
          <p style={{ color: '#aaa', margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>
            {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={estilos.btnRefresh} onClick={cargarDashboard}>Actualizar</button>
          <button style={estilos.btnVolver} onClick={onVolver}>Volver</button>
        </div>
      </div>

      {/* KPIs principales */}
      <div style={estilos.grid3}>
        <div style={estilos.kpiCard}>
          <div style={estilos.kpiLabel}>Ventas del día</div>
          <div style={estilos.kpiValor}>S/. {data?.totalDia}</div>
          <div style={estilos.kpiLabel}>{data?.totalPedidos} pedidos</div>
        </div>
        <div style={estilos.kpiCard}>
          <div style={estilos.kpiLabel}>Ticket promedio</div>
          <div style={estilos.kpiValor}>S/. {data?.ticketPromedio}</div>
          <div style={estilos.kpiLabel}>por pedido</div>
        </div>
        <div style={{ ...estilos.kpiCard, borderColor: data?.insumosbajos?.length > 0 ? '#e94560' : 'transparent', border: '1px solid' }}>
          <div style={estilos.kpiLabel}>Alertas de stock</div>
          <div style={{ ...estilos.kpiValor, color: data?.insumosbajos?.length > 0 ? '#e94560' : '#4caf50' }}>
            {data?.insumosbajos?.length}
          </div>
          <div style={estilos.kpiLabel}>insumos bajos</div>
        </div>
      </div>

      <div style={estilos.grid2}>
        {/* Ventas por sede */}
        <div style={estilos.card}>
          <div style={estilos.cardTitle}>VENTAS POR SEDE — HOY</div>
          {Object.keys(data?.ventasPorSede || {}).length === 0 ? (
            <p style={{ color: '#555' }}>Sin ventas hoy</p>
          ) : (
            Object.entries(data.ventasPorSede).map(([sede, info]) => (
              <div key={sede} style={estilos.sedeItem}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{sede}</div>
                  <div style={{ color: '#aaa', fontSize: '0.8rem' }}>{info.pedidos} pedidos</div>
                </div>
                <div style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  S/. {info.total.toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Top productos */}
        <div style={estilos.card}>
          <div style={estilos.cardTitle}>TOP PRODUCTOS — HOY</div>
          {data?.topProductos?.length === 0 ? (
            <p style={{ color: '#555' }}>Sin ventas hoy</p>
          ) : (
            data.topProductos.map((p, i) => (
              <div key={i} style={estilos.productoItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#555', fontSize: '0.85rem' }}>#{i + 1}</span>
                  <span>{p.nombre}</span>
                </div>
                <span style={estilos.badge}>{p.cantidad} vendidos</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Alertas de stock */}
      {data?.insumosbajos?.length > 0 && (
        <div style={{ ...estilos.card, border: '1px solid #e94560' }}>
          <div style={{ ...estilos.cardTitle, color: '#e94560' }}>⚠️ INSUMOS CON STOCK BAJO</div>
          {data.insumosbajos.map((insumo, i) => (
            <div key={i} style={estilos.alertaItem}>
              <span>{insumo.nombre}</span>
              <span>{insumo.stock_actual} {insumo.unidad} (mínimo: {insumo.stock_minimo})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}