import express from 'express'
import { createStockAdjustment,getStockAdjustment,getStockAdjustmentById } from '../Controllers/stockAdjustment.controller.js';
import { protect,authorize } from '../middlewares/auth.middleware.js';



const router = express.Router()

router.post('/', protect, authorize('admin', 'manager'), createStockAdjustment);
router.get('/', protect,  getStockAdjustment);
router.get('/:id', protect, getStockAdjustmentById);




export default router;