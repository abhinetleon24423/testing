const { getMysql } = require('../../database/connection');

const TABLE = 'users';

/**
 * MySQL users model (raw query wrapper).
 * Use when MySQL is configured; getMysql() must be connected.
 */
class UserMS {
  static _db() {
    return getMysql();
  }

  static async findAll(omitPassword = true) {
    const db = this._db();
    if (!db) return [];
    const [rows] = await db.query(`SELECT id, mongo_id, name, email${omitPassword ? '' : ', password'}, created_at, updated_at FROM ${TABLE}`);
    return rows;
  }

  static async findById(id) {
    const db = this._db();
    if (!db) return null;
    const [rows] = await db.query(
      `SELECT id, mongo_id, name, email, created_at, updated_at FROM ${TABLE} WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByMongoId(mongoId) {
    const db = this._db();
    if (!db) return null;
    const [rows] = await db.query(
      `SELECT id, mongo_id, name, email, created_at, updated_at FROM ${TABLE} WHERE mongo_id = ? LIMIT 1`,
      [String(mongoId)]
    );
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const db = this._db();
    if (!db) return null;
    const [rows] = await db.query(
      `SELECT id, mongo_id, name, email, created_at, updated_at FROM ${TABLE} WHERE email = ? LIMIT 1`,
      [email]
    );
    return rows[0] || null;
  }

  static async create(data) {
    const db = this._db();
    if (!db) return null;
    const { mongo_id, name, email, password = null } = data;
    const [result] = await db.query(
      `INSERT INTO ${TABLE} (mongo_id, name, email, password) VALUES (?, ?, ?, ?)`,
      [String(mongo_id), name, email, password]
    );
    return { id: result.insertId, mongo_id, name, email, ...data };
  }

  static async updateByMongoId(mongoId, data) {
    const db = this._db();
    if (!db) return null;
    const fields = [];
    const values = [];
    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.email !== undefined) {
      fields.push('email = ?');
      values.push(data.email);
    }
    if (data.password !== undefined) {
      fields.push('password = ?');
      values.push(data.password);
    }
    if (fields.length === 0) return this.findByMongoId(mongoId);
    values.push(String(mongoId));
    await db.query(`UPDATE ${TABLE} SET ${fields.join(', ')} WHERE mongo_id = ?`, values);
    return this.findByMongoId(mongoId);
  }

  static async deleteByMongoId(mongoId) {
    const db = this._db();
    if (!db) return false;
    const [result] = await db.query(`DELETE FROM ${TABLE} WHERE mongo_id = ?`, [String(mongoId)]);
    return result.affectedRows > 0;
  }
}

module.exports = UserMS;
