import mongoose from "mongoose";
import User from "../models/User.model.js";
import { connectDB } from '../config/db.js';
import { env } from "../config/env.js";
import crypto from 'crypto';





const checkAdmin = async () => {

    const isProd = env.nodeEnv === 'production';

    // protect the database in production so anyone cant just create admin 
    if (isProd && !process.env.ALLOW_PROD_SEED) {
        console.error('Refusing to run in production. Set ALLOW_PROD_SEED=true to override.');
        process.exit(1);
    }

    // generating a random password for admin 
    const seedPassword = isProd
        ? crypto.randomBytes(12).toString('hex')
        : 'admin';

    const DEFAULT_ADMIN = {
        name: 'System Admin',
        email: 'admin@admin.local',
        password: seedPassword,
        role: 'admin',
        mustChangePassword: true
    };

    try {
   
        await connectDB();
        const user = await User.findOne({ role: 'admin' });
        if (user) {
            console.log('Admin already exists, skipping seed.');
        } else {
            await User.create(DEFAULT_ADMIN);
            console.log(`Admin created — email: ${DEFAULT_ADMIN.email}, password: ${DEFAULT_ADMIN.password}`);
        }
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Seed failed:', error.message);
        process.exit(1);
    }
};

checkAdmin();