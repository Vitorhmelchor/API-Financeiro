const db = require('./db');
require('dotenv').config();

async function createTables() {
  try {
    // Tabela de usuários
    await db.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabela usuarios criada ou já existente');

    // Tabela de categorias
    await db.query(`
      CREATE TABLE IF NOT EXISTS categorias (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(50) NOT NULL,
        icone VARCHAR(30),
        cor VARCHAR(20),
        usuario_id INT,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);
    console.log('Tabela categorias criada ou já existente');

    // Tabela de gastos
    await db.query(`
      CREATE TABLE IF NOT EXISTS gastos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        descricao VARCHAR(100) NOT NULL,
        valor DECIMAL(10,2) NOT NULL,
        data DATE NOT NULL,
        categoria_id INT,
        usuario_id INT,
        pago BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);
    console.log('Tabela gastos criada ou já existente');

    // Tabela de receitas
    await db.query(`
      CREATE TABLE IF NOT EXISTS receitas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        descricao VARCHAR(100) NOT NULL,
        valor DECIMAL(10,2) NOT NULL,
        data DATE NOT NULL,
        usuario_id INT,
        recebido BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);
    console.log('Tabela receitas criada ou já existente');

    // Tabela de metas
    await db.query(`
      CREATE TABLE IF NOT EXISTS metas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        descricao VARCHAR(100) NOT NULL,
        valor_objetivo DECIMAL(10,2) NOT NULL,
        valor_atual DECIMAL(10,2) DEFAULT 0,
        data_limite DATE,
        usuario_id INT,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);
    console.log('Tabela metas criada ou já existente');

    // Inserir usuário demo
    const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [
      'demo@email.com',
    ]);
    if (users.length === 0) {
      const hashedPassword = require('bcryptjs').hashSync('123456', 8);
      await db.query(
        'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
        ['Usuário Demo', 'demo@email.com', hashedPassword]
      );
      console.log('Usuário demo criado');

      // Inserir categorias demo
      await db.query(`
        INSERT INTO categorias (nome, icone, cor, usuario_id) VALUES
        ('Alimentação', 'shopping-cart', 'vermelho', 1),
        ('Transporte', 'car', 'azul', 1),
        ('Moradia', 'home', 'verde', 1),
        ('Lazer', 'film', 'amarelo', 1),
        ('Saúde', 'heart', 'rosa', 1)
      `);
      console.log('Categorias demo criadas');
    }
  } catch (err) {
    console.error('Erro ao criar tabelas:', err);
    process.exit(1);
  }
}

createTables();
