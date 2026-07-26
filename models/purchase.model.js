import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema({
    supplier:{type:mongoose.Schema.Types.ObjectId, ref:'Supplier', required:true},
    warehouse:{type:mongoose.Schema.Types.ObjectId, ref:'Warehouse' , required:true},
    status:{type:String, enum:['draft', 'confirmed', 'cancelled'], default:'draft'},
    totalAmount:{type:Number, default:0, min:0},
    createdBy:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    confirmedAt:{type:Date}
},{timestamps:true})

const Purchase = mongoose.model('Purchase', purchaseSchema)
export default Purchase