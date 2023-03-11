const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { PostCarritoProductos, RealizarCompra, GetCompras, GenerarFactura, getFacturas } = require('../controllers/ComprasCarrito');
const { validarJWT } = require('../middlewares/validar-jwt');
const { tieneRole } = require('../middlewares/validar-roles');
const router = Router();

router.get('/mostrarCompras', [
    validarJWT,
    tieneRole('CLIENT')
], GetCompras);

router.post('/agregarCarrito', [
    validarJWT,
    tieneRole('CLIENT'),
    validarCampos
], PostCarritoProductos);

router.post('/comprar', [
    validarJWT,
    tieneRole('CLIENT'),
    validarCampos
], RealizarCompra);

router.post('/facturar', [
    validarJWT,
    tieneRole('CLIENT'),
    validarCampos,
], GenerarFactura);

router.get('/mostrar', getFacturas);


module.exports = router;