// Credenciales de admin (fijas por ahora)
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin1234';



// 🧹 Limpiar credenciales anteriores al entrar al login
document.addEventListener('DOMContentLoaded', () => {
  localStorage.removeItem('adminLogged');
  localStorage.removeItem('user');
  localStorage.removeItem('email');
  localStorage.removeItem('token'); // por si en un futuro usás JWT u otro tipo
  localStorage.clear();
  console.log('Sesión anterior eliminada.');
});


// 🔹 Funciones para mostrar y ocultar formularios
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

async function login() {
  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value.trim();

  if (!user || !pass) {
    alert("Por favor completa todos los campos.");
    return;
  }

  // Si es admin
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    localStorage.setItem('adminLogged', 'true');
    alert(`Bienvenido, ${user} (Admin)`);
    window.location.replace("admin.html");
    return;
  }

  // Si es usuario común
  try {
    const res = await fetch('https://backend-cantina.onrender.com/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nameuser: user, pass })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Error en el login');

    // ✅ Guardamos sesión del usuario
    localStorage.setItem('user', data.nameuser);
    localStorage.setItem('email', data.email);
    localStorage.setItem('userLogged', 'true');

    alert(`Bienvenido ${data.user}`);
    window.location.replace('home.html'); // o index.html, según tu estructura
  } catch (err) {
    console.error('Error en login:', err);
    alert('Usuario o contraseña incorrectos');
  }
}


// ✍️ Registro de usuarios (DB)
async function registrar() {
    const user = document.getElementById("regUser").value.trim();
    const pass = document.getElementById("regPass").value.trim();
    const email = document.getElementById("regEmail").value.trim();

    if (!user || !pass || !email) {
        alert("Completa todos los campos para registrarte.");
        return;
    }

    try {
        const res = await fetch('https://backend-cantina.onrender.com/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nameuser: user, pass, email })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Error al registrar');
        }

        alert(`Usuario ${user} registrado con éxito`);
        mostrarLogin();
    } catch (err) {
        alert(err.message);
    }
}

// 🔒 Logout
function logout() {
    localStorage.removeItem('adminLogged');
    localStorage.removeItem('userLogged');
    window.location.replace('login.html');
}

// ✅ Protección del panel de admin
function protegerAdmin() {
    if (localStorage.getItem('adminLogged') !== 'true') {
        alert('Debes iniciar sesión como admin');
        window.location.replace('login.html');
    }
}

// ✅ Protección de páginas de usuario
function protegerUsuario() {
    if (!localStorage.getItem('userLogged')) {
        alert('Debes iniciar sesión para acceder');
        window.location.replace('login.html');
    }
}
