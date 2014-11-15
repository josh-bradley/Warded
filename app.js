var rest = require("restler");
var _ = require("underscore");
var datalayer = require("./data")
var wardCountBuilder = require("./wardCountBuilder").wardCountBuilder;
var API_SERVER = require("./constants").API_SERVER;

var summoners = {};
var matchData;

var onSummonersReturned = function(summonersData){
    for(var p in summonersData){
        var rankedSolo = _.find(summonersData[p], function(team) { return team.queue === 'RANKED_SOLO_5x5' });
        var rankDescription = null;
        if(rankedSolo){
            rankDescription = rankedSolo.tier + "_" + rankedSolo.entries[0].division;
        }

        summoners[p] = {
            rank: rankDescription
        };
    }

    countWards(matchData);
};

var countWards = function(matchData){
    var w = wardCountBuilder(matchData, summoners);
    _.each(matchData.participants, function(p) {
       datalayer.updateWardCount(w.getWardDetailsForParticipant(p.participantId));
    });
    console.log("Done processing match: " + matchData.matchId);
}

var getMatch = function(){
    datalayer.getNextMatchId(processMatch);
}

var processMatch = function(err, item){
    var matchId = item[0].lastMatchId;
    matchId += 1;
    var request = API_SERVER +"/api/lol/na/v2.2/match/" + matchId + "?api_key=b4f8745b-f145-4392-bccb-90cebe04d4c5&includeTimeline=true";
    rest.get(request)
        .on("success", onSuccessfulMatchRetrieve);
    setTimeout(getMatch, 5000);
    summoners = {};
};

var onSuccessfulMatchRetrieve = function(data){
    if(isApplicableQueueType(data.queueType) && isSummonersRift(data.mapId)) {
        console.log("Processing match " + data.matchId + "that started on " + new Date(data.matchCreation));

        var summonerIds = buildSummonerIdsFilter(data);
        matchData = data;

        if(summonerIds){
            rest.get(API_SERVER + "/api/lol/na/v2.5/league/by-summoner/"+ summonerIds  +"/entry?api_key=b4f8745b-f145-4392-bccb-90cebe04d4c5")
                .on("success", onSummonersReturned);
        } else{
            countWards(data);
        }
    } else {
        console.log("Skipping match " + data.matchId + " map type id " + data.mapId + " game type " + data.queueType + " played at " +  new Date(data.matchCreation));
    }
}

var buildSummonerIdsFilter = function(data){
    var summonerIds = "";
    matchData = data;

    for(var i = 0; i < data.participantIdentities.length; i++){
        if(data.participantIdentities[i].player) {
            summonerIds += data.participantIdentities[i].player.summonerId + ',';
        }
    }

    return summonerIds;
}

var isApplicableQueueType = function(queue) {
    return queue === "NORMAL_5x5_BLIND" || queue === "NORMAL_5x5_DRAFT" ||
            queue === "RANKED_SOLO_5x5" || queue === "RANKED_TEAM_5x5" ||
            queue === "RANKED_PREMADE_5x5";
}

var isSummonersRift = function(mapId) {
  return mapId === 1 || mapId === 2 || mapId === 11;
};

setTimeout(getMatch, 5000);