const API_URL = 'http://localhost:3000/productos';
const form = document.getElementById('product-form');
const itemsContainer = document.getElementById('items-container');
const searchInput = document.getElementById('searchInput');


document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('adminLogged');
    window.location.replace('login.html');
});


// 🔹 Debounce para búsquedas en tiempo real
function debounce(fn, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// 🧾 Mostrar productos con botones de editar solo precio y cantidad
function mostrarProductos(productos) {
    if (productos.length === 0) {
        itemsContainer.innerHTML = '<p>No hay productos.</p>';
        return;
    }

    itemsContainer.innerHTML = productos.map(p => `
        <div class="item-card">
            <img src="${p.imagen || 'https://via.placeholder.com/150'}" alt="${p.nombre}" class="item-img">
            <h4>${p.nombre}</h4>
            <p>$${p.precio}</p>
            <p>Stock: ${p.cantidad}</p>
            <div class="admin-buttons">
                <button onclick="editarProducto(${p.id})" class="btn-editar">✏️ Editar</button>
                <button onclick="borrarProducto(${p.id})" class="btn-borrar">🗑️ Borrar</button>
            </div>
        </div>
    `).join('');
}

// 🔎 Buscar productos
async function buscarProductos(query) {
    query = query.trim();
    if (!query) {
        cargarProductos();
        return;
    }

    try {
        const res = await fetch(`${API_URL}/buscar?q=${encodeURIComponent(query)}`);
        const productos = await res.json();
        mostrarProductos(productos);
    } catch (err) {
        console.error('Error al buscar productos:', err);
        itemsContainer.innerHTML = '<p>Error al realizar la búsqueda.</p>';
    }
}

// 🧾 Cargar todos los productos
async function cargarProductos() {
    try {
        const res = await fetch(API_URL);
        const productos = await res.json();
        mostrarProductos(productos);
    } catch (err) {
        console.error('Error al cargar productos:', err);
        itemsContainer.innerHTML = '<p>Error al conectar con el servidor.</p>';
    }
}

// 🗑️ Borrar producto
async function borrarProducto(id) {
    if (!confirm('¿Seguro que querés borrar este producto?')) return;
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    cargarProductos();
}

// ✏️ Editar solo precio y stock
async function editarProducto(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`);
        const p = await res.json();

        // Pedimos al admin que ingrese los nuevos valores
        const nuevoPrecio = parseFloat(prompt('Nuevo precio:', p.precio));
        if (isNaN(nuevoPrecio) || nuevoPrecio < 0) return alert('Precio inválido');

        const nuevoStock = parseInt(prompt('Nueva cantidad en stock:', p.cantidad));
        if (isNaN(nuevoStock) || nuevoStock < 0) return alert('Cantidad inválida');

        // Enviar actualización al servidor
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: p.nombre,       // se mantiene
                imagen: p.imagen,       // se mantiene
                descripcion: p.descripcion, // se mantiene
                precio: nuevoPrecio,
                cantidad: nuevoStock
            })
        });

        cargarProductos();
        alert('Producto actualizado ✅');
    } catch (err) {
        console.error('Error al editar producto:', err);
        alert('No se pudo editar el producto');
    }
}

// 🔎 Buscador en tiempo real
searchInput.addEventListener('input', debounce(() => {
    buscarProductos(searchInput.value);
}, 300));

// 🚀 Inicializar
cargarProductos();

// 🧾 Agregar producto nuevo
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nuevoProducto = {
        nombre: document.getElementById('product-name').value.trim(),
        precio: parseFloat(document.getElementById('product-price').value),
        cantidad: parseInt(document.getElementById('product-quantity').value),
        imagen: document.getElementById('product-image').value.trim() || null,
        descripcion: document.getElementById('product-desc').value.trim() || null,
    };
    

    // Validar datos básicos
    if (!nuevoProducto.nombre || isNaN(nuevoProducto.precio) || isNaN(nuevoProducto.cantidad)) {
        return alert('Por favor, completa correctamente los campos requeridos');
    }

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoProducto)
        });

        if (!res.ok) throw new Error('Error al agregar producto');
        alert('✅ Producto agregado correctamente');

        form.reset();
        cargarProductos();
    } catch (err) {
        console.error('Error al agregar producto:', err);
        alert('❌ No se pudo agregar el producto');
    }
});


async function cargarPedidos() {
    try {
        const res = await fetch('http://localhost:3000/pedidos');
        const pedidos = await res.json();

        const pedidosContainer = document.getElementById('pedidos-container');
        pedidosContainer.innerHTML = pedidos.map(p => `
            <div class="pedido-card">
                <p><strong>${p.usuario}</strong> pidió <strong>${p.nombre_producto}</strong> (${p.cantidad}u)</p>
                <p>Total: $${p.total.toFixed(2)} | Estado: ${p.estado}</p>
                <button onclick="actualizarEstado(${p.id}, 'preparado')">Preparar</button>
                <button onclick="actualizarEstado(${p.id}, 'entregado')">Entregar</button>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error al cargar pedidos:', err);
    }
}

async function actualizarEstado(id, estado) {
    await fetch(`http://localhost:3000/pedidos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado })
    });
    cargarPedidos();
}

document.addEventListener('DOMContentLoaded', () => {
    cargarPedidos();
});

