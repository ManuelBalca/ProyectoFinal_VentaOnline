const { request, response } = require('express');
const Categoria = require('../models/categoria');
const Producto = require('../models/producto');
const { ObjectId } = require('mongoose').Types

const coleccionesPermitidas = [
    'categorias',
    'productos'
]

const buscarCategoria = async (termino = '', res = response) => {
    const esMongoId = ObjectId.isValid(termino)

    if (esMongoId) {
        const categoria = await Categoria.findById(termino)

        return res.json({
            results: (categoria) ? [categoria] : []
        })
    }

    const regexp = new RegExp(termino, 'i')

    const categorias = await Categoria.find({
        $or: [{ nombre: regexp }]
    })

    res.json({
        results: categorias
    })
}

const buscarProducto = async (termino = '', res = response) => {
    const esMongoId = ObjectId.isValid(termino)

    if (esMongoId) {
        const producto = await Producto.findById(termino)

        return res.json({
            results: (producto) ? [producto] : []
        })
    }

    const regexp = new RegExp(termino, 'i')

    const productos = await Producto.find({
        $or: [{ nombre: regexp }]
    })

    res.json({
        results: productos
    })
}

const buscar = (req = request, res = response) => {

    const { coleccion, termino } = req.params

    if (!coleccionesPermitidas.includes(coleccion)) {
        return res.status(400).json({
            msg: `La coleccion: ${coleccion} no existe en la db
                Las colecciones permitidas son ${coleccionesPermitidas}`
        })
    }

    switch (coleccion) {
        case 'categorias':
            buscarCategoria(termino, res)
            break;
        case 'productos':
            buscarProducto(termino, res)
            break;
        default:
            res.status(500).json({
                msg: 'Esta busqueda no esta disponible'
            });
            break;
    }
}

module.exports = {
    buscar
}