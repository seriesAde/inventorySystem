import mongoose from "mongoose";
import bcrypt from 'bcrypt';



const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['storekeeper', 'admin', 'manager'] },
    isActive: { type: Boolean, default: true },
    mustChangePassword:{type:Boolean, default:false}

}, { timestamps: true })


userSchema.pre('save', async function () {
    if (!this.isModified('password')) return ;
    this.password = await bcrypt.hash(this.password, 10);
    
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;