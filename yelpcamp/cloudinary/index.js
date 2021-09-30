const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// associating our cloudinary account with this cloudinary instance
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// setting up an instance of cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary, // pass in the cloudinary object we just configured, and then specifying some things about the cloudinary storage
    params: {
        folder: 'Yelpcamp',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

module.exports = {
    cloudinary, // configured cloudinary instance
    storage // configured CloudinaryStorage instance
};