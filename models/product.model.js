import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    sku: { type: String, unique: true, trim: true, required: true },
    name: { type: String, trim: true, required: true },
    description: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, required: true, min: 0 },
    reorderThreshold: { type: Number, required: true, min: 0 },
    image: [{
        url: { type: String, default: null },
        public_id: { type: String, default: null }
    }],
    isAvailable: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

const Product = mongoose.model('Product', productSchema);
export default Product