module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
};
// this function accepts and returns a function that executes the the function itself and catches any errors if they're thrown and passes the errors to next.