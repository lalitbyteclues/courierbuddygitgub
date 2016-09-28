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
angular.module('courier').controller("adminairportmanagerController", function ($http, $state, $scope, $location, AirportService, AuthService, $timeout) {
    $scope.errormessage = '';
    $scope.successMessage = "";
    $scope.edit = false;
    $scope.data = { "location": "", "zone": 0, "type": "", "code": "", "zonelistid": 0, "status": "Y" };
    $scope.zonelist = [];
    AirportService.getzonelist().then(function (results) {
        $scope.zonelist = results.data.response;
    });

    if (!AuthService.authentication.isAdministrator) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    AirportService.getairportslist().then(function (results) {
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
    $scope.addRow = function () {
        $scope.errormessage = "";
        $scope.successmessage = "";
        if ($scope.data.location.length > 0 && $scope.data.type != "" && $scope.data.code != "" && $scope.data.zonelistid != 0) {
            if ($.grep($scope.list, function (air) { return air.location.toLowerCase() == $scope.data.location.toLowerCase() || air.code.toLowerCase() == $scope.data.code.toLowerCase(); }).length == 0) {
                AirportService.saveairportdate($scope.data).then(function (results) {
                    $scope.list = results.data.response;
                    $scope.currentPage = 1; //current page
                    $scope.entryLimit = 10; //max no of items to display in a page
                    $scope.filteredItems = $scope.list.length; //Initially for no filter  
                    $scope.totalItems = $scope.list.length;
                    $scope.successmessage = "Saved SuccessFully";
                    $("#addairport").modal("hide");
                    $scope.data = { "location": "", "zone": 0, "type": "", "code": "", "zonelistid": 0, "status": "Y" };
                    $scope.errormessage = "";
                });
            } else {
                $scope.errormessage = "Duplicate Airport !";
            }
        } else {
            $scope.errormessage = "Fill all fields !";
        }
    };
    $scope.deleterecords = function (field) {
		 bootbox.confirm("Do you want to delete ?", function (result) {
                if (result) {
        AirportService.deleteairportlist(field).then(function (results) {
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
        AirportService.saveairportdate(item).then(function (results) {
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
    $scope.uploadcsvfile = function () {
        $scope.successmessage = "";
        if ($scope.fileContent.length > 0) {
            var airportlist = JSON.parse(csvJSON($scope.fileContent));
            for (i = 0; i < airportlist.length; i++) {
                if (angular.isDefined(airportlist[i].Name) && angular.isDefined(airportlist[i].Zone) && angular.isDefined(airportlist[i].type)) {
                    if ($.grep($scope.list, function (air) { return air.location.trim().toLowerCase() == airportlist[i].Name.trim().toLowerCase() || (air.code==null || air.code.trim().toLowerCase() == airportlist[i].Code.trim().toLowerCase()) }).length == 0) {
                        if ($.grep($scope.zonelist, function (zone) { return zone.Zonename.trim().toLowerCase() == airportlist[i].Zone.trim().toLowerCase(); }).length > 0) {
                            var item = { "location": airportlist[i].Name, "zone": 0, "type": airportlist[i].type, "zonelistid": $.grep($scope.zonelist, function (zone) { return zone.Zonename.trim().toLowerCase() == airportlist[i].Zone.trim().toLowerCase(); })[0].id, "status": "Y", "code": airportlist[i].Code };
                            AirportService.saveairportdate(item).then(function (results) {
                                $scope.list = results.data.response;
                                $scope.currentPage = 1; //current page
                                $scope.entryLimit = 10; //max no of items to display in a page
                                $scope.filteredItems = $scope.list.length; //Initially for no filter  
                                $scope.totalItems = $scope.list.length;
                                $scope.successmessage = "Uploaded SuccessFully";
                                $scope.errormessage = "";
                                if (airportlist.length == i + 1) {
                                    $("#login-modal").modal("hide");
                                }
                            });
                        } else {
                            if (airportlist.length == i + 1) {
                                $("#login-modal").modal("hide");
                                $scope.successmessage = "Uploaded SuccessFully";
                                $scope.errormessage = "";
                            }
                        }
                    } else {
                        if (airportlist.length == i + 1) {
                            $("#login-modal").modal("hide");
                            $scope.successmessage = "Uploaded SuccessFully";
                            $scope.errormessage = "";
                        }
                    }
                } else {
                    if (airportlist.length == i + 1) {
                        $("#login-modal").modal("hide");
                        $scope.successmessage = "Uploaded SuccessFully";
                        $scope.errormessage = "";
                    }
                }
            }
        }
    }
    function csvJSON(csv) {
        var lines = csv.split("\n");
        var result = [];
        var headers = lines[0].replace("\r", "").split(",");
        for (var i = 1; i < lines.length; i++) {
            var obj = {};
            var currentline = lines[i].split(",");
            for (var j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentline[j];
            }
            result.push(obj);
        }
        return JSON.stringify(result);
    }
});