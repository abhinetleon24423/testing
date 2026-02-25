const User = require('../Models/User');
const UserMS = require('../Models/UserMS');
const helper = require('../Helpers/helper');

// Return error result – controller uses this with apiResponse
function err(message, statusCode = 400) {
  return { success: false, message, statusCode };
}

function validateCreate(data) {
  const name = helper.trim(data.name);
  const email = helper.trim(data.email).toLowerCase();
  if (!name) return err('Name is required', 400);
  if (!email) return err('Email is required', 400);
  if (!helper.isValidEmail(email)) return err('Invalid email format', 400);
  return { success: true, data: { name, email, password: data.password || null } };
}

function validateUpdate(data) {
  const out = {};
  if (data.name !== undefined) {
    const name = helper.trim(data.name);
    if (!name) return err('Name cannot be empty', 400);
    out.name = name;
  }
  if (data.email !== undefined) {
    const email = helper.trim(data.email).toLowerCase();
    if (!email) return err('Email cannot be empty', 400);
    if (!helper.isValidEmail(email)) return err('Invalid email format', 400);
    out.email = email;
  }
  if (data.password !== undefined) out.password = data.password;
  return { success: true, data: out };
}

class UserService {
  static async getUsers() {
    try {
      const users = await User.find().select('-password').lean();
      return { success: true, data: users };
    } catch (e) {
      return err(e.code === 11000 ? 'Email already registered' : e.message || 'Something went wrong', e.code === 11000 ? 409 : 500);
    }
  }

  static async getUserById(id) {
    try {
      const user = await User.findById(id).select('-password').lean();
      if (!user) return err('User not found', 404);
      return { success: true, data: user };
    } catch (e) {
      return err(e.message || 'Something went wrong', 500);
    }
  }

  static async createUser(data) {
    const validated = validateCreate(data);
    if (!validated.success) return validated;

    const { name, email, password } = validated.data;
    const existing = await User.findOne({ email }).lean();
    if (existing) return err('Email already registered', 409);

    try {
      const user = await User.create({ name, email, password });
      const obj = user.toObject ? user.toObject() : user;
      const mongoId = String(obj._id);

      try {
        await UserMS.create({
          mongo_id: mongoId,
          name: obj.name,
          email: obj.email || null,
          password: obj.password || null,
        });
      } catch (e) {
        console.error('MySQL user sync create error:', e.message);
      }

      delete obj.password;
      return { success: true, data: obj };
    } catch (e) {
      return err(e.code === 11000 ? 'Email already registered' : e.message || 'Something went wrong', e.code === 11000 ? 409 : 500);
    }
  }

  static async updateUser(id, data) {
    const validated = validateUpdate(data);
    if (!validated.success) return validated;

    const sanitized = validated.data;
    if (sanitized.email) {
      const existing = await User.findOne({ email: sanitized.email, _id: { $ne: id } }).lean();
      if (existing) return err('Email already registered', 409);
    }

    try {
      const user = await User.findByIdAndUpdate(id, sanitized, { new: true }).select('-password').lean();
      if (!user) return err('User not found', 404);

      try {
        await UserMS.updateByMongoId(id, sanitized);
      } catch (e) {
        console.error('MySQL user sync update error:', e.message);
      }

      return { success: true, data: user };
    } catch (e) {
      return err(e.code === 11000 ? 'Email already registered' : e.message || 'Something went wrong', e.code === 11000 ? 409 : 500);
    }
  }

  static async deleteUser(id) {
    try {
      const user = await User.findByIdAndDelete(id);
      if (!user) return err('User not found', 404);
      try {
        await UserMS.deleteByMongoId(id);
      } catch (e) {
        console.error('MySQL user sync delete error:', e.message);
      }
      return { success: true, data: user };
    } catch (e) {
      return err(e.message || 'Something went wrong', 500);
    }
  }
}

module.exports = UserService;
