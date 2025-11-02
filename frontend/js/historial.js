document.addEventListener('DOMContentLoaded', () => {
    cargarHistorial();
});

async function cargarHistorial() {
    try {
        const res = await fetch('http://localhost:3000/ventas');
        const ventas = await res.json();

        const contenedor = document.getElementById('ventas-container');

        if (!ventas.length) {
            contenedor.innerHTML = '<p>No hay ventas registradas.</p>';
            return;
        }

        contenedor.innerHTML = ventas.map(v => `
            <div class="venta-card">
                <p><strong>${v.usuario}</strong> compró <strong>${v.nombre_producto}</strong> (${v.cantidad}u)</p>
                <p>Total: $${v.total.toFixed(2)} | Fecha: ${v.fecha}</p>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error al cargar ventas:', err);
    }
}
