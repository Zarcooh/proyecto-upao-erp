const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');
const soloAdmin = require('../middleware/soloAdmin');


// Ver todos los usuarios
router.get('/', authMiddleware, soloAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, email, rol, activo, sede_id, sedes(nombre)')
    .order('nombre');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Crear usuario
router.post('/', authMiddleware, soloAdmin, async (req, res) => {
  const { nombre, email, password, rol, sede_id } = req.body;

  if (!nombre || !email || !password || !rol || !sede_id) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  // Verificar si el email ya existe
  const { data: existe } = await supabase
    .from('usuarios')
    .select('id')
    .eq('email', email)
    .single();

  if (existe) {
    return res.status(400).json({ error: 'Ya existe un usuario con ese email' });
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('usuarios')
    .insert({ nombre, email, password_hash, rol, sede_id, activo: true })
    .select('id, nombre, email, rol, activo, sede_id')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ mensaje: 'Usuario creado', usuario: data });
});

// Editar usuario
router.patch('/:id', authMiddleware, soloAdmin, async (req, res) => {
  const { id } = req.params;
  const { nombre, rol, activo, sede_id } = req.body;

  const { data, error } = await supabase
    .from('usuarios')
    .update({ nombre, rol, activo, sede_id })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ mensaje: 'Usuario actualizado', usuario: data });
});

// Cambiar contraseña
router.patch('/:id/password', authMiddleware, soloAdmin, async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { error } = await supabase
    .from('usuarios')
    .update({ password_hash })
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ mensaje: 'Contraseña actualizada' });
});

module.exports = router;