class ExpressError extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
};
// setting up the ExpressError as the error class
module.exports = ExpressError;