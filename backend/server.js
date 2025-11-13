const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer'); // 📦 Para subir archivos
const dbFuncs = require('./dbFunciones');
const pool = require('./bases/database');


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



// 📁 Crear carpeta "uploads" si no existe
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 📤 Configurar almacenamiento de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
        cb(null, uniqueName);
    }
});
const upload = multer({ storage });

// 🔗 Servir imágenes estáticas (localhost:3000/uploads/nombre.jpg)
app.use('/uploads', express.static(uploadDir));


// Rutas

// 1️⃣ Obtener productos
app.get('/productos', (req, res) => {
    dbFuncs.obtenerProductos((err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 2️⃣ Agregar producto con imagen (archivo)
app.post('/productos', upload.single('imagen'), (req, res) => {
    const { nombre, precio, cantidad, descripcion } = req.body;
    const imagen = req.file ? `/uploads/${req.file.filename}` : null; // ruta local

    if (!nombre || !precio || !cantidad) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

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


// 🛒 Buscar productos
app.get('/productos/buscar', async (req, res) => {
    const q = req.query.q || '';

    try {
        const result = await pool.query(
            'SELECT * FROM productos WHERE nombre ILIKE $1',
            [`%${q}%`]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('❌ Error en búsqueda:', err);
        res.status(500).json({ error: 'Error en la búsqueda' });
    }
});

// POST /productos/comprar/:id
app.post('/productos/comprar/:id', async (req, res) => {
    const id = req.params.id;
    const { cantidad, usuario } = req.body;

    try {
        const productoRes = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
        const producto = productoRes.rows[0];
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

        if (producto.cantidad < cantidad) {
            return res.status(400).json({ error: 'Stock insuficiente' });
        }

        const nuevoStock = producto.cantidad - cantidad;
        await pool.query('UPDATE productos SET cantidad = $1 WHERE id = $2', [nuevoStock, id]);

        const total = producto.precio * cantidad;
        await pool.query(
            `INSERT INTO pedidos (usuario, producto_id, nombre_producto, cantidad, precio_unitario, total, estado)
             VALUES ($1, $2, $3, $4, $5, $6, 'pendiente')`,
            [usuario || 'Invitado', id, producto.nombre, cantidad, producto.precio, total]
        );

        res.json({ mensaje: 'Compra realizada y pedido registrado ✅', stockRestante: nuevoStock });
    } catch (err) {
        console.error('❌ Error en /comprar:', err);
        res.status(500).json({ error: 'Error al procesar la compra' });
    }
});


// Registrar usuario
app.post('/usuarios', (req, res) => {
    const { nameuser, pass, email } = req.body;

    dbFuncs.agregarUsuario(nameuser, pass, email, (err, id) => {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.status(400).json({ error: 'El usuario ya existe' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.json({ id, nameuser, email });
    });
});

// Login usuario
app.post('/usuarios/login', (req, res) => {
    const { nameuser, pass } = req.body;

    dbFuncs.obtenerUsuario(nameuser, pass, (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

        res.json({ id: row.id, nameuser: row.nameuser, email: row.email });
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
// ✅ Actualizar estado de pedido
app.put('/pedidos/:id', (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    dbFuncs.obtenerPedidos((err, pedidos) => {
        if (err) return res.status(500).json({ error: err.message });

        const pedido = pedidos.find(p => p.id == id);
        if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

        // Si el pedido se marca como ENTREGADO
        if (estado === 'entregado') {
            dbFuncs.agregarVenta(
                pedido.usuario,
                pedido.producto_id,
                pedido.nombre_producto,
                pedido.cantidad,
                pedido.precio_unitario,
                pedido.total,
                (err) => {
                    if (err) return res.status(500).json({ error: 'No se pudo guardar en ventas' });

                    // Ahora sí borramos el pedido
                    dbFuncs.borrarPedido(pedido.id, (err2) => {
                        if (err2) {
                            console.error('No se pudo eliminar pedido entregado:', err2.message);
                            return res.status(500).json({ error: 'No se pudo eliminar el pedido' });
                        }

                        // ✅ Todo correcto
                        return res.json({ mensaje: 'Pedido entregado y movido al historial de ventas ✅' });
                    });
                }
            );
        } else {
            // En otros estados (pendiente, preparado), solo actualizamos
            dbFuncs.actualizarEstadoPedido(id, estado, (err, cambios) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ mensaje: `Pedido actualizado a "${estado}" (${cambios} cambios)` });
            });
        }
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


