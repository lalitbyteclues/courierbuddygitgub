/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("RefundParcelController", function ($scope, $state, $location, AuthService, ParcelService) {
    if (!AuthService.authentication.isAuth) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path); 
        $state.transitionTo('login');
    }
    $scope.list = [];
    $scope.mainlist = [];
    dTable = $('#example').DataTable();
    ParcelService.getrefundedParcelList(sessionStorage.getItem("UserId")).then(function (results) {
        if (results.status == 200) {
            $scope.list = results.data.response;
            $scope.mainlist = results.data.response;
            for (i = 0; i < $scope.list.length; i++) {
                var deptime = $scope.list[i].till_date.split(" ");
                $scope.list[i].till_date = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                $scope.mainlist[i].till_date = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                dTable.row.add(["P" + $scope.mainlist[i].id, $scope.mainlist[i].source, $scope.mainlist[i].destination, $scope.mainlist[i].type == 'E' ? 'Envelope' : $scope.mainlist[i].type == 'B' ? 'Box' : $scope.mainlist[i].type == 'P' ? 'Packet' : $scope.mainlist[i].type, $scope.mainlist[i].weight + " kg.", $scope.mainlist[i].transemail, $scope.mainlist[i].receiveremail,$scope.mainlist[i].status == 0 ? "Parcel ID Created" : $scope.mainlist[i].status == 1 ? "Created Payment Due" : $scope.mainlist[i].status == 2 ? "Booked With TR" : $scope.mainlist[i].status == 3 ? "Parcel Collected" : $scope.mainlist[i].status == 4 ? "Parcel Delivered" : $scope.mainlist[i].status == 5 ? "Delivery Complete" : $scope.mainlist[i].status == 6 ? "Cancelled" : "Undelivered"]).draw();
            }
        }
    });
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
});