/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("BankdetailsController", function ($rootScope, $state, $scope, $location, ValiDatedTokenObject, AuthService, searchService, $stateParams) {
    $scope.errormessage = '';
    $scope.successMessage = "";
    if (!AuthService.authentication.isAuth) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path); 
        $state.transitionTo('login');
    }
    $scope.isActive = function (viewLocation) { 
        return viewLocation === $location.path();
    };
    $scope.updatebankdetails = function (isValid) {
        $scope.errormessage = '';
        $scope.successMessage = "";
        if (!isValid) {
            $scope.errormessage = "Please, fill out all fields!";
            return;
        } 
        AuthService.updateuserdetails($scope.userdetails).then(function (results) { 
            if (results.status == 200) {
                $scope.successMessage = " Bank details added successfully ";
            }
        });
    }
    AuthService.getuserdetails(sessionStorage.getItem("UserId")).then(function (results) {
        if (results.status == 200) {
            $scope.userdetails = results.data.response[0];
            $scope.rbank_act_no = results.data.response[0].bank_act_no;
        }
    });
});