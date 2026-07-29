import asyncHandler from "../utilities/asyncHandler.js";
import ApiError from "../utilities/apiErrors.js";
import StockLevel from '../models/stockLevel.model.js'
import mongoose from "mongoose";
import StockAdjustment from "../models/stockAdjustment.model.js"
import StockTransfer from "../models/stocktransfer.model.js";
import StockMovement from "../models/stockMovement.model.js"





export const getStockLevels = asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.product) filter.product = req.query.product;
    if (req.query.warehouse) filter.warehouse = req.query.warehouse;

    const stockLevels = await StockLevel.find(filter)
        .populate('product')
        .populate('warehouse');

    res.status(200).json({ success: true, data: stockLevels });
});


export const getLowStockProducts = asyncHandler(async (req, res) => {
    const lowStock = await StockLevel.aggregate([
        {
            $lookup: {
                from: 'products',        // the actual MongoDB collection name (lowercase, pluralized automatically by Mongoose)
                localField: 'product',    // the field on StockLevel
                foreignField: '_id',      // the field on Product it matches against
                as: 'productInfo',        // Product data gets attached here, as an ARRAY
            },
        },
        { $unwind: '$productInfo' },     // $lookup always returns an array; unwind flattens it to a single object
        {
            $match: {
                $expr: { $lte: ['$currentQuantity', '$productInfo.reorderThreshold'] },
            },
        },
    ]);

    res.status(200).json({ success: true, data: lowStock, message: `Warning Product is running low` });
});



export const createStockTransfer = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { product, fromWarehouse, toWarehouse, quantity, note } = req.body;

        if (!product || !fromWarehouse || !toWarehouse || !quantity) {
            throw new ApiError(400, 'Product, fromWarehouse, toWarehouse, and quantity are required');
        }

        if (fromWarehouse === toWarehouse) {
            throw new ApiError(400, 'Source and destination warehouses must be different');
        }

        const sourceStock = await StockLevel.findOne({ product, warehouse: fromWarehouse }).session(session);
        if (!sourceStock) throw new ApiError(404, 'No stock record found at source warehouse');
        if (sourceStock.currentQuantity < quantity) {
            throw new ApiError(409, 'Insufficient stock at source warehouse for this transfer');
        }

        const quantityBeforeSource = sourceStock.currentQuantity;

        const updatedSource = await StockLevel.findOneAndUpdate(
            { product, warehouse: fromWarehouse },
            { $inc: { currentQuantity: -quantity } },
            { new: true, session }
        );

        const destStockBefore = await StockLevel.findOne({ product, warehouse: toWarehouse }).session(session);
        const quantityBeforeDest = destStockBefore ? destStockBefore.currentQuantity : 0;

        const updatedDest = await StockLevel.findOneAndUpdate(
            { product, warehouse: toWarehouse },
            { $inc: { currentQuantity: quantity } },
            { new: true, upsert: true, session }
        );

        const transfer = await StockTransfer.create([{
            product,
            fromWarehouse,
            toWarehouse,
            quantity,
            note,
            performedBy: req.user.id,
        }], { session });

        const sourceMovement = {
            product,
            warehouse: fromWarehouse,
            type: 'transfer',
            quantity: -quantity,
            quantityBefore: quantityBeforeSource,
            quantityAfter: updatedSource.currentQuantity,
            sourceType: 'StockTransfer',
            sourceId: transfer[0]._id,
            performedBy: req.user.id,
        };

        const destMovement = {
            product,
            warehouse: toWarehouse,
            type: 'transfer',
            quantity: quantity,
            quantityBefore: quantityBeforeDest,
            quantityAfter: updatedDest.currentQuantity,
            sourceType: 'StockTransfer',
            sourceId: transfer[0]._id,
            performedBy: req.user.id,
        };

        await StockMovement.create([sourceMovement, destMovement], { session, ordered: true });

        await session.commitTransaction();

        res.status(201).json({ success: true, data: transfer[0] });

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});


export const createStockAdjustment = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const { product, warehouse, reason, quantityDelta, note } = req.body
        if (!product || !warehouse || !reason) throw new ApiError(400, 'product, warehouse, and reason are required')
        if (quantityDelta === undefined || quantityDelta === 0) throw new ApiError(400, 'quantity cant be 0')
        const stocklevel = await StockLevel.findOne({ product, warehouse }).session(session)
        if (!stocklevel) throw new ApiError(404, 'no stock record found for this product at this warehouse')
        if (quantityDelta < 0 && stocklevel.currentQuantity + quantityDelta < 0) throw new ApiError(409, 'adjustment will result in negative stock')

        const updated = await StockLevel.findOneAndUpdate({ product, warehouse },
            { $inc: { currentQuantity: quantityDelta } }, {
            new: true, session

        }
        )
        const quantityBefore = stocklevel.currentQuantity;

        const adjustment = await StockAdjustment.create([{
            product,
            warehouse,
            reason,
            quantityDelta,
            note,
            performedBy: req.user.id
        }], { session })


        const payload = {
            product,
            warehouse,
            type: 'adjustment',
            quantity: quantityDelta,
            quantityBefore,
            quantityAfter: updated.currentQuantity,
            sourceType: 'StockAdjustment',
            sourceId: adjustment[0]._id,
            performedBy: req.user.id,
        };

        await StockMovement.create([payload], { session });

        await session.commitTransaction();

        res.status(201).json({ success: true, data: adjustment[0] });

    } catch (error) {
        await session.abortTransaction();
        throw error; // asyncHandler catches this and forwards it to your error handler
    } finally {
        session.endSession();
    }

})



export const getStockAdjustment = asyncHandler(async (req, res) => {
    const stocks = await StockAdjustment.find()
        .populate('product')
        .populate('warehouse')
        .populate('performedBy')

    res.status(200).json({ success: true, data: stocks });
})


export const getStockAdjustmentById = asyncHandler(async (req, res) => {
    const stock = await StockAdjustment.findById(req.params.id).populate('product')
        .populate('warehouse')
        .populate('performedBy')
    if (!stock) throw new ApiError(404, 'Stock adjustment not found');
    res.status(200).json({ success: true, data: stock })
})


export const getStockValuation = asyncHandler(async (req, res) => {
    const matchStage = req.query.warehouse
        ? { warehouse: new mongoose.Types.ObjectId(req.query.warehouse) }
        : {};

    const valuation = await StockLevel.aggregate([
        { $match: matchStage },
        {
            $lookup: {
                from: 'products',
                localField: 'product',
                foreignField: '_id',
                as: 'productInfo',
            },
        },
        { $unwind: '$productInfo' },
        {
            $project: {
                product: '$productInfo.name',
                sku: '$productInfo.sku',
                currentQuantity: 1,
                costPrice: '$productInfo.costPrice',
                itemValue: { $multiply: ['$currentQuantity', '$productInfo.costPrice'] },
            },
        },
        {
            $group: {
                _id: null,
                totalValue: { $sum: '$itemValue' },
                items: { $push: '$$ROOT' },
            },
        },
    ]);

    res.status(200).json({
        success: true,
        data: valuation[0] || { totalValue: 0, items: [] },
    });
});


export const getMovementHistory = asyncHandler(async (req, res) => {
    const filter = {};

    if (req.query.product) filter.product = req.query.product;
    if (req.query.warehouse) filter.warehouse = req.query.warehouse;
    if (req.query.type) filter.type = req.query.type;

    if (req.query.startDate || req.query.endDate) {
        filter.createdAt = {};
        if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
        if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
    }

    const movements = await StockMovement.find(filter)
        .populate('product')
        .populate('warehouse')
        .populate('performedBy')
        .sort({ createdAt: -1 }); // most recent first

    res.status(200).json({ success: true, count: movements.length, data: movements });
});

export const getMovementSummary = asyncHandler(async (req, res) => {
    const matchStage = { type: 'sale' };

    if (req.query.startDate || req.query.endDate) {
        matchStage.createdAt = {};
        if (req.query.startDate) matchStage.createdAt.$gte = new Date(req.query.startDate);
        if (req.query.endDate) matchStage.createdAt.$lte = new Date(req.query.endDate);
    }

    const summary = await StockMovement.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$product',
                totalSold: { $sum: { $abs: '$quantity' } }, // quantity is negative for sales, $abs makes it positive for reporting
                movementCount: { $sum: 1 },
            },
        },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'productInfo',
            },
        },
        { $unwind: '$productInfo' },
        {
            $project: {
                _id: 0,
                product: '$productInfo.name',
                sku: '$productInfo.sku',
                totalSold: 1,
                movementCount: 1,
            },
        },
        { $sort: { totalSold: -1 } }, // fastest movers first; reverse with 1 for slowest
    ]);

    res.status(200).json({ success: true, data: summary });
});


