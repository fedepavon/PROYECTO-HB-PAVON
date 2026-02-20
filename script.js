//HOME BANKING

// BASE DE DATOS
const datosUsuarios =[
    { nombre: "Victoria", email: "victoria@gmail.com", contraseña: "1234", saldo: 13000, prestamo: true },
    { nombre: "Rodrigo", email: "rodrigo@gmail.com", contraseña: "1234fe", saldo: 200000, prestamo: false },
    { nombre: "Lucia", email: "lucia@gmail.com", contraseña: "lucia123", saldo: 5000.49, prestamo: false },
    { nombre: "Ricardo", email: "ricardo@gmail.com", contraseña: "ricardo1234", saldo: 300000, prestamo: true },
    { nombre: "Camila", email: "camila@gmail.com", contraseña: "cami1234", saldo: 250000, prestamo: true }
]

 //RECUPERAR LA LISTA DE USUARIOS DESDE EL LOCALSTORAGE. SI ES EL PRIMER INGRESO USA LA BASE DE DATO ORIGINAL
const usuariosGuardados = JSON.parse(localStorage.getItem("usuarios")) || datosUsuarios
//VERIFICA SI NO HAY GUARDADA UNA SESIÓN
let usuarioConectado = JSON.parse(localStorage.getItem("usuario")) || null

// VARIABLES DEL DOM 
const loginSection = document.getElementById("login")
const menuSection = document.getElementById("menu")
const resultado = document.getElementById("resultado")
const bienvenida = document.getElementById("bienvenida")
const btnAbrirTransferencias = document.getElementById("btnMenuTransferir")
const panelTransferencias = document.getElementById("contenedorTransferencia")
const btnAbrirPrestamos = document.getElementById("btnMenuPrestamos")
const panelPrestamos = document.getElementById("contenedorPrestamos")

//FUNCIÓN PARA GUARDAR MODIFICACIONES EN LA BASE DE DATOS CON LOCALSTORAGE
function actualizarStorage() {
    const buscarUsuario = usuariosGuardados.findIndex(u => u.email === usuarioConectado.email)
    if(buscarUsuario !== -1){
        usuariosGuardados[buscarUsuario] = usuarioConectado
    }
    localStorage.setItem("usuario", JSON.stringify(usuarioConectado))
    localStorage.setItem("usuarios",JSON.stringify(usuariosGuardados))
}
//MUESTRA EL MENÚ Y OCULTA EL LOGIN CUANDO EL USUARIO INICIA SESIÓN
function iniciarSesion() {
    loginSection.classList.add("hidden")
    menuSection.classList.remove("hidden")
    bienvenida.textContent = `Bienvenido ${usuarioConectado.nombre}`
}
//FUNCIÓN VER SALDO DEL USUARIO CONECTADO
function verSaldo() {
    resultado.textContent = `Saldo disponible: $${usuarioConectado.saldo}`
}

//ABRIR CONTENEDOR DE TRANSFERENCIAS
btnAbrirTransferencias.addEventListener("click", () => {panelTransferencias.classList.toggle("hidden")})
//FUNCIÓN TRANSFERIR DINERO 
function transferirDinero() {
    const emailDestino = document.getElementById("emailDestino").value.trim()
    const monto = Number(document.getElementById("montoTransferir").value)

    const usuarioDestino = usuariosGuardados.find(usuario => usuario.email === emailDestino)
    //swal.fire --> libreria sweetAlert
    if (!emailDestino) {
        swal.fire("Opps", "Debés ingresar un email de destino", "warning")
        return
    }
    if (monto <= 0) {
        swal.fire("Opps", "El monto ingresado no es válido. Ingresá un valor mayor a $0.", "warning")
        return
    }
    if (!usuarioDestino) {
        swal.fire("Opps", "No existe ningún usuario registrado con ese email.", "warning")
        return
    }
    if (usuarioDestino.email === usuarioConectado.email) {
        swal.fire("Opps", "No podés transferirte dinero a vos mismo", "warning")
        return
    }
    if (monto > usuarioConectado.saldo) {
        swal.fire("Opps", "No se pudo realizar la transferencia porque el saldo es insuficiente.", "warning")
        return
    }
    //USO DE LIBRERIA "SWEETALERT" PARA CONFIRMAR LOS DATOS DE LA TRANSFERENCIA
    Swal.fire({
        title: "¿DESEA CONFIRMAR TRANSFERENCIA?",
        html:`
        Monto: $${monto}<br>
        Destinatario: ${usuarioDestino.nombre} <br>
        Email: ${usuarioDestino.email}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "TRANFERIR",
        cancelButtonText: "CANCELAR"
}).then((result) => {
    if (result.isConfirmed) {
        usuarioConectado.saldo -= monto
        usuarioDestino.saldo += monto
        // GUARDAR CAMBIOS
        actualizarStorage()
        Swal.fire({
            title: "TRANSFERENCIA EXITOSA",
            html:`saldo actual: ${usuarioConectado.saldo}`,
            icon: "success"
    });
}
})
}
// ABRIR CONTENEDOR DE PRESTAMOS
btnAbrirPrestamos.addEventListener("click", () => {panelPrestamos.classList.toggle("hidden")})

//FUNCIONES CALCULAR CUOTAS DEL PRÉSTAMO Y SOLICITARLO
function calcularCuota(monto, cuotas) {
    let interes = 0
    if (cuotas === 3) interes = 0.15
    if (cuotas === 6) interes = 0.25
    const total = monto * (1 + interes)
    return total / cuotas
}

function solicitarPrestamo() {
    if (!usuarioConectado.prestamo) {
        swal.fire("Opps", "Tu perfil no tiene préstamos habilitados. <br> Contactá con el banco para más información.", "warning")
        return
    }

    const monto = Number(document.getElementById("montoPrestamo").value)
    const cuotas = Number(document.getElementById("cuotas").value)

    if (monto <= 0 || !cuotas) {
        swal.fire("Opps", "Ingresá un monto válido y seleccioná cuotas", "warning")
        return
    }

    const cuotaMensual = calcularCuota(monto, cuotas)
    //USO DE LIBRERIA "SWEETALERT" PARA CONFIRMAR PRESTAMOS
    Swal.fire({
        title: "CONFIRMAR PRESTAMO",
        html:`
        Monto solicitado: $${monto}<br>
        Cantidad de cuotas: ${cuotas}<br>
        Valor de cada cuota: $${cuotaMensual.toFixed(2)}<br>`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "CONFIRMAR",
        cancelButtonText: "CANCELAR"
}).then((result) => {
    if (result.isConfirmed) {
        usuarioConectado.saldo += monto
        //GUARDAR CAMBIOS
        actualizarStorage()
        Swal.fire({
            title: "PRESTAMO CONFIRMADO",
            html:` Ya se encuentra disponible tu prestamo <br>
            Tu saldo saldo: $${usuarioConectado.saldo}`,
            icon: "success"
    });
}
})
}

//FUNCIÓN CERRAR SESIÓN
function cerrarSesion() {
    localStorage.removeItem("usuario")
    location.reload()
}

//FUNCIÓN BUSCAR USUARIO Y CONECTARSE
document.getElementById("btnLogin").addEventListener("click", () => {
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const usuario = usuariosGuardados.find(u => u.email === email && u.contraseña === password)
    if (usuario) {
        usuarioConectado = usuario
        actualizarStorage()
        iniciarSesion()
    } else {
        document.getElementById("loginMsg").textContent = "Email o contraseña incorrectos"
    }
})

document.getElementById("btnSaldo").addEventListener("click", verSaldo)
document.getElementById("btnTransferir").addEventListener("click", transferirDinero)
document.getElementById("btnPrestamo").addEventListener("click", solicitarPrestamo)
document.getElementById("btnSalir").addEventListener("click", cerrarSesion)

//SI EXISTE UN USUARIO EN LOCALSTORAGE, INICIA SESION AUTOMÁTICAMENTE
if (usuarioConectado) {
    iniciarSesion()
}