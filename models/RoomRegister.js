const mongoose = require("mongoose");

const nodeRegister = new mongoose.Schema({
    RoomID : String,
    createdBy : String,
    Date : { type: Date, default: Date.now }
});

const RegisterData = mongoose.model('RoomRegiserData',nodeRegister);

module.exports =  RegisterData;