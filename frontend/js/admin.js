const API_URL = 'https://backend-cantina.onrender.com/productos';
const PEDIDOS_URL = 'https://backend-cantina.onrender.com/pedidos';

const form = document.getElementById('product-form');
const itemsContainer = document.getElementById('items-container');
const pedidosContainer = document.getElementById('pedidos-container');
const searchInput = document.getElementById('searchInput');

// 🚪 Cerrar sesión admin
const logoutBtn = document.getElementById('logout');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('adminLogged');
    window.location.replace('login.html');
  });
}

// 🔄 Debounce de búsqueda
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 🧾 Mostrar productos
function mostrarProductos(productos) {
  if (!productos.length) {
    itemsContainer.innerHTML = `<p class="text-center">No hay productos disponibles.</p>`;
    return;
  }

  itemsContainer.innerHTML = productos.map(p => `
    <div class="col-xl-3 col-lg-4 col-md-6">
      <div class="item-card">
        <img src="${p.imagen 
          ? (p.imagen.startsWith('http') 
              ? p.imagen 
              : `https://backend-cantina.onrender.com${p.imagen}`)
          : 'https://via.placeholder.com/200'}" 
          alt="${p.nombre}">

        <h5 class="fw-bold mt-2">${p.nombre}</h5>
        <p class="mb-1">$${p.precio}</p>
        <p class="text-muted">Stock: ${p.cantidad}</p>
        <div class="admin-buttons mt-2">
          <button class="btn-editar" onclick="editarProducto(${p.id})">✏️</button>
          <button class="btn-borrar" onclick="borrarProducto(${p.id})">🗑️</button>
        </div>
      </div>
    </div>
  `).join('');
}

// 🔍 Buscar productos
async function buscarProductos(query) {
  query = query.trim();
  try {
    const url = query ? `${API_URL}/buscar?q=${encodeURIComponent(query)}` : API_URL;
    const res = await fetch(url);
    const productos = await res.json();
    mostrarProductos(productos);
  } catch (err) {
    console.error('Error al buscar productos:', err);
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
  }
}

// 🗑️ Borrar producto
async function borrarProducto(id) {
  if (!confirm('¿Seguro que querés eliminar este producto?')) return;
  try {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    await cargarProductos();
  } catch (err) {
    console.error('Error al borrar producto:', err);
  }
}

// ✏️ Editar producto (solo precio y stock)
async function editarProducto(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const p = await res.json();

    const nuevoPrecio = parseFloat(prompt(`Nuevo precio de "${p.nombre}"`, p.precio));
    if (isNaN(nuevoPrecio) || nuevoPrecio < 0) return alert('Precio inválido');

    const nuevoStock = parseInt(prompt('Nueva cantidad en stock:', p.cantidad));
    if (isNaN(nuevoStock) || nuevoStock < 0) return alert('Cantidad inválida');

    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...p,
        precio: nuevoPrecio,
        cantidad: nuevoStock
      })
    });

    alert('✅ Producto actualizado correctamente');
    await cargarProductos();
  } catch (err) {
    console.error('Error al editar producto:', err);
    alert('❌ No se pudo editar el producto');
  }
}

// 📦 Agregar producto
form.addEventListener('submit', async e => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('nombre', document.getElementById('product-name').value);
  formData.append('precio', document.getElementById('product-price').value);
  formData.append('cantidad', document.getElementById('product-quantity').value);
  formData.append('descripcion', document.getElementById('product-desc').value);
  if (document.getElementById('product-image').files[0]) {
    formData.append('imagen', document.getElementById('product-image').files[0]);
  }

  try {
    const res = await fetch(API_URL, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Error al agregar producto');
    alert('✅ Producto agregado correctamente');
    form.reset();
    cargarProductos();
  } catch (err) {
    console.error('Error:', err);
    alert('❌ Error al agregar producto');
  }
});


// 🧾 Cargar pedidos
async function cargarPedidos() {
  try {
    const res = await fetch(PEDIDOS_URL);
    const pedidos = await res.json();

    if (!pedidos.length) {
      pedidosContainer.innerHTML = `<p class="text-center">No hay pedidos pendientes.</p>`;
      return;
    }

    pedidosContainer.innerHTML = pedidos.map(p => `
      <div class="col-md-6 col-lg-4">
        <div class="pedido-card">
          <p><strong>${p.usuario}</strong> pidió <strong>${p.nombre_producto}</strong> (${p.cantidad}u)</p>
          <p>Total: $${p.total.toFixed(2)} | Estado: ${p.estado}</p>
          <button onclick="actualizarEstado(${p.id}, 'preparado')">Preparar</button>
          <button onclick="actualizarEstado(${p.id}, 'entregado')">Entregar</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error al cargar pedidos:', err);
  }
}

// 🔄 Actualizar estado de pedido
async function actualizarEstado(id, estado) {
  try {
    await fetch(`${PEDIDOS_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado })
    });
    await cargarPedidos();
  } catch (err) {
    console.error('Error al actualizar pedido:', err);
  }
}

// 🚀 Inicializar
document.addEventListener('DOMContentLoaded', () => {
  cargarProductos();
  cargarPedidos();
});

if (searchInput) {
  searchInput.addEventListener('input', debounce(() => {
    buscarProductos(searchInput.value);
  }, 300));
}
