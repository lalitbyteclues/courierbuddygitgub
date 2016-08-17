/**
 * Created by Lalit on 21.05.2016.
 */
/// <reference path="angular.min.js" />  
/// <reference path="Module.js" />  
/// <reference path="Service.js" />   
angular.module('courier').controller("VerifyUserController", function ($scope, $state, $location, locationHistoryService, ValiDatedTokenObject, AuthService, RESOURCES, $modal, $timeout, $stateParams) {
    var Id = $stateParams.id;
    var code = $stateParams.code;
    var data = { "id": Id, "code": code };
    AuthService.verifyuser(data).then(function (responseuser) { 
        if (responseuser.data.status == "success") {
            $scope.successverifyuserDescription = "Success ! Your Email is Successfully Verified";
            setTimeout(function () { $state.go('dashboard'); }, 1000);
        }
        else
        {
            $scope.errorverifyuserDescription = "Error ! Invalid Request";
        } 
    });
});
