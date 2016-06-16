/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("parcelbookingController", function ($scope, ValiDatedTokenObject, AddTripsService, ParcelService, AuthService, $stateParams) {
    if (!AuthService.authentication.isAuth) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    } 
    $scope.successMessage = "";
    $scope.loginuser = ValiDatedTokenObject.getValiDatedTokenObject()[0];
    trans = $('#example').DataTable({ searching: false, "paging": false });
    $scope.tripsmatch = [];
    $scope.parcel = {};
    ParcelService.getparceldetail($stateParams.id).then(function (response) {
        if (response.data.status == "success") {
            $scope.parcel = response.data.response[0];
            if (response.data.tripsmatch !== null && typeof response.data.tripsmatch !== 'undefined') {
                $scope.tripsmatchdata = response.data.tripsmatch;
                trans.clear().draw(); 
                for (i = 0; i < $scope.tripsmatchdata.length; i++) {
                    if ($scope.tripsmatchdata[i].t_id == $scope.loginuser.id)
                    {
                        $scope.tripsmatch.push($scope.tripsmatchdata[i]);
                        var dat = $scope.tripsmatchdata[i].dep_time.split("-");
                        var day = dat[2].split(" "); 
                        $scope.tripsmatchdata[i].dep_time = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
                        var dat = $scope.tripsmatchdata[i].arrival_time.split("-");
                        var day = dat[2].split(" ");
                        $scope.tripsmatchdata[i].arrival_time = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
                        trans.row.add(["T" + $scope.tripsmatchdata[i].id, $scope.tripsmatchdata[i].source, $scope.tripsmatchdata[i].destination, moment($scope.tripsmatchdata[i].dep_time).format('DD/MM/YYYY, h:mm a'), moment($scope.tripsmatchdata[i].arrival_time).format('DD/MM/YYYY, h:mm a'), $scope.tripsmatchdata[i].capacity, "<a href='javascript:void(0);'  onclick='senderbooknow(" + $scope.tripsmatchdata[i].id + ")' class='btn btn-primary'>Accept Booking</a>"]).draw();
                    }
                }
            } else {
                $scope.tripsmatch = [];
            }
        }
    });
    $scope.senderbooknow = function (id) {
        $scope.successMessage = "";
        AddTripsService.senderbookingrequest($scope.parcel.id,id).then(function (results) {
            if (results.data.status == "success") {
                $scope.successMessage = results.data.response + '  <a style="float:right;" href="/viewtrip/' + id + '" aria-controls="home" role="tab" data-toggle="tab"><i class="fa fa-plane" ></i> View Trip</a>';
            }
        });
    }
});