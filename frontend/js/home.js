// frontend/js/home.js
document.addEventListener("DOMContentLoaded", () => {
    const itemsContainer = document.getElementById("items-container");

    if (!itemsContainer) {
        console.error("No se encontró el contenedor de ítems en home.html");
        return;
    }

    // Datos de prueba
    const testItems = [
        { id: 1, nombre: "Hamburguesa Doble", precio: 2500, img: "https://via.placeholder.com/150" },
        { id: 2, nombre: "Pizza Muzza", precio: 3200, img: "https://via.placeholder.com/150" },
        { id: 3, nombre: "Empanadas (6u)", precio: 1800, img: "https://via.placeholder.com/150" },
        { id: 4, nombre: "Coca-Cola 1.5L", precio: 1200, img: "https://via.placeholder.com/150" }
    ];

    // Renderizar ítems
    testItems.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("item-card");

        card.innerHTML = `
            <img src="${item.img}" alt="${item.nombre}" class="item-img">
            <h3 class="item-name">${item.nombre}</h3>
            <p class="item-price">$${item.precio}</p>
            <button class="item-btn">Agregar</button>
        `;

        itemsContainer.appendChild(card);
    });
});
