const Campground = require('./models/campground');
const Review = require('./models/review');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {  // using Passport's "isAuthenticated" method on req to check authentication on campground route
        req.session.returnTo = req.originalUrl; // storing the url onto the session to redirect the user back after logging in
        req.flash('error', 'You must be Logged in!');
        res.redirect('/login');
    } else {
        next();
    }
} // exporting a middleware that checkes whether they are already logged in or not!

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}; // server validation middleware for campgrounds

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', "Sorry, can't do that!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}; // author confirmation middleware, checking if the author of the campground is the same guy that is loggedin right now!

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}; // server validation middleware for reviews

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', "Sorry, can't do that!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}; // checking if the author of the review is the same guy loggedin right now

