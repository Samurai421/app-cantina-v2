// auth-proteccion.js

document.addEventListener("DOMContentLoaded", () => {
  const rutaActual = window.location.pathname.split("/").pop();
  const adminLogged = localStorage.getItem("adminLogged") === "true";
  const userLogged = localStorage.getItem("userLogged") === "true";

  // 🛡️ Si está en admin.html pero no es admin
  const paginasProtegidasAdmin = ["admin.html", "historial-ventas.html"]; // agregá las que quieras
  if (paginasProtegidasAdmin.includes(rutaActual) && !adminLogged) {
    alert("Acceso denegado. Debes iniciar sesión como administrador.");
    localStorage.clear();
    window.location.replace("login.html");
    return;
  }

  // 🛡️ Si está en home.html o cualquier página de usuario pero no está logueado
  const paginasProtegidasUsuario = ["home.html", "historial-compras.html", "cart.html", "historial-ventas.html"]; // agregá las que quieras
  if (paginasProtegidasUsuario.includes(rutaActual) && !userLogged && !adminLogged) {
    alert("Debes iniciar sesión para acceder a esta página.");
    localStorage.clear();
    window.location.replace("login.html");
    return;
  }

  // ✅ Si está logueado, mostrar su nombre (opcional)
  const user = localStorage.getItem("user");
  const userDisplay = document.getElementById("userDisplay");
  if (userDisplay && user) userDisplay.textContent = user;
});
