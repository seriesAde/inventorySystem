import express from 'express'
import { protect, authorize } from '../middlewares/auth.middleware.js'
import { getLowStockProducts, getStockLevels,createStockTransfer, getStockAdjustment, getStockAdjustmentById, createStockAdjustment, getStockValuation } from '../Controllers/stock.contoller.js';


const router = express.Router()


router.post('/transfer', protect, authorize('admin', 'manager'), createStockTransfer);
router.post('/adjust', protect, authorize('admin', 'manager'), createStockAdjustment);
router.get('/low', protect, getLowStockProducts);
router.get('/', protect,  getStockLevels);
router.get('/valuation', protect, authorize('admin'),  getStockValuation);
router.get('/adjustment', protect,  getStockAdjustment);
router.get('/adjustment/:id', protect, getStockAdjustmentById);



export default router