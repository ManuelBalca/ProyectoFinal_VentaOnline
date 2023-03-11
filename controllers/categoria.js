const { request, response } = require('express');
const Categoria = require('../models/categoria');
const producto = require('../models/producto');

const getCategorias = async (req, res) => {
    try {
        const query = { estado: true };
        const [count, categorias] = await Promise.all([
            Categoria.countDocuments(query),
            Categoria.find(query).populate('usuario', 'nombre').lean()
        ]);
        res.status(200).json({ count, categorias });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Hubo un error al obtener las categorías' });
    }
};


const postCategoria = async (req = request, res = response) => {
    const nombre = req.body.nombre.toUpperCase();
    const categoriaDB = await Categoria.findOne({ nombre });

    if (categoriaDB) {
        return res.status(400).json({
            msg: `La categoria ${categoriaDB.nombre}, ya existe`
        });
    }

    const data = {
        nombre,
        usuario: req.usuario._id
    }

    const categoria = new Categoria(data);
    await categoria.save();

    res.status(201).json(categoria);
}


const putCategoria = async (req = request, res = response) => {
    const { id } = req.params;
    const { estado, usuario, ...resto } = req.body;

    resto.nombre = resto.nombre.toUpperCase();
    resto.usuario = req.usuario._id;

    const categoriaEditada = await Categoria.findByIdAndUpdate(id, resto, { new: true });

    res.status(201).json(categoriaEditada);

}

const deleteCategoria = async (req, res) => {
    const { id } = req.params;

    try {
        const categoria = await Categoria.findById(id);
        const productos = await producto.find({ categoria: id });

        const categoriaBorrada = await Categoria.findByIdAndUpdate(id, { estado: false }, { new: true });

        if (productos.length > 0) {
            const categoriaPorDefecto = await Categoria.findOne({ nombre: 'POR_DEFECTO' });
            if (!categoriaPorDefecto) {
                return res.status(500).json({
                    msg: 'No se encontró la categoría por defecto'
                });
            }
            await producto.updateMany({ categoria: id }, { categoria: categoriaPorDefecto._id });
        }

        res.status(201).json(categoriaBorrada);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hubo un error al eliminar la categoría'
        });
    }
};

module.exports = {
    getCategorias,
    postCategoria,
    putCategoria,
    deleteCategoria
}
