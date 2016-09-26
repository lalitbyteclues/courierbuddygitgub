/**
 * Created by Lalit on 07.07.2016.
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
angular.module('courier').controller("pricerangeController", function ($state, $scope, $location, AirportService, AuthService, $timeout) {
    $scope.errormessage = '';
    $scope.warningmessage = '';
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
    $scope.weightrangelist = []; 
    $scope.fillgrid = function () {
        AirportService.getweightrangelist().then(function (results) {
            $scope.list = results.data.response;
            for (i = 0; i < $scope.list.length; i++) {
                $scope.list[i].minweight = parseFloat($scope.list[i].minweight);
                $scope.list[i].maxweight = parseFloat($scope.list[i].maxweight);
            }
            $scope.currentPage = 1;
            $scope.entryLimit = 20;
            $scope.filteredItems = $scope.list.length;
            $scope.totalItems = $scope.list.length;
            $scope.sort_by("name");
            $scope.sort_by("name"); 
        });
    }
    $scope.fillgrid();
    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };
    $scope.filter = function () {
        $timeout(function () {
            $scope.filteredItems = $scope.filtered.length;
        }, 10);
    };
    $scope.addRow = function (index) {
        $scope.currentPage = 1;
        $scope.list.push({ editMode: true}); 
    };
    $scope.deleterecords = function (field) {
        AirportService.deletepricerecord(field).then(function (results) {
            $scope.list = results.data.response; 
            for (i = 0; i < $scope.list.length; i++) { 
                $scope.list[i].minweight = parseFloat($scope.list[i].minweight);
                $scope.list[i].maxweight = parseFloat($scope.list[i].maxweight);
            }
            $scope.filteredItems = $scope.list.length;
            $scope.totalItems = $scope.list.length;
            if (results.data.status == 'error') {
                $scope.errormessage = results.data.response;
            } else {
                $scope.successmessage = "Deleted SuccessFully";
            } 
        }); 
    };
    $scope.editAppKey = function (field) {
        $scope.successmessage = "";
        $scope.errormessage = "";
    }
    $scope.saverecords = function (item) {
        $scope.errormessage = "";
        $scope.warningmessage = '';
        $scope.successmessage = "";
        if (item.minweight > 30) {
            $scope.errormessage = "Max weight 30 kg  !"; 
            return;
        }
        if (item.maxweight > 30) {
            $scope.errormessage = "Max weight 30 kg !"; 
            return;
        }
        if (item.minweight == item.maxweight) {
            $scope.errormessage = "Min weight and max weight same !";  
            return;
        }
        var mintotal = 0;
        var maxtotal = 0;
        for (i = 0; i < $scope.list.length; i++)
        {
            mintotal += parseFloat(Math.round($scope.list[i].minweight * 10) / 10);
            maxtotal += parseFloat(Math.round($scope.list[i].maxweight * 10) / 10);
        } 
        if ((maxtotal - mintotal) != 30)
        {
            $scope.warningmessage = "Your range total is not 30kg kindly adjust other ranges !";  
        }
        item.name = item.minweight + "-" + item.maxweight;
        AirportService.saveweightrangelist(item).then(function (results) {
            $scope.list = results.data.response; 
            for (i = 0; i < $scope.list.length; i++) { 
                $scope.list[i].minweight = parseFloat($scope.list[i].minweight);
                $scope.list[i].maxweight = parseFloat($scope.list[i].maxweight);
            }
            $scope.currentPage = 1;   
            $scope.filteredItems = $scope.list.length;  
            $scope.totalItems = $scope.list.length;
            $scope.successmessage = "Updated SuccessFully"; 
        });
    };
    $scope.sort_by = function (predicate) {
        $scope.predicate = predicate;
        $scope.reverse = !$scope.reverse;
    };
});