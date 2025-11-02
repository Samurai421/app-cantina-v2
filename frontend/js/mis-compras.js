document.addEventListener('DOMContentLoaded', () => {
    cargarMisCompras(usuario);
});

async function cargarMisCompras(usuario) {
    try {
        const res = await fetch(`http://localhost:3000/ventas/${usuario}`);
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
    }
}
