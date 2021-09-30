if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
};


// configuring and requiring express
const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;

// requiring app dependencies
const flash = require('connect-flash'); // connect-flash
const session = require('express-session'); // express session manager
const ejsMate = require('ejs-mate'); // ejs-mate
const ExpressError = require('./utils/ExpressError'); // ExpressError from utilities
const methodOverride = require('method-override'); // method-override
const mongoose = require('mongoose'); // mongoose ODM
const passport = require('passport'); // plain old passport, allows to integrate multiple strategies
const LocalStrategy = require('passport-local'); // the passport-local strategy out of Passport
const User = require('./models/user'); // requiring the user model
const mongoSanitize = require('express-mongo-sanitize'); //requring the mongo sanitizer that prohibits reserved characters to be passed in as query
const helmet = require('helmet');

// requiring the routes
const campgroundRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const MongoStore = require('connect-mongo'); // requiring the mongodb session store

const dbUrl =  process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'; // database location variable

// connecting to mongoDB or mongo ATLAS (development/production)
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'CONNECTION ERROR:')); // checking for any error in connection
db.once('open', () => {
    console.log('DATABASE CONNECTED');
});

app.engine('ejs', ejsMate); // setting ejs templates to use ejs locals
app.set('view engine', 'ejs'); // setting view engine
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); // for parsing the request body
app.use(methodOverride('_method')); // override with POST having '?_method='
app.use(express.static(path.join(__dirname, 'public'))); // helps in serving static files 

app.use(mongoSanitize({
    replaceWith: '_', // replacing all the prohibited characters with an '_' 
})); // using mongo sanitizer


const secret = process.env.SECRET || 'thisshouldbeabettersecret'; // session secret key variable

// setting up session store options
const storeConfig = {
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 3600 // time period in seconds
};


// setting up express session options
const sessionConfig = {
    store: MongoStore.create(storeConfig),
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // time in miliSeconds
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig)); // setting up express session middleware
app.use(flash()); // 'using' flash
app.use(helmet()); // using the helmet for HTTP header security

// allowances for sources
const scriptSrcUrls = [
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [
    "https://fonts.googleapis.com/",
    "https://fonts.gstatic.com/",
];

// configuring the content policy 
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", ...connectSrcUrls], // use self and connectSrcUrls
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls], // use self, 
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dk8jzfr34/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



app.use(passport.initialize()); // initialize passport
app.use(passport.session()); // sets passport up for a persistent login session
passport.use(new LocalStrategy(User.authenticate())); // telling passport to static authenticate method of model in the localstrategy

// use static serialize and desialize of model for passport session support
passport.serializeUser(User.serializeUser()); // serializing user (storing user to a session)
passport.deserializeUser(User.deserializeUser()); // deserializing user (un-storing or retrieving user from a session)


// middleware to give access of the flash messages to the html templates on every single request
app.use((req, res, next) => {
    res.locals.currentUser = req.user;  // saving the information of authorized user on the session
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// ROUTES
app.use('/campgrounds', campgroundRoutes); // for the campgrounds
app.use('/campgrounds/:id/reviews', reviewRoutes); // for reviews
app.use('/', userRoutes); // for user registrations

// rendering the home template on the home route
app.get('/', (req, res) => {
    res.render('home');
});

// Error Handlers******************
// "unknown page" error-route handler {hits on every request, therefore ORDER is very important}
app.all('*', (req, res, next) => {
    return next(new ExpressError('Page not found!', 404))
});

// 'catch all' generic handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh No,Something Went Wrong!"; //checking if the created error contains a message or not 
    res.status(statusCode).render('error', { err });
});

// port listener
app.listen(port, () => {
    console.log(`Serving on port ${port} in ${ process.env.NODE_ENV === 'production' ? "Production" : "Development"}`);
});