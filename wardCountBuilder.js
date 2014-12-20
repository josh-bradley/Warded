var _ = require("underscore");
var constants = require("./constants");

exports.wardCountBuilder = function(matchData, summoners){

    var getSummonerRankByParticipantId = function(participantId){
        var participant = _.find(matchData.participantIdentities, function(pid) { return pid.participantId === participantId });
        var summoner = summoners[participant.player.summonerId];
        if(summoner){
            return summoner.rank;
        }
        else{
            return null;
        }
    };

    var getRoleByParticipantId = function(participantId){
        var participant = _.find(matchData.participants, function(pid) { return pid.participantId === participantId });
        var lane = participant.timeline.lane;
        var role = participant.timeline.role;

        if(lane === constants.RIOT_BOTTOM_LANE) {
            lane = role;
        }

        return constants.ROLE_MAPPING[lane];
    }

    var getWardDetailsForParticipant = function(participantId) {
        var participant = _.find(matchData.participants, function(p) {return p.participantId === participantId});
        var rank = getSummonerRankByParticipantId(participantId);

        return  {
            role: getRoleByParticipantId(participantId),
            winner: participant.stats.winner,
            rank: rank,
            wardsPlaced: participant.stats.wardsPlaced,
            visionWardsBoughtInGame: participant.stats.visionWardsBoughtInGame,
            sightWardsBoughtInGame: participant.stats.sightWardsBoughtInGame,
            wardsKilled: participant.stats.wardsKilled
        };
    };

    return { getWardDetailsForParticipant: getWardDetailsForParticipant };
};

