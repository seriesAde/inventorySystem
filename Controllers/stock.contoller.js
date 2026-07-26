import asyncHandler from "../utilities/asyncHandler.js";
import ApiError from "../utilities/apiErrors.js";
import StockLevel from '../models/stockLevel.model.js'
import mongoose from "mongoose";




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

    res.status(200).json({ success: true, data: lowStock, message:`Warning Product ${lowStock[0].productInfo.name} is running low` });
});
