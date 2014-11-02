var winWards = 0, loseWards = 0;
var wardsByRank = {};
var mongoClient = require('mongodb').MongoClient;

var winLossCollectionName = 'winLossCount';
var wardCountCollectionName = 'wardCount';
var lastMatchIdCollectionName = 'lastMatchId';


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

    var updateWardPlayCount = function(db, callback){
        var wardCount = db.collection(wardCountCollectionName);
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
                callback();
            });
    }

    var updateWinLossWardCount = function(db, callback){
        var winLossCountCollection = db.collection(winLossCollectionName);
        var winWardsPlaced = 0, lossWardsPlaced = 0;
        if(isWinner){
            winWardsPlaced = wardsPlaced;
        } else {
            lossWardsPlaced = wardsPlaced;
        }

        winLossCountCollection.update({}, {$inc:{
            winPlacedCount:winWardsPlaced,
            lossPlacedCount:lossWardsPlaced,
            players:1
        }}, {upsert:true}, function(err){
            err && console.log("Error updating win loss: " + err);
            callback();
        });
    }

    performDbAction(updateWardPlayCount);
    performDbAction(updateWinLossWardCount);
}

exports.getWardsByRank = function(){
    return wardsByRank;
}
