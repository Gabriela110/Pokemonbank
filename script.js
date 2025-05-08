function obtenerUsuarios() {
  return JSON.parse(localStorage.getItem('usuarios')) || [];
}

function guardarUsuarios(usuarios) {
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

function guardarUsuarioActual(usuario) {
  localStorage.setItem('usuarioActual', JSON.stringify(usuario));
}

function obtenerUsuarioActual() {
  return JSON.parse(localStorage.getItem('usuarioActual'));
}

function guardarTransacciones(transacciones) {
  localStorage.setItem('transacciones', JSON.stringify(transacciones));
}

function obtenerTransacciones() {
  return JSON.parse(localStorage.getItem('transacciones')) || [];
}

// --- Registro ---
if (document.getElementById('registroForm')) {
  document.getElementById('registroForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombreRegistro').value.trim();
    const pin = document.getElementById('pinRegistro').value.trim();

    if (pin.length !== 4 || isNaN(pin)) {
      alert('El PIN debe ser un número de 4 dígitos.');
      return;
    }

    const usuarios = obtenerUsuarios();

    const nuevaCuenta = Math.floor(10000000 + Math.random() * 90000000); // Número aleatorio 8 dígitos

    const nuevoUsuario = { nombre, pin, cuenta: nuevaCuenta, saldo: 0 };
    usuarios.push(nuevoUsuario);

    guardarUsuarios(usuarios);
    alert('Registro exitoso. Ahora puedes iniciar sesión.');
    window.location.href = "index.html";
  });
}

// --- Login ---
if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombreLogin').value.trim();
    const pin = document.getElementById('pinLogin').value.trim();

    const usuarios = obtenerUsuarios();
    const usuario = usuarios.find(u => u.nombre === nombre && u.pin === pin);

    if (usuario) {
      guardarUsuarioActual(usuario);
      window.location.href = "acciones.html";
    } else {
      alert('Nombre o PIN incorrecto.');
    }
  });
}

// --- Acciones ---
if (document.getElementById('bienvenida')) {
  const usuario = obtenerUsuarioActual();
  if (!usuario) {
    window.location.href = "index.html"; // Si no hay sesión, redirige
  } else {
    document.getElementById('bienvenida').textContent = `Bienvenido, ${usuario.nombre}!`;
    document.getElementById('cuenta').textContent = `Cuenta: ${usuario.cuenta}`;
  }
}

function realizarTransaccion(tipo) {
  const monto = prompt(`¿Cuánto deseas ${tipo}?`);
  const usuario = obtenerUsuarioActual();
  if (!usuario || isNaN(monto) || monto <= 0) {
    alert('Monto inválido.');
    return;
  }

  let saldoActualizado = usuario.saldo;
  const cantidad = parseFloat(monto);

  if (tipo === 'deposito') {
    saldoActualizado += cantidad;
  } else if (tipo === 'retiro' || tipo === 'pago') {
    if (cantidad > usuario.saldo) {
      alert('Fondos insuficientes.');
      return;
    }
    saldoActualizado -= cantidad;
  }

  usuario.saldo = saldoActualizado;
  
  const usuarios = obtenerUsuarios().map(u => u.cuenta === usuario.cuenta ? usuario : u);
  guardarUsuarios(usuarios);
  guardarUsuarioActual(usuario);

const transacciones = obtenerTransacciones(); transacciones.push({   tipo: tipo.charAt(0).toUpperCase() + tipo.slice(1),   cantidad, 
  fecha: new Date().toLocaleString(), 
  usuarioCuenta: usuario.cuenta
});
guardarTransacciones(transacciones);
alert(`Transacción exitosa! Nuevo saldo: $${usuario.saldo.toFixed(2)}`);
}
// Mostrar formulario de pago
document.getElementById('btnPagarServicios').addEventListener('click', function() {
document.getElementById('formularioServicios').style.display = 'block';
});

// Cancelar formulario de pago
document.getElementById('btnCancelarPago').addEventListener('click', function() {
document.getElementById('formularioServicios').style.display = 'none';
});

// Aceptar pago
document.getElementById('btnAceptarPago').addEventListener('click', function() {
const servicio = document.getElementById('servicio').value;
const monto = parseFloat(document.getElementById('monto').value);

if (isNaN(monto) || monto <= 0) {
  alert('Monto inválido.');
  return;
}

const usuario = obtenerUsuarioActual();

if (usuario.saldo < monto) {
  alert('Fondos insuficientes.');
  return;
}

// Descontar el monto del saldo
usuario.saldo -= monto;

// Guardar el usuario actualizado
const usuarios = obtenerUsuarios().map(u => u.cuenta === usuario.cuenta ? usuario : u);
guardarUsuarios(usuarios);
guardarUsuarioActual(usuario);

// Registrar la transacción de pago
const transacciones = obtenerTransacciones();
transacciones.push({
  tipo: `Pago de ${servicio}`,
  cantidad: monto,
  fecha: new Date().toLocaleString(),
  usuarioCuenta: usuario.cuenta
});
guardarTransacciones(transacciones);

// Mostrar mensaje de éxito
alert(`Pago exitoso. Nuevo saldo: $${usuario.saldo.toFixed(2)}`);

// Ocultar el formulario de pago
document.getElementById('formularioServicios').style.display = 'none';
});


function consultarSaldo() {
  const usuario = obtenerUsuarioActual();
  alert(`Tu saldo actual es: $${usuario.saldo.toFixed(2)}`);
}

function cerrarSesion() {
  localStorage.removeItem('usuarioActual');
  window.location.href = "index.html";
}

// --- Historial ---

if (document.getElementById('historialTransacciones')) {
  const usuario = obtenerUsuarioActual();
  if (!usuario) {
    window.location.href = "index.html"; // Redirigir si no está logueado
  }

  const transacciones = obtenerTransacciones().filter(t => t.usuarioCuenta === usuario.cuenta);
  const historial = document.getElementById('historialTransacciones');

  if (transacciones.length === 0) {
    historial.innerHTML = '<p class="text-center">No hay transacciones aún.</p>';
  } else {
    transacciones.forEach(t => {
      const card = document.createElement('div');
      card.className = 'col-md-4 mb-4';
      card.innerHTML = `
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">${t.tipo}</h5>
            <p class="card-text">Monto: $${t.cantidad.toFixed(2)}</p>
            <p class="card-text"><small class="text-muted">${t.fecha}</small></p>
          </div>
        </div>
      `;
      historial.appendChild(card);
    });
  }
}








    
























