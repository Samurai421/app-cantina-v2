document.addEventListener('DOMContentLoaded', () => {
    const usuario = localStorage.getItem('user'); // ✅ toma el usuario actual logueado
    if (!usuario) {
        alert('Debes iniciar sesión para ver tu historial de compras.');
        localStorage.clear();
        window.location.replace('login.html');
        return;
    }
    cargarMisCompras(usuario);
});

async function cargarMisCompras(usuario) {
    try {
        const res = await fetch(`https://backend-cantina.onrender.com/ventas/${usuario}`);
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

        const compras = await res.json();
        const contenedor = document.getElementById('compras-container');

        if (!compras.length) {
            contenedor.innerHTML = `<p>No tenés compras registradas todavía.</p>`;
            return;
        }

        contenedor.innerHTML = compras.map(c => `
            <div class="compra-card">
                <p><strong>${c.nombre_producto}</strong> (${c.cantidad}u)</p>
                <p>Precio unitario: $${c.precio_unitario.toFixed(2)}</p>
                <p>Total: <strong>$${c.total.toFixed(2)}</strong></p>
                <p><small>Fecha: ${new Date(c.fecha).toLocaleString()}</small></p>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error al cargar compras:', err);
        const contenedor = document.getElementById('compras-container');
        contenedor.innerHTML = `<p>Error al cargar el historial de compras.</p>`;
    }
}
