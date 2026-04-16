import { useState, useEffect } from 'react';
import API from '../services/api';

export default function Usuarios({ onVolver }) {
  const [usuarios, setUsuarios] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [editando, setEditando] = useState(null);
  const [cambiandoPass, setCambiandoPass] = useState(null);
  const [nuevo, setNuevo] = useState({ nombre: '', email: '', password: '', rol: 'cajero', sede_id: '' });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevaPass, setNuevaPass] = useState('');

  useEffect(() => {
    cargarUsuarios();
    cargarSedes();
  }, []);

  const cargarUsuarios = async () => {
    const res = await API.get('/usuarios');
    setUsuarios(res.data);
  };

  const cargarSedes = async () => {
    const res = await API.get('/sedes');
    setSedes(res.data);
  };

  const mostrarMensaje = (msg) => {
    setMensaje(msg);
    setTimeout(() => setMensaje(''), 3000);
  };

  const mostrarError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 3000);
  };

  const crearUsuario = async () => {
    if (!nuevo.nombre || !nuevo.email || !nuevo.password || !nuevo.sede_id) {
      mostrarError('Todos los campos son obligatorios');
      return;
    }
    try {
      await API.post('/usuarios', nuevo);
      setNuevo({ nombre: '', email: '', password: '', rol: 'cajero', sede_id: '' });
      setMostrarForm(false);
      mostrarMensaje('Usuario creado');
      cargarUsuarios();
    } catch (err) {
      mostrarError(err.response?.data?.error || 'Error al crear usuario');
    }
  };

  const guardarEdicion = async (id) => {
    try {
      await API.patch(`/usuarios/${id}`, {
        nombre: editando.nombre,
        rol: editando.rol,
        activo: editando.activo,
        sede_id: editando.sede_id
      });
      setEditando(null);
      mostrarMensaje('Usuario actualizado');
      cargarUsuarios();
    } catch {
      mostrarError('Error al actualizar');
    }
  };

  const cambiarPassword = async (id) => {
    if (!nuevaPass || nuevaPass.length < 6) {
      mostrarError('Mínimo 6 caracteres');
      return;
    }
    try {
      await API.patch(`/usuarios/${id}/password`, { password: nuevaPass });
      setCambiandoPass(null);
      setNuevaPass('');
      mostrarMensaje('Contraseña actualizada');
    } catch {
      mostrarError('Error al cambiar contraseña');
    }
  };

  const roles = ['admin', 'cajero', 'planchero', 'cajero_planchero'];

  const colorRol = {
    admin: '#7f77dd',
    cajero: '#1D9E75',
    planchero: '#D85A30',
    cajero_planchero: '#BA7517'
  };

  const estilos = {
    container: { minHeight: '100vh', background: '#1a1a2e', color: '#fff', padding: '1rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
    btnVolver: { background: 'transparent', border: '1px solid #555', color: '#aaa', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer' },
    btnNuevo: { background: '#e94560', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 'bold' },
    btnGuardar: { background: '#4caf50', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer', marginRight: '0.3rem' },
    btnEditar: { background: '#0f3460', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer', marginRight: '0.3rem' },
    btnPass: { background: '#534AB7', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer', marginRight: '0.3rem' },
    btnCancelar: { background: '#555', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer' },
    form: { background: '#16213e', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem' },
    input: { background: '#0f3460', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.5rem', marginRight: '0.5rem', marginBottom: '0.5rem' },
    select: { background: '#0f3460', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.5rem', marginRight: '0.5rem', marginBottom: '0.5rem' },
    tabla: { width: '100%', borderCollapse: 'collapse' },
    th: { background: '#16213e', padding: '0.75rem 1rem', textAlign: 'left', color: '#aaa', fontSize: '0.85rem' },
    td: { padding: '0.75rem 1rem', borderBottom: '1px solid #16213e' },
    mensaje: { background: '#4caf50', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', marginBottom: '1rem' },
    errorMsg: { background: '#c0392b', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', marginBottom: '1rem' },
    badge: (rol) => ({
      display: 'inline-block', padding: '0.2rem 0.6rem',
      borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold',
      background: (colorRol[rol] || '#555') + '33',
      color: colorRol[rol] || '#aaa'
    }),
    badgeActivo: (activo) => ({
      display: 'inline-block', padding: '0.2rem 0.6rem',
      borderRadius: '20px', fontSize: '0.75rem',
      background: activo ? '#1a3a1a' : '#3a1a1a',
      color: activo ? '#4caf50' : '#e94560'
    })
  };

  return (
    <div style={estilos.container}>
      <div style={estilos.header}>
        <h2 style={{ margin: 0 }}>Gestión de usuarios</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={estilos.btnNuevo} onClick={() => setMostrarForm(!mostrarForm)}>
            + Nuevo usuario
          </button>
          <button style={estilos.btnVolver} onClick={onVolver}>Volver</button>
        </div>
      </div>

      {mensaje && <div style={estilos.mensaje}>{mensaje}</div>}
      {error && <div style={estilos.errorMsg}>{error}</div>}

      {mostrarForm && (
        <div style={estilos.form}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Nuevo usuario</h3>
          <input
            style={{ ...estilos.input, width: '160px' }}
            placeholder="Nombre"
            value={nuevo.nombre}
            onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })}
          />
          <input
            style={{ ...estilos.input, width: '180px' }}
            placeholder="Email"
            type="email"
            value={nuevo.email}
            onChange={e => setNuevo({ ...nuevo, email: e.target.value })}
          />
          <input
            style={{ ...estilos.input, width: '130px' }}
            placeholder="Contraseña"
            type="password"
            value={nuevo.password}
            onChange={e => setNuevo({ ...nuevo, password: e.target.value })}
          />
          <select
            style={estilos.select}
            value={nuevo.rol}
            onChange={e => setNuevo({ ...nuevo, rol: e.target.value })}
          >
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            style={estilos.select}
            value={nuevo.sede_id}
            onChange={e => setNuevo({ ...nuevo, sede_id: e.target.value })}
          >
            <option value="">Seleccionar sede</option>
            {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
          <br />
          <button style={estilos.btnGuardar} onClick={crearUsuario}>Guardar</button>
          <button style={estilos.btnCancelar} onClick={() => setMostrarForm(false)}>Cancelar</button>
        </div>
      )}

      <table style={estilos.tabla}>
        <thead>
          <tr>
            <th style={estilos.th}>Nombre</th>
            <th style={estilos.th}>Email</th>
            <th style={estilos.th}>Rol</th>
            <th style={estilos.th}>Sede</th>
            <th style={estilos.th}>Estado</th>
            <th style={estilos.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u.id}>
              <td style={estilos.td}>
                {editando?.id === u.id ? (
                  <input
                    style={{ ...estilos.input, marginBottom: 0 }}
                    value={editando.nombre}
                    onChange={e => setEditando({ ...editando, nombre: e.target.value })}
                  />
                ) : u.nombre}
              </td>
              <td style={{ ...estilos.td, color: '#aaa' }}>{u.email}</td>
              <td style={estilos.td}>
                {editando?.id === u.id ? (
                  <select
                    style={{ ...estilos.select, marginBottom: 0 }}
                    value={editando.rol}
                    onChange={e => setEditando({ ...editando, rol: e.target.value })}
                  >
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                ) : <span style={estilos.badge(u.rol)}>{u.rol}</span>}
              </td>
              <td style={estilos.td}>
                {editando?.id === u.id ? (
                  <select
                    style={{ ...estilos.select, marginBottom: 0 }}
                    value={editando.sede_id}
                    onChange={e => setEditando({ ...editando, sede_id: e.target.value })}
                  >
                    {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </select>
                ) : <span style={{ color: '#aaa' }}>{u.sedes?.nombre}</span>}
              </td>
              <td style={estilos.td}>
                {editando?.id === u.id ? (
                  <select
                    style={{ ...estilos.select, marginBottom: 0 }}
                    value={editando.activo}
                    onChange={e => setEditando({ ...editando, activo: e.target.value === 'true' })}
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                ) : <span style={estilos.badgeActivo(u.activo)}>{u.activo ? 'Activo' : 'Inactivo'}</span>}
              </td>
              <td style={estilos.td}>
                {editando?.id === u.id ? (
                  <>
                    <button style={estilos.btnGuardar} onClick={() => guardarEdicion(u.id)}>Guardar</button>
                    <button style={estilos.btnCancelar} onClick={() => setEditando(null)}>Cancelar</button>
                  </>
                ) : cambiandoPass === u.id ? (
                  <>
                    <input
                      style={{ ...estilos.input, width: '120px', marginBottom: 0 }}
                      type="password"
                      placeholder="Nueva contraseña"
                      value={nuevaPass}
                      onChange={e => setNuevaPass(e.target.value)}
                    />
                    <button style={estilos.btnGuardar} onClick={() => cambiarPassword(u.id)}>Guardar</button>
                    <button style={estilos.btnCancelar} onClick={() => { setCambiandoPass(null); setNuevaPass(''); }}>X</button>
                  </>
                ) : (
                  <>
                    <button style={estilos.btnEditar} onClick={() => setEditando({ id: u.id, nombre: u.nombre, rol: u.rol, activo: u.activo, sede_id: u.sede_id })}>Editar</button>
                    <button style={estilos.btnPass} onClick={() => setCambiandoPass(u.id)}>Contraseña</button>
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