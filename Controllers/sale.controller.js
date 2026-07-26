
import Product from "../models/product.model.js";
import SaleItem from "../models/saleItem.model.js";
import Sale from "../models/sales.model.js";
import StockLevel from "../models/stockLevel.model.js";
import StockMovement from "../models/stockMovement.model.js";
import ApiError from "../utilities/apiErrors.js";
import asyncHandler from "../utilities/asyncHandler.js";
import mongoose from "mongoose";









export const createSale = asyncHandler(async (req, res) => {
    const { customerName, warehouse } = req.body;
    if (!warehouse) throw new ApiError(400, ' warehouse is required');

    const sale = await Sale.create({
        customerName,
        warehouse,
        createdBy: req.user.id,
    });

    res.status(201).json({ success: true, data: sale });
});


export const getSales = asyncHandler(async (req, res) => {
    const sale = await Sale.find().populate('warehouse');
    res.status(200).json({ success: true, data: sale });
});



export const getSaleById = asyncHandler(async (req, res) => {
    const sale = await Sale.findById(req.params.id)
        .populate('warehouse');
    if (!sale) throw new ApiError(404, 'sales not found');

    const items = await SaleItem.find({ sale: sale._id }).populate('product');

    res.status(200).json({
        success: true,
        data: {
            ...sale.toObject(),
            items,
        },
    });
});




export const addSaleItem = asyncHandler(async (req, res) => {
    const sale = await Sale.findById(req.params.id)

    if (!sale) throw new ApiError(404, 'Sale not found');

    if (sale.status !== 'draft') throw new ApiError(409, 'Cannot add items to a Sale that is not in draft status');

    const { product, quantity, unitPrice } = req.body
    if (!product || !quantity || !unitPrice) throw new ApiError(400, ' all fields are required')
    const subtotal = quantity * unitPrice

    const item = await SaleItem.create({
        sale: sale._id,
        product,
        quantity,
        unitPrice,
        subtotal
    })
    sale.totalAmount += subtotal
    await sale.save()

    res.status(201).json({
        success: true,
        data: item,
        newTotalAmount: sale.totalAmount,
    });
});






export const confirmSale = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const sale = await Sale.findById(req.params.id).session(session)
        if (!sale) throw new ApiError(404, 'no sale found')
        if (sale.status !== 'draft') throw new ApiError(409, 'conflict transaction edit not allowed')

        const items = await SaleItem.find({ sale: sale._id }).session(session);
        if (items.length === 0) throw new ApiError(400, 'there is nothing to confirm')
        for (const item of items) {
            const stockLevel = await StockLevel.findOne(
                { product: item.product, warehouse: sale.warehouse }
            ).session(session);

            if (!stockLevel || stockLevel.currentQuantity < item.quantity) {
                throw new ApiError(409, `Insufficient stock for product ${item.product}`);
            }

            const updatedStockLevel = await StockLevel.findOneAndUpdate(
                { product: item.product, warehouse: sale.warehouse },
                { $inc: { currentQuantity: -item.quantity } }, // negative — decrementing
                { new: true, session }
            );

            const quantityBefore = stockLevel.currentQuantity;

            const payload = {
                product: item.product,
                warehouse: sale.warehouse,
                type: 'sale',
                quantity: item.quantity,
                quantityBefore,
                quantityAfter: updatedStockLevel.currentQuantity,
                sourceType: 'Sale',
                sourceId: sale._id,
                performedBy: req.user.id,
            };

            await StockMovement.create([payload], { session });


        }

        sale.status = 'confirmed';
        sale.confirmedAt = new Date();
        await sale.save({ session });

        await session.commitTransaction();

        res.status(200).json({ success: true, data: sale });

    } catch (error) {
        await session.abortTransaction();
        throw error; // asyncHandler catches this and forwards it to your error handler
    } finally {
        session.endSession();
    }

})


export const cancelSale = asyncHandler(async (req, res) => {
    const sale = await Sale.findById(req.params.id);
    if (!sale) throw new ApiError(404, 'Sale not found');
    if (sale.status !== 'draft') throw new ApiError(409, 'Only draft sales can be cancelled');

    sale.status = 'cancelled';
    await sale.save();

    res.status(200).json({ success: true, message: 'Sale cancelled', data: sale });
});