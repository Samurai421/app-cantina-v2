// verProductos.js
const API_URL = 'https://backend-cantina.onrender.com/productos';
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

    itemsContainer.innerHTML = `
        <div class="container-xxl py-5">
            <div class="container">
                <div class="tab-content">
                    <div id="tab-1" class="tab-pane fade show p-0 active">
                        <div class="row g-4">
                            ${productos.map((p, index) => {
                                // 🔹 Ajuste: determinar ruta de la imagen
                                const imagenSrc = p.imagen
                                    ? (p.imagen.startsWith('http')
                                        ? p.imagen
                                        : `https://backend-cantina.onrender.com${p.imagen}`)
                                    : 'https://via.placeholder.com/300x300?text=Sin+imagen';

                                return `
                                    <div class="col-xl-3 col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="${0.1 * index}s">
                                        <div class="product-item">
                                            <div class="position-relative bg-light overflow-hidden">
                                                <img class="img-fluid w-100" src="${imagenSrc}" alt="${p.nombre}">
                                            </div>
                                            <div class="text-center p-4">
                                                <a class="d-block h5 mb-2" href="#">${p.nombre}</a>
                                                <span class="text-primary me-1">$${p.precio.toFixed(2)}</span>
                                            </div>
                                            <div class="d-flex border-top">
                                                <small class="w-50 text-center border-end py-2">
                                                    <a class="text-body" href="#">
                                                        <i class="fa fa-eye text-primary me-2"></i>${p.cantidad}
                                                    </a>
                                                </small>
                                                <small class="w-50 text-center py-2">
                                                    <a class="text-body" href="#" 
                                                       onclick='agregarAlCarrito(${JSON.stringify(p)})'
                                                       ${p.cantidad === 0 ? 'style="pointer-events:none;opacity:0.6;"' : ''}>
                                                        <i class="fa fa-shopping-bag text-primary me-2"></i>
                                                        ${p.cantidad === 0 ? 'Agotado' : 'Añadir al carrito'}
                                                    </a>
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
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
