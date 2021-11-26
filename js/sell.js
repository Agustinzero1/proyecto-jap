let productCost = 0;
let productCount = 0;
let comissionPercentage = 0.13;
let MONEY_SYMBOL = "$";
let DOLLAR_CURRENCY = "Dólares (USD)";
let PESO_CURRENCY = "Pesos Uruguayos (UYU)";
let DOLLAR_SYMBOL = "USD ";
let PESO_SYMBOL = "UYU ";
let PERCENTAGE_SYMBOL = '%';
let SUCCESS_MSG = "¡Se ha realizado la publicación con éxito! :)";
let ERROR_MSG = "Ha habido un error :(, verifica qué pasó.";

//Función que se utiliza para actualizar los costos de publicación
function updateTotalCosts(){
    let unitProductCostHTML = document.getElementById("productCostText");
    let comissionCostHTML = document.getElementById("comissionText");
    let totalCostHTML = document.getElementById("totalCostText");

    let unitCostToShow = MONEY_SYMBOL + productCost;
    let comissionToShow = Math.round((comissionPercentage * 100)) + PERCENTAGE_SYMBOL;
    let totalCostToShow = MONEY_SYMBOL + (Math.round(productCost * comissionPercentage * 100) / 100);

    unitProductCostHTML.innerHTML = unitCostToShow;
    comissionCostHTML.innerHTML = comissionToShow;
    totalCostHTML.innerHTML = totalCostToShow;
}

//Función que se ejecuta una vez que se haya lanzado el evento de
//que el documento se encuentra cargado, es decir, se encuentran todos los
//elementos HTML presentes.
document.addEventListener("DOMContentLoaded", function(e){
    document.getElementById("productCountInput").addEventListener("change", function(){
        productCount = this.value;
        updateTotalCosts();
    });

    document.getElementById("productCostInput").addEventListener("change", function(){
        productCost = this.value;
        updateTotalCosts();
    });

    document.getElementById("goldradio").addEventListener("change", function(){
        comissionPercentage = 0.13;
        updateTotalCosts();
    });
    
    document.getElementById("premiumradio").addEventListener("change", function(){
        comissionPercentage = 0.07;
        updateTotalCosts();
    });

    document.getElementById("standardradio").addEventListener("change", function(){
        comissionPercentage = 0.03;
        updateTotalCosts();
    });

    document.getElementById("productCurrency").addEventListener("change", function(){
        if (this.value == DOLLAR_CURRENCY)
        {
            MONEY_SYMBOL = DOLLAR_SYMBOL;
        } 
        else if (this.value == PESO_CURRENCY)
        {
            MONEY_SYMBOL = PESO_SYMBOL;
        }

        updateTotalCosts();
    });

    //Configuraciones para el elemento que sube archivos
    var dzoptions = {
        url:"/",
        autoQueue: false,
        thumbnailHeight:400,
        thumbnailWidth:400,
        thumbnailMethod:'contain',
        resizeMimeType:'image/jpeg'
    };
    var myDropzone = new Dropzone("div#file-upload", dzoptions);    


    //Se obtiene el formulario de publicación de producto
    var sellForm = document.getElementById("sell-info");

    //Se agrega una escucha en el evento 'submit' que será
    //lanzado por el formulario cuando se seleccione 'Vender'.
    sellForm.addEventListener("submit", function(e){
        let productNameInput = document.getElementById("productName");
        let productDescription = document.getElementById("productDescription");
        let productCost = document.getElementById("productCostInput");
        let infoMissing = false;

        //Quito las clases que marcan como inválidos
        productNameInput.classList.remove('is-invalid');
        productCategory.classList.remove('is-invalid');
        productCost.classList.remove('is-invalid');

        //Se realizan los controles necesarios,
        //En este caso se controla que se haya ingresado el nombre y categoría.
        //Consulto por el nombre del producto
        if (productNameInput.value === "")
        {
            productNameInput.classList.add('is-invalid');
            infoMissing = true;
        }
        
        //Consulto por la categoría del producto
        if (productCategory.value === "")
        {
            productCategory.classList.add('is-invalid');
            infoMissing = true;
        }

        //Consulto por el costo
        if (productCost.value <=0)
        {
            productCost.classList.add('is-invalid');
            infoMissing = true;
        }
        
        

        if(!infoMissing)
        {
            
            let img_link = document.querySelector('.dz-image img')

            var payload = {
                name:productNameInput.value,
                description: productDescription.value,
                cost:productCost.value,
                currency:MONEY_SYMBOL,
                imgSrc:img_link != null? img_link.src : "img/image-placeholder.png",
                soldCount:0
            };
            
            console.log(payload);

            fetch(PUBLISH_PRODUCT_URL,
                {
                    method: "POST",
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(payload)
                })
                .then(function (res) { 
                    
                    let msgToShowHTML = document.getElementById("resultSpan");
                    let msgToShow = "";
                    //Si la publicación fue exitosa, devolverá mensaje de éxito,
                    //de lo contrario, devolverá mensaje de error.
                    if (res.status === 'ok') {
                        msgToShow = res.data.msg;
                        document.getElementById("alertResult").classList.add('alert-success');
                    }
                    else if (res.status === 'error') {
                        msgToShow = ERROR_MSG;
                        document.getElementById("alertResult").classList.add('alert-danger');
                    }
                    msgToShowHTML.innerHTML = msgToShow;
                    document.getElementById("alertResult").classList.add("show");

                    return res.json(); })
                
                .then(function (data) { 
                    alert(data.mensaje)
                    location.href = "products.html"
                })

            //Aquí ingresa si pasó los controles, irá a enviar
            //la solicitud para crear la publicación.

            
            // getJSONData(PUBLISH_PRODUCT_URL).then(function(resultObj){
            //     let msgToShowHTML = document.getElementById("resultSpan");
            //     let msgToShow = "";
    
            //     //Si la publicación fue exitosa, devolverá mensaje de éxito,
            //     //de lo contrario, devolverá mensaje de error.
            //     if (resultObj.status === 'ok')
            //     {
            //         msgToShow = resultObj.data.msg;
            //         document.getElementById("alertResult").classList.add('alert-success');
            //     }
            //     else if (resultObj.status === 'error')
            //     {
            //         msgToShow = ERROR_MSG;
            //         document.getElementById("alertResult").classList.add('alert-danger');
            //     }
    
            //     msgToShowHTML.innerHTML = msgToShow;
            //     document.getElementById("alertResult").classList.add("show");
            // });
        }

        //Esto se debe realizar para prevenir que el formulario se envíe (comportamiento por defecto del navegador)
        if (e.preventDefault) e.preventDefault();
            return false;
    });
});


function previewFile(htmlElement_input_file) {
    var reader  = new FileReader();
    reader.onloadend = function () {
        fileBase64 = reader.result;
      }
    
      if (file) {
        if(ValidateSingleInput(htmlElement_input_file, _validFileExtensions)){
            reader.readAsDataURL(file);
        }
      } else {
      }
}

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