/**
 * Global helper – use anywhere in the project.
 * API responses: use apiResponse() everywhere (controllers, error handler, middleware).
 */

// ----- API response: use EVERYWHERE for all API JSON responses -----
function apiResponse(res, status = true, message = '', data = [], statusCode = null) {
  const code = statusCode != null ? statusCode : (status ? 200 : 500);
  const msg = message || (status ? 'Success' : 'Something went wrong');
  return res.status(code).json({
    status: !!status,
    message: msg,
    data: data != null ? data : [],
  });
}

// ----- Throw error (services: no res, so throw; controller passes to next()) -----
function throwErr(message, statusCode = 400) {
  throw { message, statusCode };
}
function err(message, statusCode = 400) {
  return { message, statusCode };
}

// ----- Validation -----
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(email) {
  return email && typeof email === 'string' && emailRegex.test(email.trim());
}

function trim(str) {
  return (str == null ? '' : String(str)).trim();
}

function env(key, defaultValue = '') {
  return process.env[key] != null ? process.env[key] : defaultValue;
}

module.exports = {
  apiResponse,
  throwErr,
  err,
  isValidEmail,
  trim,
  env,
};
