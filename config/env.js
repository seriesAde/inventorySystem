import dotenv from 'dotenv'

dotenv.config();

const required= (key,fallback=undefined)=>{
    const value = process.env[key] ?? fallback;
    if (value ===undefined){
        throw new Error(`missing required environment variable: ${key}`);
    }
    return value
};

export const env={
    nodeEnv:process.env.NODE_ENV ||'deployemnt',
    isProd: process.env.NODE_ENV || 'production',
    port: parseInt(process.env.PORT || '5000',10),

    mongoUri: required("MONGO_URI"),
    frontEndUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

    corsOrigins:(process.CORS_ORIGIN || '').split(',').map((o)=> o.trim()).filter(Boolean),
    
    jwtAccessSecret: required('JWT_SECRET'),
    cloudinaryApiKey: required('CLOUD_API_KEY'),
    cloudinaryApiSecret: required('CLOUD_API_SECRET'),
    cloudinaryCloudName: required('CLOUD_NAME')

}