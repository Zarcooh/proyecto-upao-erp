import { useState, useEffect } from 'react';
import API from '../services/api';

export default function GestionInsumos({ onVolver }) {
  const [insumos, setInsumos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [nuevo, setNuevo] = useState({ nombre: '', unidad: '', stock_actual: '', stock_minimo: '' });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarInsumos();
  }, []);

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

  const crearInsumo = async () => {
    if (!nuevo.nombre || !nuevo.unidad) {
      mostrarError('Nombre y unidad son obligatorios');
      return;
    }
    const duplicado = insumos.some(
      i => i.nombre.toLowerCase() === nuevo.nombre.toLowerCase()
    );
    if (duplicado) {
      mostrarError('Ya existe un insumo con ese nombre');
      return;
    }
    try {
      await API.post('/insumos', {
        nombre: nuevo.nombre.trim(),
        unidad: nuevo.unidad.trim(),
        stock_actual: parseFloat(nuevo.stock_actual) || 0,
        stock_minimo: parseFloat(nuevo.stock_minimo) || 0
      });
      setNuevo({ nombre: '', unidad: '', stock_actual: '', stock_minimo: '' });
      setMostrarForm(false);
      mostrarMensaje('Insumo creado');
      cargarInsumos();
    } catch {
      mostrarError('Error al crear insumo');
    }
  };

  const guardarEdicion = async (id) => {
    try {
      await API.patch(`/insumos/${id}`, {
        nombre: editando.nombre.trim(),
        unidad: editando.unidad.trim(),
        stock_actual: parseFloat(editando.stock_actual),
        stock_minimo: parseFloat(editando.stock_minimo)
      });
      setEditando(null);
      mostrarMensaje('Insumo actualizado');
      cargarInsumos();
    } catch {
      mostrarError('Error al actualizar');
    }
  };

  const eliminarInsumo = async (id, nombre) => {
    if (!confirm(`¿Eliminar el insumo "${nombre}"? Se eliminará también de las recetas.`)) return;
    try {
      await API.delete(`/insumos/${id}`);
      mostrarMensaje('Insumo eliminado');
      cargarInsumos();
    } catch {
      mostrarError('Error al eliminar');
    }
  };

  const colorStock = (insumo) => {
    if (insumo.stock_actual <= insumo.stock_minimo) return '#e94560';
    if (insumo.stock_actual <= insumo.stock_minimo * 1.5) return '#f39c12';
    return '#4caf50';
  };

  const insumosFiltrados = insumos.filter(i =>
    i.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const unidades = ['unidad', 'gramos', 'kg', 'ml', 'litros', 'lonchas', 'porciones'];

  const estilos = {
    container: { minHeight: '100vh', background: '#1a1a2e', color: '#fff', padding: '1rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
    btnVolver: { background: 'transparent', border: '1px solid #555', color: '#aaa', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer' },
    btnNuevo: { background: '#e94560', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 'bold' },
    btnGuardar: { background: '#4caf50', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer', marginRight: '0.3rem' },
    btnEditar: { background: '#0f3460', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer', marginRight: '0.3rem' },
    btnEliminar: { background: '#c0392b', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer' },
    btnCancelar: { background: '#555', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer' },
    form: { background: '#16213e', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem' },
    input: { background: '#0f3460', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.5rem', marginRight: '0.5rem', marginBottom: '0.5rem' },
    select: { background: '#0f3460', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.5rem', marginRight: '0.5rem', marginBottom: '0.5rem' },
    tabla: { width: '100%', borderCollapse: 'collapse' },
    th: { background: '#16213e', padding: '0.75rem 1rem', textAlign: 'left', color: '#aaa', fontSize: '0.85rem' },
    td: { padding: '0.75rem 1rem', borderBottom: '1px solid #16213e' },
    mensaje: { background: '#4caf50', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', marginBottom: '1rem' },
    errorMsg: { background: '#c0392b', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', marginBottom: '1rem' },
    filtros: { display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' },
  };

  return (
    <div style={estilos.container}>
      <div style={estilos.header}>
        <h2 style={{ margin: 0 }}>Gestión de insumos</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={estilos.btnNuevo} onClick={() => setMostrarForm(!mostrarForm)}>
            + Nuevo insumo
          </button>
          <button style={estilos.btnVolver} onClick={onVolver}>Volver</button>
        </div>
      </div>

      {mensaje && <div style={estilos.mensaje}>{mensaje}</div>}
      {error && <div style={estilos.errorMsg}>{error}</div>}

      {mostrarForm && (
        <div style={estilos.form}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Nuevo insumo</h3>
          <input
            style={{ ...estilos.input, width: '180px' }}
            placeholder="Nombre del insumo"
            value={nuevo.nombre}
            onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })}
          />
          <select
            style={estilos.select}
            value={nuevo.unidad}
            onChange={e => setNuevo({ ...nuevo, unidad: e.target.value })}
          >
            <option value="">Unidad</option>
            {unidades.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <input
            style={{ ...estilos.input, width: '100px' }}
            placeholder="Stock inicial"
            type="number"
            value={nuevo.stock_actual}
            onChange={e => setNuevo({ ...nuevo, stock_actual: e.target.value })}
          />
          <input
            style={{ ...estilos.input, width: '100px' }}
            placeholder="Stock mínimo"
            type="number"
            value={nuevo.stock_minimo}
            onChange={e => setNuevo({ ...nuevo, stock_minimo: e.target.value })}
          />
          <br />
          <button style={estilos.btnGuardar} onClick={crearInsumo}>Guardar</button>
          <button style={estilos.btnCancelar} onClick={() => setMostrarForm(false)}>Cancelar</button>
        </div>
      )}

      <div style={estilos.filtros}>
        <input
          style={{ ...estilos.input, width: '220px', marginBottom: 0 }}
          placeholder="Buscar insumo..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <span style={{ color: '#aaa', fontSize: '0.85rem' }}>
          {insumosFiltrados.length} insumos
        </span>
      </div>

      <table style={estilos.tabla}>
        <thead>
          <tr>
            <th style={estilos.th}>Insumo</th>
            <th style={estilos.th}>Unidad</th>
            <th style={estilos.th}>Stock actual</th>
            <th style={estilos.th}>Stock mínimo</th>
            <th style={estilos.th}>Estado</th>
            <th style={estilos.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {insumosFiltrados.map(i => (
            <tr key={i.id}>
              <td style={estilos.td}>
                {editando?.id === i.id ? (
                  <input
                    style={{ ...estilos.input, marginBottom: 0 }}
                    value={editando.nombre}
                    onChange={e => setEditando({ ...editando, nombre: e.target.value })}
                  />
                ) : i.nombre}
              </td>
              <td style={estilos.td}>
                {editando?.id === i.id ? (
                  <select
                    style={{ ...estilos.select, marginBottom: 0 }}
                    value={editando.unidad}
                    onChange={e => setEditando({ ...editando, unidad: e.target.value })}
                  >
                    {unidades.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                ) : <span style={{ color: '#aaa' }}>{i.unidad}</span>}
              </td>
              <td style={estilos.td}>
                {editando?.id === i.id ? (
                  <input
                    style={{ ...estilos.input, width: '80px', marginBottom: 0 }}
                    type="number"
                    value={editando.stock_actual}
                    onChange={e => setEditando({ ...editando, stock_actual: e.target.value })}
                  />
                ) : (
                  <span style={{ color: colorStock(i), fontWeight: 'bold' }}>
                    {i.stock_actual}
                  </span>
                )}
              </td>
              <td style={estilos.td}>
                {editando?.id === i.id ? (
                  <input
                    style={{ ...estilos.input, width: '80px', marginBottom: 0 }}
                    type="number"
                    value={editando.stock_minimo}
                    onChange={e => setEditando({ ...editando, stock_minimo: e.target.value })}
                  />
                ) : <span style={{ color: '#aaa' }}>{i.stock_minimo}</span>}
              </td>
              <td style={estilos.td}>
                <span style={{
                  background: colorStock(i) === '#4caf50' ? '#1a3a1a' : colorStock(i) === '#f39c12' ? '#3a2a00' : '#3a1a1a',
                  color: colorStock(i), borderRadius: '20px',
                  padding: '0.2rem 0.6rem', fontSize: '0.75rem'
                }}>
                  {i.stock_actual <= i.stock_minimo ? 'Stock bajo' :
                    i.stock_actual <= i.stock_minimo * 1.5 ? 'Por agotarse' : 'OK'}
                </span>
              </td>
              <td style={estilos.td}>
                {editando?.id === i.id ? (
                  <>
                    <button style={estilos.btnGuardar} onClick={() => guardarEdicion(i.id)}>Guardar</button>
                    <button style={estilos.btnCancelar} onClick={() => setEditando(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button style={estilos.btnEditar} onClick={() => setEditando({
                      id: i.id, nombre: i.nombre, unidad: i.unidad,
                      stock_actual: i.stock_actual, stock_minimo: i.stock_minimo
                    })}>Editar</button>
                    <button style={estilos.btnEliminar} onClick={() => eliminarInsumo(i.id, i.nombre)}>Eliminar</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}