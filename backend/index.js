const dbFuncs = require('./dbFunciones');

// Crear tabla
dbFuncs.crearTabla();

// Agregar un producto
dbFuncs.agregarProducto('Gaseosa', 150.5, 20, (err, id) => {
    if (err) console.error(err);
    else console.log(`Producto agregado con ID ${id}`);
});

// Consultar productos
dbFuncs.obtenerProductos((err, rows) => {
    if (err) console.error(err);
    else console.log('Productos:', rows);
});

// Editar producto con id = 1
dbFuncs.editarProducto(1, 'Gaseosa Light', 160, 15, (err, cambios) => {
    if (err) console.error(err);
    else console.log(`Filas editadas: ${cambios}`);
});

// Borrar producto con id = 1
dbFuncs.borrarProducto(1, (err, cambios) => {
    if (err) console.error(err);
    else console.log(`Filas borradas: ${cambios}`);
});
