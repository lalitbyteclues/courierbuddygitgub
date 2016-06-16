/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("ChangePasswordController", function ($rootScope, $scope, $state, $location, ValiDatedTokenObject, locationHistoryService, AuthService) {
    if (!AuthService.authentication.isAuth) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
    $scope.errormessage = '';
    $scope.successMessage = "";
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    $scope.changepassword = function () {
        $scope.errormessage = '';
        $scope.successMessage = "";
        var data = { "userID": sessionStorage.getItem("UserId"), "password": $scope.user.changepasswordcurrentpassword, "newpassword": $scope.user.changepasswordpassword };
        AuthService.changepassword(data).then(function (results) {
            if (results.data.status == "success")
            {
                $scope.successMessage = results.data.response;
                $scope.reset();
            }
            else
            {
                $scope.errormessage = results.data.errorMessage;
            }
        });
    }
    $scope.reset = function () {
        $scope.user = angular.copy($scope.master);
    }; 
});