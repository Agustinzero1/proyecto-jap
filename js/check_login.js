//se dispara al cargar la pagina para recuperar los datos de OAuth 2.0 de google
function onLoad() {
    gapi.load('auth2', function() {
      gapi.auth2.init();
    });
}

//se dispara al pulsar el log out, y haciendo uso de los datos de sesion cierra la sesion de OAuth 2.0 de google
function google_signOut() {
    //esta linea es para que si no hay sesion de google no la cierre.
    //para evitar errores relacionados a el objeto gapi => undefined
    if(localStorage.getItem("login_type") == "google"){
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function () {
          console.log('User signed out.');
        });          
    }
}

/** - Carga la imagen del usuario y el nombre en la interface de la web */
function load_ui_user_data(){
    let user_name_block = document.getElementsByClassName("profile-user-name")[0];
    user_name_block.textContent = localStorage.getItem("usuario");
    
    let profile_img = document.getElementById("profile-img");
    if(localStorage.getItem("user_img") != null && localStorage.getItem("user_img") != "" && localStorage.getItem("user_img") != undefined){
        profile_img.src = localStorage.getItem("user_img");
    }
}

/** - borra los datos del usuario logueado del localStorage y vuelve al loguin */
function remove_user_data_and_go_to_login(){
    //borro los datos de la sesion
    localStorage.removeItem("login_type");
    localStorage.removeItem("usuario");
    localStorage.removeItem("user_img");
    localStorage.removeItem("password");

    location.href = "login.html"; // voy al menu principal
}

/** - Carga las funciones de los botones del desplegable del usuario */
function load_ui_user_options(){

            //boton de ir a perfil de usuario
            document.getElementById("profile-lnk").addEventListener('click', function(e){
                location.href='my-profile.html';
            });
    
            //boton de ir al carrito
            document.getElementById("cart-lnk").addEventListener('click', function(e){
                location.href='cart.html';
            });
            
            //boton de desconectar
            document.getElementById("logout-lnk").addEventListener('click', function(e){
                //cierro la sesion de google si es de google
                google_signOut();

                //borro los datos del usuario y me vuelvo al login
                remove_user_data_and_go_to_login();
            });
}

document.addEventListener("DOMContentLoaded", function(e){

    //disparo la funcion de google que carga los datos, porque sino a 
    //veces fallaba y no estaba definido el objeto de gapi
    onLoad();

    //seteo el boton y el desplegable del usuario logueado solo si esta logueado
    if(localStorage.getItem("usuario") != null && localStorage.getItem("usuario") != ""){

        //cargo la info del usuario en la interface
        load_ui_user_data();

        //cargo las funciones del usario en el desplegable
        load_ui_user_options();
        
    }else{
        //me guardo la direccion para redirigir aqui al usuario cuando se loguee
        localStorage.setItem("last_url", location.href);

        alert('Necesitas iniciar sesión para continuar...');

        //borro los datos del usuario y me vuelvo al login
        remove_user_data_and_go_to_login();
    }
    
});
