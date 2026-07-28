
import mongoose from 'mongoose'

const stockTransferSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    fromWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    toWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    quantity: { type: Number, min: 1, required:true },
    note: { type: String },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true })

const StockTransfer = mongoose.model('StockTransfer', stockTransferSchema);
export default StockTransfer;