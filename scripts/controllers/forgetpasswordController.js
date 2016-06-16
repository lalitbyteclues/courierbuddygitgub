/**
 * Created by Lalit on 21.05.2016.
 */
/// <reference path="angular.min.js" />  
/// <reference path="Module.js" />  
/// <reference path="Service.js" />   
angular.module('courier').controller("forgetpasswordController", function ($scope, $rootScope, $location, locationHistoryService, ValiDatedTokenObject, AuthService, RESOURCES, $modal, $timeout) {
    if (AuthService.authentication.isAuth) {
        $location.path('/home');
    }
    $scope.forgetpasswordData = { userName: '' };
    $scope.errorforgetpasswordDescription = '';
    $scope.successforgetpasswordDescription = '';
    $scope.forgetpassword = function(isValid) { 
        $scope.errorforgetpasswordDescription = '';
        $scope.successforgetpasswordDescription = '';
        if (!isValid) {
            $scope.errorforgetpasswordDescription = "Please, fill out all fields!";
            return;
        } 
        AuthService.resetPassword($scope.forgetpasswordData).then(function (response) {
            if (response.data.status == "success") {
                $scope.successforgetpasswordDescription = response.data.response;
                $scope.forgetpasswordData = { userName: '' };
            } else {
                $scope.errorforgetpasswordDescription = response.data.errorMessage;
            } 
            },
            function (err) {
                if (err != null){
                    $scope.errorforgetpasswordDescription = err.error_description;
                }
                else{
                    $scope.errorforgetpasswordDescription = "Internal Server Error";
                }
            });
    };   
});
