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
angular.module('courier').controller("admintripmanagerController", function ($rootScope, $state, $scope, $location, searchService, AddTripsService, AuthService, RESOURCES) {
    $scope.errormessage = '';
    $scope.successmessage = "";
    $scope.transporter = {};
    $scope.userdetails = {};
    $scope.listexportcsv = [];
    if (!AuthService.authentication.isAdministrator) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }  
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    $scope.requesttripticket = function (id) {
        AddTripsService.getrequstticket(id).then(function (results) {
            if (results.status == 200) {
                $scope.fillgrid();
                $scope.successmessage = "Request has been sent successfully.";
            }
        });
    }
    $scope.approvetrip = function (id, status) {
        $scope.successmessage = "";
        var reason = "";
        if (status == 8) {
            bootbox.prompt("Reason for keeping the trip on hold.", function (result) {
                if (result !== null) {
                    var data = { "id": id, "status": status, "reason": result, "processed_by": AuthService.authentication.UserId };
                    AddTripsService.updatestatus(data).then(function (results) {
                        if (results.status == 200) {
                            $scope.fillgrid();
                            $scope.successmessage = "Request status has been set 'On Hold' successfully.";
                        }
                    });
                }
            });
        } else {
            bootbox.prompt("Comment.", function (result) {
                if (result !== null) {
                    var data = { "id": id, "status": status, "reason": result, "processed_by": AuthService.authentication.UserId };
                    AddTripsService.updatestatus(data).then(function (results) {
                        if (results.status == 200) {
                            $scope.fillgrid();
                            if (status == 1) {
                                $scope.successmessage = "Request has been 'Approved' successfully.";
                            }
                            if (status == 5) {
                                $scope.successmessage = "Request has been 'Cancelled' successfully.";
                            }
                        }
                    });
                }
            });
        }
    }
        $scope.delete = function (id) {
            var data = { "id": id };
            AddTripsService.deletetrip(data).then(function (results) {
                if (results.status == 200) {
                    $scope.fillgrid();
                }
            });
        }
        $scope.tripslist = [];
        $scope.fillgrid = function () {
            $scope.successmessage = "";
            AddTripsService.getTripsListall().then(function (results) {
                if (results.status == 200) {
                    $scope.tripslist = results.data.response;
                    for (i = 0; i < $scope.tripslist.length; i++) {
                        var deptime = $scope.tripslist[i].dep_time.split(" ");
                        $scope.tripslist[i].dep_time = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                        var deptime = $scope.tripslist[i].arrival_time.split(" ");
                        $scope.tripslist[i].arrival_time = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);

                        $scope.tripslist[i].status = parseInt($scope.tripslist[i].status);
                        $scope.tripslist[i].image = $scope.tripslist[i].image == "" ? "" : RESOURCES.API_BASE_PATH + $scope.tripslist[i].image;
                        $scope.listexportcsv.push({ "TripID": $scope.tripslist[i].TripID, "UserID": $scope.tripslist[i].UserID, "From": $scope.tripslist[i].source, "To": $scope.tripslist[i].destination, "Date": $scope.tripslist[i].dep_time, "PNR": $scope.tripslist[i].pnr, "Status": $scope.tripslist[i].statusdescription });
                    }
                    $scope.currentPage = 1; //current page
                    $scope.entryLimit = 10; //max no of items to display in a page
                    $scope.filteredItems = $scope.tripslist.length; //Initially for no filter  
                    $scope.totalItems = $scope.tripslist.length;
                    $scope.sort_by("status");
                    $scope.sort_by("status");
                }
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
        $scope.sort_by = function (predicate) {
            $scope.predicate = predicate;
            $scope.reverse = !$scope.reverse;
        };
        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };
        $scope.viewtripdetails = function (tripid) {
            $scope.successmessage = "";
            searchService.gettransporterdetails(tripid).then(function (response) {
                if (response.data.status == "success") {
                    $scope.transporter = response.data.response[0];
                    var deptime = $scope.transporter.dep_time.split(" ");
                    $scope.transporter.dep_time = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                    var deptime = $scope.transporter.arrival_time.split(" ");
                    $scope.transporter.arrival_time = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                    $("#tripdetails").modal();
                }}); 
        };
        $scope.viewuserdetails = function (userid)
        {
            AuthService.getuserdetails(userid).then(function (results) { 
                $scope.userdetails = results.data.response[0];
                $("#userdetails").modal();
            });
       
        };
        $scope.search = function (item) { 
            if ((item.status == $scope.status || typeof $scope.status === 'undefined' || $scope.status === '' || $scope.status == null) && (item.dep_time.getDate() == new Date($scope.departureat).getDate() || typeof $scope.departureat === 'undefined' || $scope.departureat === '' || $scope.departureat == null) && (item.id.toLowerCase().indexOf($scope.TransporterID) != -1 || typeof $scope.TransporterID === 'undefined' || $scope.TransporterID === '' || $scope.TransporterID == null)) {
                return true;
            }
            return false;
        };
        $scope.dt = new Date();
        $scope.disabled = function (date, mode) { return (mode === 'day' && false); };
        var date = new Date();
        $scope.maxDate = date.setDate((new Date()).getDate() + 180);
        $scope.open0 = function ($event) { $event.preventDefault(); $event.stopPropagation(); $scope.status0.opened = true; };
        $scope.status0 = { opened: false };

    });