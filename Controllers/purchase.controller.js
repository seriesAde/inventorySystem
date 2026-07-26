import mongoose from 'mongoose'
import Purchase from '../models/purchase.model.js'
import PurchaseItem from '../models/purchaseItem.model.js'
import asyncHandler from '../utilities/asyncHandler.js'
import ApiError from '../utilities/apiErrors.js'
import StockLevel from '../models/stockLevel.model.js'
import StockMovement from '../models/stockMovement.model.js'
import Product from '../models/product.model.js'



export const createPurchase = asyncHandler(async (req, res) => {
    const { supplier, warehouse } = req.body;
    if (!supplier || !warehouse) throw new ApiError(400, 'Supplier and warehouse are required');

    const purchase = await Purchase.create({
        supplier,
        warehouse,
        createdBy: req.user.id,
    });

    res.status(201).json({ success: true, data: purchase });
});


export const getPurchases = asyncHandler(async (req, res) => {
    const purchases = await Purchase.find().populate('supplier').populate('warehouse');
    res.status(200).json({ success: true, data: purchases });
});


export const getPurchaseById = asyncHandler(async (req, res) => {
    const purchase = await Purchase.findById(req.params.id)
        .populate('supplier')
        .populate('warehouse');
    if (!purchase) throw new ApiError(404, 'Purchase not found');

    const items = await PurchaseItem.find({ purchase: purchase._id }).populate('product');

    res.status(200).json({
        success: true,
        data: {
            ...purchase.toObject(),
            items,
        },
    });
});



export const addPurchaseItem = asyncHandler(async (req, res) => {
    const purchase = await Purchase.findById(req.params.id)

    if (!purchase) throw new ApiError(404, 'Purchase not found');

    if (purchase.status !== 'draft') throw new ApiError(409, 'Cannot add items to a purchase that is not in draft status');

    const { product, quantity, unitCost } = req.body
    if (!product || !quantity || !unitCost) throw new ApiError(400, ' all fields are required')
    const subtotal = quantity * unitCost

    const item = await PurchaseItem.create({
        purchase: purchase._id,
        product,
        quantity,
        unitCost,
        subtotal
    })
    purchase.totalAmount += subtotal
    await purchase.save()

    res.status(201).json({
        success: true,
        data: item,
        newTotalAmount: purchase.totalAmount,
    });
});



export const confirmPurchase = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const purchase = await Purchase.findById(req.params.id).session(session)
        if (!purchase) throw new ApiError(404, 'no purchase found')
        if (purchase.status !== 'draft') throw new ApiError(409, 'conflict transaction edit not allowed')

        const items = await PurchaseItem.find({ purchase: purchase._id }).session(session);
        if (items.length === 0) throw new ApiError(400, 'there is nothing to confirm')
        for (const item of items) {
            const stockLevel = await StockLevel.findOneAndUpdate(
                { product: item.product, warehouse: purchase.warehouse },
                { $inc: { currentQuantity: item.quantity } },
                { new: true, upsert: true, session }
            );

            const quantityBefore = stockLevel.currentQuantity - item.quantity;

            const payload = {
                product: item.product,
                warehouse: purchase.warehouse,
                type: 'purchase',
                quantity: item.quantity,
                quantityBefore,
                quantityAfter: stockLevel.currentQuantity,
                sourceType: 'Purchase',
                sourceId: purchase._id,
                performedBy: req.user.id,
            };

            await StockMovement.create([payload], { session });

            await Product.findByIdAndUpdate(
                item.product,
                { costPrice: item.unitCost },
                { session }
            );
        }

        purchase.status = 'confirmed';
        purchase.confirmedAt = new Date();
        await purchase.save({ session });

        await session.commitTransaction();

        res.status(200).json({ success: true, data: purchase });

    } catch (error) {
        await session.abortTransaction();
        throw error; // asyncHandler catches this and forwards it to your error handler
    } finally {
        session.endSession();
    }

})



export const cancelPurchase = asyncHandler(async (req, res) => {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) throw new ApiError(404, 'Purchase not found');
    if (purchase.status !== 'draft') throw new ApiError(409, 'Only draft purchases can be cancelled');

    purchase.status = 'cancelled';
    await purchase.save();

    res.status(200).json({ success: true, message: 'Purchase cancelled', data: purchase });
});