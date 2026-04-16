const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');
const soloAdmin = require('../middleware/soloAdmin');

// Ver receta de un producto
router.get('/:producto_id', authMiddleware, soloAdmin, async (req, res) => {
  const { producto_id } = req.params;

  const { data, error } = await supabase
    .from('recetas')
    .select('id, cantidad, insumos(id, nombre, unidad)')
    .eq('producto_id', producto_id);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Agregar ingrediente a receta
router.post('/', authMiddleware, soloAdmin, async (req, res) => {
  const { producto_id, insumo_id, cantidad } = req.body;

  if (!producto_id || !insumo_id || !cantidad) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  // Verificar si ya existe ese insumo en la receta
  const { data: existe } = await supabase
    .from('recetas')
    .select('id')
    .eq('producto_id', producto_id)
    .eq('insumo_id', insumo_id)
    .single();

  if (existe) {
    return res.status(400).json({ error: 'Ese insumo ya está en la receta' });
  }

  const { data, error } = await supabase
    .from('recetas')
    .insert({ producto_id, insumo_id, cantidad })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ mensaje: 'Ingrediente agregado', receta: data });
});

// Editar cantidad de un ingrediente
router.patch('/:id', authMiddleware, soloAdmin, async (req, res) => {
  const { id } = req.params;
  const { cantidad } = req.body;

  const { data, error } = await supabase
    .from('recetas')
    .update({ cantidad })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ mensaje: 'Cantidad actualizada', receta: data });
});

// Eliminar ingrediente de receta
router.delete('/:id', authMiddleware, soloAdmin, async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('recetas')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ mensaje: 'Ingrediente eliminado' });
});

module.exports = router;