/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("admindeliveryreportmanagerController", function ($state, $scope, ParcelService, $location, AuthService, searchService) {
    $scope.errormessage = '';
    $scope.successMessage = "";
    $scope.timeperiod =0;
    $scope.statussearch = "0";
    $scope.tripslist = [];
    $scope.currentPage = 1; //current page
    $scope.entryLimit = 10; //max no of items to display in a page 
    $scope.searchdatabyuser = function () {
        $scope.entryrange = (parseInt($scope.currentPage - 1) * $scope.entryLimit) + "-" + $scope.entryLimit;
        var datapost = { "limit": $scope.entryrange, "period": $scope.timeperiod, "status": $scope.statussearch };
        ParcelService.getalldeliveryreportslist(datapost).then(function (results) {
            if (results.status == 200) {
                $scope.tripslist = results.data.response;
                $scope.listexportcsv = [];
                $scope.payment = 0;
                for (i = 0; i < $scope.tripslist.length; i++) {
                    $scope.tripslist[i].created = new Date($scope.tripslist[i].created);
                    $scope.tripslist[i].status = parseInt($scope.tripslist[i].status);
                    if ($scope.tripslist[i].status == 6) {
                        $scope.payment = parseFloat($scope.payment) + parseFloat($scope.tripslist[i].payment);
                    }
                    $scope.listexportcsv.push({ "id": $scope.tripslist[i].id, "BookingDate": $scope.tripslist[i].created, "TransporteruserID": $scope.tripslist[i].TransporteruserID, "SenderID": $scope.tripslist[i].SenderID, "payment": $scope.tripslist[i].payment, "Ordernumber": "" + $scope.tripslist[i].trans_payment + "", "BookingStatus": $scope.tripslist[i].BookingStatus });
                }
                $scope.filteredItems = results.data.total; //Initially for no filter  
                $scope.totalItems = results.data.total;
            }
        });

    }
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
    $scope.viewbookingdetail = function (id) {
        searchService.gettransporterdetails(id).then(function (response) {
            $scope.trip = response.data.response[0];
            var deptime = $scope.trip.dep_time.split(" ");
            $scope.trip.dep_time = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]).getTime();
            var arrtime = $scope.trip.arrival_time.split(" ");
            $scope.trip.arrival_time = new Date(arrtime[0].split("-")[1] + "/" + arrtime[0].split("-")[2] + "/" + arrtime[0].split("-")[0] + " " + arrtime[1]).getTime();
            $("#parceldetails").modal();
        });
    }
    $scope.$watch('currentPage', function (newPage) {
        if (newPage != NaN) {
            $scope.searchdatabyuser();
        }
    }); 
    $scope.search = function (item) {
        return true;
        //if ((item.status == $scope.status || typeof $scope.status === 'undefined' || $scope.status === '' || $scope.status == null) && (item.till_date.getDate() == new Date($scope.departureat).getDate() || typeof $scope.departureat === 'undefined' || $scope.departureat === '' || $scope.departureat == null) && (item.id.toLowerCase().indexOf($scope.TransporterID) != -1 || typeof $scope.TransporterID === 'undefined' || $scope.TransporterID === '' || $scope.TransporterID == null)) {
        //    return true;
        //}
        //return false;
    };
    $scope.viewuserdetails = function (userid) {
        AuthService.getuserdetails(userid).then(function (results) {
            $scope.userdetails = results.data.response[0];
            $("#userdetails").modal();
        });

    };
     





    if (!AuthService.authentication.isAdministrator) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
     $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
     };
      

});