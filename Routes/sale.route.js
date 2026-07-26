import express from 'express'
import { authorize, protect } from '../middlewares/auth.middleware.js';
import { createSale, getSaleById, getSales, addSaleItem, confirmSale, cancelSale } from '../Controllers/sale.controller.js';



const router = express.Router() 

router.post('/', protect, authorize('admin', 'manager', 'storekeeper'), createSale);
router.get('/', protect, getSales);
router.get('/:id', protect, getSaleById);
router.post('/:id/items', protect, authorize('admin', 'manager', 'storekeeper'), addSaleItem);
router.patch('/:id/confirm', protect, authorize('admin', 'manager', 'storekeeper'), confirmSale);
router.patch('/:id/cancel', protect, authorize('admin', 'manager', 'storekeeper'), cancelSale);


export default router