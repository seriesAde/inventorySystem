import mongoose from "mongoose";


const stockAdjustmentSchema = new mongoose.Schema({
    product:{type:mongoose.Schema.Types.ObjectId, ref:'Product', required:true},
    warehouse:{type:mongoose.Schema.Types.ObjectId, ref:'Warehouse', required:true},
    reason:{type:String, enum:['damaged', 'loss', 'recount', 'other'], required:true},
    quantityDelta:{type:Number, default:0, required:true},
    note:{type:String},
    performedBy:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true}
}, {timestamps:true})

const StockAdjustment = mongoose.model('StockAdjustment', stockAdjustmentSchema);
export default StockAdjustment;