import Category from "../models/category.model.js";
import asyncHandler from "../utilities/asyncHandler.js";
import ApiError from "../utilities/apiErrors.js";

export const createCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    if (!name) throw new ApiError(400, 'name is required')
    const category = await Category.create({ name, description })
    res.status(201).json({
        success: true,
        message: 'category created successfully ✅',
        data: category
    })
})

export const getCategory = asyncHandler(async (req, res) => {
    const filter = req.query.includeInactive === 'true' ? {} : { isActive: true };
    const category = await Category.find(filter);

    res.status(200).json({
        success: true,
        data: category
    });
});

export const getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id)
    if (!category) throw new ApiError(404, 'category not found')
    res.status(200).json({
        success: true,
        data: category
    })
})

export const updateCategory = asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!category) throw new ApiError(404, 'category not found')
    res.status(200).json({
        success: true,
        message: 'category updated successfully',
        data: category
    })
})

export const deactivateCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id)
    if (!category) throw new ApiError(404, 'category not found')
    category.isActive = false
    await category.save();
    res.status(200).json({
        success: true,
        message: 'category deactivated'
    })
})
export const reactivateCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id)
    if (!category) throw new ApiError(404, 'category not found')
    category.isActive = true
    await category.save();
    res.status(200).json({
        success: true,
        message: 'category reactivated'
    })
})

export const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndDelete(req.params.id)
    if (!category) throw new ApiError(404, 'category not found')
    res.status(200).json({
        success: true,
        message: 'category permmenently deleted'
    })
})