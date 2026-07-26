import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
warehouse:{type:mongoose.Schema.Types.ObjectId, ref:'Warehouse', required:true},
customerName:{type:String,trim:true},
status:{type:String, enum:['draft', 'confirmed', 'cancelled'], default:'draft'},
totalAmount:{type:Number, default:0, min:0},
createdBy:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
confirmedAt:{type:Date}
},{timestamps:true})

const Sale= mongoose.model('Sale', saleSchema);
export default Sale