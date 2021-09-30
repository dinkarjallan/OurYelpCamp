const mongoose = require('mongoose');
const Review = require('./review');
// variable to cut short the referencing
const Schema = mongoose.Schema;
const { cloudinary } = require('../cloudinary');


const ImageSchema = new Schema({
    url: String,
    filename: String
}); // nested schema so use the virtual property on the images

// creating virtual 'thumbnail' property on CampgroundSchema
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200'); // adding 'cloudinary image manipulation' properties inside of the 'url'
});

const opts = { toJSON: { virtuals: true } };
// creating a schema
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema], // nested schema
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);


CampgroundSchema.virtual('properties.popUpMarkup').get(function () { // nested virtual
    return `
        <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
        <p>${this.description.substring(0, 110)}<strong>...</strong></p>
        ` // virtual for the cluster map to access the markup on properties on the frontend and display it on the popup
});

CampgroundSchema.post('findOneAndDelete', async function (campground) {
    if (campground) {
        await Review.deleteMany({ _id: { $in: campground.reviews } }); // remove from Review collection, everything whose '_id' are found 'in' campround.reviews array of ObjectID's
        for (let image of campground.images) {
            // deleting from cloudinary
            await cloudinary.uploader.destroy(image.filename); // deleting the images in the deleteImages array from the cloud, when a campground is deleted
        }
    }
})


// compiling the model and exporting it
module.exports = mongoose.model('Campground', CampgroundSchema);