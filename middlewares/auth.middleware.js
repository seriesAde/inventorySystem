import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { env } from '../config/env.js';
import asyncHandler from "../utilities/asyncHandler.js";
import ApiError from "../utilities/apiErrors.js";


export const protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }
    if (!token) throw new ApiError(401, 'Not authorized, no token provided');
    const decoded = jwt.verify(token, env.jwtAccessSecret);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) throw new ApiError(401, 'User not found')
    if (!user.isActive) throw new ApiError(403, 'Account deactivated')

    req.user = user;
    next();

})

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, 'You do not have permission to perform this action');
        }
        next();
    };
};