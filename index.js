import express from 'express';
import authRoutes from './Routes/auth.route.js';
import { env } from './config/env.js';
import cors from 'cors'
import { notFound, errorHandler } from './middlewares/errorHandler.js';
import asyncHandler from './utilities/asyncHandler.js';
import { connectDB } from './config/db.js';
import userRoutes from './Routes/user.route.js'
import warehouseRoutes from './Routes/warehouse.route.js'
import productroutes from './Routes/product.routes.js'




const app = express();

app.use(cors({
    origin: env.corsOrigins.length > 0 ? env.corsOrigins : '*',
    credentials: true
}))

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/warehouses', warehouseRoutes);
app.use('/api/v1/products', productroutes);






app.use(notFound);
app.use(errorHandler);


let server;
asyncHandler(async () => {
    try {
        await connectDB();
        server = app.listen(env.port, () => {
            console.log(`✅ Blog database running on port ${env.port} [${env.nodeEnv}]`)
        })
    } catch (error) {
        console.error('❌ failed to connect: ', error.message)
        process.exit(1)
    }
})();
