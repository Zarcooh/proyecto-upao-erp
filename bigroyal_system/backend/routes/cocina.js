const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

// Ver pedidos pendientes en cocina
router.get('/', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      *,
      pedido_items(
        cantidad,
        personalizacion,
        productos(nombre)
      )
    `)
    .eq('sede_id', req.usuario.sede_id)
    .in('estado', ['pendiente', 'en_cocina'])
    .order('created_at', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Planchero marca pedido como en_cocina o listo
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!['en_cocina', 'listo', 'entregado'].includes(estado)) {
    return res.status(400).json({ error: 'Estado no válido' });
  }

  const { data, error } = await supabase
    .from('pedidos')
    .update({ estado, updated_at: new Date() })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ mensaje: `Pedido actualizado a ${estado}`, pedido: data });
});

module.exports = router;