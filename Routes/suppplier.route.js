import express from 'express'
import {createSupplier,getSupplier,getSupplierById,updateSupplier,deactivateSupplier, reactivateSupplier,deleteSupplier} from '../Controllers/supplier.controller.js'
import { protect, authorize } from '../middlewares/auth.middleware.js'


const router = express.Router()

router.post('/', protect, authorize('admin', 'manager'), createSupplier);
router.get('/', protect, getSupplier);
router.get('/:id', protect, getSupplierById);
router.patch('/:id', protect, authorize('admin', 'manager'), updateSupplier);
router.patch('/:id/deactivate', protect, authorize('admin', 'manager'), deactivateSupplier);
router.patch('/:id/reactivate', protect, authorize('admin', 'manager'), reactivateSupplier);
router.delete('/:id', protect, authorize('admin'), deleteSupplier);

export default router 