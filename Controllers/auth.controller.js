
import User from "../models/User.model.js";
import { env } from '../config/env.js';
import { generateToken } from "../utilities/generateToken.js";
import asyncHandler from "../utilities/asyncHandler.js";
import ApiError from "../utilities/apiErrors.js";


export const login = asyncHandler(async (req, res) => {

    const { email, password } = req.body

    if (!email || !password) {
        throw new ApiError(400, 'Email and password are required');
    };

    const user = await User.findOne({ email }).select('+password')

    if (!user) throw new ApiError(401, 'Invalid credentials');

    if (!user.isActive) throw new ApiError(403, 'Account is deactivated');

    const isMatched = await user.comparePassword(password);

   if (!isMatched) throw new ApiError(401, 'Invalid credentials');
   
    const token = generateToken(user._id, user.role)

    res.status(200).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            mustChangePassword: user.mustChangePassword
        }
    })
})