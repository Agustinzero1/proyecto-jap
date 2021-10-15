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


const envio = [0,   0.15,   0.07,   0.05,];

//al iniciar la pagina
document.addEventListener("DOMContentLoaded", function(e){
    selectedCurrency = document.querySelector('input[name="currency"]:checked').value;
    
    let currency_radios = document.getElementsByName('currency');
    for (const radio of currency_radios) {
        radio.parentElement.addEventListener('click', (e)=>{
            selectedCurrency = radio.value 
            // draw_cart_products(jsonCarrito.articles, tBodyCarrito)
            convert_currency_cart();
            calc_total()
        })
    }

    let err_envio_list = document.getElementsByClassName('envio-err');
    let select_envio = document.getElementsByClassName('envio-select')[0];
    select_envio.addEventListener('change', (e)=>{
            for (const err_envio of err_envio_list) {
                err_envio.classList.remove('d-block');
            }
            
            document.getElementById('envio-' + select_envio.value ).classList.add('d-block')
            calc_total()
    })

    let tBodyCarrito = document.getElementsByClassName('lista-producto')[0];

    getJSONData(CART_INFO_DESAFIATE_URL).then(function(resultObj){
        if (resultObj.status === "ok"){
            jsonCarrito = resultObj.data;
            draw_cart_products(jsonCarrito.articles, tBodyCarrito)
        }
    });

    let datos_compra = document.getElementById('datos-compra');
    datos_compra.addEventListener('submit', (e)=>{
        
        /** @type {Article} - description */
        let productos = jsonCarrito.articles;
        let products_input = document.getElementsByClassName('input-cant-unidades')

        let compra = {}
        compra.articles = [];
        //listando prpductos
        for( let i = 0; i < jsonCarrito.articles.length; i++){
            /** @type {Article} - description */
            let producto_Actual = productos[i];
            let producto_input_Actual = products_input[i];

            compra.articles[i] = {
                name : producto_Actual.name,
                src : producto_Actual.src,
                unitCost : producto_Actual.unitCost,
                currency : producto_Actual.currency,
                count : producto_input_Actual.value,
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

        e.preventDefault();
    })

});

//funciones

/** - muestra los elementos del carrito en pantalla
 * 
 * @param {[Article]} listaProductos - lista de elementos de tipo Article, obtenidos del JSON
 * @param {HTMLElement} tBodyCarrito - tBody donde se renderizara la tabla de productos
 */
function draw_cart_products(listaProductos, tBodyCarrito) {
    if(listaProductos != undefined){
        if(listaProductos.length != 0 && listaProductos.length != undefined){
            for (const producto of listaProductos) {
                draw_product( producto, tBodyCarrito )
            }
            calc_total()
        }else{
            mostrarErrorCarrito(tBodyCarrito)
        }
    }else{
        mostrarErrorCarrito(tBodyCarrito)
    }
}

/** - muestra el error de que no hay productos en el carrito
 * 
 * @param {HTMLElement} tBodyCarrito - tBody donde se renderizara la tabla de productos
 */
function mostrarErrorCarrito(tBodyCarrito){
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

    tr.innerHTML= `
        <td class="product-img"> <img src="${producto.src}" alt=""> </td> 
        <td> ${producto.name}</td>
        <td class=""> ${producto.currency} ${producto.unitCost}</td>
        <td class="cant-unidades"> 
            <input class="input-cant-unidades"type="number"
            name="cant-unidades" min="0" value="${producto.count}"> 
        </td>
        <td class="precio sub-total"> ${selectedCurrency} ${ currency_convert( (producto.unitCost * producto.count) , producto.currency, selectedCurrency) } </td>
    `;

    //busco el input de cantidad de productos
    input_cant_unidades = tr.getElementsByClassName("input-cant-unidades")[0];

    //configuro que se cambie el subtotal al cambiar la cantidad de productos
    input_cant_unidades.addEventListener('change',(e)=>{
        let subtotal = tr.getElementsByClassName("sub-total")[0];
        let newSubTotal = (producto.unitCost * e.target.value)
        let sonvertedSubTotal = currency_convert( newSubTotal, producto.currency, selectedCurrency);
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
        let converted_product_sub_total = currency_convert( product_sub_total, producto_Actual.currency, selectedCurrency);
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
function currency_convert(value, currency, currencySelected){
    if(currency != currencySelected){
        if ( currencySelected != "USD" ){
            return (value * dolar);
        }else{
            return (value / dolar);
        }
    }else{
        return value;
    }
}

function calc_total() {
    let productos = jsonCarrito.articles;
    let products_input = document.getElementsByClassName('input-cant-unidades')

    let sub_total = 0

    for (let i = 0; i < productos.length; i++) {
        let productoActual = productos[i];
        let producto_inputActual = products_input[i];

        let product_sub_total = (productoActual.unitCost * producto_inputActual.value)
        let converted_product_sub_total = currency_convert( product_sub_total, productoActual.currency, selectedCurrency);
        
        sub_total += converted_product_sub_total
    }

    //console.log( selectedCurrency + " " + sub_total)
    cost_sub_total = sub_total
    document.getElementsByClassName('cost-sub-total-txt')[0].textContent = selectedCurrency + " " + sub_total.toLocaleString();
    
    //busco el valor del envio
    let slect_envio = document.getElementsByClassName('envio-select')[0]
    let envio_porcentaje = envio[slect_envio.value];

    //activa o desactiva el boton
    document.getElementsByClassName("comprar-btn")[0].disabled = (slect_envio.value == 0)

    
    //calcula y muestra el envio
    cost_envio = (sub_total * envio_porcentaje)
    document.getElementsByClassName('cost-envio-txt')[0].textContent = selectedCurrency + " " + cost_envio.toLocaleString();
    
    
    //calcula y muestra el total
    cost_total = ((sub_total * envio_porcentaje) + sub_total);
    document.getElementsByClassName('cost-total-txt')[0].textContent = selectedCurrency + " " + cost_total.toLocaleString();

}