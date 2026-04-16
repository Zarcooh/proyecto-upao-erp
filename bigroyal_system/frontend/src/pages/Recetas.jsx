import { useState, useEffect } from 'react';
import API from '../services/api';

export default function Recetas({ onVolver }) {
  const [recetas, setRecetas] = useState({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarRecetas();
  }, []);

  const cargarRecetas = async () => {
    try {
      const res = await API.get('/recetas');
      // Agrupar por producto
      const agrupado = {};
      res.data.forEach(r => {
        const nombreProducto = r.productos?.nombre;
        if (!agrupado[nombreProducto]) {
          agrupado[nombreProducto] = {
            precio: r.productos?.precio,
            ingredientes: []
          };
        }
        agrupado[nombreProducto].ingredientes.push({
          nombre: r.insumos?.nombre,
          cantidad: r.cantidad,
          unidad: r.insumos?.unidad
        });
      });
      setRecetas(agrupado);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const estilos = {
    container: { minHeight: '100vh', background: '#1a1a2e', color: '#fff', padding: '1rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' },
    card: { background: '#16213e', borderRadius: '12px', padding: '1.2rem' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #0f3460', paddingBottom: '0.75rem' },
    nombre: { fontSize: '1.1rem', fontWeight: 'bold' },
    precio: { background: '#e94560', color: '#fff', borderRadius: '20px', padding: '0.2rem 0.6rem', fontSize: '0.85rem' },
    ingrediente: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #0f3460' },
    cantidad: { background: '#0f3460', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.85rem', color: '#4caf50', fontWeight: 'bold' },
    btnVolver: { background: 'transparent', border: '1px solid #555', color: '#aaa', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer' },
  };

  return (
    <div style={estilos.container}>
      <div style={estilos.header}>
        <h2 style={{ margin: 0 }}>Recetas</h2>
        <button style={estilos.btnVolver} onClick={onVolver}>Volver a caja</button>
      </div>

      {cargando ? (
        <p style={{ color: '#aaa' }}>Cargando recetas...</p>
      ) : Object.keys(recetas).length === 0 ? (
        <p style={{ color: '#555' }}>No hay recetas registradas</p>
      ) : (
        <div style={estilos.grid}>
          {Object.entries(recetas).map(([nombre, data]) => (
            <div key={nombre} style={estilos.card}>
              <div style={estilos.cardHeader}>
                <span style={estilos.nombre}>{nombre}</span>
                <span style={estilos.precio}>S/. {data.precio}</span>
              </div>
              {data.ingredientes.map((ing, i) => (
                <div key={i} style={estilos.ingrediente}>
                  <span style={{ color: '#ccc' }}>{ing.nombre}</span>
                  <span style={estilos.cantidad}>
                    {ing.cantidad} {ing.unidad}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}