// bases/database.js
const { Pool } = require('pg');

// Configuración de conexión a tu base de datos de Render
const pool = new Pool({
  host: 'dpg-d474v8n5r7bs73al1isg-a',   // 👈 Hostname de Render
  port: 5432,                           // Puerto por defecto de PostgreSQL
  database: 'dbcantina',           // Nombre de tu base
  user: 'dbcantina_user',          // Usuario
  password: '782CwNBwj4f9lXTzHc49I4t0jFGlhyqo',         // 🔐 Copiá la contraseña que te da Render
  ssl: { rejectUnauthorized: false }    // Importante para Render
});

// Test de conexión
pool.connect()
  .then(() => console.log('✅ Conectado correctamente a PostgreSQL en Render'))
  .catch(err => console.error('❌ Error al conectar:', err.message));

module.exports = pool;
