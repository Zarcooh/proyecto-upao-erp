const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .single();

  console.log('Usuario encontrado:', usuario);
  console.log('Error:', error);

  if (error || !usuario) {
    return res.status(401).json({ error: 'Usuario no encontrado' });
  }

  console.log('Password ingresado:', password);
  console.log('Hash en BD:', usuario.password_hash);

  const passwordValida = await bcrypt.compare(password, usuario.password_hash);
  console.log('Password válida:', passwordValida);

  if (!passwordValida) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }

  const token = jwt.sign(
    { id: usuario.id, rol: usuario.rol, sede_id: usuario.sede_id },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.rol,
      sede_id: usuario.sede_id
    }
  });
});

module.exports = router;