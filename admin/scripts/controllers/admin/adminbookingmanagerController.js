/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("adminbookingmanagerController", function ($rootScope, $state, $scope, $location, AuthService, ParcelService, AddTripsService,searchService) {
    $scope.errormessage = '';
    $scope.successMessage = "";
    $scope.TransporterID = "";
    $scope.status = "";
    $scope.payment = {};
    $scope.possiblematchid = 0;
    $scope.timeperiod = 0;
    $scope.listexportcsv = [];
    $scope.currentPage = 1; //current page
    $scope.entryLimit = 10; //max no of items to display in a page
    // trans = $('#example').DataTable();
    if (!AuthService.authentication.isAdministrator) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    }; 
    $scope.approvetrip = function (id, status) {
        var data = { "id": id, "status": status };
        ParcelService.updatestatus(data).then(function (results) {
            if (results.status == 200) {
                $scope.tripslist = results.data.response;
                for (i = 0; i < $scope.tripslist.length; i++) {
                    $scope.tripslist[i].till_date = new Date($scope.tripslist[i].till_date);
                    $scope.tripslist[i].status = parseInt($scope.tripslist[i].status); 
                }
            }
        });
    }
    $scope.viewuserdetails = function (userid) {
        AuthService.getuserdetails(userid).then(function (results) {
            $scope.userdetails = results.data.response[0];
            $("#userdetails").modal();
        });

    };
    $scope.senderbooknow = function (id) {
        AddTripsService.senderbookingrequest($scope.possiblematchid, id).then(function (results) {
            if (results.data.status == "success") {
                $('#message-box').modal('hide');
                $scope.successMessage = results.data.response;
            }
        });
    }
    $scope.cancellparcel = function (id, status) {
        bootbox.prompt("Do you want to " + status == 6 ? "Cancel" : "Refund" + " this Parcel? Give Reason.", function (result) {
            if (result !== null) {
                var data = { "id": id, "status": status, "process_by": AuthService.authentication.UserId, "reason": result };
                ParcelService.usrupdatestatusadmin(data).then(function (results) {
                    if (results.status == 200) {
                        if (status == 6) {
                            $scope.successMessage = "Cancelled Successfully";
                        } else {
                            $scope.successMessage = "Refunded Successfully";
                        }
                        $scope.searchdatabyuser();
                    }
                });
            }
        });
    }
    $scope.delete = function (id) {
		 bootbox.confirm("Do you want to delete ?", function (result) {
                if (result) {
        var data = { "id": id };
        ParcelService.deletetrip(data).then(function (results) {
            if (results.status == 200) {
            }
		 });}});
    }
    $scope.tripslist = [];

    $scope.$watch('currentPage', function (newPage) {
        if (newPage != NaN) {
            $scope.searchdatabyuser();
        }
    });
    $scope.searchdatabyuser = function () {
        $scope.entryrange = (parseInt($scope.currentPage - 1) * $scope.entryLimit) + "-" + $scope.entryLimit;
        var datapost = { "limit": $scope.entryrange, "period": $scope.timeperiod };
        ParcelService.getallbookinglist(datapost).then(function (results) {
            if (results.status == 200) {
                $scope.tripslist = results.data.response;
                $scope.listexportcsv = [];
                $scope.payment = results.data.paymentdetails[0];
                for (i = 0; i < $scope.tripslist.length; i++) {
                    $scope.tripslist[i].created = new Date($scope.tripslist[i].created);
                    $scope.tripslist[i].status = parseInt($scope.tripslist[i].status); 
                    $scope.listexportcsv.push({ "id": $scope.tripslist[i].id, "BookingDate": $scope.tripslist[i].created, "TransporteruserID": $scope.tripslist[i].TransporteruserID, "SenderID": $scope.tripslist[i].SenderID, "payment": $scope.tripslist[i].payment, "Ordernumber": "" + $scope.tripslist[i].trans_payment + "", "BookingStatus": $scope.tripslist[i].BookingStatus });
                }
                $scope.filteredItems = results.data.total; //Initially for no filter  
                $scope.totalItems = results.data.total;
            }
        });

    }
    $scope.searchdatabyuser();
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
    $scope.search = function (item) {
        return true;
        //if ((item.status == $scope.status || typeof $scope.status === 'undefined' || $scope.status === '' || $scope.status == null) && (item.till_date.getDate() == new Date($scope.departureat).getDate() || typeof $scope.departureat === 'undefined' || $scope.departureat === '' || $scope.departureat == null) && (item.id.toLowerCase().indexOf($scope.TransporterID) != -1 || typeof $scope.TransporterID === 'undefined' || $scope.TransporterID === '' || $scope.TransporterID == null)) {
        //    return true;
        //}
        //return false;
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
		 $scope.viewparceldetails = function (parcelid) {
            $scope.successmessage = "";
            ParcelService.getparceldetail(parcelid).then(function (response) {
                if (response.data.status == "success") {
                    $scope.parceldetails = response.data.response[0];
                    var deptime = $scope.parceldetails.till_date;
                    $scope.parceldetails.till_date = new Date(deptime.split("-")[1] + "/" + deptime.split("-")[2] + "/" + deptime.split("-")[0]); 
                    $("#parceldetails").modal();
                }}); 
        };
});