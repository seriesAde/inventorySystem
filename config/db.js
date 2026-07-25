
import mongoose from "mongoose";
import dotenv from 'dotenv';
import { env } from "./env.js";

// dotenv.config();

export async function connectDB(){
    mongoose.set('strictQuery', true);

    mongoose.connection.on('connected', ()=> console.log(`connected to dataBase ✅`))
    mongoose.connection.on('error', (err)=> console.error(`connection error ❌, error: ${err.message}`))
    mongoose.connection.on('disconnected', ()=> console.warn(`disconnected from database😓, attempting to reconnect🔁`))

    const options={
        autoIndex:!env.isProd,
        maxPoolSize:50,
        serverSelectionTimeoutMS:5000,
        socketTimeoutMS:45000
    };
    try {
        await mongoose.connect(env.mongoUri,options);
    } catch (error) {
        console.error(`❌ Critical: Failed to connect to dataBase`, error.message)
        process.exit(1);
    }

}