const mongoose = require("mongoose");

const nodeVisited = new mongoose.Schema({
    visitedBy: String,
    RoomID : String,
    Date : { type: Date, default: Date.now }
});

const VisitedData = mongoose.model('RoomVisitData',nodeVisited);

module.exports =  VisitedData;