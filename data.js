var winWards = 0, loseWards = 0;
var mongoose = require('mongoose');
var dataTypes = require('./dataTypes');

var wardCount, lastMatchId;

var dbInit = function(){
    mongoose.connect('mongodb://localhost:27017/warded');

    lastMatchId = mongoose.model('lastmatchid', dataTypes.lastMatchId);
    wardCount = mongoose.model('wardCount', dataTypes.wardCount);
}

dbInit();

exports.updateWinWards = function(wards){
    winWards += wards;
}

exports.updateLoseWards = function(wards){
    loseWards += wards;
}

exports.getNextMatchId = function(callback){
    lastMatchId.find(callback);

    lastMatchId.update({}, {$inc:{lastMatchId:1}}, {upsert:true}, function(err){
                err && console.log("Error updating last matchid: " + err);
    });
}

exports.updateWardCount = function(isWinner, rank, wardsPlaced, visionWardsBoughtInGame, sightWardsBoughtInGame, wardsKilled){
    rank = rank || "NOT_RANKED";
    wardCount.update({rank:rank, winner: isWinner},
        {$set: {rank:rank, winner:isWinner},
            $inc: {
                wardsPlaced:wardsPlaced,
                visionWardsBoughtInGame:visionWardsBoughtInGame,
                players:1,
                sightWardsBoughtInGame:sightWardsBoughtInGame,
                wardsKilled:wardsKilled
            }}, {upsert:true}, function(err){
            err && console.log("Error updating rank ward details: " + err);
        });
}

exports.getWardCount = function(callback){
    var query = wardCount.find();
    query.sort({rank:'asc', winner:'asc'});
    query.exec(callback);
};