/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("adminreportsmanagerController", function ($rootScope, $state, $scope, $location, ValiDatedTokenObject, locationHistoryService, AuthService) {
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
     $scope.updatebankdetails = function (isValid) {
         $scope.errormessage = '';
         $scope.successMessage = "";
         if (!isValid) {
             $scope.errormessage = "Please, fill out all fields!";
             return;
         }
         AuthService.updateuserdetails($scope.userdetails).then(function (results) {
             if (results.status == 200) {
                 $scope.successMessage = "Profile Updated successfully";
                 $scope.edit = false;
             }
         }); 
     }
     $scope.editform = function () {
         $scope.edit = true;
     }
     AuthService.getuserdetails(sessionStorage.getItem("UserId")).then(function (results) {
         if (results.status == 200) {
             $scope.userdetails = results.data.response[0];
             console.log($scope.userdetails);
         }
     });

});