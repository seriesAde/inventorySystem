import express from 'express'
import { protect } from '../middlewares/auth.middleware.js'
import { getLowStockProducts, getStockLevels } from '../Controllers/stock.contoller.js';

const router = express.Router()


router.get('/', protect,  getStockLevels);
router.get('/low', protect, getLowStockProducts);


export default router