import express from 'express'
import {createProduct, getProduct, getSingleProduct, updateProduct, deactivateProduct, reactivateProduct, deleteProduct, deleteProductImage} from '../Controllers/product.controller.js'
import { protect, authorize } from '../middlewares/auth.middleware.js'
import {upload} from '../middlewares/upload.middleware.js'


const router = express.Router()

router.post('/', protect, authorize('admin', 'manager', 'storekeeper'), upload.array('image',5), createProduct);
router.get('/', protect, getProduct);
router.get('/:id', protect, getSingleProduct);
router.patch('/:id', protect, authorize('admin', 'manager', 'storekeeper'), upload.array('image',5), updateProduct);
router.patch('/:id/deactivate', protect, authorize('admin', 'manager', 'storekeeper'), deactivateProduct);
router.patch('/:id/reactivate', protect, authorize('admin', 'manager', 'storekeeper'), reactivateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.delete('/:id/images/:imageId', protect, authorize('admin', 'manager', 'storekeeper'), deleteProductImage);

export default router 