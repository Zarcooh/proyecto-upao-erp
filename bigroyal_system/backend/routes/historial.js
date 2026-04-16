const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');
const soloAdmin = require('../middleware/soloAdmin');


router.get('/', authMiddleware, soloAdmin, async (req, res) => {
  const { fecha, sede_id } = req.query;

  let query = supabase
    .from('pedidos')
    .select(`
      *,
      sedes(nombre),
      usuarios(nombre),
      pedido_items(
        cantidad,
        precio_unitario,
        personalizacion,
        productos(nombre)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  if (fecha) {
  // Ajustar a zona horaria Lima (UTC-5)
  const inicio = new Date(fecha + 'T05:00:00.000Z'); // medianoche Lima = 5am UTC
  const fin = new Date(fecha + 'T04:59:59.999Z');
  fin.setDate(fin.getDate() + 1); // fin del día siguiente en UTC
  query = query.gte('created_at', inicio.toISOString()).lte('created_at', fin.toISOString());
}

  if (sede_id) {
    query = query.eq('sede_id', sede_id);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;