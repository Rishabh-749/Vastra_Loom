import mongoose from 'mongoose';
import './user.model.js';

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
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: "INR"
        }
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
                amount: {
                    type: Number,
                    required: true
                },
                currency: {
                    type: String,
                    default: "INR"
                }
            },
        }
    ]
}, { timestamps: true })


const productModel = mongoose.model('product', productSchema);

export default productModel;