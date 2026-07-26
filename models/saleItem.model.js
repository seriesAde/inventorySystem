import mongoose from "mongoose";

const saleItemSChema = new mongoose.Schema({
    sale:{type:mongoose.Schema.Types.ObjectId, ref:'Sale', required:true},
    product:{type:mongoose.Schema.Types.ObjectId, ref:'Product', required:true},
    quantity:{type:Number, min:1, required:true},
    unitPrice:{type:Number, min:0, required:true},
    subtotal:{type:Number, min:0, required:true},

},{timestamps:true})
const SaleItem = mongoose.model('SaleItem', saleItemSChema);
export default SaleItem;