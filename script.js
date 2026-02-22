//HOME BANKING

//Conectarse con la base de datos local
let usuariosGuardados = []
//VERIFICA SI NO HAY GUARDADA UNA SESIÓN
let usuarioConectado = JSON.parse(localStorage.getItem("usuario")) || null

async function iniciarBaseDeDatos() {
    const data = localStorage.getItem("usuarios")

    if(data){
        usuariosGuardados = JSON.parse(data)
    }
    else{
        try{
            const res = await fetch("./datosUsuarios.json")
            const datosOriginales = await res.json()
            usuariosGuardados = datosOriginales
            localStorage.setItem("usuarios",JSON.stringify(usuariosGuardados))
            console.log(usuariosGuardados)
        }
        catch (error){
            console.error("Error al conectarse a la base de datos", error)
        }
    }
}


// VARIABLES DEL DOM 
const loginSection = document.getElementById("login")
const menuSection = document.getElementById("menu")
const resultado = document.getElementById("resultado")
const bienvenida = document.getElementById("bienvenida")
const btnabrirSaldo = document.getElementById("btnSaldo")
const btnAbrirPerfil = document.getElementById("btnPerfil")
const panelPerfil = document.getElementById("contenedorPerfil")
const btnAbrirTransferencias = document.getElementById("btnMenuTransferir")
const panelTransferencias = document.getElementById("contenedorTransferencia")
const btnAbrirPrestamos = document.getElementById("btnMenuPrestamos")
const panelPrestamos = document.getElementById("contenedorPrestamos")
const eventoUsuarioInactivo = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"]

//FUNCIÓN PARA GUARDAR MODIFICACIONES EN LA BASE DE DATOS CON LOCALSTORAGE
function actualizarStorage() {
    const buscarUsuario = usuariosGuardados.findIndex(u => u.usuario === usuarioConectado.usuario)
    if(buscarUsuario !== -1){
        usuariosGuardados[buscarUsuario] = usuarioConectado
    }
    localStorage.setItem("usuario", JSON.stringify(usuarioConectado))
    localStorage.setItem("usuarios", JSON.stringify(usuariosGuardados));
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

//FUNCIÓN ABRIR PERFIL Y MOSTRAR DATOS DEL USUARIO CONECTADO
btnAbrirPerfil.addEventListener("click", abrirPerfil)
function abrirPerfil() {
    if (usuarioConectado) {
        document.getElementById("perfilNombre").textContent = usuarioConectado.nombre
        document.getElementById("perfilUsuario").textContent = usuarioConectado.usuario
        document.getElementById("perfilEmail").textContent = usuarioConectado.email
        document.getElementById("perfilContraseña").textContent = usuarioConectado.contraseña

        panelPerfil.classList.toggle("hidden")
        panelTransferencias.classList.add("hidden")
        panelPrestamos.classList.add("hidden")
    }
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
            Tu saldo actual: $${usuarioConectado.saldo}`,
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
//CERRAR SESION CUANDO EL USUARIO NO INTERACTUA CON EL DOM POR SEGURIDAD
let tiempoInactivo

function reiniciarTiempo(){
    if (usuarioConectado){
        clearTimeout(tiempoInactivo)
        tiempoInactivo = setTimeout(cerrarSesionInactivo, 60000)
    }
}
function cerrarSesionInactivo(){
    localStorage.removeItem("usuario")
    Swal.fire({
        icon: "warning",
        title: "Sesión expirada",
        text: "Por tu seguridad, cerramos tu sesión.",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Volver a ingresar",
        allowOutsideClick: false 
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.reload();
        }
    });
}
eventoUsuarioInactivo.forEach(evento => {
    document.addEventListener(evento, reiniciarTiempo, true);
});

//FUNCIÓN BUSCAR USUARIO Y CONECTARSE
document.getElementById("btnLogin").addEventListener("click", () => {
    const usuarioImput = document.getElementById("usuario").value
    const contraseñaImput = document.getElementById("password").value
    const UsuarioEncontrado = usuariosGuardados.find(u => u.usuario === usuarioImput && u.contraseña === contraseñaImput)
    if (UsuarioEncontrado) {
        usuarioConectado = UsuarioEncontrado
        actualizarStorage()
        iniciarSesion()
    } else {
        document.getElementById("loginMsg").textContent = "Usuario o contraseña incorrectos"
    }
})

document.getElementById("btnSaldo").addEventListener("click", verSaldo)
document.getElementById("btnTransferir").addEventListener("click", transferirDinero)
document.getElementById("btnPrestamo").addEventListener("click", solicitarPrestamo)
document.getElementById("btnSalir").addEventListener("click", cerrarSesion)


iniciarBaseDeDatos().then(() => {
    if (usuarioConectado) {
        iniciarSesion()
        reiniciarTiempo()
    }
})