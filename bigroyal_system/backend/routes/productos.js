const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

// Ver todos los productos (para gestión) — DEBE IR PRIMERO
router.get('/todos', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('productos')
    .select('*, categorias(nombre)')
    .order('nombre');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Ver productos disponibles (para caja)
router.get('/', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('productos')
    .select('*, categorias(nombre)')
    .eq('disponible', true)
    .order('nombre');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Crear producto
router.post('/', authMiddleware, async (req, res) => {
  const { nombre, precio, categoria_id } = req.body;

  if (!nombre || !precio) {
    return res.status(400).json({ error: 'Nombre y precio son obligatorios' });
  }

  const { data, error } = await supabase
    .from('productos')
    .insert({ nombre, precio, categoria_id, disponible: true })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ mensaje: 'Producto creado', producto: data });
});

// Editar producto
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, disponible, categoria_id } = req.body;

  const { data, error } = await supabase
    .from('productos')
    .update({ nombre, precio, disponible, categoria_id })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ mensaje: 'Producto actualizado', producto: data });
});

// Eliminar definitivamente
router.delete('/eliminar/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ mensaje: 'Producto eliminado' });
});

// Desactivar producto
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('productos')
    .update({ disponible: false })
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ mensaje: 'Producto desactivado' });
});



module.exports = router;