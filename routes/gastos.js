const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('./auth');

const validateGasto = (descricao, valor, data, categoria_id) => {
  if (!descricao || !valor || !data || !categoria_id) {
    throw new Error('Todos os campos são obrigatórios');
  }
  if (isNaN(parseFloat(valor))) {
    throw new Error('Valor deve ser um número');
  }
  if (parseFloat(valor) <= 0) {
    throw new Error('Valor deve ser positivo');
  }
  if (!Date.parse(data)) {
    throw new Error('Data inválida');
  }
};

router.post('/', verifyToken, async (req, res) => {
  try {
    const { descricao, valor, data, categoria_id, pago } = req.body;
    validateGasto(descricao, valor, data, categoria_id);

    const [categoria] = await db.query(
      'SELECT id FROM categorias WHERE id = ? AND usuario_id = ?',
      [categoria_id, req.userId]
    );

    if (categoria.length === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    const [result] = await db.query(
      'INSERT INTO gastos (descricao, valor, data, categoria_id, usuario_id, pago) VALUES (?, ?, ?, ?, ?, ?)',
      [descricao, valor, data, categoria_id, req.userId, pago || false]
    );

    res.status(201).json({
      id: result.insertId,
      descricao,
      valor: parseFloat(valor),
      data,
      categoria_id,
      pago: pago || false,
      usuario_id: req.userId,
    });
  } catch (err) {
    handleErrorResponse(res, err);
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate, categoria } = req.query;

    let query = `
      SELECT g.*, c.nome as categoria_nome, c.cor as categoria_cor
      FROM gastos g 
      LEFT JOIN categorias c ON g.categoria_id = c.id
      WHERE g.usuario_id = ?
    `;
    const params = [req.userId];

    if (startDate) {
      query += ' AND g.data >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND g.data <= ?';
      params.push(endDate);
    }
    if (categoria) {
      query += ' AND g.categoria_id = ?';
      params.push(categoria);
    }

    query += ' ORDER BY g.data DESC';

    const [results] = await db.query(query, params);
    res.json(results);
  } catch (err) {
    handleErrorResponse(res, err);
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await db.query(
      `
      SELECT g.*, c.nome as categoria_nome, c.cor as categoria_cor
      FROM gastos g 
      LEFT JOIN categorias c ON g.categoria_id = c.id
      WHERE g.id = ? AND g.usuario_id = ?
    `,
      [id, req.userId]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: 'Gasto não encontrado' });
    }
    res.json(results[0]);
  } catch (err) {
    handleErrorResponse(res, err);
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao, valor, data, categoria_id, pago } = req.body;
    validateGasto(descricao, valor, data, categoria_id);


    const [gasto] = await db.query(
      'SELECT id FROM gastos WHERE id = ? AND usuario_id = ?',
      [id, req.userId]
    );

    if (gasto.length === 0) {
      return res.status(404).json({ message: 'Gasto não encontrado' });
    }


    const [categoria] = await db.query(
      'SELECT id FROM categorias WHERE id = ? AND usuario_id = ?',
      [categoria_id, req.userId]
    );

    if (categoria.length === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    await db.query(
      'UPDATE gastos SET descricao = ?, valor = ?, data = ?, categoria_id = ?, pago = ? WHERE id = ?',
      [descricao, valor, data, categoria_id, pago || false, id]
    );

    res.json({
      id,
      descricao,
      valor: parseFloat(valor),
      data,
      categoria_id,
      pago: pago || false,
    });
  } catch (err) {
    handleErrorResponse(res, err);
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      'DELETE FROM gastos WHERE id = ? AND usuario_id = ?',
      [id, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Gasto não encontrado' });
    }

    res.json({ message: 'Gasto deletado com sucesso' });
  } catch (err) {
    handleErrorResponse(res, err);
  }
});

function handleErrorResponse(res, err) {
  console.error(err);
  const statusCode =
    err.message.includes('obrigatóri') || err.message.includes('inválid')
      ? 400
      : 500;
  res.status(statusCode).json({
    error: err.message || 'Erro interno do servidor',
  });
}

module.exports = router;
