import Supplier from "../models/supplier.model.js";
import asyncHandler from "../utilities/asyncHandler.js";
import ApiError from "../utilities/apiErrors.js";

export const createSupplier = asyncHandler(async (req, res) => {
    const { name, email, phone, address, contactPerson } = req.body
    if (!name || !phone ) throw new ApiError(400, 'name and phone number are required')
    const supplier = await Supplier.create({ name, email, phone, address, contactPerson });
    res.status(201).json({
        success: true,
        message: 'supplier created successfully ✅',
        data: supplier
    })
})

export const getSupplier = asyncHandler(async (req, res) => {
    const filter = req.query.includeInactive === 'true' ? {} : { isActive: true };
    const supplier = await Supplier.find(filter);

    res.status(200).json({
        success: true,
        data: supplier
    });
});

export const getSupplierById = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findById(req.params.id)
    if (!supplier) throw new ApiError(404, 'supplier not found')
    res.status(200).json({
        success: true,
        data: supplier
    })
})

export const updateSupplier = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!supplier) throw new ApiError(404, 'supplier not found')
    res.status(200).json({
        success: true,
        message: 'supplier updated successfully',
        data: supplier
    })
})

export const deactivateSupplier = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findById(req.params.id)
    if (!supplier) throw new ApiError(404, 'supplier not found')
    supplier.isActive = false
    await supplier.save();
    res.status(200).json({
        success: true,
        message: 'supplier deactivated'
    })
})

export const reactivateSupplier = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findById(req.params.id)
    if (!supplier) throw new ApiError(404, 'supplier not found')
    supplier.isActive = true
    await supplier.save();
    res.status(200).json({
        success: true,
        message: 'supplier deactivated'
    })
})

export const deleteSupplier = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) throw new ApiError(404, 'Supplier not found');
    res.status(200).json({ success: true, message: 'Supplier permanently deleted' });
});