// requiring mongoose 
const mongoose = require('mongoose');
// requiring mongoose model
const Campground = require('../models/campground');
// requiring cities seeds
const cities = require('./cities');
// requiring the seedHelpers for the random titles of the campgrounds
const { places, descriptors } = require('./seedHelpers');

// connecting to mongoDB
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});
// checking for any error in connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'CONNECTION ERROR:'));
db.once('open', () => {
    console.log('DATABASE CONNECTED');
});

// sampling the seedHelpers for campground names
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 500) + 10;
        const camp = new Campground({
            author: '611a571c6f75454b845b95be', //  particularly MY user id
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    "url": "https://res.cloudinary.com/dk8jzfr34/image/upload/v1630676794/Yelpcamp/ncsxmrwhaqfgnanetnkl.jpg",
                    "filename": "Yelpcamp/ncsxmrwhaqfgnanetnkl"
                },
                {
                    "url": "https://res.cloudinary.com/dk8jzfr34/image/upload/v1630676623/Yelpcamp/urbl13ud9numbvw4muer.jpg",
                    "filename": "Yelpcamp/urbl13ud9numbvw4muer"
                }
            ],
            price, //shorthand for 'price : price ;' 
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor laudantium, voluptate, excepturi laboriosam velit iste expedita, illo provident est esse eveniet pariatur animi a asperiores voluptatem ad aperiam ipsam soluta.',
            location: `${cities[random1000].city}, ${cities[random1000].state}`
        });
        await camp.save();
    };
};

seedDB().then(() => {
    mongoose.connection.close();
});