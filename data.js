var winWards = 0, loseWards = 0;
var wardsByRank = {};
var lastMatchId = 1576670980;

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

exports.getNextMatchId = function(){
    lastMatchId += 1;
    return lastMatchId;
}

exports.updateWardCount = function(isWinner, rank, wards, visionWardsBoughtInGame, sightWardsBoughtInGame, wardsKilled){
    if(isWinner){
        winWards += wards || 0;
    } else {
        loseWards += wards || 0;
    }
    if(rank){
        if(!wardsByRank[rank]){
            wardsByRank[rank] = {};
            wardsByRank[rank].wards = 0;
            wardsByRank[rank].count = 0;
            wardsByRank[rank].visionWardsBoughtInGame = visionWardsBoughtInGame;
            wardsByRank[rank].sightWardsBoughtInGame = sightWardsBoughtInGame;
            wardsByRank[rank].wardsKilled = wardsKilled;
        }

        wardsByRank[rank].wards += wards;
        wardsByRank[rank].count += 1;
    }
}

exports.getWardsByRank = function(){
    return wardsByRank;
}