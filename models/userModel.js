// models/itemModel.js
const pool = require('../config/db');

const getAllUsers = (callback) => {
  pool.query('SELECT * FROM users', (error, results) => {
    if (error) throw error;
    callback(results);
  });
};

const getUserById = (userId, callback) => {
  pool.query('SELECT * FROM users WHERE id = ?', [userId], (error, results) => {
    if (error) throw error;
    callback(results[0]);
  });
};

const createUser = (userData, callback) => {
  pool.query('INSERT INTO users SET ?', [userData], (error, results) => {
    if (error) throw error;
    callback(results.insertId);
  });
};

const updateUser = (userId, userData, callback) => {
  pool.query('UPDATE users SET ? WHERE id = ?', [userData, userId], (error) => {
    if (error) throw error;
    callback();
  });
};

const deleteUser = (userId, callback) => {
  pool.query('DELETE FROM users WHERE id = ?', [userId], (error) => {
    if (error) throw error;
    callback();
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
