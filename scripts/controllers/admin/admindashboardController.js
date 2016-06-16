/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("admindashboardController", function ($rootScope, $state, $scope, $location, ValiDatedTokenObject, locationHistoryService, AuthService) {
    $scope.errormessage = '';
    $scope.successMessage = "";
    $scope.edit = false;
    if (!AuthService.authentication.isAdministrator) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
     $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
     }; 
});