var rest = require("restler");
var _ = require("underscore");
var datalayer = require("./data");
var fs = require("fs");
var sprintf = require("sprintf-js").sprintf;

var summoners = {};
var matchData;

var getSummonerRankByParticipantId = function(participentId, data){
    var participant = _.find(data.participantIdentities, function(pid) { return pid.participantId === participentId });
    if(participant && participant.player){
        var summoner = summoners[participant.player.summonerId];
        if(summoner){
            return summoner.rank;
        }
        else{
            return null;
        }
    }
    else{
        return null;
    }
}

var summonersReturned = function(data){
    for(var p in data){
        var rankedSolo = _.find(data[p], function(team) { return team.queue === 'RANKED_SOLO_5x5' });
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

var countWards = function(data){
    for(var i = 0; i < data.participants.length; i++){
        var participant = data.participants[i];
        var rank = getSummonerRankByParticipantId(participant.participantId, data);

        datalayer.updateWardCount(participant.stats.winner,
            rank,
            participant.stats.wardsPlaced,
            participant.stats.visionWardsBoughtInGame,
            participant.stats.sightWardsBoughtInGame,
            participant.stats.wardsKilled);
    }

    //printWardCount();
}

var printWardCount = function(){
    console.log(datalayer.getWinWards() + " " + datalayer.getLoseWards());
    fs.appendFile("C:\\Users\\josh\\Documents\\LolWards.txt", datalayer.getWinWards() + " " + datalayer.getLoseWards() + " - " + datalayer.getNextMatchId() + "\r\n", function(){});

    var wardsByRankArray = datalayer.getWardsByRank();
    console.log("Rank\t\tPlaced\tVision\tSight\tKilled\tPlayers");
    console.log("-------------------------------------------------------");
    for(var rank in wardsByRankArray){
        var wardsByRank = wardsByRankArray[rank];
        console.log(rank
            + "\t" + sprintf("%.2f", wardsByRank.wards / wardsByRank.count)
            + "\t" + sprintf("%.2f", wardsByRank.visionWardsBoughtInGame / wardsByRank.count)
            + "\t" + sprintf("%.2f", wardsByRank.sightWardsBoughtInGame / wardsByRank.count)
            + "\t" + sprintf("%.2f", wardsByRank.wardsKilled / wardsByRank.count)
            + "\t" + wardsByRank.count);
    }


}

var getMatch = function(){
    var matchId = datalayer.getNextMatchId();
    matchId += 1;
    var request = "https://na.api.pvp.net/api/lol/na/v2.2/match/" + matchId + "?api_key=b4f8745b-f145-4392-bccb-90cebe04d4c5";
    console.log(request);
    rest.get(request)
        .on("fail", function(result, response){

        })
        .on("success", function(data){
            if(useGameType(data.queueType)){
                var summonorIds = "";
                matchData = data;

                for(var i = 0; i < data.participantIdentities.length; i++){
                    if(data.participantIdentities[i].player) {
                        summonorIds += data.participantIdentities[i].player.summonerId + ',';
                    }
                }

                if(summonorIds){
                    rest.get("https://na.api.pvp.net/api/lol/na/v2.5/league/by-summoner/"+ summonorIds  +"/entry?api_key=b4f8745b-f145-4392-bccb-90cebe04d4c5")
                        .on("success", summonersReturned);
                } else{
                    countWards(matchData);
                }
            }
    });
    setTimeout(getMatch, 5000);
    summoners = {};
};

var useGameType = function(gameType){
    return gameType === "NORMAL_5x5_BLIND" || gameType === "NORMAL_5x5_DRAFT" ||
            gameType === "RANKED_SOLO_5x5" || gameType === "RANKED_TEAM_5x5" ||
            gameType === "RANKED_PREMADE_5x5";
}

setTimeout(getMatch, 5000);