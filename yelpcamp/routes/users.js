const express = require('express');
const router = express.Router({ mergeParams: true }); // setting 'mergeParams' option to TRUE, so that the params from the 'app' are merged with the 'router's

// route dependencies
const passport = require('passport')
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login); // logging in using the passport middleware, 

// logout using the passport built in method
router.get('/logout', users.logout);

module.exports = router;