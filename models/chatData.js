const mongoose = require("mongoose");

const nodechat = new mongoose.Schema({
    sentBy : String,
    RoomID : String,
    body : String,
    no : String,
    Date : { type: Date, default: Date.now }
});

const chatData = mongoose.model('chatData',nodechat);

module.exports = chatData;