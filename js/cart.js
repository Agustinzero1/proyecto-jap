/** comentarios */

/** - tipo de objeto Article
 * @typedef {Object} Article - Objeto con datos detallados de un producto tipo Article del JSON
 * @property {number} count - cantidad de unidades del producto
 * @property {string} currency - unidad del costo del producto ej "USD", "UYU"
 * @property {string} name - Nombre del producto
 * @property {string} src - link de la imagen del producto para mostrar
 * @property {number} unitCost - costo del producto
 */

/** variables globales */
let jsonCarrito;
let dolar = 40;
let selectedCurrency = "UYU";

let cost_sub_total = 0;
let cost_envio = 0;
let cost_total = 0;

const envio = [0, 0.15, 0.07, 0.05,];

//guardando variables para poder prender el boton de comprar
let slect_envio = 0;

let input_direccion;
let input_direccion2;
let input_pais;
let input_ciudad;
let input_codPostal;
let input_envioSeleccionado;

let Existe_direccion = false;
let Existe_direccion2 = false;
let Existe_pais = false;
let Existe_ciudad = false;
let Existe_codPostal = false;
let envioSeleccionado = false;
let metodoPagoSeleccionado = false;

let Err_Existe_direccion;
let Err_Existe_pais;
let Err_Existe_ciudad;
let Err_Existe_codPostal;

let datos_completos = false;

let tBodyCarrito = null;

let Actual_CardInput = 0;
let MetodoPago = {tipo: "invalido"};
//al iniciar la pagina
document.addEventListener("DOMContentLoaded", function (e) {
    selectedCurrency = document.querySelector('input[name="currency"]:checked').value;

    let currency_radios = document.getElementsByName('currency');
    for (const radio of currency_radios) {
        radio.parentElement.addEventListener('click', (e) => {
            selectedCurrency = radio.value
            // draw_cart_products(jsonCarrito.articles, tBodyCarrito)
            convert_currency_cart();
            calc_total()
        })
    }

    let err_envio_list = document.getElementsByClassName('envio-err');
    let select_envio = document.getElementsByClassName('envio-select')[0];
    select_envio.addEventListener('change', (e) => {
        for (const err_envio of err_envio_list) {
            
        }

        calc_total()
        comprobar_btn_comprar();
    })

    tBodyCarrito = document.getElementsByClassName('lista-producto')[0];

    getJSONData(CART_INFO_DESAFIATE_URL).then(function (resultObj) {
        if (resultObj.status === "ok") {
            jsonCarrito = resultObj.data;
            draw_cart_products(jsonCarrito.articles, tBodyCarrito)
        }
    });

    let datos_compra = document.getElementById('datos-compra');
    datos_compra.addEventListener('submit', (e) => {

        if (datos_completos) {
            /** @type {Article} - description */
            let productos = jsonCarrito.articles;
            let products_input = document.getElementsByClassName('input-cant-unidades')

            let compra = {}
            compra.articles = [];
            //listando prpductos
            for (let i = 0; i < jsonCarrito.articles.length; i++) {
                /** @type {Article} - description */
                let producto_Actual = productos[i];
                let producto_input_Actual = products_input[i];

                compra.articles[i] = {
                    name: producto_Actual.name,
                    src: producto_Actual.src,
                    unitCost: producto_Actual.unitCost,
                    currency: producto_Actual.currency,
                    count: producto_input_Actual.value,
                }
            }

            //datos de envio 
            compra.direccion = document.getElementById('input-direccion').value;
            compra.direccion2 = document.getElementById('input-direccion2').value;
            compra.pais = document.getElementById('input-pais').value;
            compra.ciudad = document.getElementById('input-ciudad').value;
            compra.codPostal = document.getElementById('input-codPostal').value;

            //tipo de envio
            compra.tipo_envio = document.getElementsByClassName('envio-select')[0].value;

            //datos del pago
            compra.cost_currency = selectedCurrency,
                compra.cost_sub_total = cost_sub_total,
                compra.cost_envio = cost_envio,
                compra.cost_total = cost_total,

                console.log(compra);

                $('#modal-compra').modal('show');
        }
        
        mostrar_errores();
        e.preventDefault();
    })

    input_envioSeleccionado =  document.getElementsByClassName('envio-select')[0];

    //les agrego un evento a todos los inputs para disparar la funcion comprobar_btn_comprar 
    //que habilitara el boton solo si estan todos los campos seleccionados y/o llenos
    input_direccion = document.getElementById('input-direccion');
    input_direccion.addEventListener('change', (e) => { comprobar_btn_comprar() });

    input_direccion2 = document.getElementById('input-direccion2');
    input_direccion2.addEventListener('change', (e) => { comprobar_btn_comprar() });

    input_pais = document.getElementById('input-pais');
    input_pais.addEventListener('change', (e) => { comprobar_btn_comprar() });

    input_ciudad = document.getElementById('input-ciudad');
    input_ciudad.addEventListener('change', (e) => { comprobar_btn_comprar() });

    input_codPostal = document.getElementById('input-codPostal');
    input_codPostal.addEventListener('change', (e) => { comprobar_btn_comprar() });

    Err_Existe_direccion    = document.getElementById('input-direccion-err');;
    Err_Existe_pais         = document.getElementById('input-pais-err');;
    Err_Existe_ciudad       = document.getElementById('input-ciudad-err');;
    Err_Existe_codPostal    = document.getElementById('input-codPostal-err');;
    
    //la primera vez lo activo forzosamente porque no hay todavia interaccion del usuario
    comprobar_btn_comprar();

    let modal_CreditCard_Numbers = document.querySelectorAll(".card-number")
    for (const inputNumber of modal_CreditCard_Numbers) {
        inputNumber.addEventListener('beforeinput', (e)=>{
            // console.log(e.data)
            if(e.data != null && esNumero(e.data) ){
                e.preventDefault();
            }

            if(e.data != null && e.target.value.length >= 3){
                // console.log("voy al siguiente")
                next_CardInput( modal_CreditCard_Numbers )

                e.preventDefault();

                if(e.target.value.length == 3){
                    e.target.value =  e.target.value + e.data;
                }
                
            }
        })

    }

    start_MetodoDePago();
});


//funciones

function esNumero(string) {
   return !Number.isInteger(parseInt(string))
}

function next_CardInput( inputList ) {
    //sumamos uno pero controlado
    Actual_CardInput = Actual_CardInput < inputList.length-1 ? Actual_CardInput +1 : inputList.length-1;
    select_CardInput(inputList, Actual_CardInput)
}

function select_CardInput(inputList, index){
    // console.log(inputList[index])
    inputList[index].focus();
    inputList[index].select();
}

/** - muestra los elementos del carrito en pantalla
 * 
 * @param {[Article]} listaProductos - lista de elementos de tipo Article, obtenidos del JSON
 * @param {HTMLElement} tBodyCarrito - tBody donde se renderizara la tabla de productos
 */
function draw_cart_products(listaProductos, tBodyCarrito) {
    tBodyCarrito.innerHTML = "";

    if (listaProductos != undefined) {
        if (listaProductos.length != 0 && listaProductos.length != undefined) {
            for (const producto of listaProductos) {
                draw_product(producto, tBodyCarrito)
            }
            calc_total()
        } else {
            mostrarErrorCarrito(tBodyCarrito)
        }
    } else {
        mostrarErrorCarrito(tBodyCarrito)
    }
}

/** - muestra el error de que no hay productos en el carrito
 * 
 * @param {HTMLElement} tBodyCarrito - tBody donde se renderizara la tabla de productos
 */
function mostrarErrorCarrito(tBodyCarrito) {
    tBodyCarrito.innerHTML =
        `<tr class="empty-list-mensage">
             <td colspan="5">no hay productos en el carrito</td> 
         </tr>`
}

/** - dibuja el elemento del carrito en pantalla
 * 
 * @param {Article} producto - elemento de tipo Article, obtenido del JSON
 * @param {HTMLElement} tBodyCarrito - tBody donde se renderizara la tabla de productos
 */
function draw_product(producto, tBodyCarrito) {

    let tr = document.createElement('tr')
    tr.classList.add("tr-producto")

    tr.innerHTML = `
        <td class="product-img"> <img src="${producto.src}" alt=""> </td> 
        <td> ${producto.name}</td>
        <td class=""> ${producto.currency} ${producto.unitCost}</td>
        <td class="cant-unidades"> 
            <input class="input-cant-unidades"type="number"
            name="cant-unidades" min="0" value="${producto.count}"> 
        </td>
        <td class="precio sub-total"> ${selectedCurrency} ${currency_convert((producto.unitCost * producto.count), producto.currency, selectedCurrency)} </td>
        <td> 
            <button type="button" class="close" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button> 
        </td>
    `;

    //busco el boton de borrar
    btn_borrar = tr.querySelector(".close");

    btn_borrar.addEventListener('click', ()=>{
        borrar_producto(producto);
        draw_cart_products(jsonCarrito.articles, tBodyCarrito)
    });

    //busco el input de cantidad de productos
    input_cant_unidades = tr.getElementsByClassName("input-cant-unidades")[0];

    //configuro que se cambie el subtotal al cambiar la cantidad de productos
    input_cant_unidades.addEventListener('change', (e) => {
        let subtotal = tr.getElementsByClassName("sub-total")[0];
        let newSubTotal = (producto.unitCost * e.target.value)
        let sonvertedSubTotal = currency_convert(newSubTotal, producto.currency, selectedCurrency);
        subtotal.textContent = selectedCurrency + " " + sonvertedSubTotal;
        calc_total();
    });

    tBodyCarrito.appendChild(tr);
}

function convert_currency_cart() {
    let productos = jsonCarrito.articles;
    let products_input = document.getElementsByClassName('input-cant-unidades')
    let products_sub_total = document.getElementsByClassName('sub-total')

    for (let i = 0; i < productos.length; i++) {
        let producto_Actual = productos[i];
        let producto_input_Actual = products_input[i];
        let products_sub_total_Actual = products_sub_total[i];

        let product_sub_total = (producto_Actual.unitCost * producto_input_Actual.value)
        let converted_product_sub_total = currency_convert(product_sub_total, producto_Actual.currency, selectedCurrency);
        products_sub_total_Actual.textContent = selectedCurrency + " " + converted_product_sub_total;

    }
}

/** - convierte entre dolar y pesos, el valor entrado por parametro con su unidad
 * 
 * @param {number} value - valor a convertir
 * @param {string} currency - unidad del precio entrado
 * @param {string} currencySelected - unidad objetivo
 * @returns {number} - valor convertido
 */
function currency_convert(value, currency, currencySelected) {
    if (currency != currencySelected) {
        if (currencySelected != "USD") {
            return (value * dolar);
        } else {
            return (value / dolar);
        }
    } else {
        return value;
    }
}

//calcula el precio total
function calc_total() {
    let productos = jsonCarrito.articles;
    let products_input = document.getElementsByClassName('input-cant-unidades')

    let sub_total = 0

    for (let i = 0; i < productos.length; i++) {
        let productoActual = productos[i];
        let producto_inputActual = products_input[i];

        let product_sub_total = (productoActual.unitCost * producto_inputActual.value)
        let converted_product_sub_total = currency_convert(product_sub_total, productoActual.currency, selectedCurrency);

        sub_total += converted_product_sub_total
    }

    //console.log( selectedCurrency + " " + sub_total)
    cost_sub_total = sub_total
    document.getElementsByClassName('cost-sub-total-txt')[0].textContent = selectedCurrency + " " + sub_total.toLocaleString();

    //busco el valor del envio
    slect_envio = document.getElementsByClassName('envio-select')[0].value
    let envio_porcentaje = envio[slect_envio];

    //calcula y muestra el envio
    cost_envio = (sub_total * envio_porcentaje)
    document.getElementsByClassName('cost-envio-txt')[0].textContent = selectedCurrency + " " + cost_envio.toLocaleString();


    //calcula y muestra el total
    cost_total = ((sub_total * envio_porcentaje) + sub_total);
    document.getElementsByClassName('cost-total-txt')[0].textContent = selectedCurrency + " " + cost_total.toLocaleString();

}

function comprobar_btn_comprar() {

    // console.log("comprobando boton comprar")

    Existe_direccion        = input_direccion.value.trim() != "";
    Existe_direccion2       = input_direccion2.value.trim() != "";
    Existe_pais             = input_pais.value.trim() != "";
    Existe_ciudad           = input_ciudad.value.trim() != "";
    Existe_codPostal        = input_codPostal.value.trim() != "";
    envioSeleccionado       = slect_envio != 0;
    metodoPagoSeleccionado  = MetodoPago.tipo != "invalido";

    if(Existe_direccion && Existe_pais &&  Existe_ciudad && Existe_codPostal && envioSeleccionado && metodoPagoSeleccionado){
        datos_completos = true;
        //document.getElementsByClassName("comprar-btn")[0].disabled = false;
    }else{
        datos_completos = false;
        //document.getElementsByClassName("comprar-btn")[0].disabled = true;  
    }

}

function  mostrar_errores() {


    if(!Existe_direccion){
        input_direccion.classList.add("is-invalid");
        input_direccion.classList.remove("is-valid");
    }else{
        input_direccion.classList.remove("is-invalid");
        input_direccion.classList.add("is-valid");
    }

    if(!Existe_pais){
        input_pais.classList.add("is-invalid");
        input_pais.classList.remove("is-valid");
    }else{
        input_pais.classList.remove("is-invalid");
        input_pais.classList.add("is-valid");
    }

    if(!Existe_ciudad){
        input_ciudad.classList.add("is-invalid");
        input_ciudad.classList.remove("is-valid");
    }else{
        input_ciudad.classList.remove("is-invalid");
        input_ciudad.classList.add("is-valid");
    }

    if(!Existe_codPostal){
        input_codPostal.classList.add("is-invalid");
        input_codPostal.classList.remove("is-valid");
    }else{
        input_codPostal.classList.remove("is-invalid");
        input_codPostal.classList.add("is-valid");
    }

    if(!envioSeleccionado){
        input_envioSeleccionado.classList.add("is-invalid");
        input_envioSeleccionado.classList.remove("is-valid");
    }else{
        input_envioSeleccionado.classList.remove("is-invalid");
        input_envioSeleccionado.classList.add("is-valid");
    }

    update_MetodoPago();
}

/** - Elimina el produicto pasado por parametro
 * 
 * @param {Article} producto - elemento de tipo Article, obtenido del JSON
 */
function borrar_producto(producto) {
    jsonCarrito.articles.splice( jsonCarrito.articles.indexOf(producto), 1)
}

function start_MetodoDePago() {
    let select_metodo_pago = document.querySelector('.pago-select');

    let list_forms = document.querySelectorAll('.opcion-pago');
    
    select_metodo_pago.addEventListener('change', (e)=>{
        if(select_metodo_pago.value != 'x'){
            select_metodo_pago.classList.remove('is-invalid')
        }else{
            if(!select_metodo_pago.classList.contains('is-invalid')){
                select_metodo_pago.classList.add('is-invalid');
            }
            
        }

        for(let i = 0; i<list_forms.length; i++){
            
            if( i == parseInt(select_metodo_pago.value) ){
                list_forms[i].className = "opcion-pago";
            }else{
                list_forms[i].className = "opcion-pago desactivado";
            }
        }

    });

    let btn_validar = document.getElementById('metodo-pago-validar');
    btn_validar.addEventListener('click', (e)=>{
        if(select_metodo_pago.value != 'x'){
            check_metodoPago(select_metodo_pago.value, list_forms);
        }else{
            console.log('metodo de pago no seleccionado')
        }
    })

}

function check_metodoPago(metodoSeleccionado, listaMetodosHTML) {
    selected_method_html = listaMetodosHTML[metodoSeleccionado];

    switch(parseInt(metodoSeleccionado)){
        case 0:
            console.log("metodo: tarjeta");
            if(check_metodo_tarjeta(selected_method_html)){
                console.log("el metodo es valido")
                $('#pagoModal').modal('hide');
            }else{
                console.log("el metodo NO es valido")
                MetodoPago = {};
                MetodoPago.tipo = "invalido";
            }
            break;

        case 1:
            console.log("metodo: banco")
            if(check_metodo_banco(selected_method_html)){
                console.log("el metodo es valido")
                $('#pagoModal').modal('hide');
            }else{
                console.log("el metodo NO es valido")
                MetodoPago = {};
                MetodoPago.tipo = "invalido";
            }
            break;
    }

    update_MetodoPago();
}

//comprueba los campos de el metodo Tarjeta
function check_metodo_tarjeta(selected_method_html) {
    let isInvalid = 0;

    MetodoPago = {};
    MetodoPago.tipo = "tarjeta";
    
    let input_nombre = document.getElementById('input-card-name');
    input_nombre.classList.toggle('is-invalid', (
        input_nombre.value.trim() == "" ||
        input_nombre.value == null
    ))
    isInvalid += input_nombre.classList.contains('is-invalid')? 1:0;
    MetodoPago.nombre = input_nombre.value.trim();

    let input_vencimiento = document.getElementById('input-card-expiration');
    input_vencimiento.classList.toggle('is-invalid', (
        input_vencimiento.value.trim() == "" ||
        input_vencimiento.value == null
    ))
    isInvalid += input_vencimiento.classList.contains('is-invalid')? 1:0;
    MetodoPago.vencimiento = input_vencimiento.value.trim();

    let input_code = document.getElementById('input-card-code');
    input_code.classList.toggle('is-invalid', (
        input_code.value.trim() == "" ||
        input_code.value == null
    ))
    isInvalid += input_code.classList.contains('is-invalid')? 1:0;
    MetodoPago.code = input_code.value.trim();

    let card_number_isValid = 0;
    let card_number_list = document.querySelectorAll('.card-number');
    MetodoPago.cardNumber = "";
    for (const card_number of card_number_list) {

        MetodoPago.cardNumber += card_number.value + "-";

        if(card_number.value.trim() == "" || card_number.value == null || card_number.value.trim().length != 4){
            card_number_isValid++;
            card_number.classList.toggle('is-invalid', true);
        }else{
            card_number.classList.toggle('is-invalid', false);
        }
    }
    MetodoPago.cardNumber = MetodoPago.cardNumber.substring(0, MetodoPago.cardNumber.length-1)

    let card_numbers_error = document.getElementById("input-input-card-number")
    card_numbers_error.classList.toggle('is-invalid', card_number_isValid>0)
    isInvalid += card_numbers_error.classList.contains('is-invalid')? 1:0;

    return isInvalid == 0;
}

//comprueba los campos de el metodo Banco
function check_metodo_banco(selected_method_html) {
    let isInvalid = 0;

    MetodoPago = {};
    MetodoPago.tipo = "banco";

    let input_nombre = document.getElementById('input-banco-titular-name');
    input_nombre.classList.toggle('is-invalid', (
        input_nombre.value.trim() == "" ||
        input_nombre.value == null
    ))
    isInvalid += input_nombre.classList.contains('is-invalid')? 1:0;
    MetodoPago.nombre = input_nombre.value.trim();

    let input_banco = document.getElementById('input-banco-name');
    input_banco.classList.toggle('is-invalid', (
        input_banco.value.trim() == "" ||
        input_banco.value == null
    ))
    isInvalid += input_banco.classList.contains('is-invalid')? 1:0;
    MetodoPago.banco = input_banco.value.trim();

    let input_banco_numero = document.getElementById('input-banco-numero');
    input_banco_numero.classList.toggle('is-invalid', (
        input_banco_numero.value.trim() == "" ||
        input_banco_numero.value == null
    ))
    isInvalid += input_banco_numero.classList.contains('is-invalid')? 1:0;
    MetodoPago.cuenta = input_banco_numero.value.trim();

    return isInvalid == 0;
}

function update_MetodoPago() {

    let error_html_element = document.getElementById('input-metodo-pago-ui-dummy')
    let tipo_pago = document.getElementById('input-metodo-pago-ui')
    
    
    if(MetodoPago.tipo == "invalido"){
        error_html_element.classList.toggle('is-invalid', true);
        tipo_pago.classList.toggle('is-valid', false);
        tipo_pago.classList.toggle('is-invalid', true);
        tipo_pago.textContent = "Ninguno"
        
    }else{
        error_html_element.classList.toggle('is-invalid', false);
        tipo_pago.classList.toggle('is-invalid', false);
        tipo_pago.classList.toggle('is-valid', true);

        switch(MetodoPago.tipo){
            case "tarjeta":
                tipo_pago.textContent = "Tarjeta terminada en " + MetodoPago.cardNumber.split('-')[3];
                break; 

            case "banco":

                let extra = "";

                if(MetodoPago.cuenta.length >4){
                    const fullNumber = MetodoPago.cuenta;
                    const last4Digits = fullNumber.slice(-4);
                    const maskedNumber = last4Digits.padStart(fullNumber.length, 'x');
                    extra = " (Nº " + maskedNumber + ")";
                    
                }
                

                tipo_pago.textContent = "Cuenta de " + MetodoPago.banco + extra;
                break;
        }
    }

    comprobar_btn_comprar()

}