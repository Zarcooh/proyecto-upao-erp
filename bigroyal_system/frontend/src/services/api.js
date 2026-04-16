import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Agrega el token automáticamente a cada request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (email, password) =>
  API.post('/auth/login', { email, password });

export const getPedidos = () =>
  API.get('/pedidos');

export const crearPedido = (pedido) =>
  API.post('/pedidos', pedido);

export const getPedidosCocina = () =>
  API.get('/cocina');

export const actualizarEstadoPedido = (id, estado) =>
  API.patch(`/cocina/${id}`, { estado });

export default API;