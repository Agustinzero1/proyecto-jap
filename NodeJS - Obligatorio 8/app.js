// modulos de EXPRESS.JS
const express = require('express');
const app = express(); // este es mi servidor
const port = 3000; // el puerto de respuesta

let fs = require('fs')// esto sirve para acceder a archivos, escribirlos y demas...

//para leer json codificados
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//para poder usar datos saltandose las limitaciones del cors
const cors = require('cors');
app.use(cors());

//requiero los json para poder acceder a los datos
const productos = require('./api/product/all.json') // PRODUCTS_URL
const productos_info = require('./api/product/5678.json') // PRODUCT_INFO_URL
const productos_info_comments = require('./api/product/5678-comments.json') // PRODUCT_INFO_COMMENTS_URL

const cart_info = require('./api/cart/987.json')  //CART_INFO_URL
const cart_info_desafiate = require('./api/cart/654.json')  //CART_INFO_DESAFIATE_URL
const cart_buy = require('./api/cart/buy.json')  //CART_BUY_URL 

const categories = require('./api/category/all.json')  //CATEGORIES_URL
const category_info = require('./api/category/1234.json')  //CATEGORY_INFO_URL

const precios = require('./api/precios.json') // este es mi servidor

app.get('/', (req, res) => {
    res.type('json');
    res.json(req.query);
});

//PUBLISH_PRODUCT_URL => registra el producto nuevo a la venta
app.post('/publicar-producto', (req, res) => {
    console.log('se recibio una peticion de agregar un producto');

    let productoNuevo = req.body
    console.log(productoNuevo);

    //creo el archivo y lo preparo para escribir
    let nArchivo = './api/product/all.json';
    let archivo = fs.createWriteStream(nArchivo);

    productos.push(productoNuevo)

    //escribo el archivo
    archivo.write( JSON.stringify(productos) );

    //termino la escritura en el archivo
    archivo.end();

    console.log('se registro un producto nuevo');

    res.send({mensaje:"Producto agregado correctamente"});
})

app.get('/publicar-producto', (req, res) => {
    console.log('se recibio una peticion de agregar un producto');

    let productoNuevo = req.body
    console.log(productoNuevo);

    //creo el archivo y lo preparo para escribir
    let nArchivo = './api/product/all.json';
    let archivo = fs.createWriteStream(nArchivo);

    productos.push(productoNuevo)

    //escribo el archivo
    archivo.write( JSON.stringify(productos) );

    //termino la escritura en el archivo
    archivo.end();

    console.log('se registro un producto nuevo');

    res.send({status:"correcto"});
})

//CART_BUY_URL => registra el producto comprado
app.post('/comprar', (req, res) => {
    console.log('se recibio una peticion compra');

    let fecha = Date.now()

    let compra = req.body
    console.log(compra);
    
    //creo el archivo y lo preparo para escribir
    let nArchivo = './compras/' + fecha + '.json';
    let archivo = fs.createWriteStream(nArchivo);

    //escribo el archivo
    archivo.write(JSON.stringify(compra));
    
    //termino la escritura en el archivo
    archivo.end();

    console.log('se registro ' + fecha + '.json');

    //devuelvo la respuesta
    res.send(cart_buy)
})

//CART_INFO_URL => api/category/all.json
app.get('/category', (req, res) => {
    console.log('peticion de categorias')
    res.send(categories);
})

//CATEGORY_INFO_URL => api/category/1234.json
app.get('/category/info', (req, res) => {
    console.log('peticion de info de categorias')
    res.send(category_info);
})

//CART_INFO_URL => api/cart/987.json
app.get('/cart/info', (req, res) => {
    console.log('peticion de info de carrito')
    res.send(cart_info);
})

//PRODUCT_INFO_URL => api/cart/654.json
app.get('/cart/info/desafiate', (req, res) => {
    console.log('peticion de info de carrito del desafiate')
    res.send(cart_info_desafiate);
})

//PRODUCT_INFO_URL => api/product/5678-comments.json
app.get('/productos/info', (req, res) => {
    console.log('peticion de info de productos')
    res.send(productos_info);
})

//PRODUCT_INFO_COMMENTS_URL => api/product/5678.json
app.get('/productos/info/comments', (req, res) => {
    console.log('peticion de info de productos comments')
    res.send(productos_info_comments);
})

app.get('/productos', (req, res) => {
    if(req.query.id != null){
        if(req.query.id >= 0 && req.query.id < productos.length){
            res.json(productos[req.query.id]);
        }else{
            res.json({
                mensaje:"error, el peoducto solicitado no existe"
            });
        }
    }else{
        res.json(productos);
    }
    
})

app.get('/productos/:posicion', (req, res) => {

    let posicion = req.params.posicion;

    if(posicion != null){
        if(posicion >= 0 && posicion < productos.length){
            res.json(productos[posicion]);
        }else{
            res.status(404).send("ERROR: El producto solicitado no existe"
            );
        }
    }else{
        res.json(productos);
    }
    
})

//es para que quede escuchando el servidor a las peticiones
app.listen(port, (req, res)=>{
    console.log('Servidor iniciado  en el puerto ' + port);
})

