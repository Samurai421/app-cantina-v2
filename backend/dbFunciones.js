const db = require('./bases/database');

// 1️⃣ Crear tabla si no existe
function crearTabla() {
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
        if (err) console.error('Error al crear la tabla:', err.message);
        else console.log('Tabla productos lista.');
    });
}


// 2️⃣ Insertar producto
function agregarProducto(nombre, precio, cantidad, imagen, descripcion, callback) {
    db.run(
        `INSERT INTO productos (nombre, precio, cantidad, imagen, descripcion) 
         VALUES (?, ?, ?, ?, ?)`,
        [nombre, precio, cantidad, imagen, descripcion],
        function(err) { if(callback) callback(err, this.lastID) }
    );
}


// 3️⃣ Editar producto
function editarProducto(id, nombre, precio, cantidad, callback) {
    db.run(
        `UPDATE productos SET nombre = ?, precio = ?, cantidad = ? WHERE id = ?`,
        [nombre, precio, cantidad, id],
        function(err) {
            callback(err, this.changes);
        }
    );
}

// 4️⃣ Borrar producto
function borrarProducto(id, callback) {
    db.run(
        `DELETE FROM productos WHERE id = ?`,
        [id],
        function(err) {
            callback(err, this.changes);
        }
    );
}

// 5️⃣ Consultar todos los productos
function obtenerProductos(callback) {
    db.all(`SELECT * FROM productos`, [], callback);
}

function obtenerProductoPorId(id, callback) {
    db.get('SELECT * FROM productos WHERE id = ?', [id], (err, row) => {
        callback(err, row);
    });
}



// 6️⃣ Crear tabla de usuarios
function crearTablaUsuarios() {
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user TEXT UNIQUE NOT NULL,
            pass TEXT NOT NULL,
            email TEXT
        )
    `, (err) => {
        if (err) console.error('Error al crear tabla usuarios:', err.message);
        else console.log('Tabla usuarios lista.');
    });
}

// Registrar usuario
function agregarUsuario(user, pass, email, callback) {
    db.run(
        `INSERT INTO usuarios (user, pass, email) VALUES (?, ?, ?)`,
        [user, pass, email],
        function(err) {
            if (callback) callback(err, this.lastID);
        }
    );
}

// Obtener usuario por username y password
function obtenerUsuario(user, pass, callback) {
    db.get(
        `SELECT * FROM usuarios WHERE user = ? AND pass = ?`,
        [user, pass],
        (err, row) => {
            callback(err, row);
        }
    );
}


// 7️⃣ Crear tabla de pedidos
function crearTablaPedidos() {
    db.run(`
        CREATE TABLE IF NOT EXISTS pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario TEXT NOT NULL,
            producto_id INTEGER NOT NULL,
            nombre_producto TEXT NOT NULL,
            cantidad INTEGER NOT NULL,
            precio_unitario REAL NOT NULL,
            total REAL NOT NULL,
            estado TEXT DEFAULT 'pendiente',  -- pendiente | preparado | entregado
            fecha TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error('Error al crear tabla pedidos:', err.message);
        else console.log('Tabla pedidos lista.');
    });
}

// Insertar nuevo pedido
function agregarPedido(usuario, producto_id, nombre_producto, cantidad, precio_unitario, total, callback) {
    db.run(
        `INSERT INTO pedidos (usuario, producto_id, nombre_producto, cantidad, precio_unitario, total)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [usuario, producto_id, nombre_producto, cantidad, precio_unitario, total],
        function (err) {
            if (callback) callback(err, this.lastID);
        }
    );
}

// Obtener todos los pedidos (para admin)
function obtenerPedidos(callback) {
    db.all(`SELECT * FROM pedidos ORDER BY fecha DESC`, [], callback);
}

// Cambiar estado de un pedido
function actualizarEstadoPedido(id, nuevoEstado, callback) {
    db.run(
        `UPDATE pedidos SET estado = ? WHERE id = ?`,
        [nuevoEstado, id],
        function (err) {
            if (callback) callback(err, this.changes);
        }
    );
}


// 8️⃣ Crear tabla de ventas (historial)
function crearTablaVentas() {
    db.run(`
        CREATE TABLE IF NOT EXISTS ventas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario TEXT NOT NULL,
            producto_id INTEGER NOT NULL,
            nombre_producto TEXT NOT NULL,
            cantidad INTEGER NOT NULL,
            precio_unitario REAL NOT NULL,
            total REAL NOT NULL,
            fecha TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error('Error al crear tabla ventas:', err.message);
        else console.log('Tabla ventas lista.');
    });
}

// Insertar en historial
function agregarVenta(usuario, producto_id, nombre_producto, cantidad, precio_unitario, total, callback) {
    db.run(
        `INSERT INTO ventas (usuario, producto_id, nombre_producto, cantidad, precio_unitario, total)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [usuario, producto_id, nombre_producto, cantidad, precio_unitario, total],
        function (err) {
            if (callback) callback(err, this.lastID);
        }
    );
}

// Obtener todas las ventas
function obtenerVentas(callback) {
    db.all(`SELECT * FROM ventas ORDER BY fecha DESC`, [], callback);
}


function obtenerVentasPorUsuario(usuario, callback) {
    db.all(
        `SELECT * FROM ventas WHERE usuario = ? ORDER BY fecha DESC`,
        [usuario],
        callback
    );
}



// Eliminar pedido por ID
function borrarPedido(id, callback) {
    db.run(
        `DELETE FROM pedidos WHERE id = ?`,
        [id],
        function (err) {
            if (callback) callback(err, this.changes);
        }
    );
}


module.exports = {
    crearTablaUsuarios,
    agregarUsuario,
    obtenerUsuario,
    obtenerProductoPorId,
    crearTabla,
    agregarProducto,
    editarProducto,
    borrarProducto,
    obtenerProductos,
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
