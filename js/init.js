// const CATEGORIES_URL = "https://japdevdep.github.io/ecommerce-api/category/all.json";
// const PUBLISH_PRODUCT_URL = "https://japdevdep.github.io/ecommerce-api/product/publish.json";
// const CATEGORY_INFO_URL = "https://japdevdep.github.io/ecommerce-api/category/1234.json";
// const PRODUCTS_URL = "https://japdevdep.github.io/ecommerce-api/product/all.json";
// const PRODUCT_INFO_URL = "https://japdevdep.github.io/ecommerce-api/product/5678.json";
// const PRODUCT_INFO_COMMENTS_URL = "https://japdevdep.github.io/ecommerce-api/product/5678-comments.json";
// const CART_INFO_URL = "https://japdevdep.github.io/ecommerce-api/cart/987.json";
// const CART_INFO_DESAFIATE_URL = "https://japdevdep.github.io/ecommerce-api/cart/654.json";
// const CART_BUY_URL = "https://japdevdep.github.io/ecommerce-api/cart/buy.json";

//mi api
const API = "http://localhost:3000/"
const CATEGORIES_URL            = API + "category";
const PUBLISH_PRODUCT_URL       = API + "publicar-producto";
const CATEGORY_INFO_URL         = API + "category/info";
const PRODUCTS_URL              = API + "productos";
const PRODUCT_INFO_URL          = API + "productos/info";
const PRODUCT_INFO_COMMENTS_URL = API + "productos/info/comments";
const CART_INFO_URL             = API + "cart/info";
const CART_INFO_DESAFIATE_URL   = API + "cart/info/desafiate";
const CART_BUY_URL              = API + "comprar";

var showSpinner = function(){
  document.getElementById("spinner-wrapper").style.display = "block";
}

var hideSpinner = function(){
  document.getElementById("spinner-wrapper").style.display = "none";
}

var getJSONData = function(url){
    var result = {};
    showSpinner();
    return fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }else{
        throw Error(response.statusText);
      }
    })
    .then(function(response) {
          result.status = 'ok';
          result.data = response;
          hideSpinner();
          return result;
    })
    .catch(function(error) {
        result.status = 'error';
        result.data = error;
        hideSpinner();
        return result;
    });
}

//Función que se ejecuta una vez que se haya lanzado el evento de
//que el documento se encuentra cargado, es decir, se encuentran todos los
//elementos HTML presentes.
document.addEventListener("DOMContentLoaded", function(e){
});