/** - esto son los tipos de ordenamientos disponibles en un solo enum object */
const ORDER = {
	ASC_BY_NAME: "AZ", 
	DESC_BY_NAME: "ZA",
	ASC_BY_PROD_SOLD_COUNT: "COUNT_ASC",
	DESC_BY_PROD_SOLD_COUNT: "COUNT_DESC",
    ASC_BY_PROD_PRICE: "PRICE_ASC",
    DESC_BY_PROD_PRICE: "PRICE_DESC",
}
var currentProductsArray = [];
var currentSortCriteria = undefined;
var minPrice = undefined;
var maxPrice = undefined;
var searchText = undefined;

/** - busca el json los valores de los productos y sus nombres y los usa para crear una lista de opciones rapidas en los filtros y busquedas
 * @param {[]} array - lista de productos para calcular los rangos de precios y los nombres para las busquedas rapidas
 */
function calculate_recomended_values(array){
    let listByName = sortProducts(ORDER.ASC_BY_NAME, array)
    for(let i = 0; i < listByName.length; i++){
        document.getElementById('busquedas_recomendados').innerHTML += `<option value="${listByName[i].name}">`
    }

    let listByPrice = sortProducts(ORDER.ASC_BY_PROD_PRICE, array)
    for(let i = 0; i < listByPrice.length; i++){
        document.getElementById('valores_recomendados').innerHTML += `<option value="${listByPrice[i].cost}">`
    }
}

/** - ordena la lista de elementos pasada por parametros con los criterios elegidos
 * @param {ORDER} criteria - criterio para ordenar los elementos
 * @param {[object]} array - lista de elementos a ordenar
 * @returns {[object]} - lista de elementos ordenados
 */
function sortProducts(criteria, array){
    let result = [];

    switch(criteria){
        case ORDER.ASC_BY_NAME:
            result = array.sort(function(a, b) {
                if ( a.name < b.name ){ return -1; }
                if ( a.name > b.name ){ return 1; }
                return 0;
            });
            break;

        case ORDER.DESC_BY_NAME:
            result = array.sort(function(a, b) {
                if ( a.name > b.name ){ return -1; }
                if ( a.name < b.name ){ return 1; }
                return 0;
            });
            break;

        case ORDER.ASC_BY_PROD_SOLD_COUNT:
            result = array.sort(function(a, b) {
                if ( a.soldCount > b.soldCount ){ return -1; }
                if ( a.soldCount < b.soldCount ){ return 1; }
                return 0;
            });
            break;

        case ORDER.DESC_BY_PROD_SOLD_COUNT:
            result = array.sort(function(a, b) {
                if ( a.soldCount < b.soldCount ){ return -1; }
                if ( a.soldCount > b.soldCount ){ return 1; }
                return 0;
            });
            break;

        case ORDER.ASC_BY_PROD_PRICE:
            result = array.sort(function(a, b) {
                if ( a.cost > b.cost ){ return -1; }
                if ( a.cost < b.cost ){ return 1; }
                return 0;
            });
            break;

        case ORDER.DESC_BY_PROD_PRICE:
            result = array.sort(function(a, b) {
                if ( a.cost < b.cost ){ return -1; }
                if ( a.cost > b.cost ){ return 1; }
                return 0;
            });
            break;
    }

    return result;
}

/** - muestra la lista de productos en la pagina, teniendo en cuetna la busqueda y al filtrado de precio
 * 
 */
function showProductsList(){

    let htmlContentToAppend = "";
    for(let i = 0; i < currentProductsArray.length; i++){
        let product = currentProductsArray[i];

        if (((minPrice == undefined) || (minPrice != undefined && parseInt(product.cost) >= minPrice)) &&
            ((maxPrice == undefined) || (maxPrice != undefined && parseInt(product.cost) <= maxPrice))){

            if(searchText == undefined || (searchText != undefined && product.name.toLowerCase().indexOf(searchText) != -1 ) || (searchText != undefined && product.description.toLowerCase().indexOf(searchText) != -1 )){
                htmlContentToAppend += 
                `<a href="product-info.html" class="card mb-4 custom-card custome-prod-card" ondragstart="return false;" ondrop="return false;">
                    
                    <div class="card-top-img">
                        <img class="" src="${product.imgSrc}" alt="${product.description}">
                    </div>
                    
                    <div class="card-body d-flex flex-column">
                        <h4 class="card-title text-success font-weight-bold prod-price-text">${product.currency} ${product.cost.toLocaleString()}</h4>
                        <h5 class="card-title font-weight-normal text-truncate">${product.name}</h5>
                        <p class="card-text fade-text-truncate" >${product.description}</p>
                        <p class="card-text bottom-text"><small class="text-muted">${product.soldCount} vendidos</small></p>
                    </div>
                
                </a>`
                
            }
            

        }

        document.getElementById("prod-list-container").innerHTML = htmlContentToAppend;
    }
}

/** - muestra los productos y los ordena al mismo tiempo
 * @param {ORDER} sortCriteria - el criterio de ordenamietno que se va a utilizar
 * @param {[object]} productsArray - la lista de productos que se va a ordenar y mostrar
 */
function sortAndShowProducts(sortCriteria, productsArray){
    currentSortCriteria = sortCriteria;

    if(productsArray != undefined){
        currentProductsArray = productsArray;
    }

    currentProductsArray = sortProducts(currentSortCriteria, currentProductsArray);

    //Muestro los productos ordenadas
    showProductsList();
}

/** - esto sirve para disparar la busqueda, se llama desde el evento que genera el search
 * 
 */
function search_input_activate(){
    searchText =  document.getElementById("search_input").value.toLowerCase();
    if(searchText == ""){
        searchText = undefined;
    }
    
    showProductsList();
}

/** - crea la estructura de event listener, para hacer mas corto el codigo
 * @param {string} id - identificador a colocarle un event listener
 * @param {string} event - evento a escuchar
 * @param {()} Callback - funcion que se va a disparar
 * @return {Event} el evento resultante
 */
function addEvent(id, event, Callback){
    return document.getElementById(id).addEventListener(event, function(e){
        Callback(e);
    });
}

//Función que se ejecuta una vez que se haya cargado la pagina completa
document.addEventListener("DOMContentLoaded", function (e) {
    getJSONData(PRODUCTS_URL).then(function(resultObj){
        if (resultObj.status === "ok"){
            //console.log(resultObj.data) //debug json
            calculate_recomended_values(resultObj.data);
            sortAndShowProducts(ORDER.ASC_BY_NAME, resultObj.data);
        }
    });

    addEvent("sortAsc", "click", function(e){ 
        sortAndShowProducts(ORDER.ASC_BY_NAME) 
    });

    addEvent("sortDesc", "click", function(e){ 
        sortAndShowProducts(ORDER.DESC_BY_NAME) 
    });

    addEvent("sortByPrice", "click", function(e){
         sortAndShowProducts(ORDER.ASC_BY_PROD_PRICE)
    });

    addEvent("sortByPriceReverse", "click", function(e){ 
        sortAndShowProducts(ORDER.DESC_BY_PROD_PRICE) 
    });

    addEvent("sortByRelevant", "click", function(e){ 
        sortAndShowProducts(ORDER.ASC_BY_PROD_SOLD_COUNT) 
    });

    addEvent("sortByRelevantReverse", "click", function(e){ 
        sortAndShowProducts(ORDER.DESC_BY_PROD_SOLD_COUNT) 
    });

    addEvent("clearRangeFilter", "click", function(){
        document.getElementById("rangeFilterPriceMin").value = "";
        document.getElementById("rangeFilterPriceMax").value = "";

        minPrice = undefined; 
        maxPrice = undefined;

        showProductsList();
    });

    addEvent("rangeFilterPrice", "click", function(){
        //tratare de determinar si el rango ingresado es valido
        minPrice = document.getElementById("rangeFilterPriceMin").value;
        maxPrice = document.getElementById("rangeFilterPriceMax").value;

        minPrice = (minPrice != undefined) && (minPrice != "") && (parseInt(minPrice)) >= 0 ? parseInt(minPrice) : undefined;
        maxPrice = (maxPrice != undefined) && (maxPrice != "") && (parseInt(maxPrice)) >= 0 ? parseInt(maxPrice) : undefined;

        showProductsList();
    });

    addEvent("search_input", "keyup", function(e){
        search_input_activate()
    });

    //#region estos 2 eventos son para las plataformas que no lanzan el evento keyup, por ejemplo android
    addEvent("search_input", "search", function(e){
        search_input_activate()
    });

    addEvent("search_button", "click", function(e){
        search_input_activate();
    });
    //#endregion

});

