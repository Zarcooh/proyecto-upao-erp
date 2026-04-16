const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  try {
    // Ventas del día
    const { data: pedidosHoy } = await supabase
      .from('pedidos')
      .select('total, sede_id, estado, sedes(nombre)')
      .gte('created_at', hoy.toISOString())
      .neq('estado', 'cancelado');

    const totalDia = pedidosHoy?.reduce((sum, p) => sum + parseFloat(p.total), 0) || 0;
    const ticketPromedio = pedidosHoy?.length > 0 ? totalDia / pedidosHoy.length : 0;

    // Ventas por sede
    const ventasPorSede = {};
    pedidosHoy?.forEach(p => {
      const nombre = p.sedes?.nombre || 'Sin sede';
      if (!ventasPorSede[nombre]) ventasPorSede[nombre] = { total: 0, pedidos: 0 };
      ventasPorSede[nombre].total += parseFloat(p.total);
      ventasPorSede[nombre].pedidos += 1;
    });

    // Productos más vendidos
    const { data: itemsHoy } = await supabase
      .from('pedido_items')
      .select('cantidad, productos(nombre), pedido_id');

    const topProductos = {};
    itemsHoy?.forEach(item => {
      const nombre = item.productos?.nombre;
      if (!nombre) return;
      if (!topProductos[nombre]) topProductos[nombre] = 0;
      topProductos[nombre] += item.cantidad;
    });

    const topProductosOrdenado = Object.entries(topProductos)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }));

    // Insumos con stock bajo
    const { data: todosInsumos } = await supabase
      .from('insumos')
      .select('nombre, stock_actual, stock_minimo, unidad');

    const insumosbajos = todosInsumos?.filter(
      i => parseFloat(i.stock_actual) <= parseFloat(i.stock_minimo)
    ) || [];

    res.json({
      totalDia: totalDia.toFixed(2),
      totalPedidos: pedidosHoy?.length || 0,
      ticketPromedio: ticketPromedio.toFixed(2),
      ventasPorSede,
      topProductos: topProductosOrdenado,
      insumosbajos,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;