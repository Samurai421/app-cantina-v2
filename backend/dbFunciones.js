// 📦 Importar conexión a PostgreSQL
const pool = require('./bases/database');


// 1️⃣ Crear tabla de productos
async function crearTabla() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        precio REAL NOT NULL,
        cantidad INTEGER DEFAULT 0,
        imagen TEXT,
        descripcion TEXT
      )
    `);
    console.log('✅ Tabla productos lista.');
  } catch (err) {
    console.error('❌ Error al crear tabla productos:', err.message);
  }
}


// 2️⃣ Insertar producto
async function agregarProducto(nombre, precio, cantidad, imagen, descripcion, callback) {
  try {
    const result = await pool.query(
      `INSERT INTO productos (nombre, precio, cantidad, imagen, descripcion)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [nombre, precio, cantidad, imagen, descripcion]
    );
    if (callback) callback(null, result.rows[0].id);
  } catch (err) {
    if (callback) callback(err);
  }
}


// 3️⃣ Editar producto
async function editarProducto(id, nombre, precio, cantidad, callback) {
  try {
    const result = await pool.query(
      `UPDATE productos SET nombre = $1, precio = $2, cantidad = $3 WHERE id = $4`,
      [nombre, precio, cantidad, id]
    );
    if (callback) callback(null, result.rowCount);
  } catch (err) {
    if (callback) callback(err);
  }
}


// 4️⃣ Borrar producto
async function borrarProducto(id, callback) {
  try {
    const result = await pool.query(`DELETE FROM productos WHERE id = $1`, [id]);
    if (callback) callback(null, result.rowCount);
  } catch (err) {
    if (callback) callback(err);
  }
}


// 5️⃣ Consultar todos los productos
async function obtenerProductos(callback) {
  try {
    const result = await pool.query(`SELECT * FROM productos ORDER BY id DESC`);
    callback(null, result.rows);
  } catch (err) {
    callback(err);
  }
}


async function obtenerProductoPorId(id, callback) {
  try {
    const result = await pool.query(`SELECT * FROM productos WHERE id = $1`, [id]);
    callback(null, result.rows[0]);
  } catch (err) {
    callback(err);
  }
}


// 6️⃣ Crear tabla de usuarios
async function crearTablaUsuarios() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nameuser TEXT UNIQUE NOT NULL,
        pass TEXT NOT NULL,
        email TEXT
      )
    `);
    console.log('✅ Tabla usuarios lista.');
  } catch (err) {
    console.error('❌ Error al crear tabla usuarios:', err.message);
  }
}


// Registrar usuario
async function agregarUsuario(nameuser, pass, email, callback) {
  try {
    const result = await pool.query(
      `INSERT INTO usuarios (nameuser, pass, email) VALUES ($1, $2, $3) RETURNING id`,
      [nameuser, pass, email]
    );
    if (callback) callback(null, result.rows[0].id);
  } catch (err) {
    if (callback) callback(err);
  }
}


// Obtener usuario por nameusername y password
async function obtenerUsuario(nameuser, pass, callback) {
  try {
    const result = await pool.query(
      `SELECT * FROM usuarios WHERE nameuser = $1 AND pass = $2`,
      [nameuser, pass]
    );
    callback(null, result.rows[0]);
  } catch (err) {
    callback(err);
  }
}


// 7️⃣ Crear tabla de pedidos
async function crearTablaPedidos() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        usuario TEXT NOT NULL,
        producto_id INTEGER NOT NULL,
        nombre_producto TEXT NOT NULL,
        cantidad INTEGER NOT NULL,
        precio_unitario REAL NOT NULL,
        total REAL NOT NULL,
        estado TEXT DEFAULT 'pendiente',
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla pedidos lista.');
  } catch (err) {
    console.error('❌ Error al crear tabla pedidos:', err.message);
  }
}


// Insertar nuevo pedido
async function agregarPedido(usuario, producto_id, nombre_producto, cantidad, precio_unitario, total, callback) {
  try {
    const result = await pool.query(
      `INSERT INTO pedidos (usuario, producto_id, nombre_producto, cantidad, precio_unitario, total)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [usuario, producto_id, nombre_producto, cantidad, precio_unitario, total]
    );
    if (callback) callback(null, result.rows[0].id);
  } catch (err) {
    if (callback) callback(err);
  }
}


// Obtener todos los pedidos
async function obtenerPedidos(callback) {
  try {
    const result = await pool.query(`SELECT * FROM pedidos ORDER BY fecha DESC`);
    callback(null, result.rows);
  } catch (err) {
    callback(err);
  }
}


// Cambiar estado de pedido
async function actualizarEstadoPedido(id, nuevoEstado, callback) {
  try {
    const result = await pool.query(
      `UPDATE pedidos SET estado = $1 WHERE id = $2`,
      [nuevoEstado, id]
    );
    if (callback) callback(null, result.rowCount);
  } catch (err) {
    if (callback) callback(err);
  }
}


// 8️⃣ Crear tabla de ventas
async function crearTablaVentas() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ventas (
        id SERIAL PRIMARY KEY,
        usuario TEXT NOT NULL,
        producto_id INTEGER NOT NULL,
        nombre_producto TEXT NOT NULL,
        cantidad INTEGER NOT NULL,
        precio_unitario REAL NOT NULL,
        total REAL NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla ventas lista.');
  } catch (err) {
    console.error('❌ Error al crear tabla ventas:', err.message);
  }
}


// Insertar venta
async function agregarVenta(usuario, producto_id, nombre_producto, cantidad, precio_unitario, total, callback) {
  try {
    const result = await pool.query(
      `INSERT INTO ventas (usuario, producto_id, nombre_producto, cantidad, precio_unitario, total)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [usuario, producto_id, nombre_producto, cantidad, precio_unitario, total]
    );
    if (callback) callback(null, result.rows[0].id);
  } catch (err) {
    if (callback) callback(err);
  }
}


// Obtener todas las ventas
async function obtenerVentas(callback) {
  try {
    const result = await pool.query(`SELECT * FROM ventas ORDER BY fecha DESC`);
    callback(null, result.rows);
  } catch (err) {
    callback(err);
  }
}


// Obtener ventas por usuario
async function obtenerVentasPorUsuario(usuario, callback) {
  try {
    const result = await pool.query(
      `SELECT * FROM ventas WHERE usuario = $1 ORDER BY fecha DESC`,
      [usuario]
    );
    callback(null, result.rows);
  } catch (err) {
    callback(err);
  }
}


// Borrar pedido
async function borrarPedido(id, callback) {
  try {
    const result = await pool.query(`DELETE FROM pedidos WHERE id = $1`, [id]);
    if (callback) callback(null, result.rowCount);
  } catch (err) {
    if (callback) callback(err);
  }
}


// 📦 Exportar todas las funciones
module.exports = {
  crearTabla,
  agregarProducto,
  editarProducto,
  borrarProducto,
  obtenerProductos,
  obtenerProductoPorId,

  crearTablaUsuarios,
  agregarUsuario,
  obtenerUsuario,

  crearTablaPedidos,
  agregarPedido,
  obtenerPedidos,
  actualizarEstadoPedido,
  borrarPedido,

  crearTablaVentas,
  agregarVenta,
  obtenerVentas,
  obtenerVentasPorUsuario,
};
