import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    type: { type: String, enum: ['purchase', 'sale', 'adjustment'], required: true },
    quantity: { type: Number, required: true },
    quantityBefore: { type: Number, required: true },
    quantityAfter: { type: Number, required: true },
    sourceType: { type: String, enum: ['Purchase', 'Sale', 'StockAdjustment'], required: true },
    sourceId:{type:mongoose.Schema.Types.ObjectId, required:true},
    performedBy:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    note:{type:String, trim:true}
}, {timestamps:true})

const StockMovement = mongoose.model('StockMovement', stockMovementSchema)

export default StockMovement