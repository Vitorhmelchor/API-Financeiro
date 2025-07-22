const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('./auth');

router.post('/', verifyToken, async (req, res) => {
  try {
    const { nome, icone, cor } = req.body;
    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    const [result] = await db.query(
      'INSERT INTO categorias (nome, icone, cor, usuario_id) VALUES (?, ?, ?, ?)',
      [nome, icone || null, cor || null, req.userId]
    );

    res.status(201).json({
      id: result.insertId,
      nome,
      icone,
      cor,
      usuario_id: req.userId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const [results] = await db.query(
      'SELECT * FROM categorias WHERE usuario_id = ?',
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
      'SELECT * FROM categorias WHERE id = ? AND usuario_id = ?',
      [id, req.userId]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, icone, cor } = req.body;

    await db.query(
      'UPDATE categorias SET nome = ?, icone = ?, cor = ? WHERE id = ? AND usuario_id = ?',
      [nome, icone || null, cor || null, id, req.userId]
    );

    res.json({ id, nome, icone, cor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      'DELETE FROM categorias WHERE id = ? AND usuario_id = ?',
      [id, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    res.json({ message: 'Categoria deletada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
