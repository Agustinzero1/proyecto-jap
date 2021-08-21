

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

//Función que se ejecuta una vez que se haya lanzado el evento de
//que el documento se encuentra cargado, es decir, se encuentran todos los
//elementos HTML presentes.
document.addEventListener("DOMContentLoaded", function(e){
    // - este codigo si se ejecuta ni bien arranca la pagina
    if((localStorage.getItem("usuario"))){  

        let last_url = localStorage.getItem("last_url");
        // console.log(last_url);

        if(last_url != "" && last_url != undefined && last_url != null){
            location.href = last_url; // vuelvo a la pagina que estaba
            localStorage.removeItem("last_url");
        }else{
            location.href = "index.html"; // voy al menu principal
        }

    }

    document.getElementsByClassName("g-signin2")[0].style = "height:50px;width:200px;"
    
});

/** - loguea en una cuenta de e-Mercado y carga la pagina index.html o la ultima en la que estuvo si esta disponible
 * 
 * @param {string} user - usuario a loguear
 * @param {string} pass - pasword del usuario a loguear
 */
function login_Cuenta_eMercado(user, pass){

    // console.log("user: " + user + " | pass: " + pass) //debug de los datos

    if (user.trim()==="" || pass.trim()===""){ //Chequea que el user recibido no esté vacío. 
        //El método trim elimina los espacios en blanco al inicio y al final del mismo.
        alert("Usuario o Contraseña vacios");
    } else{
        //si esta autorizado 
        localStorage.setItem("login_type", "eMercado");
        localStorage.setItem("usuario", user.trim()); //setItem almacena el user en la posición "usuario"
        localStorage.setItem("password", pass.trim()); // Almaceno la contraseña

    }
}

function onSignIn(googleUser) {
    // Useful data for your client-side scripts:
    var profile = googleUser.getBasicProfile();
    //console.log("ID: " + profile.getId()); // Don't send this directly to your server!
    //console.log('Full Name: ' + profile.getName());
    //console.log('Given Name: ' + profile.getGivenName());
    //console.log('Family Name: ' + profile.getFamilyName());
    //console.log("Image URL: " + profile.getImageUrl());
    //console.log("Email: " + profile.getEmail());

    // The ID token you need to pass to your backend:
    var id_token = googleUser.getAuthResponse().id_token;
    //console.log("ID Token: " + id_token);

    localStorage.setItem("login_type", "google");
    localStorage.setItem("usuario", profile.getName());
    localStorage.setItem("user_img", profile.getImageUrl());

    let last_url = localStorage.getItem("last_url");
    // console.log(last_url);

    if(last_url != "" && last_url != undefined && last_url != null){
        location.href = last_url; // vuelvo a la pagina que estaba
        localStorage.removeItem("last_url");
    }else{
        location.href = "index.html"; // voy al menu principal
    }
}
