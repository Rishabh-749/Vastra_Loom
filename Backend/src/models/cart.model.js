import mongoose from "mongoose";
import priceSchema from "./price.schema.js";

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
                required: true
            },
            variant: {
                type: mongoose.Schema.Types.ObjectId,
                default: null
            },
            quantity: {
                type: Number,
                default: 1,
                min: 1
            },
            price: {
                type: priceSchema,
                required: true
            }
        }
    ]
}, { timestamps: true })

const cartModel = mongoose.model('cart', cartSchema);

export default cartModel;