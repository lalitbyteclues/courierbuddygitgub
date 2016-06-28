/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("adminparcelmanagerController", function ($rootScope, $state, $scope, $location, AuthService, ParcelService, AddTripsService) {
    $scope.errormessage = '';
    $scope.successMessage = "";
    $scope.TransporterID = "";
    $scope.status = "";
    $scope.listexportcsv = [];
    $scope.possiblematchid = 0;
    $scope.currentPage = 1; //current page
    $scope.entryLimit = 10; //max no of items to display in a page
    trans = $('#example').DataTable();
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
    $scope.possiblematch = function (id) {
        $scope.possiblematchid = id;
        ParcelService.getparceldetail(id).then(function (response) {
            trans.clear().draw();
            if (response.data.tripsmatch !== null && typeof response.data.tripsmatch !== 'undefined') {
                $scope.tripsmatch = response.data.tripsmatch;
                trans.clear().draw();
                for (i = 0; i < $scope.tripsmatch.length; i++) {
                    var dat = $scope.tripsmatch[i].dep_time.split("-");
                    var day = dat[2].split(" ");
                    $scope.tripsmatch[i].dep_time = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
                    var dat = $scope.tripsmatch[i].arrival_time.split("-");
                    var day = dat[2].split(" ");
                    $scope.tripsmatch[i].arrival_time = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
                    trans.row.add(["T" + $scope.tripsmatch[i].id, $scope.tripsmatch[i].source, $scope.tripsmatch[i].destination, moment($scope.tripsmatch[i].dep_time).format('DD/MM/YYYY, h:mm a'), moment($scope.tripsmatch[i].arrival_time).format('DD/MM/YYYY, h:mm a'), $scope.tripsmatch[i].capacity, "<a href='javascript:void(0);' onclick='senderbooknow(" + $scope.tripsmatch[i].id + ")'  class='btn btn-primary'>Create Courier Request</a>"]).draw();

                }

            } else {
                $scope.tripsmatch = [];
            }
            $("#message-box").modal();
        });

    }
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
                var data = { "id": id, "status": status, "process_by": sessionStorage.getItem("UserId"), "reason": result };
                ParcelService.usrupdatestatus(data).then(function (results) {
                    if (results.status == 200) {
                        if (status == 6){
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
        var data = { "id": id };
        ParcelService.deletetrip(data).then(function (results) {
            if (results.status == 200) {
            }
        });
    }
    $scope.tripslist = [];

    $scope.$watch('currentPage', function (newPage) {
        if (newPage != NaN) {
            $scope.searchdatabyuser();
        }
    });
    $scope.searchdatabyuser = function () {
        $scope.entryrange = (parseInt($scope.currentPage - 1) * $scope.entryLimit) + "-" + $scope.entryLimit;
        var tilldate = "";
        if (!(typeof $("#tilldate").val() == 'undefined') && $("#tilldate").val() != "") {
            tilldate = $("#tilldate").val().split("-")[2] + "/" + $("#tilldate").val().split("-")[1] + "/" + $("#tilldate").val().split("-")[0];
        }
        var datapost = { "limit": $scope.entryrange, "id": $scope.TransporterID, "status": $scope.status, "till_date": tilldate };
        ParcelService.getParcelListall(datapost).then(function (results) {
            if (results.status == 200) {
                $scope.listexportcsv = [];
                $scope.tripslist = results.data.response;
                for (i = 0; i < $scope.tripslist.length; i++) {
                    $scope.tripslist[i].till_date = new Date($scope.tripslist[i].till_date);
                    $scope.tripslist[i].status = parseInt($scope.tripslist[i].status);
                    $scope.listexportcsv.push({ "ParcelID": $scope.tripslist[i].ParcelID, "From": $scope.tripslist[i].source, "Destination": $scope.tripslist[i].destination, "TillDate": $scope.tripslist[i].till_date, "ParcelType": $scope.tripslist[i].type == 'E' ? 'Envelope' : $scope.tripslist[i].type == 'B' ? 'Box' : $scope.tripslist[i].type == 'P' ? 'Packet' : $scope.tripslist[i].type, "weight": $scope.tripslist[i].weight + "Kg", "Amount": $scope.tripslist[i].payment, "Status": $scope.tripslist[i].statusdescription });
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
    $scope.dt = new Date();
    $scope.disabled = function (date, mode) { return (mode === 'day' && false); };
    var date = new Date();
    $scope.maxDate = date.setDate((new Date()).getDate() + 900);
    $scope.open0 = function ($event) { $event.preventDefault(); $event.stopPropagation(); $scope.status0.opened = true; };
    $scope.status0 = { opened: false };

});