/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("adminsliderController", function ($rootScope, $state, $scope, $location, RESOURCES, UsersService, AuthService) {
    $scope.errormessage = '';
    $scope.successMessage = "";
    $scope.contentsingle = { "title": "", "name": "", "created": new Date(), "status": "Y" };
    $scope.serviceBase = RESOURCES.API_BASE_PATH; 
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
     $scope.fill = function () {
         UsersService.getMysliderlist().then(function (results) {
             if (results.status == 200) {
                 $scope.list = results.data.response;
                 $scope.currentPage = 1; //current page
                 $scope.entryLimit = 10; //max no of items to display in a page
                 $scope.filteredItems = $scope.list.length; //Initially for no filter  
                 $scope.totalItems = $scope.list.length;
             }
         });
     }
     $scope.fill();
     $scope.deleteAppKey = function (field) {
         UsersService.deleteslider(field).then(function (response) {
             $scope.successmessage = "Deleted Successfully";
             $scope.fill();
             $("#userdetails").modal("hide");
         });
     }
     $scope.addRow = function () {
         $scope.contentsingle = { "title": "", "name": "", "created":new Date(), "status": "Y" };
         $("#userdetails").modal();
         $scope.successmessage = "";
         $scope.errormessage = "";
     }
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
         if (typeof $scope.ticket.base64 !== 'undefined' && $scope.ticket.base64 !== '' && $scope.ticket.base64 != null) {
             $scope.contentsingle['name'] = $scope.ticket.base64; 
         }
         UsersService.addslider($scope.contentsingle).then(function (response) {
             $scope.successmessage = "Saved Successfully";
             $scope.fill();
             $("#userdetails").modal("hide");
         });
     }
});