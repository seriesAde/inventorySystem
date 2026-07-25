import Warehouse from "../models/warehouse.model.js";
import asyncHandler from "../utilities/asyncHandler.js";
import ApiError from "../utilities/apiErrors.js";

export const createWarehouse = asyncHandler(async (req, res) => {
    const { name, code, address } = req.body
    if (!name || !code || !address) throw new ApiError(400, 'all fields are required')
    const warehouse = await Warehouse.create({ name, code, address })
    res.status(201).json({
        success: true,
        message: 'warehouse created successfully ✅',
        data: warehouse
    })
})

export const getWarehouses = asyncHandler(async (req, res) => {
    const filter = req.query.includeInactive === 'true' ? {} : { isActive: true };
    const warehouses = await Warehouse.find(filter);

    res.status(200).json({
        success: true,
        data: warehouses
    });
});

export const getWarehouseById = asyncHandler(async (req, res) => {
    const warehouse = await Warehouse.findById(req.params.id)
    if (!warehouse) throw new ApiError(404, 'warehouse not found')
    res.status(200).json({
        success: true,
        data: warehouse
    })
})

export const updateWarehouse = asyncHandler(async (req, res) => {
    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!warehouse) throw new ApiError(404, 'warehouse not found')
    res.status(200).json({
        success: true,
        message: 'warehouse updated successfully',
        data: warehouse
    })
})

export const deactivateWarehouse = asyncHandler(async (req, res) => {
    const warehouse = await Warehouse.findById(req.params.id)
    if (!warehouse) throw new ApiError(404, 'warehouse not found')
    warehouse.isActive = false
    await warehouse.save();
    res.status(200).json({
        success: true,
        message: 'warehouse deactivated'
    })
})