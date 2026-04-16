import { useState, useEffect } from 'react';
import { getPedidos, crearPedido } from '../services/api';
import API from '../services/api';
import Dashboard from './Dashboard';
import Productos from './Productos';
import GestionInsumos from './GestionInsumos';
import Historial from './Historial';
import Usuarios from './Usuarios';


export default function Caja({ usuario, onLogout }) {
    
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [notas, setNotas] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [verDashboard, setVerDashboard] = useState(false);
  const [verGestionInsumos, setVerGestionInsumos] = useState(false);
  const [verProductos, setVerProductos] = useState(false);
  const [verHistorial, setVerHistorial] = useState(false);
  const [verUsuarios, setVerUsuarios] = useState(false);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    const res = await API.get('/productos');
    setProductos(res.data);
  };

  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(p => p.producto_id === producto.id);
      if (existe) {
        return prev.map(p =>
          p.producto_id === producto.id
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        );
      }
      return [...prev, {
        producto_id: producto.id,
        nombre: producto.nombre,
        cantidad: 1,
        precio_unitario: producto.precio
      }];
    });
  };

  const quitarDelCarrito = (producto_id) => {
    setCarrito(prev => {
      const existe = prev.find(p => p.producto_id === producto_id);
      if (existe.cantidad === 1) {
        return prev.filter(p => p.producto_id !== producto_id);
      }
      return prev.map(p =>
        p.producto_id === producto_id
          ? { ...p, cantidad: p.cantidad - 1 }
          : p
      );
    });
  };

  const total = carrito.reduce((sum, p) => sum + p.precio_unitario * p.cantidad, 0);

  const enviarPedido = async () => {
    if (carrito.length === 0) return;
    setEnviando(true);
    try {
      await crearPedido({ items: carrito, notas, canal: 'caja' });
      setCarrito([]);
      setNotas('');
      setMensaje('Pedido enviado a cocina');
      setTimeout(() => setMensaje(''), 3000);
    } catch (err) {
      setMensaje('Error al enviar pedido');
    } finally {
      setEnviando(false);
    }
  };

  const estilos = {
    container: { display: 'flex', height: '100vh', background: '#1a1a2e', color: '#fff' },
    menu: { flex: 1, padding: '1rem', overflowY: 'auto' },
    sidebar: { width: '320px', background: '#16213e', padding: '1rem', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
    producto: { background: '#16213e', borderRadius: '8px', padding: '1rem', marginBottom: '0.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    btnAgregar: { background: '#e94560', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.4rem 0.8rem', cursor: 'pointer', fontWeight: 'bold' },
    carritoItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', background: '#0f3460', borderRadius: '6px', padding: '0.5rem' },
    btnCantidad: { background: '#e94560', border: 'none', color: '#fff', borderRadius: '4px', padding: '0.2rem 0.6rem', cursor: 'pointer', fontWeight: 'bold' },
    total: { fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'right', margin: '1rem 0' },
    btnEnviar: { background: '#4caf50', border: 'none', color: '#fff', borderRadius: '8px', padding: '1rem', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', width: '100%' },
    btnLogout: { background: 'transparent', border: '1px solid #555', color: '#aaa', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer' },
    mensaje: { background: '#4caf50', color: '#fff', padding: '0.5rem', borderRadius: '6px', textAlign: 'center', marginBottom: '0.5rem' }
  };


    if (verDashboard) return <Dashboard usuario={usuario} onVolver={() => setVerDashboard(false)} />;
    if (verProductos) return <Productos onVolver={() => setVerProductos(false)} />;
    if (verGestionInsumos) return <GestionInsumos onVolver={() => setVerGestionInsumos(false)} />;
    if (verHistorial) return <Historial onVolver={() => setVerHistorial(false)} />;
    if (verUsuarios) return <Usuarios onVolver={() => setVerUsuarios(false)} />;

  return (
    <div style={estilos.container}>
      <div style={estilos.menu}>
        <div style={estilos.header}>
          <h2 style={{ margin: 0 }}>Caja — {usuario.nombre}</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>

            {usuario.rol === 'admin' && (
              <>
                <button style={{ ...estilos.btnLogout, borderColor: '#4caf50', color: '#4caf50' }}
                  onClick={() => setVerGestionInsumos(true)}>
                  Insumos
                </button>
                <button style={{ ...estilos.btnLogout, borderColor: '#5dcaa5', color: '#5dcaa5' }}
                  onClick={() => setVerProductos(true)}>
                  Productos
                </button>
                <button style={{ ...estilos.btnLogout, borderColor: '#f39c12', color: '#f39c12' }}
                  onClick={() => setVerDashboard(true)}>
                  Dashboard
                </button>
                <button style={{ ...estilos.btnLogout, borderColor: '#378ADD', color: '#378ADD' }}
                  onClick={() => setVerHistorial(true)}>
                  Historial
                </button>
                <button style={{ ...estilos.btnLogout, borderColor: '#7f77dd', color: '#7f77dd' }}
                  onClick={() => setVerUsuarios(true)}>
                  Usuarios
                </button>
              </>
            )}
            <button style={estilos.btnLogout} onClick={onLogout}>Salir</button>
          </div>
        </div>
        <h3 style={{ color: '#aaa' }}>Menú</h3>
        {productos.map(p => (
          <div key={p.id} style={estilos.producto}>
            <div>
              <div style={{ fontWeight: 'bold' }}>{p.nombre}</div>
              <div style={{ color: '#aaa' }}>S/. {p.precio}</div>
            </div>
            <button style={estilos.btnAgregar} onClick={() => agregarAlCarrito(p)}>+ Agregar</button>
          </div>
        ))}
      </div>

      <div style={estilos.sidebar}>
        <h3 style={{ margin: '0 0 1rem 0' }}>Pedido actual</h3>
        {mensaje && <div style={estilos.mensaje}>{mensaje}</div>}

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {carrito.length === 0
            ? <p style={{ color: '#555' }}>Sin productos aún</p>
            : carrito.map(p => (
              <div key={p.producto_id} style={estilos.carritoItem}>
                <div>
                  <div style={{ fontSize: '0.9rem' }}>{p.nombre}</div>
                  <div style={{ color: '#aaa', fontSize: '0.8rem' }}>S/. {(p.precio_unitario * p.cantidad).toFixed(2)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button style={estilos.btnCantidad} onClick={() => quitarDelCarrito(p.producto_id)}>-</button>
                  <span>{p.cantidad}</span>
                  <button style={estilos.btnCantidad} onClick={() => agregarAlCarrito({ id: p.producto_id, nombre: p.nombre, precio: p.precio_unitario })}>+</button>
                </div>
              </div>
            ))
          }
        </div>

        <input
          placeholder="Notas (ej: sin cebolla)"
          value={notas}
          onChange={e => setNotas(e.target.value)}
          style={{ background: '#0f3460', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.5rem', marginBottom: '0.5rem', width: '100%', boxSizing: 'border-box' }}
        />

        <div style={estilos.total}>Total: S/. {total.toFixed(2)}</div>

        <button
          style={{ ...estilos.btnEnviar, opacity: carrito.length === 0 ? 0.5 : 1 }}
          onClick={enviarPedido}
          disabled={enviando || carrito.length === 0}
        >
          {enviando ? 'Enviando...' : 'Enviar a cocina'}
        </button>
      </div>
    </div>
  );

  
}