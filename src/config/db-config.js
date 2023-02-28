require("dotenv").config();
module.exports = {
    host:process.env.HOST,
    user:process.env.DB_USERNAME,
    database:process.env.DATABASE,
    password:process.env.PASSWORD}