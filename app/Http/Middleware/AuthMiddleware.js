const helper = require('../../Helpers/helper');

function AuthMiddleware(req, res, next) {
  const token = req.headers.authorization || req.query.token;
  if (!token) return helper.apiResponse(res, false, 'Unauthorized', [], 401);
  next();
}

module.exports = AuthMiddleware;
