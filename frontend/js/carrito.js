const mainCarritoContainer = document.getElementById('main-carrito-container');
const totalCarrito = document.getElementById('total-carrito');
const finalizarBtn = document.getElementById('finalizar-compra');
const API_URL = 'http://localhost:3000/productos';

let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// 🎨 Mostrar productos en el carrito
function mostrarCarrito() {
    carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    if (carrito.length === 0) {
        mainCarritoContainer.innerHTML = `
            <div class="text-center py-5">
                <h4>Tu carrito está vacío 🛍️</h4>
                <a href="home.html" class="btn btn-primary rounded-pill mt-3">Volver a la tienda</a>
            </div>
        `;
        actualizarTotal();
        return;
    }

    mainCarritoContainer.innerHTML = carrito.map(p => `
        <div class="carrito-item card border-0 shadow-sm mb-2 p-3">
            <div class="d-flex justify-content-between align-items-center flex-wrap">
                
                <div class="carrito-info">
                    <h6 class="mb-1 fw-semibold">${p.nombre}</h6>
                    <small class="text-muted">Precio unitario: $${p.precio}</small>
                </div>

                <div class="carrito-cantidad d-flex align-items-center mt-2 mt-md-0">
                    <button class="btn btn-outline-secondary btn-sm me-2" 
                            onclick="cambiarUnidades(${p.id}, -1)">➖</button>

                    <input type="number" 
                           min="1" 
                           max="${p.stock}" 
                           value="${p.cantidad}" 
                           class="form-control text-center form-control-sm"
                           style="width:60px;"
                           onchange="cambiarCantidadManual(${p.id}, this.value)">

                    <button class="btn btn-outline-secondary btn-sm ms-2" 
                            onclick="cambiarUnidades(${p.id}, 1)">➕</button>
                </div>

                <div class="carrito-precio mt-2 mt-md-0 text-center">
                    <strong>$${(p.precio * p.cantidad).toFixed(2)}</strong>
                </div>

                <div class="carrito-acciones mt-2 mt-md-0 text-end">
                    <button class="btn btn-outline-danger btn-sm" 
                            onclick="quitarDelCarrito(${p.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    actualizarTotal();
}

// 💰 Recalcular total
function actualizarTotal() {
    const total = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
    totalCarrito.textContent = `$${total.toFixed(2)}`;
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// ➕➖ Cambiar unidades
function cambiarUnidades(id, cambio) {
    carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const producto = carrito.find(p => p.id === id);
    if (!producto) return;

    const nuevoValor = producto.cantidad + cambio;

    if (nuevoValor < 1) return;
    if (nuevoValor > producto.stock) {
        alert('No hay suficiente stock disponible');
        return;
    }

    producto.cantidad = nuevoValor;
    localStorage.setItem('carrito', JSON.stringify(carrito));

    // 🔄 Refrescar solo el contenido
    mostrarCarrito();
}

// ✏️ Cambiar cantidad manualmente desde input
function cambiarCantidadManual(id, nuevaCantidad) {
    carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const producto = carrito.find(p => p.id === id);
    nuevaCantidad = parseInt(nuevaCantidad);

    if (!producto) return;

    if (!nuevaCantidad || nuevaCantidad < 1) {
        producto.cantidad = 1;
    } else if (nuevaCantidad > producto.stock) {
        alert('Stock insuficiente');
        producto.cantidad = producto.stock;
    } else {
        producto.cantidad = nuevaCantidad;
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    mostrarCarrito();
}

// 🗑️ Quitar producto
function quitarDelCarrito(id) {
    carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito = carrito.filter(p => p.id !== id);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    mostrarCarrito();
}

// ✅ Finalizar compra
finalizarBtn.addEventListener('click', async () => {
    if (!carrito.length) return alert('Carrito vacío');

    const usuario = localStorage.getItem('user') || 'Invitado';

    for (const p of carrito) {
        try {
            const res = await fetch(`${API_URL}/comprar/${p.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cantidad: p.cantidad, usuario })
            });

            const data = await res.json();
            if (!res.ok) {
                alert(`No se pudo comprar ${p.nombre}: ${data.error}`);
            }
        } catch (err) {
            console.error(err);
        }
    }

    carrito = [];
    localStorage.removeItem('carrito');
    mostrarCarrito();
    alert('✅ Compra realizada y pedido enviado al administrador');
});

// 🚀 Inicializar
document.addEventListener('DOMContentLoaded', mostrarCarrito);
