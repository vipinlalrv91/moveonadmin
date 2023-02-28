const jwt = require("jsonwebtoken");

module.exports = (_user,_envSecret)=> jwt.sign(_user,_envSecret)