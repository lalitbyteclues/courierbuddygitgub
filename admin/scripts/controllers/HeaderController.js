/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("HeaderController", function ($scope, AuthService, $location, AirportService) {
    $scope.isAuth = AuthService.authentication.isAuth;
    $scope.userName = AuthService.authentication.userName;
    $scope.isAdministrator = AuthService.authentication.isAdministrator;
    $scope.isUser = AuthService.authentication.isUser;
    if ($scope.isAuth) {
        AuthService.getuserdetails(AuthService.authentication.UserId).then(function (results) { 
            if (results.data.status == "success") { 
                if (results.data.response[0].status == "Y") { }
                else { 
                    $scope.verificationmessage = "Verification link send on your Email please verify.";
                }
            }
        });
    } 
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    AirportService.getseolist().then(function (results) { 
        $scope.list = results.data.response; 
        for (i = 0; i < $scope.list.length; i++) {
            if ($scope.list[i].location == $location.path())
            { 
                $('head').append('<meta name="description" content="' + $scope.list[i].description + '">');
                $('head').append('<meta name="keywords" content="' + $scope.list[i].keyword + '">');
                $('head').append('<title>' + $scope.list[i].title + '</title> ');
            }
        }
    });
})