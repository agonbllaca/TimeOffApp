//this will return a promise , hence why we can use .catch method , next will forward the error to global error handler middleware
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(err => next(err));
  };
};
