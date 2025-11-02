const API_URL = 'http://localhost:3000/productos';
const searchInput = document.getElementById('searchInput');

// 🧩 Función debounce
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 🧾 Detectar en qué página estamos
function obtenerContextoPagina() {
  const ruta = window.location.pathname.split("/").pop();

  if (ruta.includes("admin")) return "admin";
  if (ruta.includes("home")) return "home";
  if (ruta.includes("historial-ventas")) return "ventas";
  if (ruta.includes("historial-compras")) return "compras";

  return "desconocido";
}

// 🧱 Función genérica de renderizado (fallback)
function renderGenerico(productos) {
  const container = document.getElementById("items-container") || document.body;
  container.innerHTML = productos.map(p => `
    <div class="item-card">
      <img src="${p.imagen || 'https://via.placeholder.com/150'}" alt="${p.nombre}" class="item-img">
      <h4>${p.nombre}</h4>
      <p>$${p.precio}</p>
      <p>${p.descripcion || ''}</p>
      <p>Stock: ${p.cantidad}</p>
    </div>
  `).join('');
}

// 🔍 Búsqueda en el backend
async function handleSearch(query) {
  if (!query.trim()) return; // Evita búsquedas vacías

  try {
    const res = await fetch(`${API_URL}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const productos = await res.json();

    const filtrados = productos.filter(p =>
      p.nombre.toLowerCase().includes(query.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(query.toLowerCase())
    );

    // 🧭 Detectar página y mostrar según corresponda
    const contexto = obtenerContextoPagina();

    switch (contexto) {
      case "admin":
        if (typeof mostrarProductosAdmin === "function") return mostrarProductosAdmin(filtrados);
        break;
      case "home":
        if (typeof mostrarProductosHome === "function") return mostrarProductosHome(filtrados);
        break;
      case "ventas":
        if (typeof mostrarVentas === "function") return mostrarVentas(filtrados);
        break;
      case "compras":
        if (typeof mostrarCompras === "function") return mostrarCompras(filtrados);
        break;
      default:
        renderGenerico(filtrados);
        break;
    }

  } catch (err) {
    console.error("Error en búsqueda:", err);
  }
}

// 🕵️‍♂️ Escuchar el input
if (searchInput) {
  searchInput.addEventListener("input", debounce(() => {
    const query = searchInput.value.trim();
    if (query) handleSearch(query);
    else {
      // Si se borra la búsqueda, recargar lista original según la página
      const contexto = obtenerContextoPagina();
      switch (contexto) {
        case "admin": if (typeof cargarProductosAdmin === "function") cargarProductosAdmin(); break;
        case "home": if (typeof cargarProductosHome === "function") cargarProductosHome(); break;
        case "ventas": if (typeof cargarVentas === "function") cargarVentas(); break;
        case "compras": if (typeof cargarCompras === "function") cargarCompras(); break;
        default: break;
      }
    }
  }, 400));
}
