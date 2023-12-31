// config/db.js
require('dotenv').config();
const knex = require('knex');
const knexFile = require('../knexfile.js');

const environment = process.env.NODE_ENV || "development";

module.exports = knex(knexFile[environment]);