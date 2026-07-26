
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import { env } from '../config/env.js'

cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,

})

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'inventory',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
    }
})

export const upload = multer({ storage })
export { cloudinary };