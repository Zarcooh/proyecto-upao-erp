import { useState, useEffect } from 'react';
import API from '../services/api';

export default function Inventario({ onVolver }) {
  const [insumos, setInsumos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [nuevoStock, setNuevoStock] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    cargarInsumos();
  }, []);

  const cargarInsumos = async () => {
    const res = await API.get('/insumos');
    setInsumos(res.data);
  };

  const guardarStock = async (id) => {
    try {
      await API.patch(`/insumos/${id}`, { stock_actual: parseFloat(nuevoStock) });
      setEditando(null);
      setNuevoStock('');
      setMensaje('Stock actualizado');
      setTimeout(() => setMensaje(''), 3000);
      cargarInsumos();
    } catch (err) {
      setMensaje('Error al actualizar');
    }
  };

  const colorStock = (insumo) => {
    if (insumo.stock_actual <= insumo.stock_minimo) return '#e94560';
    if (insumo.stock_actual <= insumo.stock_minimo * 1.5) return '#f39c12';
    return '#4caf50';
  };

  const estilos = {
    container: { minHeight: '100vh', background: '#1a1a2e', color: '#fff', padding: '1rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    tabla: { width: '100%', borderCollapse: 'collapse' },
    th: { background: '#16213e', padding: '0.75rem 1rem', textAlign: 'left', color: '#aaa', fontSize: '0.85rem' },
    td: { padding: '0.75rem 1rem', borderBottom: '1px solid #16213e' },
    btnEditar: { background: '#0f3460', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer' },
    btnGuardar: { background: '#4caf50', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer', marginRight: '0.5rem' },
    btnCancelar: { background: '#555', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer' },
    btnVolver: { background: 'transparent', border: '1px solid #555', color: '#aaa', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer' },
    input: { background: '#0f3460', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.3rem 0.5rem', width: '80px' },
    mensaje: { background: '#4caf50', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', marginBottom: '1rem' },
    alerta: { background: '#2a1a1a', border: '1px solid #e94560', borderRadius: '8px', padding: '0.5rem 1rem', marginBottom: '1rem', color: '#e94560', fontSize: '0.9rem' }
  };

  const insumosAlerta = insumos.filter(i => i.stock_actual <= i.stock_minimo);

  return (
    <div style={estilos.container}>
      <div style={estilos.header}>
        <h2 style={{ margin: 0 }}>Control de inventario</h2>
        <button style={estilos.btnVolver} onClick={onVolver}>Volver a caja</button>
      </div>

      {mensaje && <div style={estilos.mensaje}>{mensaje}</div>}

      {insumosAlerta.length > 0 && (
        <div style={estilos.alerta}>
          ⚠️ Stock bajo: {insumosAlerta.map(i => i.nombre).join(', ')}
        </div>
      )}

      <table style={estilos.tabla}>
        <thead>
          <tr>
            <th style={estilos.th}>Insumo</th>
            <th style={estilos.th}>Unidad</th>
            <th style={estilos.th}>Stock actual</th>
            <th style={estilos.th}>Stock mínimo</th>
            <th style={estilos.th}>Estado</th>
            <th style={estilos.th}>Ajustar</th>
          </tr>
        </thead>
        <tbody>
          {insumos.map(insumo => (
            <tr key={insumo.id} style={{ background: '#1a1a2e' }}>
              <td style={estilos.td}>{insumo.nombre}</td>
              <td style={{ ...estilos.td, color: '#aaa' }}>{insumo.unidad}</td>
              <td style={estilos.td}>
                <span style={{ color: colorStock(insumo), fontWeight: 'bold' }}>
                  {insumo.stock_actual}
                </span>
              </td>
              <td style={{ ...estilos.td, color: '#aaa' }}>{insumo.stock_minimo}</td>
              <td style={estilos.td}>
                <span style={{
                  background: colorStock(insumo),
                  color: '#fff', borderRadius: '20px',
                  padding: '0.2rem 0.6rem', fontSize: '0.75rem'
                }}>
                  {insumo.stock_actual <= insumo.stock_minimo ? 'Stock bajo' :
                    insumo.stock_actual <= insumo.stock_minimo * 1.5 ? 'Por agotarse' : 'OK'}
                </span>
              </td>
              <td style={estilos.td}>
                {editando === insumo.id ? (
                  <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                    <input
                      style={estilos.input}
                      type="number"
                      value={nuevoStock}
                      onChange={e => setNuevoStock(e.target.value)}
                      autoFocus
                    />
                    <button style={estilos.btnGuardar} onClick={() => guardarStock(insumo.id)}>Guardar</button>
                    <button style={estilos.btnCancelar} onClick={() => setEditando(null)}>X</button>
                  </div>
                ) : (
                  <button style={estilos.btnEditar} onClick={() => {
                    setEditando(insumo.id);
                    setNuevoStock(insumo.stock_actual);
                  }}>
                    Ajustar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}