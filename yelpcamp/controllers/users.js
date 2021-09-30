const User = require('../models/user');


module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

module.exports.register = async (req, res, next) => {
    try { // trying and catching, to display a custom fallback for registering errors on top of catchAsync
        const { username, email, password } = req.body; // destructuring req.body
        const newUser = new User({ email, username }); // making a new User using the usernane and email
        const registeredUser = await User.register(newUser, password); // registering the User, wuth the hashed password
        req.login(registeredUser, err => {  // logging in as soon as user registers to yelpcamp using passport's login 
            if (err) {
                return next(err); // catch err
            } else { // execute other code if no error
                req.flash('success', 'Welcome to yelpcamp');
                res.redirect('/campgrounds');
            }
        });
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/register');
    }
};

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

module.exports.login = (req, res) => {
    const redirectUrl = req.session.returnTo || '/campgrounds'; // saving the url to return back after logging in OR redirecting to /campgrounds 
    delete req.session.returnTo; // clearing out the 'returnTo'(not redirectUrl) to avoid Url conflicts
    req.flash('success', 'welcome Back!');
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
    req.logout(); // logging out using passport method (this is crazy... i mean just look at this! damn)
    req.flash('success', 'Logged Out Successfully!')
    res.redirect('/campgrounds');
}