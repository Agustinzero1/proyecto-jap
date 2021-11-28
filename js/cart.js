/** comentarios */

/** - tipo de objeto Article
 * @typedef {Object} Article - Objeto con datos detallados de un producto tipo Article del JSON
 * @property {number} count - cantidad de unidades del producto
 * @property {string} currency - unidad del costo del producto ej "USD", "UYU"
 * @property {string} name - Nombre del producto
 * @property {string} src - link de la imagen del producto para mostrar
 * @property {number} unitCost - costo del producto
 */

let blockClose = false;

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
let input_metodoPago;

let datos_completos = false;

let tBodyCarrito = null;

let Actual_CardInput = 0;
let MetodoPago = {tipo: "invalido"};

let datosCompra = {}
//al iniciar la pagina
document.addEventListener("DOMContentLoaded", function (e) {

    input_direccion         = document.querySelector("#input-direccion");
    input_direccion2        = document.querySelector("#input-direccion2");
    input_pais              = document.querySelector("#input-pais");
    input_ciudad            = document.querySelector("#input-ciudad");
    input_codPostal         = document.querySelector("#input-codPostal");
    input_envioSeleccionado = document.querySelector('.envio-select');
    input_metodoPago        = document.querySelector('#input-metodo-pago-ui-dummy');
    input_metodoPagoUI      = document.querySelector('#input-metodo-pago-ui');

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
        return false; 
        e.preventDefault();
    })

    let btn_salir = document.getElementById('btn-salir');
    btn_salir.addEventListener('click', (e)=>{
        blockClose = false;
    })

    let btn_datos_compra = document.getElementById('btn-comprar-id');
    btn_datos_compra.addEventListener('click', (e) => {
        e.preventDefault();
        if (check_form_inputs() == 0) {

            //los contadores de cantidad de unidades de los productos
            let products_input = document.querySelectorAll('.input-cant-unidades');

            datosCompra = {};
            datosCompra.articles = [];

            //listando prpductos
            for (let i = 0; i < jsonCarrito.articles.length; i++) {
                /** @type {Article} - description */
                let producto_Actual = jsonCarrito.articles[i];
                let producto_input_Actual = products_input[i];

                datosCompra.articles[i] = {
                    
                    name: producto_Actual.name,
                    src: producto_Actual.src,
                    unitCost: convert_currency(producto_Actual.unitCost, producto_Actual.currency, selectedCurrency),

                    currency: selectedCurrency,

                    count: producto_input_Actual.value,

                }
            }

            //datos de envio 
            datosCompra.datosEnvio = {};
            datosCompra.datosEnvio.direccion = input_direccion.value;
            datosCompra.datosEnvio.direccion2 = input_direccion2.value;
            datosCompra.datosEnvio.pais = input_pais.value;
            datosCompra.datosEnvio.ciudad = input_ciudad.value;
            datosCompra.datosEnvio.codPostal = input_codPostal.value;

            //datos de los costos
            datosCompra.datosCosto = {};
            datosCompra.datosCosto.cost_currency = selectedCurrency;
            datosCompra.datosCosto.cost_sub_total = cost_sub_total;
            datosCompra.datosCosto.cost_envio = cost_envio;
            datosCompra.datosCosto.cost_total = cost_total;

            //datos de pago
            datosCompra.MetodoPago = MetodoPago;

            //tipo de envio
            datosCompra.tipo_envio = input_envioSeleccionado.value;

            console.log(datosCompra);
            llenarDatosCompra();

            $('#modal-compra').modal('show');

            blockClose = true;
            fetch(CART_BUY_URL,
                {
                    method: "POST",
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(datosCompra)
                })
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    console.log("post completo")
                   
                    //esto fue necesario porque por algun motivo el post me recarga la pagina
                    alert('compra realizada con exito')
                    
                    
            })

        }
        
        console.log("fin de evento click completo")
    });

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

 
    window.addEventListener("beforeunload", function (e) {
        if(blockClose){
            e.returnValue = "\o/";
        }else{
            e.preventDefault();
        }
        
    });

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

/** - chequea todos los elementos del form para saber si todos los datos estan bien, antes de confirmar la compra*/
function check_form_inputs() {
    let errores = 0;

    errores += check_empty_input(input_direccion)
    errores += check_empty_input(input_pais)
    errores += check_empty_input(input_ciudad)
    errores += check_empty_input(input_codPostal)

    errores += check_empty_radio(input_envioSeleccionado)

    errores += check_empty_metodoPago(input_metodoPago, input_metodoPagoUI)
    
    return errores;
}

/** - Chequea un input de tipo texto para saber si esta vacio, returnando 1 o 0 y colocando las clases de bootstrap
 * @param {HTMLElement} HTMLElement - elemento html del input a testear
 */
function check_empty_input(HTMLElement) {

    let is_invalid = HTMLElement.value.trim() == "";

    HTMLElement.classList.toggle('is-invalid', is_invalid);
    HTMLElement.classList.toggle('is-valid', !is_invalid);
    
    return is_invalid? 1 : 0;
}

/** - Chequea un input de tipo Radio para saber si esta seleccionado, returnando 1 o 0 y colocando las clases de bootstrap
 * @param {HTMLElement} HTMLElement - elemento html del input Radio a testear
 */
 function check_empty_radio(HTMLElement) {
    
    let is_invalid = HTMLElement.value.trim() == 0;

    HTMLElement.classList.toggle('is-invalid', is_invalid);
    HTMLElement.classList.toggle('is-valid', !is_invalid);
    
    return is_invalid? 1 : 0;

}

/** - Chequea un input de metodo de pago para saber si se configuro y returnando 1 o 0 y colocando las clases de bootstrap
 * @param {HTMLElement} HTMLElement - elemento html donde estan los datos del metodo de pago a testear
 */
 function check_empty_metodoPago(HTMLElement, HTMLElement2) {
    
    let is_invalid = MetodoPago.tipo == "invalido";

    HTMLElement.classList.toggle('is-invalid', is_invalid);
    HTMLElement.classList.toggle('is-valid', !is_invalid);
    
    HTMLElement2.classList.toggle('is-invalid', is_invalid);
    HTMLElement2.classList.toggle('is-valid', !is_invalid);

    return is_invalid? 1 : 0;
}

/** - Elimina el produicto pasado por parametro
 * 
 * @param {Article} producto - elemento de tipo Article, obtenido del JSON
 */
function borrar_producto(producto) {
    jsonCarrito.articles.splice( jsonCarrito.articles.indexOf(producto), 1)
}

/** - inicializa el sistema del metodo de pago con los eventos y comprobaciones necesarias*/
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
                $('#pagoModal').modal('hide');
            }else{
                MetodoPago = {};
                MetodoPago.tipo = "invalido";
            }
            break;

        case 1:
            console.log("metodo: banco")
            if(check_metodo_banco(selected_method_html)){
                $('#pagoModal').modal('hide');
            }else{
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

}

/** - convierte automaticamente de dolares a pesos segun los parametros
 * 
 * @param {*} ValueToConvert - numero a convertir
 * @param {*} FromCurrency - currency original
 * @param {*} ToCurrency - currency a la que se va a comvertir
 * @returns
 */
function convert_currency(ValueToConvert, FromCurrency, ToCurrency) {
    
    if(FromCurrency != ToCurrency){
        if(FromCurrency == "UYU" && ToCurrency == "USD"){
            return ValueToConvert / dolar;
        }

        if(FromCurrency == "USD" && ToCurrency == "UYU"){
            return ValueToConvert * dolar;
        }
    }

    return ValueToConvert;
    
}

function llenarDatosCompra() {

    let factura_table_tbody = document.querySelector('#factura-table-tbody');

    for (const producto of datosCompra.articles) {
        let tr = document.createElement('tr');

        tr.innerHTML = `
        <td>${producto.name}</td>
        <td>${producto.currency} ${producto.unitCost}</td>
        <td>${producto.count}</td>
        <td>${producto.currency} ${producto.unitCost * producto.count}</td>
        `

        factura_table_tbody.appendChild(tr);
    }

    //Pago
    let factura_pago_moneda      = document.querySelector('#factura-pago-moneda');
    let factura_pago_subTotal    = document.querySelector('#factura-pago-subTotal');
    let factura_pago_costoEnvio  = document.querySelector('#factura-pago-costoEnvio');
    let factura_pago_costoTotal  = document.querySelector('#factura-pago-costoTotal');

    factura_pago_moneda.textContent     = (datosCompra.datosCosto.cost_currency == "USD"? "Dolar Estadounidense" : "Pesos Uruguayos");
    factura_pago_subTotal.textContent   = datosCompra.datosCosto.cost_currency + " " + datosCompra.datosCosto.cost_sub_total
    factura_pago_costoEnvio.textContent = datosCompra.datosCosto.cost_currency + " " + datosCompra.datosCosto.cost_envio
    factura_pago_costoTotal.textContent = datosCompra.datosCosto.cost_currency + " " + datosCompra.datosCosto.cost_total

    //Envio
    let factura_envio_direccion  = document.querySelector('#factura-envio-direccion');
    let factura_envio_direccion2 = document.querySelector('#factura-envio-direccion2');
    let factura_envio_pais       = document.querySelector('#factura-envio-pais');
    let factura_envio_codPostal  = document.querySelector('#factura-envio-codPostal');
    let factura_envio_tipo_envio = document.querySelector('#factura-envio-tipo-envio');

    let envios = [
        "Envio Invalido",
        "Premium (2-5 días / costo 15%)",
        "Express (5-8 días / Costo 7%)",
        "Standard (12 a 15 días / Costo 5%)"
    ]

    factura_envio_direccion.textContent  = datosCompra.datosEnvio.direccion;
    factura_envio_direccion2.textContent = datosCompra.datosEnvio.direccion2;
    factura_envio_pais.textContent       = datosCompra.datosEnvio.pais;
    factura_envio_codPostal.textContent  = datosCompra.datosEnvio.codPostal;
    factura_envio_tipo_envio.textContent = envios[datosCompra.tipo_envio];

    //Metodo Pago Banco
    let factura_metodo_pago_titular = document.querySelector('#factura-metodo-pago-titular');
    let factura_metodo_pago_banco   = document.querySelector('#factura-metodo-pago-banco');
    let factura_metodo_pago_cuenta  = document.querySelector('#factura-metodo-pago-cuenta');

    //Metodo Pago Tarjeta
    let factura_metodo_pago_nombre = document.querySelector('#factura-metodo-pago-nombre');
    let factura_metodo_pago_numero = document.querySelector('#factura-metodo-pago-numero');

    let datos_metodo_pago_banco_titulo   = document.querySelector('#datos-metodo-pago-banco-titulo');
    let datos_metodo_pago_tarjeta_titulo = document.querySelector('#datos-metodo-pago-tarjeta-titulo');
    let datos_metodo_pago_banco   = document.querySelector('#datos-metodo-pago-banco');
    let datos_metodo_pago_tarjeta = document.querySelector('#datos-metodo-pago-tarjeta');

    if(datosCompra.MetodoPago.tipo == "banco"){
        //Enciendo el bloque de banco
        datos_metodo_pago_banco_titulo.className = "text-muted";
        datos_metodo_pago_banco.className = "table table-striped";
        
        //Apago el bloque de targeta
        datos_metodo_pago_tarjeta_titulo.className = "text-muted d-none";
        datos_metodo_pago_tarjeta.className = "table table-striped d-none";

        factura_metodo_pago_titular.textContent = datosCompra.MetodoPago.nombre
        factura_metodo_pago_banco.textContent = datosCompra.MetodoPago.banco
        factura_metodo_pago_cuenta.textContent = datosCompra.MetodoPago.cuenta
    }else{
        //Enciendo el bloque de targeta
        datos_metodo_pago_tarjeta_titulo.className = "text-muted";
        datos_metodo_pago_tarjeta.className = "table table-striped";

        //Apago el bloque de banco
        datos_metodo_pago_banco_titulo.className = "text-muted d-none";
        datos_metodo_pago_banco.className = "table table-striped d-none";

        factura_metodo_pago_nombre.textContent = datosCompra.MetodoPago.nombre
        factura_metodo_pago_numero.textContent = datosCompra.MetodoPago.cardNumber
    }


}
