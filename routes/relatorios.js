const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('./auth');

router.get('/mensal', verifyToken, async (req, res) => {
  try {
    const { ano, mes } = req.query;

    if (!ano || !mes) {
      return res.status(400).json({ error: 'Ano e mês são obrigatórios' });
    }

    const startDate = `${ano}-${mes.padStart(2, '0')}-01`;
    const endDate = `${ano}-${mes.padStart(2, '0')}-31`;

    const [gastos] = await db.query(
      `
      SELECT 
        c.nome as categoria,
        SUM(g.valor) as total,
        COUNT(g.id) as quantidade
      FROM gastos g
      LEFT JOIN categorias c ON g.categoria_id = c.id
      WHERE g.data BETWEEN ? AND ? AND g.usuario_id = ?
      GROUP BY c.nome
      ORDER BY total DESC
    `,
      [startDate, endDate, req.userId]
    );

    const [receitas] = await db.query(
      `
      SELECT SUM(valor) as total FROM receitas 
      WHERE data BETWEEN ? AND ? AND usuario_id = ? AND recebido = TRUE
    `,
      [startDate, endDate, req.userId]
    );

    const totalGastos = gastos.reduce(
      (sum, item) => sum + parseFloat(item.total),
      0
    );
    const totalReceitas = receitas[0].total || 0;
    const saldo = totalReceitas - totalGastos;

    res.json({
      periodo: `${mes}/${ano}`,
      totalGastos,
      totalReceitas,
      saldo,
      categorias: gastos,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/periodo', verifyToken, async (req, res) => {
  try {
    const { inicio, fim } = req.query;

    if (!inicio || !fim) {
      return res
        .status(400)
        .json({ error: 'Data inicial e final são obrigatórias' });
    }

    const [gastos] = await db.query(
      `
      SELECT 
        DATE_FORMAT(data, '%Y-%m') as mes,
        SUM(valor) as total
      FROM gastos
      WHERE data BETWEEN ? AND ? AND usuario_id = ?
      GROUP BY DATE_FORMAT(data, '%Y-%m')
      ORDER BY mes
    `,
      [inicio, fim, req.userId]
    );

    const [receitas] = await db.query(
      `
      SELECT 
        DATE_FORMAT(data, '%Y-%m') as mes,
        SUM(valor) as total
      FROM receitas
      WHERE data BETWEEN ? AND ? AND usuario_id = ? AND recebido = TRUE
      GROUP BY DATE_FORMAT(data, '%Y-%m')
      ORDER BY mes
    `,
      [inicio, fim, req.userId]
    );

    res.json({
      periodo: `${inicio} a ${fim}`,
      gastos,
      receitas,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    // Gastos do mês atual
    const currentDate = new Date();
    const firstDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    )
      .toISOString()
      .split('T')[0];
    const lastDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    )
      .toISOString()
      .split('T')[0];

    const [gastosMes] = await db.query(
      `
      SELECT SUM(valor) as total FROM gastos 
      WHERE data BETWEEN ? AND ? AND usuario_id = ?
    `,
      [firstDay, lastDay, req.userId]
    );

    const [receitasMes] = await db.query(
      `
      SELECT SUM(valor) as total FROM receitas 
      WHERE data BETWEEN ? AND ? AND usuario_id = ? AND recebido = TRUE
    `,
      [firstDay, lastDay, req.userId]
    );

    const [metas] = await db.query(
      `
      SELECT * FROM metas 
      WHERE usuario_id = ? AND (data_limite IS NULL OR data_limite >= CURDATE())
      ORDER BY data_limite ASC
      LIMIT 3
    `,
      [req.userId]
    );

    const [ultimosGastos] = await db.query(
      `
      SELECT g.*, c.nome as categoria_nome 
      FROM gastos g
      LEFT JOIN categorias c ON g.categoria_id = c.id
      WHERE g.usuario_id = ?
      ORDER BY g.data DESC, g.id DESC
      LIMIT 5
    `,
      [req.userId]
    );

    res.json({
      gastosMes: gastosMes[0].total || 0,
      receitasMes: receitasMes[0].total || 0,
      metas,
      ultimosGastos,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
