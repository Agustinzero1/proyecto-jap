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

document.addEventListener("DOMContentLoaded", function(e){
    onLoad();

    var usuario = localStorage.getItem("usuario"); 

    if(usuario != null && usuario != ""){
        let user_name_block = document.getElementsByClassName("profile-user-name")[0];
        user_name_block.textContent = localStorage.getItem("usuario");

        let profile_img = document.getElementById("profile-img");
        if(localStorage.getItem("user_img") != null && localStorage.getItem("user_img") != "" && localStorage.getItem("user_img") != undefined){
            profile_img.src = localStorage.getItem("user_img");
        }

        let profile_lnk = document.getElementById("profile-lnk");
        let cart_lnk = document.getElementById("cart-lnk");
        let logout_lnk = document.getElementById("logout-lnk");

        profile_lnk.addEventListener('click', function(e){
            location.href='my-profile.html';
        });

        cart_lnk.addEventListener('click', function(e){
            location.href='cart.html';
        });
        
        logout_lnk.addEventListener('click', function(e){

            if(localStorage.getItem("login_type") == "google"){
                signOut();
            }

            localStorage.removeItem("usuario");
            localStorage.removeItem("user_img");
            localStorage.removeItem("password");

            location.href='login.html';
        });

        
    }else{
        localStorage.removeItem('usuario');
        localStorage.removeItem('password');

        alert('Necesitas iniciar sesión'); 
        localStorage.setItem("last_url", location.href);
        location.href='login.html';
        
    }
    
    
    

    
});

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

    localStorage.setItem("usuario", profile.getName());
    localStorage.setItem("user_img", profile.getImageUrl());

    //location.href="next.html";
}
