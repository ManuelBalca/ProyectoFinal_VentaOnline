const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos, StockValidator } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { postProducto, putProducto, deleteProducto, getProductos, getAgotados, disponibilidadProducto,MasComprados } = require('../controllers/producto');
const { existeProductoPorId } = require('../helpers/db-validators');
const { tieneRole } = require('../middlewares/validar-roles');

const router = Router();

router.get('/mostrar', getProductos);

router.get('/Agotados', getAgotados);

router.get('/masVendidos', MasComprados);

router.post('/agregar', [
    validarJWT,
    tieneRole("ADMIN"),
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos
], postProducto);

router.put('/editar/:id', [
    validarJWT,
    tieneRole("ADMIN"),
    check('id', 'No es un id de Mongo Válido').isMongoId(),
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('id').custom(existeProductoPorId),
    validarCampos
], putProducto);

router.put('/disponibilidad/:id', [
    validarJWT,
    tieneRole("ADMIN"),
    check('id', 'No es un id de Mongo Válido').isMongoId(),
    check('id').custom(existeProductoPorId),
    validarCampos
], disponibilidadProducto);

router.delete('/eliminar/:id', [
    validarJWT,
    tieneRole("ADMIN"),
    check('id', 'No es un id de Mongo Válido').isMongoId(),
    check('id').custom(existeProductoPorId),
    validarCampos
], deleteProducto);

module.exports = router;