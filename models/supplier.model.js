import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    address: { type: String },
    contactPerson: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true })

const Supplier = mongoose.model('Supplier', supplierSchema)
export default Supplier;