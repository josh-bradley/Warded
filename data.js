var winWards = 0, loseWards = 0;
var wardsByRank = {};
var mongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');

var lastMatchIdCollectionName = 'lastMatchId';
var wardCount, winLossWardCount;

var dbInit = function(){
    mongoose.connect('mongodb://localhost:27017/warded');


    wardCount = mongoose.model('wardCount', {
            rank:String,
            wardsPlaced:Number,
            visionWardsBoughtInGame:Number,
            games:Number,
            sightWardsBoughtInGame:Number,
            wardsKilled:Number
    });

    winLossWardCount = mongoose.model('winLossCount', {
        winner: String,
        visionBroughtCount: Number,
        sightBroughtCount: Number,
        placedCount: Number,
        killedCount: Number,
        players: Number
    });
}

dbInit();

var performDbAction = function(action){
    var url = 'mongodb://localhost:27017/warded';

    mongoClient.connect(url, function(err, db) {
        action(db, function(){
            db.close()
        });
    });
};

exports.updateWinWards = function(wards){
    winWards += wards;
}

exports.updateLoseWards = function(wards){
    loseWards += wards;
}

exports.getWinWards = function(){
    return winWards;
}

exports.getLoseWards = function(){
    return loseWards;
}

var lastMatchId;

exports.getNextMatchId = function(){
    var getNextMatchId = function(db, callback){
        var lastMatchIdCollection = db.collection(lastMatchIdCollectionName);
        var found = function(err, item){
            lastMatchId = item.lastMatchId;
            lastMatchIdCollection.update({}, {$inc:{lastMatchId:1}}, function(err){
                err && console.log("Error updating last matchid: " + err);
                callback();
            });
        };

        lastMatchIdCollection.findOne({}, found);
    };

    performDbAction(getNextMatchId);

    return lastMatchId;
}

exports.updateWardCount = function(isWinner, rank, wardsPlaced, visionWardsBoughtInGame, sightWardsBoughtInGame, wardsKilled){
    rank = rank || "NOT_RANKED";
    wardCount.update({rank:rank},
        {$set: {rank:rank},
            $inc: {
                wardsPlaced:wardsPlaced,
                visionWardsBoughtInGame:visionWardsBoughtInGame,
                games:1,
                sightWardsBoughtInGame:sightWardsBoughtInGame,
                wardsKilled:wardsKilled
            }}, {upsert:true}, function(err){
            err && console.log("Error updating rank ward details: " + err);

        });

    winLossWardCount.update({winner:isWinner},
        {$set: {winner:isWinner},
        $inc:{
            visionBroughtCount: visionWardsBoughtInGame,
            sightBroughtCount: sightWardsBoughtInGame,
            placedCount: wardsPlaced,
            killedCount: wardsKilled,
            players: 1
        }}, {upsert:true}, function(err){
            err && console.log("Error updating win loss: " + err);
        });
}

exports.getWardCount = function(callback){
    wardCount.find(function(err, wardCounts){
       callback(err, wardCounts);
    });
};

exports.getWinLossWardCount = function(callback){
    winLossWardCount.find(callback);
}

exports.getWardsByRank = function(){
    return wardsByRank;
}
