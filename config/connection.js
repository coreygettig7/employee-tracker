const mysql = require('mysql2');

require('dotenv').config();

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.MYSQL_PASSWORD,
    database: 'cms_db'
});

module.exports = connection;