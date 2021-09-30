const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true  // not an actual validation, just sets up an index (if there's a validation middleware, "unique" is not going to be one of them!)
    }
});

UserSchema.plugin(passportLocalMongoose); // 'plugging in' the passportLocalMongoose into the schema

module.exports = mongoose.model('User', UserSchema);