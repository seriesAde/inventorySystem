import express from 'express'
import {createCategory,getCategory, getCategoryById, updateCategory, deactivateCategory, reactivateCategory, deleteCategory} from '../Controllers/category.controller.js'
import { protect, authorize } from '../middlewares/auth.middleware.js'


const router = express.Router()

router.post('/', protect, authorize('admin', 'manager'), createCategory);
router.get('/', protect, getCategory);
router.get('/:id', protect, getCategoryById);
router.patch('/:id', protect, authorize('admin', 'manager'), updateCategory);
router.patch('/:id/deactivate', protect, authorize('admin', 'manager'), deactivateCategory);
router.patch('/:id/reactivate', protect, authorize('admin', 'manager'), reactivateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

export default router 