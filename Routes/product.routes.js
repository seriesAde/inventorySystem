import express from 'express'
import {createProduct, getProduct, getSingleProduct, updateProduct, deactivateProduct} from '../Controllers/product.controller.js'
import { protect, authorize } from '../middlewares/auth.middleware.js'


const router = express.Router()

router.post('/', protect, authorize('admin', 'manager', 'storekeeper'), createProduct);
router.get('/', protect, getProduct);
router.get('/:id', protect, getSingleProduct);
router.patch('/:id', protect, authorize('admin', 'manager', 'storekeeper'), updateProduct);
router.patch('/:id/deactivate', protect, authorize('admin', 'manager', 'storekeeper'), deactivateProduct);

export default router 