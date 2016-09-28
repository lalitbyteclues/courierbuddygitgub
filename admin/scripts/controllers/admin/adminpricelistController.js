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
angular.module('courier').controller("adminpricelistController", function ($http, $state, $scope, $location, AirportService, AuthService) {
    $scope.errormessage = '';
    $scope.successMessage = "";
    $scope.searchfromzoneid = 1;
    $scope.searchtozoneid = 1;
    $scope.currentPage = 1;   
    $scope.entryLimit = 10;  
    $scope.edit = false;
    if (!AuthService.authentication.isAdministrator) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    $scope.zonelist = [];
    $scope.weightrangelist = [];
    AirportService.getzonelist().then(function (results) {
        $scope.zonelist = results.data.response;
    });
    AirportService.getweightrangelist().then(function (results) {
        $scope.weightrangelist = results.data.response;
        $scope.checkgridlist();
    });
    $scope.checkgridlist = function () {
        $scope.successmessage = "";
        if ($scope.searchfromzoneid >= 0 && $scope.searchtozoneid >= 0) {
            AirportService.getpricelist().then(function (results) {
                $scope.list = [];
                for (i = 0; i < $scope.weightrangelist.length; i++) {
                    var datacount = $.grep(results.data.response, function (pp) { return (pp.fromzoneid == $scope.searchfromzoneid || $scope.searchfromzoneid == 0) && (pp.tozoneid == $scope.searchtozoneid || $scope.searchtozoneid == 0) && pp.weightrangeid == $scope.weightrangelist[i].id });
                    console.log(datacount);
                    if (datacount.length > 0) {
                        for (j = 0; j < datacount.length; j++) { 
                            $scope.list.push({ "weightrangeid": parseInt($scope.weightrangelist[i].id), "weightrangename": $scope.weightrangelist[i].name, "transportershare": parseFloat(datacount[j].transportershare), "price": parseFloat(datacount[j].price), "id": datacount[j].id, "fromzoneid": datacount[j].fromzoneid, "tozoneid": datacount[j].tozoneid });
                        }
                    } else {
                        $scope.list.push({ "weightrangeid": parseInt($scope.weightrangelist[i].id), "weightrangename": $scope.weightrangelist[i].name, "transportershare": 0, "price": 0, "id": 0, "fromzoneid": $scope.searchfromzoneid, "tozoneid": $scope.searchtozoneid });
                    }
                }
                $scope.currentPage = 1; //current page
                $scope.entryLimit = 50; //max no of items to display in a page
                $scope.filteredItems = $scope.list.length; //Initially for no filter  
                $scope.totalItems = $scope.list.length;  
                $scope.reverse = true;
                $scope.sort_by("weightrangeid"); 
            });

        } else {
            $scope.list = [];
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
    $scope.Savepricelist = function () {
        $scope.successmessage = "";
        AirportService.savezonepricelist($scope.list).then(function (results) {
            $scope.successmessage = "Updated SuccessFully";
        });
    };
    $scope.deletepricelist = function (field) {
		 bootbox.confirm("Do you want to delete ?", function (result) {
                if (result) {
        AirportService.deleteairportlist(field).then(function (results) {
            $scope.list = results.data.response;
            $scope.filteredItems = $scope.list.length;
            $scope.totalItems = $scope.list.length;
            if (results.data.status == 'error') {
                $scope.errormessage = results.data.errorMessage;
            } else {
                $scope.successmessage = "Deleted SuccessFully";
            }
		 });}});
    };
    $scope.editAppKey = function (field) {
        $scope.successmessage = "";
        $scope.errormessage = "";
    }
    $scope.sort_by = function (predicate) {
        $scope.predicate = predicate;
        $scope.reverse = !$scope.reverse;
    }; 
});