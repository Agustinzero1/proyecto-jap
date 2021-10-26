let file = null;
let fileBase64 = null;
var _validFileExtensions = [".jpg", ".jpeg", ".bmp", ".gif", ".png"];
let actual_profile_data;

//Función que se ejecuta una vez que se haya lanzado el evento de
//que el documento se encuentra cargado, es decir, se encuentran todos los
//elementos HTML presentes.
document.addEventListener("DOMContentLoaded", function (e) {

    let profile_data = localStorage.getItem("user_data");

    //comprueba si el archivo del local storage existe, si no existe lo llena con la imagen por defecto
    if(profile_data != null ){
        actual_profile_data = JSON.parse(profile_data);
        fill_data_in_form();
    }else{
        actual_profile_data = {}
    }

    let profile_img = localStorage.getItem("user_img");
    let profile_img_preview = document.getElementsByClassName('profile-img')[0]
    
    //comprueba si el archivo del local storage existe, si no existe lo llena con la imagen por defecto
    if(profile_img != null ){
        profile_img_preview.src = profile_img;
    }

    let profile_img_container = document.getElementsByClassName('img-profile-container')[0]
    let profile_img_loader = document.getElementsByClassName('profile-img-loader')[0]
    
    //dispara la ventana de subir imagen al darle click al marco
    profile_img_container.addEventListener('click', (e)=>{
        profile_img_loader.click();
    });

    //chequea si se subio un archivo
    profile_img_loader.addEventListener('change', (e)=>{
        file = e.target.files[0]
        previewFile( profile_img_preview, e.target)
    });

    //obtengo el formulario
    let form = document.getElementById('datos-perfil');

    //configura lo que pasa cuando el form hace submit, aqui se guardan los datos
    form.addEventListener('submit', (e)=>{
        
        // se revisara si hay cambios para no guardar sin necesidad
        let cambios = 0;

        //se comprueba si se cambio la foto
        if(fileBase64 != null){
            localStorage.setItem("user_img", fileBase64);
            cambios +=1;
        }

        //se comprueba si se cambiaron los datos del usuario
        cambios += Get_Changed_data(actual_profile_data, 'input-nombre1', 'nombre1');
        cambios += Get_Changed_data(actual_profile_data, 'input-nombre2', 'nombre2');
        cambios += Get_Changed_data(actual_profile_data, 'input-apellido1', 'apellido1');
        cambios += Get_Changed_data(actual_profile_data, 'input-apellido2', 'apellido2');
        cambios += Get_Changed_data(actual_profile_data, 'input-email', 'email');
        cambios += Get_Changed_data(actual_profile_data, 'input-telefono', 'telefono');
        cambios += Get_Changed_data(actual_profile_data, 'input-edad', 'edad');

        //si hay cambios se registran
        if(cambios > 0){
            localStorage.setItem("user_data", JSON.stringify(actual_profile_data) );
        }
        
    })

});

/** - obtiene los datos del elemento para comprobar si se cambio, y si se cambio los registra y devuelve 1, sino devuelve 0
 * @param {*} actual_profile_data_OBJ - el JSON que se esta usando en formato OBJ
 * @param {*} HTMLElement_input - el ID del elemento a revisar, si este se cambio se guardaran en el JSON
 * @param {*} JSON_var_name - nombre de la variable en el JSON correspondiente, aqui se guardaran los datos
 * @returns 
 */
function Get_Changed_data(actual_profile_data_OBJ, HTMLElement_input_ID, JSON_var_name) {
    let HTMLElement_input = document.getElementById(HTMLElement_input_ID);

    if(HTMLElement_input.value != "" && HTMLElement_input.value != null){
        actual_profile_data_OBJ[JSON_var_name] = HTMLElement_input.value;
        return 1;
    }
    return 0;
}

/** - sube carga y comprueba la imagen del input_file para luego ponerla en el preview y setearla como la imagen en caso de darle guardar
 * @param {*} img_preview - html element de tipo img que se colocara el preview de la imagen
 * @param {*} htmlElement_input_file - input donde se colocara la imagen que subira el usuario
 */
function previewFile( img_preview, htmlElement_input_file) {
    var reader  = new FileReader();
    reader.onloadend = function () {
        img_preview.src = reader.result;
        fileBase64 = reader.result;
      }
    
      if (file) {
        if(ValidateSingleInput(htmlElement_input_file, _validFileExtensions)){
            reader.readAsDataURL(file);
        }
      } else {
        // img_preview.src = "";
      }
}

/** - Valida si el input pasado por parametro tiene los formatos correctos
 * @param {HTMLElement} InputHTMLElement - elemento html de tipo input file que se revisara su archivo
 * @param {[string]} validFileExtensions - lista de formatos ej [".jpg", ".jpeg", ".bmp"]
 * @returns 
 */
function ValidateSingleInput(InputHTMLElement, validFileExtensions) {
    if (InputHTMLElement.type == "file") {
        var sFileName = InputHTMLElement.value;
        if (sFileName.length > 0) {
            var blnValid = false;
            for (var j = 0; j < validFileExtensions.length; j++) {
                var sCurExtension = validFileExtensions[j];
                if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
                    blnValid = true;
                    break;
                }
            }

            if (!blnValid) {
                alert("Error, " + sFileName + " es invalido, solo se permiten los siguientes formatos: " + _validFileExtensions.join(", "));
                InputHTMLElement.value = "";
                return false;
            }
        }
    }
    return true;
}

/** - rellena los campos del form al cargar la pagina 
 * 
*/
function fill_data_in_form() {
    fill_data_in_field('input-nombre1',   'nombre1'   );
    fill_data_in_field('input-nombre2',   'nombre2'   );
    fill_data_in_field('input-apellido1', 'apellido1' );
    fill_data_in_field('input-apellido2', 'apellido2' );
    fill_data_in_field('input-email',     'email'     );
    fill_data_in_field('input-telefono',  'telefono'  );
    fill_data_in_field('input-edad',      'edad'      );
}

/** - rellena los datos del elemento con la id del parametro con los datos del json correspondientes
 * @param {*} HTMLElement_input_ID - id del elemento a rellenar el placeholder
 * @param {*} JSON_Name - nombre del parametro a usar
 */
function fill_data_in_field(HTMLElement_input_ID, JSON_Name ) {
    if(actual_profile_data[JSON_Name] != undefined){
        document.getElementById(HTMLElement_input_ID).setAttribute('placeholder', actual_profile_data[JSON_Name] )
    }
}