const { request, response } = require('express');
const Producto = require('../models/producto');
const Carrito = require('../models/carrito');
const Compra = require('../models/compra');
const Factura = require('../models/factura');


const RealizarCompra = async (req, res) => {
    const tokenID = req.usuario.id;
    try {
        const carrito = await Carrito.find({ usuario: tokenID }).populate('producto');// Búsqueda en la base de datos de la lista de compras del usuario.
        const productosCarrito = carrito.map((item) => item.producto);//mapear los datos del carrito y crear un nuevo array
        const total = productosCarrito.reduce((acc, p) => acc + p.precio, 0);//Reducir el array a un solo valor (la suma de precios)
        const compra = await Compra.create({// Crear un objeto "compra" con los datos obtenidos
            usuario: tokenID,
            producto: productosCarrito,
            total: total
        });
        if (carrito.length === 0) { // Si la lista de compras está vacía, devuelve un error
            return res.status(400).json({ msg: 'No hay productos en el carrito' });
        }
        await Carrito.deleteMany({ usuario: tokenID });//Eliminar todos los productos de la lista de compras del usuario.
        await Producto.updateMany(
            { _id: { $in: productosCarrito.map(p => p._id) } },
            { $inc: { comprados: 1 } } // suma uno a la cantidad de comprados en el modelo.
        );
        res.json({
            msg: 'Compra efectuada',
            compra
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'No se realizo la compra' });
    }
};


const GetCompras = async (req, res) => {
    const idToken = req.usuario.id;
    try {
        const compras = await Compra.find({ usuario: idToken });
        res.json({ compras });
    } catch (error) {
        res.status(500).json({
            msg: 'No se lograron visualizar las compras'
        });
    }
};


const PostCarritoProductos = async (req = request, res = response) => {
    const { usuario } = req;
    const { ProductoId, cantidad } = req.body;
    try {
        const productos = await Producto.find({ _id: { $in: ProductoId } });

        // Verifica si hay productos 
        if (productos.length === 0) {
            return res.status(404).json({ msg: 'Ingrese los productos' });
        }
        //crea un array con objetos que tienen información del producto, el usuario y la cantidad
        const productosCarrito = productos
            .filter(producto => ProductoId.includes(producto._id.toString()))
            .map(producto => ({ producto: producto._id, usuario: usuario._id, cantidad: cantidad }));

        //agrega los productos al carrito o actualiza la cantidad si ya existen
        await Carrito.bulkWrite(productosCarrito.map(producto => ({
            updateOne: {
                filter: { producto: producto.producto, usuario: producto.usuario },
                update: { $inc: { cantidad: producto.cantidad } },
                upsert: true
            }
        })));
        res.json({
            msg: 'se agregaron los productos',
            productos
        });
    } catch (error) {
        res.status(500).json({
            msg: 'no se agregaron los productos',
            error
        });
    }
};



const putCarrito = async (req = request, res = response) => {
    const { id } = req.params;
    const { estado, usuario, ...resto } = req.body;

    resto.carrito = resto.carrito.toUpperCase();
    resto.productos = [...req.body.productos];
    resto.usuario = req.usuario._id;

    const carritoEditado = await Carrito.findByIdAndUpdate(id, resto, {
        new: true,
    });

    res.status(201).json(carritoEditado);
};



const buscarCompras = async (usuarioId) => {
    return await Compra.find({ usuario: usuarioId });
};

const buscarProductosComprados = async (usuarioId) => {
    return await Compra.aggregate([
        { $match: { usuario: usuarioId } },
        { $unwind: '$producto' },
        {
            $lookup: {
                from: 'productos',
                localField: 'producto._id',
                foreignField: '_id',
                as: 'productoModel'
            }
        },
        { $unwind: '$productoModel' },
        {
            $group: {
                _id: '$producto._id',
                precio: { $first: '$productoModel.precio' }
            }
        }
    ]);
};

const calcularTotalCompras = (compras) => {
    return compras.reduce((total, compra) => total + compra.total, 0);
};

const crearFactura = async (usuarioId, productosComprados, total) => {
    const factura = new Factura({
        usuario: usuarioId,
        productos: productosComprados.map(producto => ({
            producto: producto._id,
            precio: producto.precio
        })),
        total: total
    });

    return await factura.save();
};

const GenerarFactura = async (req, res) => {
    const usuarioId = req.usuario.id;

    try {
        const compras = await buscarCompras(usuarioId);

        if (!compras || compras.length === 0) {
            return res.status(400).json({ msg: 'No hay compras registradas' });
        }

        const productosComprados = await buscarProductosComprados(usuarioId);
        const totalCompras = calcularTotalCompras(compras);
        const factura = await crearFactura(usuarioId, productosComprados, totalCompras);

        res.json({ msg: 'Factura creada con éxito', factura });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Hubo un error al crear la factura' });
    }
};

const getFacturas = async (req = request, res = response) => {
    const query = { estado: true };
    const listaFactura = await Promise.all([
        Factura.countDocuments(query),
        Factura.find(query)
            .populate('usuario', 'correo')
            .populate('usuario', 'nombre')
            .populate('carrito', "carrito").populate('productos'),
    ]);
    res.json({
        msg: 'get Api - Controlador ComprasCarrito',
        listaFactura
    });

};

module.exports = {
    PostCarritoProductos,
    RealizarCompra,
    GenerarFactura,
    GetCompras,
    getFacturas
}