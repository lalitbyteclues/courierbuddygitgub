/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("SenderController", function ($scope, $location, $state, AuthService, $stateParams, ParcelService) {
    $scope.userlist = [];
    if (!AuthService.authentication.isAuth) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };

    $scope.errormessage = "";
    $scope.list = [];
    $scope.mainlist = [];
    dTable = $('#example').DataTable();
    ParcelService.getParcelList(sessionStorage.getItem("UserId")).then(function (results) {
        if (results.status == 200) {
            $scope.list = results.data.response;
            $scope.mainlist = results.data.response;
            for (i = 0; i < $scope.list.length; i++) {
                var deptime = $scope.list[i].till_date.split(" ");
                $scope.list[i].till_date = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                $scope.mainlist[i].till_date = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                dTable.row.add(["P" + $scope.mainlist[i].id, $scope.mainlist[i].source, $scope.mainlist[i].destination, $scope.mainlist[i].type == 'E' ? 'Envelope' : $scope.mainlist[i].type == 'B' ? 'Box' : $scope.mainlist[i].type == 'P' ? 'Packet' : $scope.mainlist[i].type, $scope.mainlist[i].weight + " kg.", ($scope.mainlist[i].trans_id > 0 ? "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].trans_id + ")'>" + $scope.mainlist[i].trans_id + "</a>" : ""), ($scope.mainlist[i].recv_id > 0 ? "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].recv_id + ")'>" + $scope.mainlist[i].recv_id + "</a>" : ""), $scope.mainlist[i].status == 0 ? "Parcel ID Created" : $scope.mainlist[i].status == 1 ? "Created Payment Due" : $scope.mainlist[i].status == 2 ? "Booked With TR" : $scope.mainlist[i].status == 3 ? "Parcel Collected" : $scope.mainlist[i].status == 4 ? "Parcel Delivered" : $scope.mainlist[i].status == 5 ? "Delivery Complete" : $scope.mainlist[i].status == 6 ? "Cancelled" : $scope.mainlist[i].status == 7 ? "cancelled Paid" : "Undelivered", "<div class='dropdown'>    <a href='javascript:void()' data-toggle='dropdown' class='dropdown-toggle'>Action<b class='caret'></b></a>    <ul class='dropdown-menu'>        <li><a href='/viewparcel/" + $scope.mainlist[i].id + "' title='View parcel'>View parcel</a> </li>        <li> <a href='/editparcel/" + $scope.mainlist[i].id + "' title='Cancel parcel'>Edit parcel</a></li><li> <a href='javascript:void(0);'  onclick='cancelparcellist(" + $scope.mainlist[i].id + ")'   title='Cancel parcel'>Cancel parcel</a> </li></ul></div>"]).draw();
            }
        }
    }); 
    var _searchByFilter = function () {
        $scope.list = [];
        dTable.clear().draw();
        for (i = 0; i < $scope.mainlist.length; i++) {
            if (($scope.mainlist[i].status == $scope.status || typeof $scope.status === 'undefined' || $scope.status === '' || $scope.status == null) && ($scope.mainlist[i].till_date.getDate() == new Date($scope.departureat).getDate() || typeof $scope.departureat === 'undefined' || $scope.departureat === '' || $scope.departureat == null) && ($scope.mainlist[i].id.toLowerCase().indexOf($scope.TransporterID) != -1 || typeof $scope.TransporterID === 'undefined' || $scope.TransporterID === '' || $scope.TransporterID == null)) {
                $scope.list.push($scope.mainlist[i]);
                dTable.row.add(["P" + $scope.mainlist[i].id, $scope.mainlist[i].source, $scope.mainlist[i].destination, $scope.mainlist[i].type == 'E' ? 'Envelope' : $scope.mainlist[i].type == 'B' ? 'Box' : $scope.mainlist[i].type == 'P' ? 'Packet' : $scope.mainlist[i].type, $scope.mainlist[i].weight + " kg.", ($scope.mainlist[i].trans_id > 0 ? "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].trans_id + ")'>" + $scope.mainlist[i].trans_id + "</a>" : ""), ($scope.mainlist[i].recv_id > 0 ? "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].recv_id + ")'>" + $scope.mainlist[i].recv_id + "</a>" : ""), $scope.mainlist[i].status == 0 ? "Parcel ID Created" : $scope.mainlist[i].status == 1 ? "Created Payment Due" : $scope.mainlist[i].status == 2 ? "Booked With TR" : $scope.mainlist[i].status == 3 ? "Parcel Collected" : $scope.mainlist[i].status == 4 ? "Parcel Delivered" : $scope.mainlist[i].status == 5 ? "Delivery Complete" : $scope.mainlist[i].status == 6 ? "Cancelled" : $scope.mainlist[i].status == 7 ? "cancelled Paid" : "Undelivered", "<div class='dropdown'>    <a href='javascript:void()' data-toggle='dropdown' class='dropdown-toggle'>Action<b class='caret'></b></a>    <ul class='dropdown-menu'>        <li><a href='/viewparcel/" + $scope.mainlist[i].id + "' title='View parcel'>View parcel</a> </li>        <li> <a href='/editparcel/" + $scope.mainlist[i].id + "' title='Cancel parcel'>Edit parcel</a></li><li> <a href='javascript:void(0);'  onclick='cancelparcellist(" + $scope.mainlist[i].id + ")'   title='Cancel parcel'>Cancel parcel</a> </li></ul></div>"]).draw();
            }
        }
    };
    $scope.searchByFilter = function () {
        _searchByFilter();
    };
    $scope.viewuserdetails = function (userid) {
        AuthService.getuserdetails(userid).then(function (results) {
            $scope.userdetails = results.data.response[0];
            $("#userdetails").modal();
        });

    };
    $scope.cancelparcellist = function (id) {
        $scope.successaddtripMessage = "";
        bootbox.prompt("Do you want to cancel this Parcel? Give Reason.", function (result) {
            if (result !== null) {
                var data = { "id": id, "status": 6, "process_by": sessionStorage.getItem("UserId"), "reason": result };
                console.log(data); 
                ParcelService.usrupdatestatus(data).then(function (results) {
                    if (results.status == 200) {
                        ParcelService.getParcelList(sessionStorage.getItem("UserId")).then(function (results) {
                            if (results.status == 200) {
                                dTable.clear().draw();
                                $scope.list = results.data.response;
                                $scope.mainlist = results.data.response;
                                for (i = 0; i < $scope.list.length; i++) {
                                    var deptime = $scope.list[i].till_date.split(" ");
                                    $scope.list[i].till_date = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                                    $scope.mainlist[i].till_date = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                                    dTable.row.add(["P" + $scope.mainlist[i].id, $scope.mainlist[i].source, $scope.mainlist[i].destination, $scope.mainlist[i].type == 'E' ? 'Envelope' : $scope.mainlist[i].type == 'B' ? 'Box' : $scope.mainlist[i].type == 'P' ? 'Packet' : $scope.mainlist[i].type, $scope.mainlist[i].weight + " kg.", ($scope.mainlist[i].trans_id > 0 ? "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].trans_id + ")'>" + $scope.mainlist[i].trans_id + "</a>" : ""), ($scope.mainlist[i].recv_id > 0 ? "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].recv_id + ")'>" + $scope.mainlist[i].recv_id + "</a>" : ""), $scope.mainlist[i].status == 0 ? "Parcel ID Created" : $scope.mainlist[i].status == 0 ? "Parcel ID Created" : $scope.mainlist[i].status == 1 ? "Created Payment Due" : $scope.mainlist[i].status == 2 ? "Booked With TR" : $scope.mainlist[i].status == 3 ? "Parcel Collected" : $scope.mainlist[i].status == 4 ? "Parcel Delivered" : $scope.mainlist[i].status == 5 ? "Delivery Complete" : $scope.mainlist[i].status == 6 ? "Cancelled" : $scope.mainlist[i].status == 7 ? "cancelled Paid" : "Undelivered", "<div class='dropdown'>    <a href='javascript:void()' data-toggle='dropdown' class='dropdown-toggle'>Action<b class='caret'></b></a>    <ul class='dropdown-menu'>        <li><a href='/viewparcel/" + $scope.mainlist[i].id + "' title='View parcel'>View parcel</a> </li>        <li> <a href='/editparcel/" + $scope.mainlist[i].id + "' title='Cancel parcel'>Edit parcel</a></li><li> <a href='javascript:void(0);'  onclick='cancelparcellist(" + $scope.mainlist[i].id + ")'   title='Cancel parcel'>Cancel parcel</a> </li></ul></div>"]).draw();
                                }
                            }
                        });
                    }
                });
            }
        }); 
    } 
});