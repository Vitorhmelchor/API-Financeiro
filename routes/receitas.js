const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('./auth');

const validateReceita = (descricao, valor, data) => {
  if (!descricao || !valor || !data) {
    throw new Error('Descrição, valor e data são obrigatórios');
  }
  if (isNaN(parseFloat(valor))) {
    throw new Error('Valor deve ser um número');
  }
};

router.post('/', verifyToken, async (req, res) => {
  try {
    const { descricao, valor, data, recebido } = req.body;
    validateReceita(descricao, valor, data);

    const [result] = await db.query(
      'INSERT INTO receitas (descricao, valor, data, recebido, usuario_id) VALUES (?, ?, ?, ?, ?)',
      [descricao, valor, data, recebido || false, req.userId]
    );

    res.status(201).json({
      id: result.insertId,
      descricao,
      valor,
      data,
      recebido: recebido || false,
      usuario_id: req.userId,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const [results] = await db.query(
      'SELECT * FROM receitas WHERE usuario_id = ? ORDER BY data DESC',
      [req.userId]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await db.query(
      'SELECT * FROM receitas WHERE id = ? AND usuario_id = ?',
      [id, req.userId]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: 'Receita não encontrada' });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao, valor, data, recebido } = req.body;
    validateReceita(descricao, valor, data);

    await db.query(
      'UPDATE receitas SET descricao = ?, valor = ?, data = ?, recebido = ? WHERE id = ? AND usuario_id = ?',
      [descricao, valor, data, recebido || false, id, req.userId]
    );

    res.json({ id, descricao, valor, data, recebido: recebido || false });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      'DELETE FROM receitas WHERE id = ? AND usuario_id = ?',
      [id, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Receita não encontrada' });
    }

    res.json({ message: 'Receita deletada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
