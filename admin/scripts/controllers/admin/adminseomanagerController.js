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
angular.module('courier').controller("adminseomanagerController", function ($http, $state, $scope, $location, AirportService, AuthService, $timeout) {
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
     AirportService.getseolist().then(function (results) {
         $scope.list = results.data.response;
         $scope.currentPage = 1; //current page
         $scope.entryLimit = 10; //max no of items to display in a page
         $scope.filteredItems = $scope.list.length; //Initially for no filter  
         $scope.totalItems = $scope.list.length;
     });
     $scope.setPage = function (pageNo) {
         $scope.currentPage = pageNo;
     };
     $scope.filter = function () {
         $timeout(function () {
             $scope.filteredItems = $scope.filtered.length;
         }, 10);
     };
     $scope.addRow = function (index) {
         $scope.list.push({ editMode: true,created:new Date() });
     };
     $scope.deleterecords = function (field) { 
	  bootbox.confirm("Do you want to delete ?", function (result) {
                if (result) {
         AirportService.deleteseolist(field).then(function (results) {
             $scope.list =results.data.response;
             $scope.filteredItems = $scope.list.length;
             $scope.totalItems = $scope.list.length;
             if (results.data.status == 'error') {
                 $scope.errormessage = results.data.response;
             } else {
                 $scope.successmessage = "Deleted SuccessFully";
             }
	  });}});
     };
     $scope.editAppKey = function (field) { 
         $scope.successmessage = "";
         $scope.errormessage = "";
     }
     $scope.saverecords = function (item) { 
         AirportService.saveseolist(item).then(function (results) {
             console.log(results);  
             $scope.list = results.data.response;
             $scope.currentPage = 1; //current page
             $scope.entryLimit = 10; //max no of items to display in a page
             $scope.filteredItems = $scope.list.length; //Initially for no filter  
             $scope.totalItems = $scope.list.length;
             $scope.successmessage = "Updated SuccessFully";
             $scope.errormessage = "";
         }); 
     };
     $scope.sort_by = function (predicate) {
         $scope.predicate = predicate;
         $scope.reverse = !$scope.reverse;
     }; 
});