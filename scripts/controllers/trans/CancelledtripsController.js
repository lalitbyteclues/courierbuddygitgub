/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("CancelledtripsController", function ($rootScope, $scope, $state, $location, AuthService, AddTripsService) {
    
    if (!AuthService.authentication.isAuth) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path); 
        $state.transitionTo('login');
    }
    $scope.list = [];
    $scope.mainlist = [];
    dTable = $('#example').DataTable();
    AddTripsService.getcalcelledTripsList(sessionStorage.getItem("UserId")).then(function (results) {
        if (results.status == 200) {
            $scope.list = results.data.response;
            $scope.mainlist = results.data.response;
            for (i = 0; i < $scope.list.length; i++) {
                var deptime = $scope.list[i].dep_time.split(" ");
                $scope.list[i].dep_time = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                $scope.mainlist[i].dep_time = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                var arrtime = $scope.list[i].arrival_time.split(" ");
                $scope.list[i].arrival_time = new Date(arrtime[0].split("-")[1] + "/" + arrtime[0].split("-")[2] + "/" + arrtime[0].split("-")[0] + " " + arrtime[1]);
                $scope.mainlist[i].arrival_time = new Date(arrtime[0].split("-")[1] + "/" + arrtime[0].split("-")[2] + "/" + arrtime[0].split("-")[0] + " " + arrtime[1]);
                $scope.list[i].status = parseInt($scope.list[i].status);
                $scope.mainlist[i].status = parseInt($scope.list[i].status);
                dTable.row.add(["T" + $scope.mainlist[i].id, $scope.mainlist[i].source, $scope.mainlist[i].destination, $scope.mainlist[i].flight_no, $scope.mainlist[i].capacity, $scope.mainlist[i].capacity, $scope.mainlist[i].status == 0 ? "Pending" : $scope.mainlist[i].status == 1 ? "Approved" : $scope.mainlist[i].status == 2 ? "Booking Request Sent" : $scope.mainlist[i].status == 3 ? "Booked" : $scope.mainlist[i].status == 4 ? "Cancelled":$scope.mainlist[i].status == 6 ? "Delivered" : "Undelivered"]).draw();
            }
        }
    });  
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
});