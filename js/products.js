const ORDER_ASC_BY_NAME = "AZ";
const ORDER_DESC_BY_NAME = "ZA";
const ORDER_BY_PROD_SOLD_COUNT = "SoldCount";
const ORDER_BY_PROD_SOLD_COUNT_REVERSE = "SoldCount_Reverse";
const ORDER_BY_PROD_PRICE = "Price";
const ORDER_BY_PROD_PRICE_REVERSE = "Price_Reverse";
var currentProductsArray = [];
var currentSortCriteria = undefined;
var minPrice = undefined;
var maxPrice = undefined;

function sortProducts(criteria, array){
    let result = [];

    switch(criteria){
        case ORDER_ASC_BY_NAME:
            result = array.sort(function(a, b) {
                if ( a.name < b.name ){ return -1; }
                if ( a.name > b.name ){ return 1; }
                return 0;
            });
            break;

        case ORDER_DESC_BY_NAME:
            result = array.sort(function(a, b) {
                if ( a.name > b.name ){ return -1; }
                if ( a.name < b.name ){ return 1; }
                return 0;
            });
            break;

        case ORDER_BY_PROD_SOLD_COUNT:
            result = array.sort(function(a, b) {
                if ( a.soldCount > b.soldCount ){ return -1; }
                if ( a.soldCount < b.soldCount ){ return 1; }
                return 0;
            });
            break;

        case ORDER_BY_PROD_SOLD_COUNT_REVERSE:
            result = array.sort(function(a, b) {
                if ( a.soldCount < b.soldCount ){ return -1; }
                if ( a.soldCount > b.soldCount ){ return 1; }
                return 0;
            });
            break;

        case ORDER_BY_PROD_PRICE:
            result = array.sort(function(a, b) {
                if ( a.cost > b.cost ){ return -1; }
                if ( a.cost < b.cost ){ return 1; }
                return 0;
            });
            break;

        case ORDER_BY_PROD_PRICE_REVERSE:
            result = array.sort(function(a, b) {
                if ( a.cost < b.cost ){ return -1; }
                if ( a.cost > b.cost ){ return 1; }
                return 0;
            });
            break;
    }

    return result;
}

function showProductsList(){

    let htmlContentToAppend = "";
    for(let i = 0; i < currentProductsArray.length; i++){
        let product = currentProductsArray[i];

        if (((minPrice == undefined) || (minPrice != undefined && parseInt(product.cost) >= minPrice)) &&
            ((maxPrice == undefined) || (maxPrice != undefined && parseInt(product.cost) <= maxPrice))){

            htmlContentToAppend += 
            `<a href="product-info.html" class="card mb-4 custom-card custome-prod-card" ondragstart="return false;" ondrop="return false;">
                
                <img class="card-img-top" src="${product.imgSrc}" alt="${product.description}">
                
                <div class="card-body d-flex flex-column">
                    <h4 class="card-title text-success font-weight-bold prod-price-text">${product.currency} ${product.cost.toLocaleString()}</h4>
                    <h5 class="card-title font-weight-normal text-truncate">${product.name}</h5>
                    <p class="card-text fade-text-truncate" >${product.description}</p>
                    <p class="card-text bottom-text"><small class="text-muted">${product.soldCount} vendidos</small></p>
                </div>
            
            </a>`
        }
        
        document.getElementById("prod-list-container").innerHTML = htmlContentToAppend;
    }
}

function sortAndShowProducts(sortCriteria, productsArray){
    currentSortCriteria = sortCriteria;

    if(productsArray != undefined){
        currentProductsArray = productsArray;
    }

    currentProductsArray = sortProducts(currentSortCriteria, currentProductsArray);

    //Muestro los productos ordenadas
    showProductsList();
}


//Función que se ejecuta una vez que se haya lanzado el evento de
//que el documento se encuentra cargado, es decir, se encuentran todos los
//elementos HTML presentes.
document.addEventListener("DOMContentLoaded", function (e) {
    getJSONData(PRODUCTS_URL).then(function(resultObj){
        if (resultObj.status === "ok"){
            console.log(resultObj.data) //debug json
            sortAndShowProducts(ORDER_ASC_BY_NAME, resultObj.data);
        }
    });

    document.getElementById("sortAsc").addEventListener("click", function(){
        sortAndShowProducts(ORDER_ASC_BY_NAME);
    });

    document.getElementById("sortDesc").addEventListener("click", function(){
        sortAndShowProducts(ORDER_DESC_BY_NAME);
    });

    document.getElementById("sortByPrice").addEventListener("click", function(){
        sortAndShowProducts(ORDER_BY_PROD_PRICE);
    });

    document.getElementById("sortByPriceReverse").addEventListener("click", function(){
        sortAndShowProducts(ORDER_BY_PROD_PRICE_REVERSE);
    });

    document.getElementById("sortByRelevant").addEventListener("click", function(){
        sortAndShowProducts(ORDER_BY_PROD_SOLD_COUNT);
    });

    document.getElementById("sortByRelevantReverse").addEventListener("click", function(){
        sortAndShowProducts(ORDER_BY_PROD_SOLD_COUNT_REVERSE);
    });

    document.getElementById("clearRangeFilter").addEventListener("click", function(){
        document.getElementById("rangeFilterPriceMin").value = "";
        document.getElementById("rangeFilterPriceMax").value = "";

        minPrice = undefined;
        maxPrice = undefined;

        showProductsList();
    });

    document.getElementById("rangeFilterPrice").addEventListener("click", function(){
        //Obtengo el mínimo y máximo de los intervalos para filtrar por cantidad
        //de productos por categoría.
        minPrice = document.getElementById("rangeFilterPriceMin").value;
        maxPrice = document.getElementById("rangeFilterPriceMax").value;

        if ((minPrice != undefined) && (minPrice != "") && (parseInt(minPrice)) >= 0){
            minPrice = parseInt(minPrice);
        }
        else{
            minPrice = undefined;
        }

        if ((maxPrice != undefined) && (maxPrice != "") && (parseInt(maxPrice)) >= 0){
            maxPrice = parseInt(maxPrice);
        }
        else{
            maxPrice = undefined;
        }

        showProductsList();
    });

});