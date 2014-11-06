(function(){
    var app = angular.module("warded");

    var MainCtrl = function($scope, $http){
        $http.get('api/wardCount').success(function(data) {
           console.log(data[0]);
            $scope.wardsByRank = data;
        });
        $scope.message = "Welcome to warded";
    };

    app.controller("MainCtrl", MainCtrl);
})();