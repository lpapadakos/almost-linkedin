module.exports = (middleware, ...paths) => (req, res, next) => paths.some(path => path === req.path) ? next() : middleware(req, res, next);
