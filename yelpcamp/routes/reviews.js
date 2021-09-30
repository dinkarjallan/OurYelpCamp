const express = require('express');
const router = express.Router({ mergeParams: true }); // setting 'mergeParams' option to TRUE, so that the params from the 'app' are merged with the 'router's

// route dependencies
const catchAsync = require('../utils/catchAsync');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews');


// review routes
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;