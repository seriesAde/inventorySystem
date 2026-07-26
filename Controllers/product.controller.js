import Product from "../models/product.model.js";
import asyncHandler from "../utilities/asyncHandler.js";
import ApiError from "../utilities/apiErrors.js";
import { cloudinary } from "../middlewares/upload.middleware.js";

export const createProduct = asyncHandler(async (req, res) => {
    const { sku, name, description, category, unitPrice, costPrice, reorderThreshold } = req.body;
    if (!sku || !name || !category || unitPrice === undefined || costPrice === undefined || reorderThreshold === undefined) {
        throw new ApiError(400, 'All fields are required');
    }

    const images = req.files
        ? req.files.map((file) => ({ url: file.path, public_id: file.filename }))
        : [];

    const product = await Product.create({
        sku, name, description, category, unitPrice, costPrice, reorderThreshold,
        image: images,
        createdBy: req.user.id,
    });

    res.status(201).json({ success: true, data: product });
});


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
    const updateData = { ...req.body };
    delete updateData.image; // never let raw JSON overwrite images directly — only uploads should

    const product = await Product.findById(req.params.id);
    if (!product) throw new ApiError(404, 'Product not found');

    if (req.files && req.files.length > 0) {
        const newImages = req.files.map((file) => ({ url: file.path, public_id: file.filename }));
        product.image.push(...newImages);
    }

    Object.assign(product, updateData);
    await product.save();

    res.status(200).json({ success: true, message: 'Product updated successfully', data: product });
});

export const deactivateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw new ApiError(404, 'Product not found');
    product.isAvailable = false;
    await product.save();
    res.status(200).json({ success: true, message: 'Product deactivated' });
});



export const reactivateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw new ApiError(404, 'Product not found');
    product.isAvailable = true;
    await product.save();
    res.status(200).json({ success: true, message: 'Product reactivated', data:product });
});


export const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) throw new ApiError(404, 'Product not found');
    res.status(200).json({ success: true, message: 'Product permanently deleted' });
});

export const deleteProductImage = asyncHandler(async (req, res) => {
    const { id, imageId } = req.params;
    const product = await Product.findById(id);
    if (!product) throw new ApiError(404, 'Product not found');

    const image = product.image.id(imageId);
    if (!image) throw new ApiError(404, 'Image not found on this product');

    await cloudinary.uploader.destroy(image.public_id); // remove from Cloudinary too, not just the DB

    product.image.pull(imageId);
    await product.save();

    res.status(200).json({ success: true, message: 'Image deleted', data: product });
});