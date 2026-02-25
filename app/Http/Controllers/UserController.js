const UserService = require('../../Services/UserService');
const helper = require('../../Helpers/helper');

class UserController {
  /** Home page: render sample view with users data */
  static async indexPage(req, res) {
    const result = await UserService.getUsers();
    const users = result.success ? result.data : [];
    return res.render('pages/home', { users });
  }

  static async index(req, res) {
    const result = await UserService.getUsers();
    if (!result.success) return helper.apiResponse(res, false, result.message, [], result.statusCode);
    return helper.apiResponse(res, true, 'Success', result.data);
  }

  static async show(req, res) {
    const result = await UserService.getUserById(req.params.id);
    if (!result.success) return helper.apiResponse(res, false, result.message, [], result.statusCode);
    return helper.apiResponse(res, true, 'Success', result.data);
  }

  static async store(req, res) {
    const result = await UserService.createUser(req.body);
    if (!result.success) return helper.apiResponse(res, false, result.message, [], result.statusCode);
    return helper.apiResponse(res, true, 'User created', result.data, 201);
  }

  static async update(req, res) {
    const result = await UserService.updateUser(req.params.id, req.body);
    if (!result.success) return helper.apiResponse(res, false, result.message, [], result.statusCode);
    return helper.apiResponse(res, true, 'Success', result.data);
  }

  static async destroy(req, res) {
    const result = await UserService.deleteUser(req.params.id);
    if (!result.success) return helper.apiResponse(res, false, result.message, [], result.statusCode);
    return helper.apiResponse(res, true, 'User deleted', [], 204);
  }
}

module.exports = UserController;
