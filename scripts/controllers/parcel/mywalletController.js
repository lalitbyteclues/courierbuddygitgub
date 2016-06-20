/**
 * Created by Lalit on 18.06.2016.
 */
angular.module('courier').controller("mywalletController", function ($scope, $state, $location, AuthService, ParcelService) {
    if (!AuthService.authentication.isAuth) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path); 
        $state.transitionTo('login');
    } 
    $scope.list = [];
    $scope.mainlist = [];
    AuthService.getuserdetails(sessionStorage.getItem("UserId")).then(function (results) {
        if (results.status == 200) {
            $scope.userdetails = results.data.response[0];
            $scope.userdetails.targetamount = parseFloat($scope.userdetails.wallet);
        }
    });
    dTable = $('#example').DataTable();
    ParcelService.getwalletstatement(AuthService.authentication.UserId).then(function (results) {
        if (results.status == 200) {
            console.log(results.data.response);
            $scope.list = results.data.response;
            $scope.mainlist = results.data.response;
            for (i = 0; i < $scope.list.length; i++) {
                var deptime = $scope.list[i].insertdate.split(" ");
                $scope.list[i].insertdate = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                $scope.mainlist[i].insertdate = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                dTable.row.add(["T" + $scope.mainlist[i].tripid, $scope.mainlist[i].parcelid, $scope.mainlist[i].comment, moment($scope.mainlist[i].insertdate).format("DD/MM/YYYY hh:mm:ss"), $scope.mainlist[i].weight + " kg.", $scope.mainlist[i].credit, $scope.mainlist[i].debit]).draw();
            }
        }
    });
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
});