// verProductos.js
const API_URL = 'http://localhost:3000/productos';
const itemsContainer = document.getElementById('items-container');
const searchInput = document.getElementById('searchInput');

// 🧩 Función debounce
function debounce(fn, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// 🧾 Mostrar productos
function mostrarProductos(productos) {
    if (!productos || productos.length === 0) {
        itemsContainer.innerHTML = '<p>No hay productos.</p>';
        return;
    }

    itemsContainer.innerHTML = productos.map(p => `
        <div class="item-card">
            <img src="${p.imagen || 'https://via.placeholder.com/150'}" alt="${p.nombre}" class="item-img">
            <h4>${p.nombre}</h4>
            <p>$${p.precio}</p>
            <p>${p.descripcion || ''}</p>
            <p>Stock: ${p.cantidad}</p>
            <button ${p.cantidad === 0 ? 'disabled' : ''} 
                    onclick='agregarAlCarrito(${JSON.stringify(p)})'>
                ${p.cantidad === 0 ? 'Agotado' : 'Agregar al carrito'}
            </button>
        </div>
    `).join('');
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

// ➕ Agregar producto al carrito
function agregarAlCarrito(producto) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const existente = carrito.find(p => p.id === producto.id);

    if (existente) {
        if (existente.cantidad + 1 > producto.cantidad) {
            alert('No hay suficiente stock disponible');
            return;
        }
        existente.cantidad += 1;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    window.dispatchEvent(new Event('carritoActualizado'));
    alert(`${producto.nombre} agregado al carrito`);
}

// 🔍 Búsqueda local (sin depender del backend)
async function buscarProductos(query) {
    try {
        const res = await fetch(API_URL);
        const productos = await res.json();

        const filtrados = productos.filter(p =>
            p.nombre.toLowerCase().includes(query.toLowerCase()) ||
            p.descripcion?.toLowerCase().includes(query.toLowerCase())
        );

        mostrarProductos(filtrados);
    } catch (err) {
        console.error('Error en la búsqueda:', err);
    }
}

// 🚀 Inicializar
cargarProductos();

// 🔎 Buscador en tiempo real
if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
        const query = searchInput.value.trim();
        if (query) buscarProductos(query);
        else cargarProductos();
    }, 300));
}
