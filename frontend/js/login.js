function mostrarRegistro() {
  document.getElementById("login-box").classList.add("oculto");
  document.getElementById("register-box").classList.remove("oculto");
  document.getElementById("login-text").classList.add("oculto");
  document.getElementById("register-text").classList.remove("oculto");
}

function mostrarLogin() {
  document.getElementById("register-box").classList.add("oculto");
  document.getElementById("login-box").classList.remove("oculto");
  document.getElementById("register-text").classList.add("oculto");
  document.getElementById("login-text").classList.remove("oculto");
}

function login() {
  const user = document.getElementById("loginUser").value;
  const pass = document.getElementById("loginPass").value;

  if (user && pass) {
    alert(`Bienvenido, ${user}`);
    // acá podrías redirigir a home.html
    window.location.replace("home.html");
  } else {
    alert("Por favor completa todos los campos.");
  }
}

function registrar() {
  const user = document.getElementById("regUser").value;
  const pass = document.getElementById("regPass").value;
  const email = document.getElementById("regEmail").value;

  if (user && pass && email) {
    alert(`Usuario ${user} registrado con éxito`);
    mostrarLogin(); // vuelve al login
  } else {
    alert("Completa todos los campos para registrarte.");
  }
}
