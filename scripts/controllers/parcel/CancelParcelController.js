/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("CancelParcelController", function ($scope, $state, $location, AuthService, ParcelService) {
    if (!AuthService.authentication.isAuth) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    } 
    
    $scope.list = [];
    $scope.mainlist = [];
    dTable = $('#example').DataTable();
    ParcelService.getcalcelledParcelList(sessionStorage.getItem("UserId")).then(function (results) {
        if (results.status == 200) {
            $scope.list = results.data.response;
            $scope.mainlist = results.data.response;
            for (i = 0; i < $scope.list.length; i++) {
                var deptime = $scope.list[i].till_date.split(" ");
                $scope.list[i].till_date = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                $scope.mainlist[i].till_date = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                dTable.row.add(["P" + $scope.mainlist[i].id, $scope.mainlist[i].source, $scope.mainlist[i].destination, $scope.mainlist[i].type == 'E' ? 'Envelope' : $scope.mainlist[i].type == 'B' ? 'Box' : $scope.mainlist[i].type == 'P' ? 'Packet' : $scope.mainlist[i].type, $scope.mainlist[i].weight + " kg.", $scope.mainlist[i].transemail, $scope.mainlist[i].receiveremail, $scope.mainlist[i].statusdescription]).draw();
            }
        }
    });
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
});