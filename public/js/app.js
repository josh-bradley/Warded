(function(){
    var app = angular.module("warded", ["ngRoute"]);

    app.config(function($routeProvider){
        $routeProvider
            .when("/main", {
                templateUrl: "templates/main.html",
                controller: "MainCtrl"
            }
            )
            .otherwise({redirectTo: "/main"})
    });
})();