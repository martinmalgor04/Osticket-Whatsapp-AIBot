require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false // Asegúrate de que no haya problemas con SSL
});

const query = (text, params) => pool.query(text, params);

module.exports = { query };