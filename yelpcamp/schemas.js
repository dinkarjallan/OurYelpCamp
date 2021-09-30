// requiring Joi data validator package for server validators
const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

// writting a joi extension
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!!'
    },
    rules: {
        escapeHTML: { // writting 'escapeHTML' extension method to sanitize the HTML 
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if(clean !== value) return helpers.error('string.escapeHTML', {value});
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension); // extending joi with a HTML sanitizer extension



// exporting the server validation for the campgrounds on the create and update route
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
    }).required(),
    deleteImages: Joi.array()
});

// exporting the server validation for the campgrounds on the create and update route
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML(),
    }).required()
});