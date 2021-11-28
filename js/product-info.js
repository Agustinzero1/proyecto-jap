//#region VARIABLES GLOBALES
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
    var lastImgCreated = 0;

    /** @type {HTMLElement} - div que contiene los botones de las estrellas */
    var divEstrellas;
    var numeroSeleccionado;

    var listImagenes;
    var big_image;
    var imagen_seleccionada;

    /** - tipo de objeto CommentObj
     * @typedef {Object} ProductInfoObj - Objeto con datos detallados de un producto
     * @property {string} category - categoria del producto
     * @property {number} cost - costo del producto 
     * @property {string} currency - unidad del costo del producto ej "USD", "UYU"
     * @property {string} description - descripcion del producto
     * @property {[string]} images - link a las imagenes del producto para mostrar en la galeria
     * @property {string} name - Nombre del producto
     * @property {[number]} relatedProducts - productos relacionados (es una id, por ej [1, 3])
     * @property {number} soldCount - cantidad de productos vendidos
     */
    /** @type {ProductInfoObj} - lista de comentarios obtenidos del JSON */
    var productInfo;

    /** - tipo de objeto CommentObj
     * @typedef {Object} ProductObj - Objeto con datos de un producto
     * @property {string} cost - costo del producto 
     * @property {string} currency - unidad del costo del producto ej "USD", "UYU"
     * @property {string} description - descripcion del producto
     * @property {string} imgSrc - link a la imagen del producto para mostrar
     * @property {string} name - Nombre del producto
     * @property {string} soldCount - cantidad de productos vendidos
     */
    /** @type {ProductObj} - lista de comentarios obtenidos del JSON */
    var productList;

    /** - tipo de objeto CommentObj
     * @typedef {Object} CommentObj - Objeto con datos de un comentario
     * @property {string} dateTime - fecha de publicacion del comentario en formato "AAAA-MM-DD hh:mm:ss" ej "2020-02-25 18:03:52"
     * @property {string} description - Indicates whether the Power component is present.
     * @property {number} score - numero de estrellas que puntuo el usuario, numeros del 1 al 5
     * @property {string} user - nombre de usuario, por ejemplo "juan_pedro"
     */
    /** @type {CommentObj} - lista de comentarios obtenidos del JSON */
    var commentsList;
//#endregion

//#region MOSTRAR DATOS DEL PROIDUCTO

    /** - dibuja los datos detallados del producto
    * @param {ProductInfoObj} productInfoOBJ - lista con los comentarios
    * @param {[CommentObj]} comment_list - lista con los comentarios
    */
    function Draw_ProductInfo( productInfoOBJ, comment_list) {

        //imprimo la descripción del producto
        let description = document.getElementsByClassName("desc-prod-info-text")[0];
        description.textContent = productInfoOBJ.description;

        //imprimo la categoria del producto
        let category = document.getElementsByClassName("category-prod-info-text")[0];
        category.textContent = `Categoría - ${productInfoOBJ.category}`;

        //imprimo el nombre del producto
        let name = document.getElementsByClassName("name-prod-info-text")[0];
        name.textContent = productInfoOBJ.name;

        //imprimo el precio del producto
        let price = document.getElementsByClassName("price-prod-info-text")[0];
        price.textContent = `${productInfoOBJ.currency} ${productInfoOBJ.cost.toLocaleString()}`;

        //imprimo la cantidad de productos vendidos
        let soldCount = document.getElementsByClassName("soldCount-prod-info-text")[0];
        soldCount.textContent = `${productInfoOBJ.soldCount} vendidos`;

        //muestro las estrellas de puntuacion calculadas con el promedio de los comentarios
        let score = document.getElementById("prod-info-score");
        marcarEstrella(  Math.round(get_ProductRate( comment_list )) , score);

        //muestro el promedio de nota de los comentarios pero como numero
        let scoreText = document.getElementsByClassName("prod-info-score-text")[0];
        scoreText.textContent = get_ProductRate( comment_list );

        //muestro las fotos del producto
        //seteando la galeria
        gal_start( productInfo.images );

        //muestro el promedio de nota de los comentarios pero como numero
        let usuario_comment = document.getElementsByClassName("com-user-name")[0];
        usuario_comment.textContent = localStorage.getItem("usuario");

    }

    /** - revisa los comentarios y calcula la nota promedio
    * @param {[CommentObj]} comment_list - lista con los comentarios
    */
    function get_ProductRate( comment_list ) {
        let valorTotal = 0;
        let contador = 0;

        for (const comment of comment_list) {
            valorTotal += comment.score;
            contador++;
        }

        return valorTotal/contador;
    }

//#endregion

//#region MOSTRAR COMENTARIOS

    /** - dibuja los comentarios presetes en la lista
    * @param {[CommentObj]} comment_list - lista con los comentarios
    * @param {HTMLElement} TargetElement - donde se imprimira el resultado
    */
    function Draw_Comments( comment_list, TargetElement) {

        TargetElement.innerHTML = "";

        for (const comment of comment_list) {
            Draw_Comment( comment, TargetElement );
        }
        
    }

    /** - dibuja un comentario
    * @param {CommentObj} comment - lista con los comentarios
    * @param {HTMLElement} TargetElement - donde se imprimira el resultado
    */
    function Draw_Comment( comment, TargetElement) {
        
        let comentario = document.createElement("div");
        comentario.classList.add("comment");
        comentario.innerHTML=`

            <div class="ratingDiv notHover">
                <span name="star5">★</span>
                <span name="star4">★</span>
                <span name="star3">★</span>
                <span name="star2">★</span>
                <span name="star1">★</span>
            </div>
            
            <span class="com-user-name">
                ${comment.user}
            </span>

            <br>

            <p class="com-user-desc">
                ${comment.description}
            </p>

            <div class="com-user-date">
                ${comment.dateTime}
            </div>

        `;

        let Estrellas = comentario.getElementsByClassName("ratingDiv")[0];
        marcarEstrella(comment.score, Estrellas);

        TargetElement.appendChild(comentario)

    }

    /** - tomando un div con estrellas y el numero de estrellas lo configura con las estrellas del parametro numero
     * @param {number} numero - numero de estrellas a marcar
     * @param {HTMLElement} bloqueEstrellas - bloque que tiene las estrellas a seleccionar
     */
    function marcarEstrella(numero, bloqueEstrellas) {
        (bloqueEstrellas.querySelector(`[name="star${numero}"]`)).classList.add("selected");
    }

//#endregion

//#region CREAR INTERFACE PARA ESCRIBIR COMENTARIOS

    function inicializar_estrellas(estrellas) {
        for (const BotonEstrella of estrellas.childNodes) {
            BotonEstrella.addEventListener('click', function(e){ 
                numeroSeleccionado = accionarEstrella(e, estrellas ) 
            });
        }
    }

    /** - tomando el evento de apretar una estrella, la marco como seleccionada y ademas desmarco las demas
     * @param {Event} evento - el evento que se disparo
     * @param {HTMLElement} divEstrellas - el div de las Estrellas
     */
    function accionarEstrella (evento, divEstrellas){

        //busco si existe una estrella anterior seleccionada o no para desmarcarla
        let ultimaEstrellaSeleccionada = divEstrellas.getElementsByClassName('selected')[0];
        if(ultimaEstrellaSeleccionada != null){
            ultimaEstrellaSeleccionada.classList.remove('selected');
        }

        evento.target.className = "selected";
        return evento.target.getAttribute("name").charAt(4);
    }

    //sirve para enviar el comentario
    function boton_comentar(){

        let comentario = document.getElementById("comment-textarea").value;

        if(comentario == undefined || comentario == null || comentario == ""){
            alert("Debe escribir un comentario, no puede dejarlo en blanco...")
            return;
        }
        
        if(numeroSeleccionado == undefined || numeroSeleccionado == 0){
            alert("Seleccione la calificacion del producto (1 a 5 estrellas)...")
            return;
        }

        const d = new Date();
        let fecha = 
        (d.getFullYear()  + "")                   + "-" 
        + (d.getMonth()+ 1  + "").padStart(2, "0")  + "-" 
        + (d.getDate()      + "").padStart(2, "0")  + " " 
        + (d.getHours()     + "").padStart(2, "0")  + ":" 
        + (d.getMinutes()   + "").padStart(2, "0")  + ":" 
        + (d.getSeconds()   + "").padStart(2, "0")  ;

        crear_comentario({
            score: parseInt(numeroSeleccionado, 10) ,
            description: comentario,
            user: localStorage.getItem("usuario"),
            dateTime: fecha,
        })

        //reseteamos todo para el siguiente comentario
        document.getElementById("comment-textarea").value = ""; 
        let estrellas= document.getElementsByClassName("ratingDiv")[1];
        (estrellas.querySelector(`[name="star${numeroSeleccionado}"]`)).classList.remove("selected");
        numeroSeleccionado = undefined;
    }

    /**
     * @param {CommentObj} CommentObj - el comentario a agregar
     */
    function crear_comentario(CommentObj) {
        commentsList.unshift(CommentObj)
        Draw_Comments(commentsList, document.getElementById("comments-block"));
    }

//#endregion

//#region PRODUCTOS RELACIONADOS

    /** - ordena la lista de elementos pasada por parametros con los criterios elegidos
     * @param {ORDER} criteria - criterio para ordenar los elementos
     * @param {[object]} array - lista de elementos a ordenar
     * @returns {[object]} - lista de elementos ordenados
     */
    function sortRelatedProducts(criteria, array){
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

    /** - muestra los productos y los ordena al mismo tiempo
     * @param {ORDER} sortCriteria - el criterio de ordenamietno que se va a utilizar
     * @param {[object]} productsArray - la lista de productos que se va a ordenar y mostrar
     */
    function sortAndShowRelatedProducts(sortCriteria, productsArray, relatedProductsIndexList){
        currentSortCriteria = sortCriteria;

        if(productsArray != undefined){
            currentProductsArray = productsArray;
        }

        currentProductsArray = sortRelatedProducts(currentSortCriteria, currentProductsArray);

        //Muestro los productos ordenadas
        showRelatedProductsList(relatedProductsIndexList);
    }

    /** - muestra la lista de productos en la pagina, teniendo en cuetna la busqueda y al filtrado de precio
     * 
     */
    function showRelatedProductsList( relatedProductsIndexList ){

        let internalProductList = [];

        for (const numero of relatedProductsIndexList) {
            internalProductList.push( currentProductsArray[numero] )
        }

        let htmlContentToAppend = "";
        for(let producto of internalProductList){
            
            htmlContentToAppend += 
                    `<a href="product-info.html" class="card mb-4 custom-card custome-prod-card" ondragstart="return false;" ondrop="return false;">

                        <div class="card-top-img">
                            <img class="" src="${producto.imgSrc}" alt="${producto.description}">
                        </div>

                        <div class="card-body d-flex flex-column">
                            <h4 class="card-title text-success font-weight-bold prod-price-text">${producto.currency} ${producto.cost.toLocaleString()}</h4>
                            <h5 class="card-title font-weight-normal text-truncate">${producto.name}</h5>
                            <p class="card-text fade-text-truncate" >${producto.description}</p>
                            <p class="card-text bottom-text"><small class="text-muted">${producto.soldCount} vendidos</small></p>
                        </div>
                    </a>`
            
            document.getElementById("prod-list-container").innerHTML = htmlContentToAppend;
        }
    }

//#endregion

//#region GALERIA DE IMAGENES

    /** - inicializa la galeria de imagenes
     * @param {[string]} images - lista de imagenes a agregar, puede ser una lista de URL como texto
    */
    function gal_start( images){

        let firstElement = true;

        let gallery = document.getElementById('img-gal')
        let galleryInner = gallery.getElementsByClassName("carousel-inner")[0]
        let galleryIndicators = gallery.getElementsByClassName("carousel-indicators")[0]

        for (const image of images) {

            if(firstElement){
                firstElement = false;
                gal_addImage(image, "active", galleryInner, galleryIndicators)
            }else{
                gal_addImage(image, "", galleryInner, galleryIndicators)
            }
            
        }

    }

    /** - agrega una imagen nueva al bloque de carrusel de imagenes
     * 
     * @param {string} image - imagen a agregar a la galeria
     * @param {boolean} active - si la imagen se crea como la seleccionada por defecto
     * @param {HTMLElement} galleryInner - bloque interno de la galeria
     * @param {HTMLElement} galleryIndicators - bloque de seleccion de imagen de la galeria
     */
    function gal_addImage(image, active, galleryInner, galleryIndicators){

        //la imagen
        let carousel_item  = document.createElement('div')    
        carousel_item.className = "carousel-item " + active;
        carousel_item.innerHTML=`<img class="d-block w-100" src="${image}" alt="imagen ${lastImgCreated}">`;

        galleryInner.appendChild( carousel_item );

        //el boton
        let carousel_indicator  = document.createElement('li')    
        carousel_indicator.className = "img-tumbnail " + active;
        
        carousel_indicator.setAttribute("data-target", '#img-gal')
        carousel_indicator.setAttribute("data-slide-to", lastImgCreated)
        lastImgCreated++;

        // carousel_indicator.innerHTML=`<img class="d-block w-100" src="${image}" alt="imagen ${lastImgCreated}">`;

        galleryIndicators.appendChild( carousel_indicator );
    }

//#endregion

//Función que se ejecuta una vez que se haya lanzado el evento de
//que el documento se encuentra cargado, es decir, se encuentran todos los
//elementos HTML presentes.
document.addEventListener("DOMContentLoaded", function(e){

    // big_image = document.getElementsByClassName("gal-img")[0].getElementsByClassName("img-selected")[0]
    // listImagenes = document.getElementsByClassName("gal-img")[0].getElementsByClassName("gal-list")[0];

    getJSONData(PRODUCTS_URL).then(function(resultObj){
        if (resultObj.status === "ok"){
            productList = resultObj.data;
        }

        getJSONData(PRODUCT_INFO_COMMENTS_URL).then(function(resultObj){
            if (resultObj.status === "ok"){
                commentsList = resultObj.data;
                Draw_Comments(commentsList, document.getElementById("comments-block"));
    
                getJSONData(PRODUCT_INFO_URL).then(function(resultObj){
                    if (resultObj.status === "ok"){
                        productInfo = resultObj.data;
                        Draw_ProductInfo( productInfo, commentsList)
                        
                        sortAndShowRelatedProducts(ORDER.ASC_BY_NAME, productList, productInfo.relatedProducts);
                    }
                });
            }
        });

    });

    

    inicializar_estrellas(document.getElementsByClassName("ratingDiv")[1]) 

    //agrego la opcion de enviar comentarios
    let btn_Comment = document.getElementsByClassName("btn-comentar")[0]
    btn_Comment.addEventListener("click", function(e) {
        boton_comentar();
    });
});