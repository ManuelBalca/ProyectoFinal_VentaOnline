const { Router } = require('express');
const { check } = require('express-validator');
const { getCategorias, postCategoria, putCategoria, deleteCategoria } = require('../controllers/categoria');
const { existeCategoriaPorId } = require('../helpers/db-validators');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { tieneRole } = require('../middlewares/validar-roles');

const router = Router();

router.get('/mostrar', getCategorias );

router.post('/agregar', [
    validarJWT,
    tieneRole("ADMIN"),
    validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos
] ,postCategoria);

router.put('/editar/:id', [
    validarJWT,
    tieneRole("ADMIN"),
    validarJWT,
    check('id', 'No es un id de Mongo Válido').isMongoId(),
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('id').custom( existeCategoriaPorId ),
    validarCampos
] ,putCategoria);

router.delete('/eliminar/:id', [
    validarJWT,
    tieneRole("ADMIN"),
    validarJWT,
    check('id', 'No es un id de Mongo Válido').isMongoId(),
    check('id').custom( existeCategoriaPorId ),
    validarCampos
] ,deleteCategoria);

module.exports = router;