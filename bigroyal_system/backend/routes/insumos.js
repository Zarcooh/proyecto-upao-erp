const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

// Ver todos los insumos
router.get('/', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('insumos')
    .select('*')
    .order('nombre');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Crear insumo
router.post('/', authMiddleware, async (req, res) => {
  const { nombre, unidad, stock_actual, stock_minimo } = req.body;

  if (!nombre || !unidad) {
    return res.status(400).json({ error: 'Nombre y unidad son obligatorios' });
  }

  const { data, error } = await supabase
    .from('insumos')
    .insert({ nombre, unidad, stock_actual: stock_actual || 0, stock_minimo: stock_minimo || 0 })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ mensaje: 'Insumo creado', insumo: data });
});

// Editar insumo
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { nombre, unidad, stock_actual, stock_minimo } = req.body;

  const { data, error } = await supabase
    .from('insumos')
    .update({ nombre, unidad, stock_actual, stock_minimo, updated_at: new Date() })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ mensaje: 'Insumo actualizado', insumo: data });
});

// Eliminar insumo
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('insumos')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ mensaje: 'Insumo eliminado' });
});

module.exports = router;