import express, { Router } from "express";
import { addPurchaseItem, getPurchaseById,getPurchases, createPurchase,confirmPurchase, cancelPurchase } from "../Controllers/purchase.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router()


router.post('/', protect, authorize('admin', 'manager', 'storekeeper'), createPurchase);
router.get('/', protect, getPurchases);
router.get('/:id', protect, getPurchaseById);
router.post('/:id/items', protect, authorize('admin', 'manager', 'storekeeper'), addPurchaseItem);
router.patch('/:id/confirm', protect, authorize('admin', 'manager', 'storekeeper'), confirmPurchase);
router.patch('/:id/cancel', protect, authorize('admin', 'manager', 'storekeeper'), cancelPurchase);

export default router