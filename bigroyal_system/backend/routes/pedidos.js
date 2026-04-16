const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

// Crear pedido
router.post('/', authMiddleware, async (req, res) => {
  const { items, notas, canal } = req.body;
  const sede_id = req.usuario.sede_id;
  const usuario_id = req.usuario.id;

  // Calcular total
  let total = 0;
  for (const item of items) {
    total += item.precio_unitario * item.cantidad;
  }

  // Crear el pedido
  const { data: pedido, error } = await supabase
    .from('pedidos')
    .insert({ sede_id, usuario_id, total, notas, canal: canal || 'caja' })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Insertar items del pedido
  const pedidoItems = items.map(item => ({
    pedido_id: pedido.id,
    producto_id: item.producto_id,
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario,
    personalizacion: item.personalizacion || null
  }));

  const { error: itemsError } = await supabase
    .from('pedido_items')
    .insert(pedidoItems);

  if (itemsError) return res.status(500).json({ error: itemsError.message });

  // Descontar insumos automáticamente
  for (const item of items) {
    const { data: recetas } = await supabase
      .from('recetas')
      .select('*')
      .eq('producto_id', item.producto_id);

    for (const receta of recetas || []) {
      await supabase.rpc('descontar_insumo', {
        p_insumo_id: receta.insumo_id,
        p_cantidad: receta.cantidad * item.cantidad
      });
    }
  }

  // Notificar a cocina en tiempo real
  const io = req.app.get('io');
  io.emit('nuevo_pedido', pedido);

  res.json({ mensaje: 'Pedido creado', pedido });
});

// Ver pedidos de la sede
router.get('/', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('pedidos')
    .select(`*, pedido_items(*, productos(nombre))`)
    .eq('sede_id', req.usuario.sede_id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;