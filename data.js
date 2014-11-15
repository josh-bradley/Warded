var mongoose = require('mongoose');
var dataTypes = require('./dataTypes');
var NOT_RANKED = require("./constants").NOT_RANKED;
var wardCount, lastMatchId;

var dbInit = function(){
    mongoose.connect('mongodb://localhost:27017/warded');

    lastMatchId = mongoose.model('lastmatchid', dataTypes.lastMatchId);
    wardCount = mongoose.model('wardCount', dataTypes.wardCount);
}

dbInit();

exports.getNextMatchId = function(callback){
    lastMatchId.find(callback);

    lastMatchId.update({}, {$inc:{lastMatchId:1}}, {upsert:true}, function(err){
                err && console.log("Error updating last matchid: " + err);
    });
}

exports.updateWardCount = function(participantWardCount){
    var rank = participantWardCount.rank || NOT_RANKED;
    wardCount.update({rank:rank, winner: participantWardCount.winner},
        {$set: {rank:rank, winner:participantWardCount.winner},
            $inc: {
                wardsPlaced:participantWardCount.wardsPlaced,
                visionWardsBoughtInGame:participantWardCount.visionWardsBoughtInGame,
                players:1,
                sightWardsBoughtInGame:participantWardCount.sightWardsBoughtInGame,
                wardsKilled:participantWardCount.wardsKilled,
                championId:participantWardCount.championId
            }}, {upsert:true}, function(err){
            err && console.log("Error updating rank ward details: " + err);
        });
}

exports.getWardCount = function(callback){
    var query = wardCount.find();
    query.sort({rank:'asc', winner:'asc'});
    query.exec(callback);
};