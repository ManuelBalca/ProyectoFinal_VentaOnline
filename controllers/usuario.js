const { response, request } = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario');

const getUsuarios = async (req = request, res = response) => {
    const query = { estado: true };

    const listaUsuarios = await Promise.all([
        Usuario.countDocuments(query),
        Usuario.find(query)
    ]);

    res.json({
        msg: 'get Api - Controlador Usuario',
        listaUsuarios
    });
}

const postUsuario = async (req = request, res = response) => {
    const { nombre, correo, password, rol } = req.body;

    const usuarioGuardadoDB = new Usuario({ nombre, correo, password, rol });

    const salt = bcrypt.genSaltSync();
    usuarioGuardadoDB.password = bcrypt.hashSync(password, salt);

    await usuarioGuardadoDB.save();

    res.json({
        msg: 'Post Api - Post Usuario',
        usuarioGuardadoDB
    });

}

const putUsuario = async (req = request, res = response) => {
    const { id } = req.params;
    const { _id, img, estado, google, ...resto } = req.body;

    const usuario = await Usuario.findById(id);
    if (usuario && usuario.rol === 'ADMIN') {
        return res.status(400).json({
            msg: 'Un administrador no puede editar a otro administrador'
        });
    }

    if (resto.password) {
        const salt = bcrypt.genSaltSync();
        resto.password = bcrypt.hashSync(resto.password, salt);
    }

    const usuarioEditado = await Usuario.findByIdAndUpdate(id, resto);

    res.json({
        msg: 'PUT editar user',
        usuarioEditado
    });
}

const putPerfilUsuario = async (req = request, res = response) => {
    const idToken = req.usuario.id;
    const { _id, img, estado, google, rol, ...resto } = req.body;

    if (resto.password) {
        const salt = bcrypt.genSaltSync();
        resto.password = bcrypt.hashSync(resto.password, salt);
    }

    const usuarioEditado = await Usuario.findByIdAndUpdate(idToken, resto);

    res.json({
        msg: 'PUT editar user',
        usuarioEditado
    });
}

const deletePerfilUsuario = async (req = request, res = response) => {
    const idToken = req.usuario.id;
    const usuarioEliminado = await Usuario.findByIdAndUpdate(idToken, { estado: false });

    res.json({
        msg: 'DELETE eliminar user',
        usuarioEliminado
    });
}

const deleteUsuario = async (req = request, res = response) => {
    const { id } = req.params;
    const usuario = await Usuario.findById(id); 
    if (usuario && usuario.rol === 'ADMIN') {
        return res.status(400).json({
            msg: 'No se puede eliminar a otro administrador'
        });
    }else{
        const usuarioEliminado = await Usuario.findByIdAndUpdate(id, { estado: false });
        res.json({
            msg: 'DELETE eliminar user',
            usuarioEliminado
        });
    }
}

module.exports = {
    getUsuarios,
    postUsuario,
    putUsuario,
    deleteUsuario,
    putPerfilUsuario,
    deletePerfilUsuario
}