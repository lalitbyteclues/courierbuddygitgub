/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("adminusersController", function ($rootScope, $state, $scope, $location, AuthService) {
    $scope.errormessage = '';
    $scope.successMessage = "";
    $scope.edit = false;
    $scope.userrole = "";
    $scope.userstatus = "";
    $scope.listexportcsv = [];
    $scope.zonelist = [];
    if (!AuthService.authentication.isAdministrator) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    AuthService.getuserslist({ "role": "", "status": "", "days": "" }).then(function (results) {
        $scope.listexportcsv = [];
        for (i = 0; i < results.data.response.length; i++) {
            $scope.listexportcsv.push({ "SNo": i + 1, "UserID": results.data.response[i].UserID, "Mobile": results.data.response[i].mobile, "EmailID": results.data.response[i].username, "Status": results.data.response[i].status == "Y" ? "Active" : "Inactive" });
        }
    });
    $scope.searchuserschange = function () {
        if ($scope.userrole == "") {
            $scope.searchusers();
        } else {
            $scope.searchusersdays($scope.userrole);
        }

    }
    $scope.searchusers = function () {
        var datapost = { "role": "", "status": $scope.userstatus, "days": "" };
        AuthService.getuserslist(datapost).then(function (results) {
            $scope.list = results.data.response;
            $scope.currentPage = 1; //current page
            $scope.entryLimit = 10; //max no of items to display in a page
            $scope.filteredItems = $scope.list.length; //Initially for no filter  
            $scope.totalItems = $scope.list.length;
        });
    }
    $scope.searchusersdays = function (day) {
        if ($scope.userrole == 7) {
            var datapost = { "role": "", "status": $scope.userstatus, "days": day };
            AuthService.getuserslist(datapost).then(function (results) {
                $scope.list = results.data.response;
                $scope.currentPage = 1; //current page
                $scope.entryLimit = 10; //max no of items to display in a page
                $scope.filteredItems = $scope.list.length; //Initially for no filter  
                $scope.totalItems = $scope.list.length;

            });
        }
    }
    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };
    $scope.filter = function () {
        $timeout(function () {
            $scope.filteredItems = $scope.filtered.length;
        }, 10);
    };
    $scope.deleterecords = function (field) {
		 bootbox.confirm("Do you want to delete ?", function (result) {
                if (result) {
        AuthService.deleteairportlist(field).then(function (results) {
            $scope.list = results.data.response;
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
        AuthService.updateuserdetails(item).then(function (results) {
            $scope.searchusers();
        });

    };
    $scope.sort_by = function (predicate) {
        $scope.predicate = predicate;
        $scope.reverse = !$scope.reverse;
    };
    $scope.searchusers();
});