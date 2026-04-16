import { useState, useEffect } from 'react';
import API from '../services/api';
import Categorias from './Categorias';
import RecetaProducto from './RecetaProducto';

export default function Productos({ onVolver }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [editando, setEditando] = useState(null);
  const [nuevo, setNuevo] = useState({ nombre: '', precio: '', categoria_id: '' });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('nombre');
  const [verCategorias, setVerCategorias] = useState(false);
  const [verReceta, setVerReceta] = useState(null);

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  const cargarProductos = async () => {
    const res = await API.get('/productos/todos');
    setProductos(res.data);
  };

  const cargarCategorias = async () => {
    try {
      const res = await API.get('/categorias');
      setCategorias(res.data);
    } catch {
      setCategorias([]);
    }
  };

  const mostrarMensaje = (msg) => {
    setMensaje(msg);
    setTimeout(() => setMensaje(''), 3000);
  };

  const mostrarError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 3000);
  };

  const validarDuplicado = (nombre, precioActual = null, idActual = null) => {
    return productos.some(p => {
      if (idActual && p.id === idActual) return false;
      return p.nombre.toLowerCase().trim() === nombre.toLowerCase().trim() &&
        (precioActual === null || parseFloat(p.precio) === parseFloat(precioActual));
    });
  };

  const crearProducto = async () => {
    if (!nuevo.nombre || !nuevo.precio) {
      mostrarError('Nombre y precio son obligatorios');
      return;
    }
    if (validarDuplicado(nuevo.nombre, nuevo.precio)) {
      mostrarError('Ya existe un producto con el mismo nombre y precio');
      return;
    }
    try {
      await API.post('/productos', {
        nombre: nuevo.nombre.trim(),
        precio: parseFloat(nuevo.precio),
        categoria_id: nuevo.categoria_id || null
      });
      setNuevo({ nombre: '', precio: '', categoria_id: '' });
      setMostrarForm(false);
      mostrarMensaje('Producto creado');
      cargarProductos();
    } catch {
      mostrarError('Error al crear producto');
    }
  };

  const guardarEdicion = async (id) => {
    if (validarDuplicado(editando.nombre, editando.precio, id)) {
      mostrarError('Ya existe un producto con el mismo nombre y precio');
      return;
    }
    try {
      await API.patch(`/productos/${id}`, {
        nombre: editando.nombre.trim(),
        precio: parseFloat(editando.precio),
        disponible: editando.disponible,
        categoria_id: editando.categoria_id || null
      });
      setEditando(null);
      mostrarMensaje('Producto actualizado');
      cargarProductos();
    } catch {
      mostrarError('Error al actualizar');
    }
  };

  const toggleDisponible = async (id, estadoActual) => {
    await API.patch(`/productos/${id}`, { disponible: !estadoActual });
    mostrarMensaje(estadoActual ? 'Producto desactivado' : 'Producto activado');
    cargarProductos();
  };

  const eliminarDefinitivo = async (id, nombre) => {
    if (!confirm(`¿Eliminar definitivamente "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await API.delete(`/productos/eliminar/${id}`);
      mostrarMensaje('Producto eliminado');
      cargarProductos();
    } catch {
      mostrarError('No se puede eliminar, tiene pedidos asociados');
    }
  };

  // Filtrar y ordenar
  const productosFiltrados = productos
    .filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => {
      if (orden === 'nombre') return a.nombre.localeCompare(b.nombre);
      if (orden === 'precio_asc') return a.precio - b.precio;
      if (orden === 'precio_desc') return b.precio - a.precio;
      return 0;
    });

  const estilos = {
    container: { minHeight: '100vh', background: '#1a1a2e', color: '#fff', padding: '1rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
    btnVolver: { background: 'transparent', border: '1px solid #555', color: '#aaa', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer' },
    btnNuevo: { background: '#e94560', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 'bold' },
    btnGuardar: { background: '#4caf50', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer', marginRight: '0.3rem' },
    btnEditar: { background: '#0f3460', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer', marginRight: '0.3rem' },
    btnEliminar: { background: '#c0392b', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer', marginRight: '0.3rem' },
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
    badge: (activo) => ({
      display: 'inline-block', padding: '0.2rem 0.5rem',
      borderRadius: '20px', fontSize: '0.75rem',
      background: activo ? '#1a3a1a' : '#3a1a1a',
      color: activo ? '#4caf50' : '#e94560'
    })
  };

  if (verCategorias) return <Categorias onVolver={() => {
  setVerCategorias(false);
  cargarCategorias();
    }} />;
  if (verReceta) return <RecetaProducto producto={verReceta} onVolver={() => setVerReceta(null)} />;

  return (
    <div style={estilos.container}>
      <div style={estilos.header}>
        <h2 style={{ margin: 0 }}>Gestión de productos</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={estilos.btnNuevo} onClick={() => setMostrarForm(!mostrarForm)}>
            + Nuevo producto
          </button>
          <button style={{ ...estilos.btnNuevo, background: '#534AB7' }}
            onClick={() => setVerCategorias(true)}>
            Categorías
          </button>
          <button style={estilos.btnVolver} onClick={onVolver}>Volver</button>
        </div>
      </div>

      {mensaje && <div style={estilos.mensaje}>{mensaje}</div>}
      {error && <div style={estilos.errorMsg}>{error}</div>}

      {mostrarForm && (
        <div style={estilos.form}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Nuevo producto</h3>
          <input
            style={{ ...estilos.input, width: '200px' }}
            placeholder="Nombre del producto"
            value={nuevo.nombre}
            onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })}
          />
          <input
            style={{ ...estilos.input, width: '100px' }}
            placeholder="Precio S/."
            type="number"
            value={nuevo.precio}
            onChange={e => setNuevo({ ...nuevo, precio: e.target.value })}
          />
          <select
            style={estilos.select}
            value={nuevo.categoria_id}
            onChange={e => setNuevo({ ...nuevo, categoria_id: e.target.value })}
          >
            <option value="">Sin categoría</option>
            {categorias.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          <br />
          <button style={estilos.btnGuardar} onClick={crearProducto}>Guardar</button>
          <button style={estilos.btnCancelar} onClick={() => setMostrarForm(false)}>Cancelar</button>
        </div>
      )}

      {/* Filtros */}
      <div style={estilos.filtros}>
        <input
          style={{ ...estilos.input, width: '220px', marginBottom: 0 }}
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <select
          style={{ ...estilos.select, marginBottom: 0 }}
          value={orden}
          onChange={e => setOrden(e.target.value)}
        >
          <option value="nombre">A — Z</option>
          <option value="precio_asc">Precio: menor a mayor</option>
          <option value="precio_desc">Precio: mayor a menor</option>
        </select>
        <span style={{ color: '#aaa', fontSize: '0.85rem' }}>
          {productosFiltrados.length} productos
        </span>
      </div>

      <table style={estilos.tabla}>
        <thead>
          <tr>
            <th style={estilos.th}>Producto</th>
            <th style={estilos.th}>Categoría</th>
            <th style={estilos.th}>Precio</th>
            <th style={estilos.th}>Estado</th>
            <th style={estilos.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productosFiltrados.map(p => (
            <tr key={p.id}>
              <td style={estilos.td}>
                {editando?.id === p.id ? (
                  <input
                    style={estilos.input}
                    value={editando.nombre}
                    onChange={e => setEditando({ ...editando, nombre: e.target.value })}
                  />
                ) : p.nombre}
              </td>
              <td style={{ ...estilos.td, color: '#aaa' }}>
                {editando?.id === p.id ? (
                  <select
                    style={{ ...estilos.select, marginBottom: 0 }}
                    value={editando.categoria_id || ''}
                    onChange={e => setEditando({ ...editando, categoria_id: e.target.value })}
                  >
                    <option value="">Sin categoría</option>
                    {categorias.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                ) : p.categorias?.nombre || '—'}
              </td>
              <td style={estilos.td}>
                {editando?.id === p.id ? (
                  <input
                    style={{ ...estilos.input, width: '80px' }}
                    type="number"
                    value={editando.precio}
                    onChange={e => setEditando({ ...editando, precio: e.target.value })}
                  />
                ) : `S/. ${p.precio}`}
              </td>
              <td style={estilos.td}>
                <span style={estilos.badge(p.disponible)}>
                  {p.disponible ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td style={estilos.td}>
                {editando?.id === p.id ? (
                  <>
                    <button style={estilos.btnGuardar} onClick={() => guardarEdicion(p.id)}>Guardar</button>
                    <button style={estilos.btnCancelar} onClick={() => setEditando(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button style={estilos.btnEditar} onClick={() => setEditando({ id: p.id, nombre: p.nombre, precio: p.precio, disponible: p.disponible, categoria_id: p.categoria_id || '' })}>Editar</button>
                    <button style={{ ...estilos.btnEditar, borderColor: '#1D9E75', color: '#1D9E75', background: '#0a2a1a' }}
                      onClick={() => setVerReceta(p)}>
                      Receta
                    </button>
                    <button
                      style={{ ...estilos.btnEliminar, background: p.disponible ? '#c0392b' : '#4caf50', marginRight: '0.3rem' }}
                      onClick={() => toggleDisponible(p.id, p.disponible)}>
                      {p.disponible ? 'Desactivar' : 'Activar'}
                    </button>
                    <button style={{ ...estilos.btnEliminar, background: '#7b0000' }}
                      onClick={() => eliminarDefinitivo(p.id, p.nombre)}>
                      Eliminar
                    </button>
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