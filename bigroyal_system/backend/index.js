const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const supabase = require('./config/supabase');
const authRoutes = require('./routes/auth');
const pedidosRoutes = require('./routes/pedidos');
const cocinaRoutes = require('./routes/cocina');
const productosRoutes = require('./routes/productos');
const insumosRoutes = require('./routes/insumos');
const recetasRoutes = require('./routes/recetas');
const dashboardRoutes = require('./routes/dashboard');
const categoriasRoutes = require('./routes/categorias');
const historialRoutes = require('./routes/historial');
const usuariosRoutes = require('./routes/usuarios');
const sedesRoutes = require('./routes/sedes');




const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors({ origin: '*' }));
app.use(express.json());

// Pasar io a las rutas
app.set('io', io);

app.use('/api/auth', authRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/cocina', cocinaRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/insumos', insumosRoutes);
app.use('/api/recetas', recetasRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/sedes', sedesRoutes);





app.get('/', async (req, res) => {
  const { data, error } = await supabase.from('sedes').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ mensaje: 'Big Royal API funcionando', sedes: data });
});

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});