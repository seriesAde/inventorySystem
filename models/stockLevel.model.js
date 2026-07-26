import mongoose from 'mongoose'

const stockLevelSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    currentQuantity: { type: Number, default: 0, min: 0, required: true },

},{timestamps:true})

stockLevelSchema.index({ product: 1, warehouse: 1 }, { unique: true });

const StockLevel = mongoose.model('StockLevel', stockLevelSchema);
export default StockLevel;