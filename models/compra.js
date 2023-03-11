const { Schema, model } = require('mongoose');

const compraSchema = new Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    producto: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Producto',
            required: true

        }
    ],
    total: {
        type: Number,
        required: true
    }
});

module.exports = model('Compra', compraSchema);