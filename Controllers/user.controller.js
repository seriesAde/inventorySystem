import User from "../models/User.model.js";
import asyncHandler from "../utilities/asyncHandler.js";
import ApiError from "../utilities/apiErrors.js";


export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) throw new ApiError(400, 'please provide current and new passwords');
    if (newPassword.length < 8) throw new ApiError(400, 'password must be at least 8 characters');

    const user = await User.findById(req.user._id).select('+password')

    const isMatched = await user.comparePassword(currentPassword);
    if (!isMatched) throw new ApiError(401, 'current password is incorrect')

    user.password = newPassword
    user.mustChangePassword = false

    await user.save();
    res.status(200).json({
        success: true,
        message: 'password changed succesfully'
    })
})

export const updateProfile = asyncHandler(async (req, res) => {
    const { name, email } = req.body
    if (req.body.password) throw new ApiError(400, 'Use the change-password endpoint to update your password')

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (Object.keys(updates).length === 0) throw new ApiError(400, 'No fields provided to update');


    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
    const data = {
        id: req.user._id,
        email: updates.email,
        name: updates.name,
        role: req.user.role
    }
    res.status(200).json({
        success: true,
        data
    })
})


export const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    const allowedRoles = ['admin', 'manager', 'storekeeper'];

    if (!allowedRoles.includes(role)) {
        throw new ApiError(400, 'Invalid role')
    };
    if (!name) throw new ApiError(400, 'name is required')
    if (!email) throw new ApiError(400, 'email is required')
    if (!role) throw new ApiError(400, 'role is required')
    if (!password) throw new ApiError(400, 'password is required')

    const newUser = await User.create({ name, email, password, role })

    const data = {
        id: newUser._id,
        email: email,
        name: name,
        role: role
    }
    res.status(201).json({
        success: true,
        data: data
    })

})