const sqlite3 = require('sqlite3').verbose();

// 📦 Conectar a la base de datos (se crea si no existe)
const db = new sqlite3.Database('./bases/cantina.db', (err) => {
    if (err) {
        console.error('❌ Error al conectar a la base de datos:', err.message);
    } else {
        console.log('✅ Conexión exitosa a SQLite.');
    }
});

// 🧱 Crear tabla productos si no existe
db.run(`
    CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        precio REAL NOT NULL,
        cantidad INTEGER DEFAULT 0,
        imagen TEXT,
        descripcion TEXT
    )
`, (err) => {
    if (err) {
        console.error('❌ Error al crear la tabla productos:', err.message);
    } else {
        console.log('📦 Tabla "productos" lista para usar.');
    }
});

module.exports = db;
