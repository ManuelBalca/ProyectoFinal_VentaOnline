const { request, response } = require('express');

const tieneRole = (...roles) => {

    return (req = request, res = response, next) => {
        if (!req.usuario) {
            return res.status(500).json({
                msg: 'No se puede verificar el TOKEN'
            })
        }

        if (!roles.includes(req.usuario.rol)) {
            return res.status(401).json({
                msg: `necesitas el rol: ${roles} para usar esto`
            })

        }
        next();
    }
}


module.exports = {
    tieneRole
}