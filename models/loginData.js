const mongoose = require("mongoose");

const nodelogin = new mongoose.Schema({
    username : String,
    password : String,
    Description : String,
    email : String,
    Date : { type: Date, default: Date.now }
});

const loginData = mongoose.model('loginData',nodelogin);

module.exports = loginData;