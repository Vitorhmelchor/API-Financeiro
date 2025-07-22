const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'UTC', 
});

// Testar conexão ao iniciar
async function testConnection() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('✅ Conectado ao MySQL com sucesso');
    await conn.ping();
    console.log('✅ Conexão está respondendo');
  } catch (err) {
    console.error('❌ Erro ao conectar ao MySQL:', err.message);
    process.exit(1);
  } finally {
    if (conn) conn.release();
  }
}

testConnection();

module.exports = pool;
