var fs = require("fs");

exports.getMatchData = function(){
    return JSON.parse(fs.readFileSync('tests/specs/server/DataFiles/Match.json'));
}

exports.getSummonersData = function(){
    return JSON.parse(fs.readFileSync('tests/specs/server/DataFiles/Summoners.json'));
};