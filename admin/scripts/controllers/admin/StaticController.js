/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').filter('startFrom', function () {
    return function (input, start) {
        if (input) {
            start = +start; //parse to int
            return input.slice(start);
        }
        return [];
    }
});
angular.module('courier').controller("adminstaticController", function ($state, $scope, $location, AuthService, UsersService) {
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
     $scope.contentsingle = {};
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
     UsersService.getMypageslist(0).then(function (results) {
         if (results.status == 200) {
             $scope.list = results.data.response;
             $scope.currentPage = 1; //current page
             $scope.entryLimit = 10; //max no of items to display in a page
             $scope.filteredItems = $scope.list.length; //Initially for no filter  
             $scope.totalItems = $scope.list.length;
         }
     });
     $scope.editAppKey = function (field) {
         $scope.contentsingle = field;
         $("#userdetails").modal();
         $scope.successmessage = "";
         $scope.errormessage = "";
     }
     $scope.sort_by = function (predicate) {
         $scope.predicate = predicate;
         $scope.reverse = !$scope.reverse;
     };
     $scope.submitcontentdetails = function () {
         UsersService.addstatics($scope.contentsingle).then(function (response) {
             $scope.successmessage = "Saved Successfully";
             $("#userdetails").modal("hide");
         }); 
     } 
});