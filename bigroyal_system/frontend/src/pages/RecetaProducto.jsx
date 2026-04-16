import { useState, useEffect } from 'react';
import API from '../services/api';

export default function RecetaProducto({ producto, onVolver }) {
  const [receta, setReceta] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [nuevo, setNuevo] = useState({ insumo_id: '', cantidad: '' });
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    cargarReceta();
    cargarInsumos();
  }, []);

  const cargarReceta = async () => {
    const res = await API.get(`/recetas/${producto.id}`);
    setReceta(res.data);
  };

  const cargarInsumos = async () => {
    const res = await API.get('/insumos');
    setInsumos(res.data);
  };

  const mostrarMensaje = (msg) => {
    setMensaje(msg);
    setTimeout(() => setMensaje(''), 3000);
  };

  const mostrarError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 3000);
  };

  const agregarIngrediente = async () => {
    if (!nuevo.insumo_id || !nuevo.cantidad) {
      mostrarError('Selecciona un insumo y cantidad');
      return;
    }
    try {
      await API.post('/recetas', {
        producto_id: producto.id,
        insumo_id: nuevo.insumo_id,
        cantidad: parseFloat(nuevo.cantidad)
      });
      setNuevo({ insumo_id: '', cantidad: '' });
      mostrarMensaje('Ingrediente agregado');
      cargarReceta();
    } catch (err) {
      mostrarError(err.response?.data?.error || 'Error al agregar');
    }
  };

  const guardarEdicion = async (id) => {
    try {
      await API.patch(`/recetas/${id}`, { cantidad: parseFloat(editando.cantidad) });
      setEditando(null);
      mostrarMensaje('Cantidad actualizada');
      cargarReceta();
    } catch {
      mostrarError('Error al actualizar');
    }
  };

  const eliminarIngrediente = async (id, nombre) => {
    if (!confirm(`¿Eliminar "${nombre}" de la receta?`)) return;
    await API.delete(`/recetas/${id}`);
    mostrarMensaje('Ingrediente eliminado');
    cargarReceta();
  };

  // Insumos disponibles (que no están ya en la receta)
  const insumosDisponibles = insumos.filter(
    i => !receta.some(r => r.insumos?.id === i.id)
  );

  const estilos = {
    container: { minHeight: '100vh', background: '#1a1a2e', color: '#fff', padding: '1rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    btnVolver: { background: 'transparent', border: '1px solid #555', color: '#aaa', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer' },
    btnGuardar: { background: '#4caf50', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer', marginRight: '0.3rem' },
    btnEditar: { background: '#0f3460', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer', marginRight: '0.3rem' },
    btnEliminar: { background: '#c0392b', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer' },
    btnCancelar: { background: '#555', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer' },
    btnAgregar: { background: '#e94560', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 'bold' },
    form: { background: '#16213e', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem' },
    input: { background: '#0f3460', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.5rem', marginRight: '0.5rem' },
    select: { background: '#0f3460', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.5rem', marginRight: '0.5rem' },
    tabla: { width: '100%', borderCollapse: 'collapse' },
    th: { background: '#16213e', padding: '0.75rem 1rem', textAlign: 'left', color: '#aaa', fontSize: '0.85rem' },
    td: { padding: '0.75rem 1rem', borderBottom: '1px solid #16213e' },
    mensaje: { background: '#4caf50', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', marginBottom: '1rem' },
    errorMsg: { background: '#c0392b', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', marginBottom: '1rem' },
    badge: { background: '#0f3460', borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.85rem', color: '#4caf50' },
  };

  return (
    <div style={estilos.container}>
      <div style={estilos.header}>
        <div>
          <h2 style={{ margin: 0 }}>Receta — {producto.nombre}</h2>
          <p style={{ color: '#aaa', margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>
            S/. {producto.precio} — {receta.length} ingredientes
          </p>
        </div>
        <button style={estilos.btnVolver} onClick={onVolver}>Volver a productos</button>
      </div>

      {mensaje && <div style={estilos.mensaje}>{mensaje}</div>}
      {error && <div style={{ ...estilos.mensaje, background: '#c0392b' }}>{error}</div>}

      {/* Agregar ingrediente */}
      <div style={estilos.form}>
        <h3 style={{ margin: '0 0 1rem 0' }}>Agregar ingrediente</h3>
        <select
          style={estilos.select}
          value={nuevo.insumo_id}
          onChange={e => setNuevo({ ...nuevo, insumo_id: e.target.value })}
        >
          <option value="">Seleccionar insumo</option>
          {insumosDisponibles.map(i => (
            <option key={i.id} value={i.id}>
              {i.nombre} ({i.unidad})
            </option>
          ))}
        </select>
        <input
          style={{ ...estilos.input, width: '100px' }}
          placeholder="Cantidad"
          type="number"
          value={nuevo.cantidad}
          onChange={e => setNuevo({ ...nuevo, cantidad: e.target.value })}
        />
        <button style={estilos.btnAgregar} onClick={agregarIngrediente}>
          + Agregar
        </button>
        {insumosDisponibles.length === 0 && (
          <p style={{ color: '#aaa', marginTop: '0.5rem', fontSize: '0.85rem' }}>
            Todos los insumos ya están en la receta
          </p>
        )}
      </div>

      {/* Lista de ingredientes */}
      {receta.length === 0 ? (
        <p style={{ color: '#555', textAlign: 'center', marginTop: '2rem' }}>
          Este producto no tiene ingredientes aún
        </p>
      ) : (
        <table style={estilos.tabla}>
          <thead>
            <tr>
              <th style={estilos.th}>Ingrediente</th>
              <th style={estilos.th}>Cantidad</th>
              <th style={estilos.th}>Unidad</th>
              <th style={estilos.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {receta.map(r => (
              <tr key={r.id}>
                <td style={estilos.td}>{r.insumos?.nombre}</td>
                <td style={estilos.td}>
                  {editando?.id === r.id ? (
                    <input
                      style={{ ...estilos.input, width: '80px' }}
                      type="number"
                      value={editando.cantidad}
                      onChange={e => setEditando({ ...editando, cantidad: e.target.value })}
                    />
                  ) : (
                    <span style={estilos.badge}>{r.cantidad}</span>
                  )}
                </td>
                <td style={{ ...estilos.td, color: '#aaa' }}>{r.insumos?.unidad}</td>
                <td style={estilos.td}>
                  {editando?.id === r.id ? (
                    <>
                      <button style={estilos.btnGuardar} onClick={() => guardarEdicion(r.id)}>Guardar</button>
                      <button style={estilos.btnCancelar} onClick={() => setEditando(null)}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button style={estilos.btnEditar} onClick={() => setEditando({ id: r.id, cantidad: r.cantidad })}>Editar</button>
                      <button style={estilos.btnEliminar} onClick={() => eliminarIngrediente(r.id, r.insumos?.nombre)}>Eliminar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}