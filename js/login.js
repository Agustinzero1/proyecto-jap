

//se dispara al cargar la pagina para recuperar los datos de OAuth 2.0 de google
function onLoad() {
    gapi.load('auth2', function() {
      gapi.auth2.init();
    });
}

//se dispara al pulsar el log out, y haciendo uso de los datos de sesion cierra la sesion de OAuth 2.0 de google
function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('User signed out.');
    });
}

function onSignIn(googleUser) {
    // Useful data for your client-side scripts:
    var profile = googleUser.getBasicProfile();

    localStorage.setItem("login_type", "google");
    localStorage.setItem("usuario", profile.getName());
    localStorage.setItem("user_img", profile.getImageUrl());

    back_to_last_url();
}

/** - loguea en una cuenta de e-Mercado y carga la pagina index.html o la ultima en la que estuvo si esta disponible
 * 
 * @param {string} user - usuario a loguear
 * @param {string} pass - pasword del usuario a loguear
 */
 function login_Cuenta_eMercado(user, pass){
        //si esta autorizado 
        localStorage.setItem("login_type", "eMercado");
        localStorage.setItem("usuario", user.trim()); //setItem almacena el user en la posición "usuario"
        localStorage.setItem("password", pass.trim()); // Almaceno la contraseña
}

/** - Trata de volver a la ultima pagina visitada, guardada en localStorage.getItem("last_url");*/
function back_to_last_url(){
    //trato de volver a la pagina que estaba
    let last_url = localStorage.getItem("last_url");

    if(last_url != "" && last_url != undefined && last_url != null){
        location.href = last_url; // vuelvo a la pagina que estaba
        localStorage.removeItem("last_url");
    }else{
        location.href = "index.html"; // voy al menu principal
    }
}

//Inicia al taner la pagina pronta
document.addEventListener("DOMContentLoaded", function(e){

    //reviso si tengo un usuario logueado
    if((localStorage.getItem("usuario"))){  
        back_to_last_url();
    }

    //esto es solo para agrandar el boton de google
    document.getElementsByClassName("g-signin2")[0].style = "height:50px;width:200px;"
    
});

