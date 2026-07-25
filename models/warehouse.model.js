
import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    code: { type: String, unique: true, required: true },
    address: { type: String, required:true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true })
const Warehouse = mongoose.model('Warehouse', warehouseSchema);
export default Warehouse