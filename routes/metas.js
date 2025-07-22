const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('./auth');

const validateMeta = (descricao, valor_objetivo, data_limite) => {
  if (!descricao || !valor_objetivo) {
    throw new Error('Descrição e valor objetivo são obrigatórios');
  }
  if (isNaN(parseFloat(valor_objetivo))) {
    throw new Error('Valor objetivo deve ser um número');
  }
};

router.post('/', verifyToken, async (req, res) => {
  try {
    const { descricao, valor_objetivo, valor_atual, data_limite } = req.body;
    validateMeta(descricao, valor_objetivo, data_limite);

    const [result] = await db.query(
      'INSERT INTO metas (descricao, valor_objetivo, valor_atual, data_limite, usuario_id) VALUES (?, ?, ?, ?, ?)',
      [
        descricao,
        valor_objetivo,
        valor_atual || 0,
        data_limite || null,
        req.userId,
      ]
    );

    res.status(201).json({
      id: result.insertId,
      descricao,
      valor_objetivo,
      valor_atual: valor_atual || 0,
      data_limite: data_limite || null,
      usuario_id: req.userId,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const [results] = await db.query(
      'SELECT * FROM metas WHERE usuario_id = ? ORDER BY data_limite ASC',
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
      'SELECT * FROM metas WHERE id = ? AND usuario_id = ?',
      [id, req.userId]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: 'Meta não encontrada' });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao, valor_objetivo, valor_atual, data_limite } = req.body;
    validateMeta(descricao, valor_objetivo, data_limite);

    await db.query(
      'UPDATE metas SET descricao = ?, valor_objetivo = ?, valor_atual = ?, data_limite = ? WHERE id = ? AND usuario_id = ?',
      [
        descricao,
        valor_objetivo,
        valor_atual || 0,
        data_limite || null,
        id,
        req.userId,
      ]
    );

    res.json({
      id,
      descricao,
      valor_objetivo,
      valor_atual: valor_atual || 0,
      data_limite: data_limite || null,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id/add', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { valor } = req.body;

    if (!valor || isNaN(parseFloat(valor))) {
      throw new Error('Valor inválido');
    }

    await db.query(
      'UPDATE metas SET valor_atual = valor_atual + ? WHERE id = ? AND usuario_id = ?',
      [valor, id, req.userId]
    );

    res.json({ message: 'Valor adicionado com sucesso' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      'DELETE FROM metas WHERE id = ? AND usuario_id = ?',
      [id, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Meta não encontrada' });
    }

    res.json({ message: 'Meta deletada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
