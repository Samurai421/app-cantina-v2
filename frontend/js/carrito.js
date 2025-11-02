const mainCarritoContainer = document.getElementById('main-carrito-container');
const totalCarrito = document.getElementById('total-carrito');
const finalizarBtn = document.getElementById('finalizar-compra');
const API_URL = 'http://localhost:3000/productos';

let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// 🎨 Mostrar productos en el carrito
function mostrarCarrito() {
    if (!carrito.length) {
        mainCarritoContainer.innerHTML = '<p>El carrito está vacío</p>';
        totalCarrito.textContent = '$0';
        return;
    }

    mainCarritoContainer.innerHTML = carrito.map(p => `
        <div class="carrito-item">
            <span class="carrito-nombre">${p.nombre}</span>
            
            <div class="carrito-cantidad">
                <button onclick="cambiarUnidades(${p.id}, -1)">➖</button>
                <input type="number" min="1" max="${p.stock}" value="${p.cantidad}" 
                    onchange="cambiarCantidadManual(${p.id}, this.value)">
                <button onclick="cambiarUnidades(${p.id}, 1)">➕</button>
            </div>

            <span class="carrito-precio">$${(p.precio * p.cantidad).toFixed(2)}</span>
            <button class="carrito-borrar" onclick="quitarDelCarrito(${p.id})">🗑️</button>
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

// ➕➖ Cambiar unidades con botones
function cambiarUnidades(id, cambio) {
    const producto = carrito.find(p => p.id === id);
    if (!producto) return;

    const nuevoValor = producto.cantidad + cambio;

    if (nuevoValor < 1) return; // no menos de 1
    if (nuevoValor > producto.stock) {
        alert('No hay suficiente stock disponible');
        return;
    }

    producto.cantidad = nuevoValor;
    mostrarCarrito();
}

// ✏️ Cambiar cantidad manualmente desde input
function cambiarCantidadManual(id, nuevaCantidad) {
    const producto = carrito.find(p => p.id === id);
    nuevaCantidad = parseInt(nuevaCantidad);

    if (!nuevaCantidad || nuevaCantidad < 1) {
        producto.cantidad = 1;
    } else if (nuevaCantidad > producto.stock) {
        alert('Stock insuficiente');
        producto.cantidad = producto.stock;
    } else {
        producto.cantidad = nuevaCantidad;
    }

    mostrarCarrito();
}

// 🗑️ Quitar producto
function quitarDelCarrito(id) {
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
