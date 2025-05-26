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
    const nuevaCuenta = Math.floor(10000000 + Math.random() * 90000000);
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
    window.location.href = "index.html";
  } else {
    document.getElementById('bienvenida').textContent = `Bienvenido, ${usuario.nombre}!`;
    document.getElementById('cuenta').textContent = `Cuenta: ${usuario.cuenta}`;
  }
}

function consultarSaldo() {
  const usuario = obtenerUsuarioActual();
  alert(`Tu saldo actual es: $${usuario.saldo.toFixed(2)}`);
}

function cerrarSesion() {
  localStorage.removeItem('usuarioActual');
  window.location.href = "index.html";
}

// --- Formulario de Transacciones (Depósito / Retiro) ---
let tipoTransaccion = null;

const btnDepositar = document.getElementById('btnDepositar');
const btnRetirar = document.getElementById('btnRetirar');
const formularioTransaccion = document.getElementById('formularioTransaccion');
const montoTransaccion = document.getElementById('montoTransaccion');
const tituloTransaccion = document.getElementById('tituloTransaccion');

if (btnDepositar && btnRetirar) {
  btnDepositar.addEventListener('click', () => {
    tipoTransaccion = 'deposito';
    tituloTransaccion.textContent = 'Depositar Dinero';
    montoTransaccion.value = '';
    formularioTransaccion.style.display = 'block';
  });

  btnRetirar.addEventListener('click', () => {
    tipoTransaccion = 'retiro';
    tituloTransaccion.textContent = 'Retirar Dinero';
    montoTransaccion.value = '';
    formularioTransaccion.style.display = 'block';
  });

  document.getElementById('btnCancelarTransaccion').addEventListener('click', () => {
    formularioTransaccion.style.display = 'none';
  });

  document.getElementById('btnConfirmarTransaccion').addEventListener('click', () => {
    const monto = parseFloat(montoTransaccion.value);
    const usuario = obtenerUsuarioActual();

    if (!usuario || isNaN(monto) || monto <= 0) {
      alert('Monto inválido.');
      return;
    }

    if (tipoTransaccion === 'retiro' && monto > usuario.saldo) {
      alert('Fondos insuficientes.');
      return;
    }

    usuario.saldo += tipoTransaccion === 'deposito' ? monto : -monto;

    const usuarios = obtenerUsuarios().map(u => u.cuenta === usuario.cuenta ? usuario : u);
    guardarUsuarios(usuarios);
    guardarUsuarioActual(usuario);

    const transacciones = obtenerTransacciones();
    transacciones.push({
      tipo: tipoTransaccion.charAt(0).toUpperCase() + tipoTransaccion.slice(1),
      cantidad: monto,
      fecha: new Date().toLocaleString(),
      usuarioCuenta: usuario.cuenta
    });
    guardarTransacciones(transacciones);

    alert(`Transacción exitosa. Nuevo saldo: $${usuario.saldo.toFixed(2)}`);
    formularioTransaccion.style.display = 'none';
  });
}

// --- Formulario de Pago de Servicios ---
const btnPagarServicios = document.getElementById('btnPagarServicios');
const formularioServicios = document.getElementById('formularioServicios');

if (btnPagarServicios) {
  btnPagarServicios.addEventListener('click', () => {
    formularioServicios.style.display = 'block';
  });

  document.getElementById('btnCancelarPago').addEventListener('click', () => {
    formularioServicios.style.display = 'none';
  });

  document.getElementById('btnAceptarPago').addEventListener('click', () => {
    const servicio = document.getElementById('servicio').value;
    const monto = parseFloat(document.getElementById('monto').value);
    const usuario = obtenerUsuarioActual();

    if (isNaN(monto) || monto <= 0) {
      alert('Monto inválido.');
      return;
    }

    if (usuario.saldo < monto) {
      alert('Fondos insuficientes.');
      return;
    }

    usuario.saldo -= monto;

    const usuarios = obtenerUsuarios().map(u => u.cuenta === usuario.cuenta ? usuario : u);
    guardarUsuarios(usuarios);
    guardarUsuarioActual(usuario);

    const transacciones = obtenerTransacciones();
    transacciones.push({
      tipo: `Pago de ${servicio}`,
      cantidad: monto,
      fecha: new Date().toLocaleString(),
      usuarioCuenta: usuario.cuenta
    });
    guardarTransacciones(transacciones);

    alert(`Pago exitoso. Nuevo saldo: $${usuario.saldo.toFixed(2)}`);
    formularioServicios.style.display = 'none';
  });
}

// --- Historial de Transacciones ---
if (document.getElementById('historialTransacciones')) {
  const usuario = obtenerUsuarioActual();
  if (!usuario) {
    window.location.href = "index.html";
  }

  const transacciones = obtenerTransacciones().filter(t => t.usuarioCuenta === usuario.cuenta);
  const tbody = document.getElementById('historialTransacciones');

  if (transacciones.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="text-center">No hay transacciones aún.</td></tr>`;
  } else {
    tbody.innerHTML = "";
    transacciones.forEach(t => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${t.tipo}</td>
        <td>$${t.cantidad.toFixed(2)}</td>
        <td>${t.fecha}</td>
      `;
      tbody.appendChild(fila);
    });
  }
}

// --- Botón de Imprimir Historial con jsPDF ---
if (document.getElementById('btnImprimirHistorial')) {
  document.getElementById('btnImprimirHistorial').addEventListener('click', async () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const usuario = obtenerUsuarioActual();
    if (!usuario) {
      alert("Sesión expirada.");
      return;
    }

    const transacciones = obtenerTransacciones().filter(t => t.usuarioCuenta === usuario.cuenta);

    doc.setFontSize(16);
    doc.text(`Historial de Transacciones - ${usuario.nombre}`, 10, 10);
    doc.setFontSize(12);
    let y = 20;

    transacciones.forEach((t, index) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${index + 1}. ${t.tipo} - $${t.cantidad.toFixed(2)} - ${t.fecha}`, 10, y);
      y += 10;
    });

    doc.save("historial.pdf");
  });
}













    
























