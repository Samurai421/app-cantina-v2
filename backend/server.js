const express = require('express');
const cors = require('cors');
const dbFuncs = require('./dbFunciones');
const db = require('./bases/database')

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());                 // Permite requests desde cualquier origen
app.use(express.json());         // Permite recibir JSON en el body

// Crear tabla al iniciar el servidor
dbFuncs.crearTabla();
dbFuncs.crearTablaUsuarios();
dbFuncs.crearTablaPedidos();
dbFuncs.crearTablaVentas();



// Rutas

// 1️⃣ Obtener todos los productos
app.get('/productos', (req, res) => {
    dbFuncs.obtenerProductos((err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 2️⃣ Agregar producto
app.post('/productos', (req, res) => {
    const { nombre, precio, cantidad, imagen, descripcion } = req.body;

    dbFuncs.agregarProducto(nombre, precio, cantidad, imagen, descripcion, (err, id) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id, nombre, precio, cantidad, imagen, descripcion });
    });
});


// 3️⃣ Editar producto
app.put('/productos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, precio, cantidad } = req.body;
    dbFuncs.editarProducto(id, nombre, precio, cantidad, (err, cambios) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: `Filas editadas: ${cambios}` });
    });
});

// Obtener producto por id (para edición)
app.get('/productos/:id', (req, res) => {
    const { id } = req.params;
    dbFuncs.obtenerProductoPorId(id, (err, producto) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(producto);
    });
});


// 4️⃣ Borrar producto
app.delete('/productos/:id', (req, res) => {
    const { id } = req.params;
    dbFuncs.borrarProducto(id, (err, cambios) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: `Filas borradas: ${cambios}` });
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});


// 🔍 Buscar productos
app.get('/productos/buscar', (req, res) => {
  const q = req.query.q || ''; // el texto que viene del frontend

  db.all(
    `SELECT * FROM productos WHERE nombre LIKE ?`,
    [`%${q}%`],
    (err, rows) => {
      if (err) {
        console.error('Error al buscar productos:', err.message);
        return res.status(500).json({ error: 'Error en la búsqueda' });
      }
      res.json(rows);
    }
  );
});

// POST /productos/comprar/:id
app.post('/productos/comprar/:id', (req, res) => {
    const id = req.params.id;
    const { cantidad, usuario } = req.body;

    db.get('SELECT * FROM productos WHERE id = ?', [id], (err, producto) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

        if (producto.cantidad < cantidad) {
            return res.status(400).json({ error: 'Stock insuficiente' });
        }

        const nuevoStock = producto.cantidad - cantidad;

        db.run('UPDATE productos SET cantidad = ? WHERE id = ?', [nuevoStock, id], function (err) {
            if (err) return res.status(500).json({ error: err.message });

            const total = producto.precio * cantidad;
            dbFuncs.agregarPedido(
                usuario || "Invitado",
                id,
                producto.nombre,
                cantidad,
                producto.precio,
                total,
                (err) => {
                    if (err) return res.status(500).json({ error: 'No se pudo registrar el pedido' });
                    res.json({ mensaje: 'Compra realizada y pedido registrado ✅', stockRestante: nuevoStock });
                }
            );
        });
    });
});



// Registrar usuario
app.post('/usuarios', (req, res) => {
    const { user, pass, email } = req.body;

    dbFuncs.agregarUsuario(user, pass, email, (err, id) => {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.status(400).json({ error: 'El usuario ya existe' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.json({ id, user, email });
    });
});

// Login usuario
app.post('/usuarios/login', (req, res) => {
    const { user, pass } = req.body;

    dbFuncs.obtenerUsuario(user, pass, (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

        res.json({ id: row.id, user: row.user, email: row.email });
    });
});

// Obtener todos los pedidos
app.get('/pedidos', (req, res) => {
    dbFuncs.obtenerPedidos((err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const activos = rows.filter(p => p.estado !== 'entregado');
        res.json(activos);
    });
});


// Actualizar estado de pedido
app.put('/pedidos/:id', (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    dbFuncs.obtenerPedidos((err, pedidos) => {
        if (err) return res.status(500).json({ error: err.message });

        const pedido = pedidos.find(p => p.id == id);
        if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

        if (estado === 'entregado') {
            // Agregar a ventas y eliminar de pedidos
            dbFuncs.agregarVenta(
                pedido.usuario,
                pedido.producto_id,
                pedido.nombre_producto,
                pedido.cantidad,
                pedido.precio_unitario,
                pedido.total,
                (err) => {
                    if (err) return res.status(500).json({ error: 'No se pudo guardar en ventas' });

                    // Eliminar el pedido de la tabla pedidos
                    dbFuncs.borrarProducto(pedido.id, (err2) => {
                        if (err2) console.error('No se pudo eliminar pedido entregado:', err2.message);
                    });
                }
            );
        }

        dbFuncs.actualizarEstadoPedido(id, estado, (err, cambios) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ mensaje: `Pedido actualizado a "${estado}" (${cambios} cambios)` });
        });
    });
});


app.get('/ventas', (req, res) => {
    dbFuncs.obtenerVentas((err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 🔍 Obtener ventas por usuario
app.get('/ventas/:usuario', (req, res) => {
    const { usuario } = req.params;
    dbFuncs.obtenerVentasPorUsuario(usuario, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

