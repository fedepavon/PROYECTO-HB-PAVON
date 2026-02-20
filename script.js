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

//FUNCIÓN TRANSFERIR DINERO 
function transferirDinero() {
    const emailDestino = document.getElementById("emailDestino").value.trim()
    const monto = Number(document.getElementById("montoTransferir").value)

    if (!emailDestino) {
        resultado.textContent = "Debés ingresar un email de destino"
        return
    }
    if (monto <= 0) {
        resultado.textContent = "El monto ingresado no es válido. Ingresá un valor mayor a $0."
        return
    }
    const usuarioDestino = usuariosGuardados.find(
        usuario => usuario.email === emailDestino
    )
    if (!usuarioDestino) {
        resultado.textContent = "No existe ningún usuario registrado con ese email."
        return
    }
    if (usuarioDestino.email === usuarioConectado.email) {
        resultado.textContent = "No podés transferirte dinero a vos mismo"
        return
    }
    if (monto > usuarioConectado.saldo) {
        resultado.textContent = "No se pudo realizar la transferencia porque el saldo es insuficiente."
        return
    }

    usuarioConectado.saldo -= monto
    usuarioDestino.saldo += monto

    // GUARDAR CAMBIOS
    actualizarStorage()



    resultado.innerHTML = `
        Transferencia exitosa <br>
        Enviados: $${monto} <br>
        Destinatario: ${usuarioDestino.nombre} <br>
        Saldo actual: $${usuarioConectado.saldo}
    `
}

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
        resultado.textContent = "Tu perfil no tiene préstamos habilitados. Contactá con el banco para más información."
        return
    }

    const monto = Number(document.getElementById("montoPrestamo").value)
    const cuotas = Number(document.getElementById("cuotas").value)

    if (monto <= 0 || !cuotas) {
        resultado.textContent = "Ingresá un monto válido y seleccioná cuotas"
        return
    }

    const cuotaMensual = calcularCuota(monto, cuotas)

    usuarioConectado.saldo += monto
    actualizarStorage()

    resultado.innerHTML = `
        Préstamo aprobado <br>
        Monto acreditado: $${monto}<br>
        Cuotas: ${cuotas}<br>
        Valor de cada cuota: $${cuotaMensual.toFixed(2)}<br>
        Nuevo saldo: $${usuarioConectado.saldo}
    `
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

    const usuario = usuariosGuardados.find(
        u => u.email === email && u.contraseña === password
    )

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