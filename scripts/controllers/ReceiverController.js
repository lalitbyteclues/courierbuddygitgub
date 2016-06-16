angular.module('courier').controller("ReceiverController", function ($rootScope, $state, $scope, $location, ValiDatedTokenObject, AuthService, searchService, ReceiverService) {
    if (!AuthService.authentication.isAuth) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    $scope.idupdate = "";
    $scope.resaonoifupdate = "";
    $scope.list = [];
    $scope.mainlist = [];
    $scope.statusupdate = true;
    dTable = $('#example').DataTable({ searching: false });
    ReceiverService.getreceiverlist(sessionStorage.getItem("UserId")).then(function (results) {
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
                dTable.row.add(["P" + $scope.mainlist[i].id, $scope.mainlist[i].source, $scope.mainlist[i].destination, moment($scope.mainlist[i].dep_time).format("DD/MM/YYYY"), moment($scope.mainlist[i].arrival_time).format("DD/MM/YYYY"), $scope.mainlist[i].flight_no, $scope.mainlist[i].weight, $scope.mainlist[i].status == 0 ? "Parcel ID Created" : $scope.mainlist[i].status == 1 ? "Created Payment Due" : $scope.mainlist[i].status == 2 ? "Booked With TR" : $scope.mainlist[i].status == 3 ? "Parcel Collected" : $scope.mainlist[i].status == 4 ? "Parcel Delivered" : $scope.mainlist[i].status == 5 ? "Delivery Complete" : $scope.mainlist[i].status == 6 ? "Cancelled" : $scope.mainlist[i].status == 7 ? "cancelled Paid" : "Undelivered", "<b>Name:<b>" + $scope.mainlist[i].transportername + "<br>" + "<b>Email:<b>" + $scope.mainlist[i].transporteremail + "<br>" + "<b>Mobile:<b>" + $scope.mainlist[i].transportermobile, "<br><b>Name:<b>" + $scope.mainlist[i].sendername + "<br>" + "<b>Email:<b>" + $scope.mainlist[i].senderemail + "<br>" + "<b>Mobile:<b>" + $scope.mainlist[i].sendermobile, "<a href='javascript:void(0);'  onclick='changestatusparcel(" + $scope.mainlist[i].id + ")'   title='Cancel Status'>Change Status</a>"]).draw();
            }
        }
    });
    var _searchByFilter = function () {
        $scope.list = [];
        dTable.clear().draw();
        for (i = 0; i < $scope.mainlist.length; i++) {
            if (($scope.mainlist[i].status == $scope.status || typeof $scope.status === 'undefined' || $scope.status === '' || $scope.status == null) && ($scope.mainlist[i].dep_time.getDate() == new Date($scope.departureat).getDate() || typeof $scope.departureat === 'undefined' || $scope.departureat === '' || $scope.departureat == null) && ($scope.mainlist[i].id.toLowerCase().indexOf($scope.TransporterID) != -1 || typeof $scope.TransporterID === 'undefined' || $scope.TransporterID === '' || $scope.TransporterID == null)) {
                $scope.list.push($scope.mainlist[i]);
                dTable.row.add(["P" + $scope.mainlist[i].id, $scope.mainlist[i].source, $scope.mainlist[i].destination, moment($scope.mainlist[i].dep_time).format("DD/MM/YYYY"), moment($scope.mainlist[i].arrival_time).format("DD/MM/YYYY"), $scope.mainlist[i].flight_no, $scope.mainlist[i].weight, $scope.mainlist[i].status == 0 ? "Parcel ID Created" : $scope.mainlist[i].status == 1 ? "Created Payment Due" : $scope.mainlist[i].status == 2 ? "Booked With TR" : $scope.mainlist[i].status == 3 ? "Parcel Collected" : $scope.mainlist[i].status == 4 ? "Parcel Delivered" : $scope.mainlist[i].status == 5 ? "Delivery Complete" : $scope.mainlist[i].status == 6 ? "Cancelled" : $scope.mainlist[i].status == 7 ? "cancelled Paid" : "Undelivered", "<b>Name:<b>" + $scope.mainlist[i].transportername + "<br>" + "<b>Email:<b>" + $scope.mainlist[i].transporteremail + "<br>" + "<b>Mobile:<b>" + $scope.mainlist[i].transportermobile, "<br><b>Name:<b>" + $scope.mainlist[i].sendername + "<br>" + "<b>Email:<b>" + $scope.mainlist[i].senderemail + "<br>" + "<b>Mobile:<b>" + $scope.mainlist[i].sendermobile, "<a href='javascript:void(0);'  onclick='changestatusparcel(" + $scope.mainlist[i].id + ")'   title='Cancel Status'>Change Status</a>"]).draw();
            }
        }
    };
    $scope.searchByFilter = function () {
        _searchByFilter();
    };
    $scope.changestatusparcelonclick = function () {
        if ($scope.statusupdate)
        {   $scope.successaddtripMessage = "";
            var data = { "id": $scope.idupdate, "status": 5, "process_by": sessionStorage.getItem("UserId"), "reason": $scope.resaonoifupdate };
            ReceiverService.usrupdatestatus(data).then(function (results) {
                $scope.successaddtripMessage = "Updated Successfully";
                $("#tripdetails").modal("hide");
                if (results.status == 200) {
                    ReceiverService.getreceiverlist(sessionStorage.getItem("UserId")).then(function (results) {
                        if (results.status == 200) {
                            $scope.list = results.data.response;
                            $scope.mainlist = results.data.response;
                            dTable.clear().draw();
                            for (i = 0; i < $scope.list.length; i++) {
                                var deptime = $scope.list[i].dep_time.split(" ");
                                $scope.list[i].dep_time = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                                $scope.mainlist[i].dep_time = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                                var arrtime = $scope.list[i].arrival_time.split(" ");
                                $scope.list[i].arrival_time = new Date(arrtime[0].split("-")[1] + "/" + arrtime[0].split("-")[2] + "/" + arrtime[0].split("-")[0] + " " + arrtime[1]);
                                $scope.mainlist[i].arrival_time = new Date(arrtime[0].split("-")[1] + "/" + arrtime[0].split("-")[2] + "/" + arrtime[0].split("-")[0] + " " + arrtime[1]);
                                $scope.list[i].status = parseInt($scope.list[i].status);
                                $scope.mainlist[i].status = parseInt($scope.list[i].status);
                                dTable.row.add(["P" + $scope.mainlist[i].id, $scope.mainlist[i].source, $scope.mainlist[i].destination, moment($scope.mainlist[i].dep_time).format("DD/MM/YYYY"), moment($scope.mainlist[i].arrival_time).format("DD/MM/YYYY"), $scope.mainlist[i].flight_no, $scope.mainlist[i].weight, $scope.mainlist[i].status == 0 ? "Parcel ID Created" : $scope.mainlist[i].status == 1 ? "Created Payment Due" : $scope.mainlist[i].status == 2 ? "Booked With TR" : $scope.mainlist[i].status == 3 ? "Parcel Collected" : $scope.mainlist[i].status == 4 ? "Parcel Delivered" : $scope.mainlist[i].status == 5 ? "Delivery Complete" : $scope.mainlist[i].status == 6 ? "Cancelled" : $scope.mainlist[i].status == 7 ? "cancelled Paid" : "Undelivered", "<b>Name:<b>" + $scope.mainlist[i].transportername + "<br>" + "<b>Email:<b>" + $scope.mainlist[i].transporteremail + "<br>" + "<b>Mobile:<b>" + $scope.mainlist[i].transportermobile, "<br><b>Name:<b>" + $scope.mainlist[i].sendername + "<br>" + "<b>Email:<b>" + $scope.mainlist[i].senderemail + "<br>" + "<b>Mobile:<b>" + $scope.mainlist[i].sendermobile, "<a href='javascript:void(0);'  onclick='changestatusparcel(" + $scope.mainlist[i].id + ")'   title='Cancel Status'>Change Status</a>"]).draw();
                            }
                        }
                    });
                }
            });
        }
        else
        {

            
        }
    }
    $scope.changestatusparcel = function (id) {
        $scope.idupdate = id;
        $("#tripdetails").modal();
        return;
    }
}); 