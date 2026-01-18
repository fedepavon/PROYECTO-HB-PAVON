//HOME BANKING

//BASE DE DATOS
let datosUsuarios = [
{
    nombre: "Victoria",
    email: "victoria@gmail.com",
    contraseña: "1234",
    saldo: 13000,
    prestamo: true
},
{
    nombre: "Rodrigo",
    email: "rodrigo@gmail.com",
    contraseña: "1234fe",
    saldo: 200000,
    prestamo: false
},
{
    nombre: "Lucia",
    email: "lucia@gmail.com",
    contraseña: "lucia123",
    saldo: 500,
    prestamo: false
}]

//FUNCION BUSCAR USUARIO Y CONECTARSE
function login(){

    let intentos = 3
    let usuarioConectado = null

    while(intentos > 0 && usuarioConectado === null){
        const emailIngresado = prompt("Ingrese su email")
        const contraseñaIngresada = prompt("Ingrese su contraseña")
        for(i = 0; i < datosUsuarios.length; i++){
            if(emailIngresado === datosUsuarios[i].email && contraseñaIngresada === datosUsuarios[i].contraseña){
                alert(`Bienvenid@ ${datosUsuarios[i].nombre}`)
                usuarioConectado = datosUsuarios[i]
            break
            }
        }
        if(usuarioConectado === null){
            intentos--
            alert(`Usuario o contreseña incorrecta. "Quedan ${intentos} intentos`)
        }
    } 
    if(usuarioConectado !== null){
        menuPrincipal(usuarioConectado)
    } else{
            alert("Cuenta bloqueada")
    }

}


function menuPrincipal(usuario){

    let salir = false
    while(salir === false){
        const opcion = prompt("MENU PRINCIPAL\n" + "1 - Ver saldo\n" + "2 - Transferir\n" + "3 - Simular prestamo\n" + "4 - Salir")

        switch(opcion){
            case "1":
                verSaldo(usuario)
                break
            case "2":
                transferir(usuario)
                break
            case "3":
                simularPrestamo(usuario)
                break
            case "4":
                salir = true
                break
            default:
                alert("Opción incorrecta")
        }
    }
}

function verSaldo(usuario){
    alert(`Tu saldo es: $${usuario.saldo}`)
}

function transferir(usuario){
    const dineroTransferir = Number(prompt("Ingrese el monto a transferir"))
    if(dineroTransferir > 0 && dineroTransferir < usuario.saldo){
        usuario.saldo -= dineroTransferir
        alert(`Transferencia realizada.\n Su saldo es: $${usuario.saldo}`)
    } else{
        alert("Saldo insuficiente")
    }
}


function simularPrestamo(usuario) {
    if (!usuario.prestamo) {
        alert("Función no habilitada para su perfil")
        return
    }
    const monto = Number(prompt("Ingrese el monto del préstamo"))
    if (isNaN(monto) || monto < 0) {
        alert("Monto inválido")
        return
    }
    const opcion = prompt("Cuotas:\n" + "1 - 1 cuota sin interés\n" + "2 - 3 cuotas (15%)\n" + "3 - 6 cuotas (25%)\n" + "4 - Volver al menú")
    let cuota
    switch (opcion) {
        case "1":
            cuota = monto
            break
        case "2":
            cuota = (monto * 1.15) / 3
            break
        case "3":
            cuota = (monto * 1.25) / 6
            break
        case "4":
            return
        default:
            alert("Opción inválida")
            return
    }
    alert(`Cuota mensual: $${cuota.toFixed(0)}`)
}

login()
