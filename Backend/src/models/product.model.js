import mongoose from 'mongoose';
import './user.model.js';
import priceSchema from './price.schema.js';

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    price: {
        type: priceSchema
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 99
    },
    originalPrice: {
        type: Number,
        default: null
    },
    images: [
        {
            url: {
                type: String,
                required: true
            }
        }
    ],
    stock: {
        type: Number,
        default: 0
    },
    variants: [
        {
            images: [
                {
                    url: {
                        type: String,
                        required: true
                    }
                }
            ],
            stock: {
                type: Number,
                default: 0
            },
            attributes: {
                type: Map,
                of: String
            },
            price: {
                type: priceSchema
            },
            discount: {
                type: Number,
                default: 0,
                min: 0,
                max: 99
            },
            originalPrice: {
                type: Number,
                default: null
            },
        }
    ]
}, { timestamps: true })


const productModel = mongoose.model('product', productSchema);

export default productModel;