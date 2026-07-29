import express from 'express';
import { changePassword, updateProfile, createUser,deactivateUser, deleteUser,reactivateUser } from "../Controllers/user.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router()

router.post('/', protect, authorize('admin'), createUser);
router.patch('/me/password', protect, changePassword)
router.patch('/me', protect, updateProfile);
router.patch('/me/:id/deactivate', protect, authorize('admin'), deactivateUser);
router.patch('/me/:id/reactivate', protect, authorize('admin'), reactivateUser);
router.delete('/me/:id', protect, authorize('admin'), deleteUser);

export default router;


