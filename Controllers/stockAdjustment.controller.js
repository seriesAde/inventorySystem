import mongoose from "mongoose"
import StockAdjustment from "../models/stockAdjustment.model.js"
import ApiError from "../utilities/apiErrors.js"
import StockLevel from "../models/stockLevel.model.js"
import StockMovement from "../models/stockMovement.model.js"
import asyncHandler from "../utilities/asyncHandler.js"





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