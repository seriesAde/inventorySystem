import express from 'express';
import { changePassword, updateProfile, createUser } from "../Controllers/user.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router()

router.patch('/me/password', protect, changePassword)
router.patch('/me', protect, updateProfile);
router.post('/', protect, authorize('admin'), createUser);

export default router;


