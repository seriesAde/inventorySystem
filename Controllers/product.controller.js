import Product from "../models/product.model.js";
import asyncHandler from "../utilities/asyncHandler.js";
import ApiError from "../utilities/apiErrors.js";

export const createProduct = asyncHandler(async (req, res) => {
    const { sku, name, description, category, unitPrice, costPrice, reorderThreshold } = req.body
    if (!sku || !name || !category || unitPrice === 'undefined' || costPrice === 'undefined' || reorderThreshold === 'undefined') throw new ApiError(400, 'all fields required')
    const product = await Product.create({
        sku,
        name,
        description,
        category,
        unitPrice,
        costPrice,
        reorderThreshold,
        image: req.file ?
            {
                url: req.file.path,
                public_id: req.file.filename
            } : [],
        createdBy: req.user.id
    })
    res.status(201).json({
        success: true,
        data: product
    })


})
export const getProduct = asyncHandler(async (req, res) => {
    const filter = req.query.includeUnavailable === 'true' ? {} : { isAvailable: true };
    const product = await Product.find(filter);
    res.status(200).json({
        success: true,
        data: product
    })

})
export const getSingleProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
    if (!product) throw new ApiError(404, 'product not found')
    res.status(200).json({
        success: true,
        data: product
    })
})
export const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!product) throw new ApiError(404, 'product not found')
    res.status(200).json({
        success: true,
        message: 'product updated succesfully',
        data: product
    })
})

export const deactivateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw new ApiError(404, 'Product not found');
    product.isAvailable = false;
    await product.save();
    res.status(200).json({ success: true, message: 'Product deactivated' });
});