const express = require('express');
const router = express.Router();

// route dependencies
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware'); // requiring required middlewares
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');
const { storage } = require('../cloudinary'); // importing the configured CloudinaryStorage instance
const upload = multer({ storage }); // setting multer to use the cloudinary storage instead of local storage

// CRUD operations
router.route('/') // grouping the routes with router.route
    .get(catchAsync(campgrounds.index)) // rendering index
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));


router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.destroyCampground));

// rendering the edit form and then the route for the put request 
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;