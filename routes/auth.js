const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const SALT_ROUNDS = 10;
const TOKEN_EXPIRATION = '7d';

const validateUserData = (nome, email, senha) => {
  if (!nome || !email || !senha) {
    throw new Error('Todos os campos são obrigatórios');
  }
  if (senha.length < 6) {
    throw new Error('A senha deve ter pelo menos 6 caracteres');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Email inválido');
  }
};

// novo usuário
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    validateUserData(nome, email, senha);

    const [users] = await db.query('SELECT id FROM usuarios WHERE email = ?', [
      email,
    ]);
    if (users.length > 0) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(senha, SALT_ROUNDS);

    const [result] = await db.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, hashedPassword]
    );

    const token = generateToken(result.insertId);

    res.status(201).json({
      auth: true,
      token,
      user: { id: result.insertId, nome, email },
    });
  } catch (err) {
    handleErrorResponse(res, err);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [
      email,
    ]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = users[0];

    const passwordIsValid = await bcrypt.compare(senha, user.senha);
    if (!passwordIsValid) {
      return res
        .status(401)
        .json({ auth: false, error: 'Credenciais inválidas' });
    }

    const token = generateToken(user.id);

    res.json({
      auth: true,
      token,
      user: { id: user.id, nome: user.nome, email: user.email },
    });
  } catch (err) {
    handleErrorResponse(res, err);
  }
});

// Middleware de verificação de token
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res
      .status(401)
      .json({ auth: false, message: 'Token não fornecido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ auth: false, message: 'Token inválido ou expirado' });
    }

    req.userId = decoded.id;
    next();
  });
}

router.get('/verify', verifyToken, (req, res) => {
  res.json({ auth: true, userId: req.userId });
});

// Funções auxiliares
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRATION,
  });
}

function handleErrorResponse(res, err) {
  console.error(err);
  const statusCode = err.message.includes('obrigatóri') ? 400 : 500;
  res.status(statusCode).json({
    error: err.message || 'Erro interno do servidor',
  });
}

module.exports = { router, verifyToken };
