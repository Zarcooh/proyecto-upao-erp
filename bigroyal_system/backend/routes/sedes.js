const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('sedes')
    .select('*')
    .eq('activa', true)
    .order('nombre');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;