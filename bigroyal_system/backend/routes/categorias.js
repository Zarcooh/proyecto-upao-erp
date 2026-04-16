const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

// Ver todas las categorías
router.get('/', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('orden');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Crear categoría
router.post('/', authMiddleware, async (req, res) => {
  const { nombre, orden } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Nombre es obligatorio' });

  const { data, error } = await supabase
    .from('categorias')
    .insert({ nombre, orden: orden || 0 })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ mensaje: 'Categoría creada', categoria: data });
});

// Editar categoría
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { nombre, orden } = req.body;

  const { data, error } = await supabase
    .from('categorias')
    .update({ nombre, orden })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ mensaje: 'Categoría actualizada', categoria: data });
});

// Eliminar categoría
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('categorias')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ mensaje: 'Categoría eliminada' });
});

module.exports = router;