/**
 * Created by Lalit on 09.12.2016.
 */
angular.module('courier').controller("identitytypeController", function ($rootScope, $state, $scope, $location, RESOURCES, UsersService, AuthService) {
    $scope.errormessage = '';
    $scope.successMessage = "";
    $scope.contentsingle = { "name": "", "region": "", "countryname": ""};
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
         UsersService.identitytypelist().then(function (results) {
             if (results.status == 200) {
                 $scope.list = results.data.response;
                 $scope.currentPage = 1; //current page
                 $scope.entryLimit = 10; //max no of items to display in a page
                 $scope.filteredItems = $scope.list.length; //Initially for no filter  
                 $scope.totalItems = $scope.list.length;
				 $scope.reverse = true;
				$scope.sort_by("title"); 
             }
         });
     }
     $scope.fill();
     $scope.deleteAppKey = function (field) {
		 bootbox.confirm("Do you want to delete ?", function (result) {
                if (result) { 
         UsersService.deleteidentity(field).then(function (response) {
             $scope.successmessage = "Deleted Successfully";
             $scope.fill();
             $("#userdetails").modal("hide");
         });}});
     }
     $scope.addRow = function () {
          $scope.contentsingle = { "name": "", "region": "", "countryname": ""};
         $("#userdetails").modal();
         $scope.successmessage = "";
         $scope.errormessage = "";
     }
     $scope.editAppKey = function (field) { 
         $scope.contentsingle={"name":field.name,"region":field.region,"countryname":field.countryname,"id":field.id};
         $("#userdetails").modal();
         $scope.successmessage = "";
         $scope.errormessage = "";
     }
     $scope.sort_by = function (predicate) {
         $scope.predicate = predicate;
         $scope.reverse = !$scope.reverse;
     };
     $scope.submitcontentdetails = function () { 
         UsersService.addidentitytype($scope.contentsingle).then(function (response) {
             $scope.successmessage = "Saved Successfully";
             $scope.fill();
             $("#userdetails").modal("hide");
         });
     }
});