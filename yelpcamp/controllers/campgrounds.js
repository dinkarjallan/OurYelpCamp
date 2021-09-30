const Campground = require('../models/campground');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding'); // requiring the geocoding service of mapbox-sdk
const mapBoxToken = process.env.MAPBOX_TOKEN; // saving token to variable
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }); // passing in the token within the instantiating of 'mapboxGeocoding'

const { cloudinary } = require('../cloudinary'); // requiring the configured cloudinary instance so to delete assets from cloud


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send(); // making and sending a 'forware Geocode' request to mapbox to get the coordinates out of the plain text 
    const newCampground = new Campground(req.body.campground); // plugging the request body directly in the model instance
    newCampground.geometry = geoData.body.features[0].geometry; // saving the GeoJSON on newCampground
    newCampground.images = req.files.map(f => ({ url: f.path, filename: f.filename })); // mapping over the 'files' object given by multer, and returning an array of objects that includes path and filename, and then saving it to the instance 
    newCampground.author = req.user._id; // saving the user id as the campground author, and then saving it.
    await newCampground.save();
    // console.log(newCampground);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${newCampground._id}`);
};

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author', // populating the author of each review that is populated on the campground
        }
    }).populate('author'); // finding and populating the campground by the id found in the request params
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    // console.log(campground)
    res.render('campgrounds/show', { campground });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
};
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    // console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs); // spreading the array so that the array only containg string elements and not object elements
    await campground.save(); // saving the image update
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            // deleting from cloudinary
            await cloudinary.uploader.destroy(filename); // deleting the images in the deleteImages array from the cloud also
        }
        // deleting from mongoDB
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } }); // says "pull, from the images array, all images where the filname of the images is 'in' the deleteImages array"
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.destroyCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect(`/campgrounds`);
}