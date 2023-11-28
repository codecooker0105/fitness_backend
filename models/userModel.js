// models/itemModel.js
const db = require("../config/db");

const checkDuplicateField = async (field, value, table) => {
}

const getAllUsers = async (callback) => {

  try {
    const users = await db('users');
    callback(users);
  } catch (e) {
    console.log(e);
  }
};

const getUserById = async (userId, callback) => {

  try {
    const userById = await db('users').where('id', userId);
    callback(userById);
  } catch (e) {
    console.log(e);
  }
};

const createUser = async (userData, callback) => {
  const query = insert("users").given({

  });

  try {
    // const result = await query.execute(pool);
    callback(result);
  } catch (e) {
    console.log(e);
  }
};

const updateUser = (userId, userData, callback) => {
  // pool.query("UPDATE users SET ? WHERE id = ?", [userData, userId], (error) => {
  //   if (error) throw error;
  //   callback();
  // });
};

const deleteUser = (userId, callback) => {
  // pool.query("DELETE FROM users WHERE id = ?", [userId], (error) => {
  //   if (error) throw error;
  //   callback();
  // });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
