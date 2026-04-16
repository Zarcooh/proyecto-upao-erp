import { useState, useEffect } from 'react';
import API from '../services/api';

export default function Categorias({ onVolver }) {
  const [categorias, setCategorias] = useState([]);
  const [editando, setEditando] = useState(null);
  const [nueva, setNueva] = useState({ nombre: '', orden: '' });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    const res = await API.get('/categorias');
    setCategorias(res.data);
  };

  const mostrarMensaje = (msg) => {
    setMensaje(msg);
    setTimeout(() => setMensaje(''), 3000);
  };

  const mostrarError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 3000);
  };

  const crearCategoria = async () => {
    if (!nueva.nombre) {
      mostrarError('El nombre es obligatorio');
      return;
    }
    const duplicada = categorias.some(
      c => c.nombre.toLowerCase() === nueva.nombre.toLowerCase()
    );
    if (duplicada) {
      mostrarError('Ya existe una categoría con ese nombre');
      return;
    }
    try {
      await API.post('/categorias', {
        nombre: nueva.nombre.trim(),
        orden: parseInt(nueva.orden) || categorias.length + 1
      });
      setNueva({ nombre: '', orden: '' });
      setMostrarForm(false);
      mostrarMensaje('Categoría creada');
      cargarCategorias();
    } catch {
      mostrarError('Error al crear categoría');
    }
  };

  const guardarEdicion = async (id) => {
    try {
      await API.patch(`/categorias/${id}`, {
        nombre: editando.nombre.trim(),
        orden: parseInt(editando.orden) || 0
      });
      setEditando(null);
      mostrarMensaje('Categoría actualizada');
      cargarCategorias();
    } catch {
      mostrarError('Error al actualizar');
    }
  };

  const eliminarCategoria = async (id, nombre) => {
    if (!confirm(`¿Eliminar la categoría "${nombre}"? Los productos quedarán sin categoría.`)) return;
    try {
      await API.delete(`/categorias/${id}`);
      mostrarMensaje('Categoría eliminada');
      cargarCategorias();
    } catch {
      mostrarError('Error al eliminar');
    }
  };

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
    tabla: { width: '100%', borderCollapse: 'collapse' },
    th: { background: '#16213e', padding: '0.75rem 1rem', textAlign: 'left', color: '#aaa', fontSize: '0.85rem' },
    td: { padding: '0.75rem 1rem', borderBottom: '1px solid #16213e' },
    mensaje: { background: '#4caf50', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', marginBottom: '1rem' },
    errorMsg: { background: '#c0392b', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', marginBottom: '1rem' },
  };

  return (
    <div style={estilos.container}>
      <div style={estilos.header}>
        <h2 style={{ margin: 0 }}>Gestión de categorías</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={estilos.btnNuevo} onClick={() => setMostrarForm(!mostrarForm)}>
            + Nueva categoría
          </button>
          <button style={estilos.btnVolver} onClick={onVolver}>Volver</button>
        </div>
      </div>

      {mensaje && <div style={estilos.mensaje}>{mensaje}</div>}
      {error && <div style={estilos.errorMsg}>{error}</div>}

      {mostrarForm && (
        <div style={estilos.form}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Nueva categoría</h3>
          <input
            style={{ ...estilos.input, width: '200px' }}
            placeholder="Nombre de la categoría"
            value={nueva.nombre}
            onChange={e => setNueva({ ...nueva, nombre: e.target.value })}
          />
          <input
            style={{ ...estilos.input, width: '80px' }}
            placeholder="Orden"
            type="number"
            value={nueva.orden}
            onChange={e => setNueva({ ...nueva, orden: e.target.value })}
          />
          <br />
          <button style={estilos.btnGuardar} onClick={crearCategoria}>Guardar</button>
          <button style={estilos.btnCancelar} onClick={() => setMostrarForm(false)}>Cancelar</button>
        </div>
      )}

      <table style={estilos.tabla}>
        <thead>
          <tr>
            <th style={estilos.th}>Orden</th>
            <th style={estilos.th}>Categoría</th>
            <th style={estilos.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map(c => (
            <tr key={c.id}>
              <td style={{ ...estilos.td, color: '#aaa', width: '80px' }}>
                {editando?.id === c.id ? (
                  <input
                    style={{ ...estilos.input, width: '60px', marginBottom: 0 }}
                    type="number"
                    value={editando.orden}
                    onChange={e => setEditando({ ...editando, orden: e.target.value })}
                  />
                ) : c.orden}
              </td>
              <td style={estilos.td}>
                {editando?.id === c.id ? (
                  <input
                    style={{ ...estilos.input, width: '200px', marginBottom: 0 }}
                    value={editando.nombre}
                    onChange={e => setEditando({ ...editando, nombre: e.target.value })}
                  />
                ) : c.nombre}
              </td>
              <td style={estilos.td}>
                {editando?.id === c.id ? (
                  <>
                    <button style={estilos.btnGuardar} onClick={() => guardarEdicion(c.id)}>Guardar</button>
                    <button style={estilos.btnCancelar} onClick={() => setEditando(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button style={estilos.btnEditar} onClick={() => setEditando({ id: c.id, nombre: c.nombre, orden: c.orden })}>Editar</button>
                    <button style={estilos.btnEliminar} onClick={() => eliminarCategoria(c.id, c.nombre)}>Eliminar</button>
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