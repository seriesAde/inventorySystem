import express from 'express'
import {createWarehouse, getWarehouses,getWarehouseById,updateWarehouse, deactivateWarehouse} from '../Controllers/warehouse.controller.js'
import { protect, authorize } from '../middlewares/auth.middleware.js'


const router = express.Router()

router.post('/', protect, authorize('admin', 'manager'), createWarehouse);
router.get('/', protect, getWarehouses);
router.get('/:id', protect, getWarehouseById);
router.patch('/:id', protect, authorize('admin', 'manager'), updateWarehouse);
router.patch('/:id/deactivate', protect, authorize('admin', 'manager'), deactivateWarehouse);

export default router 