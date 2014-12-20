var testData = require("./TestData");
var wardCountBuilder = require("../../../wardCountBuilder");
var constants = require("../../../constants");

describe("wardCountBuilder", function(){
    var matchData = testData.getMatchData();
    var summoners = testData.getSummonersData();
    var builder = wardCountBuilder.wardCountBuilder(matchData, summoners);

    describe("getWardDetailsForParticipant", function(){
        it("should set role correctly.", function(){
            var participantDetails = builder.getWardDetailsForParticipant(1);

            expect(participantDetails.role).toBe("JUNGLE");
        });

        it("should set role correctly for support.", function(){
            var participantDetails = builder.getWardDetailsForParticipant(5);

            expect(participantDetails.role).toBe("SUPPORT");
        });

        it("should set role correctly for ad carry.", function(){
            var participantDetails = builder.getWardDetailsForParticipant(4);

            expect(participantDetails.role).toBe("CARRY");
        });

        it("should set loser correctly.", function(){
            var participantDetails = builder.getWardDetailsForParticipant(4);

            expect(participantDetails.winner).toBe(false);
        });

        it("should set winner correctly.", function(){
            var participantDetails = builder.getWardDetailsForParticipant(6);

            expect(participantDetails.winner).toBe(true);
        });

        it("should set rank correctly.", function(){
            var participantDetails = builder.getWardDetailsForParticipant(1);

            expect(participantDetails.rank).toBe("SILVER_V");
        });
    });
});