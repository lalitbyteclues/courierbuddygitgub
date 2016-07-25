/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("SenderController", function ($scope, $location, $state, AuthService, $stateParams, ParcelService, RESOURCES, ReceiverService) {
    $scope.userlist = [];
    if (!AuthService.authentication.isAuth) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    $scope.departureat = "";
    $scope.errormessage = "";
    $scope.list = [];
    $scope.mainlist = [];
    dTable = $('#example').DataTable({ searching: false });
    ParcelService.getParcelList(sessionStorage.getItem("UserId")).then(function (results) {
        if (results.status == 200) {
            dTable.clear().draw();
            $scope.list = results.data.response;
            $scope.mainlist = results.data.response;
            $scope.TransporterID = RESOURCES.sendersearchcriteria.TransporterID;
            $scope.departureat = RESOURCES.sendersearchcriteria.departureat;
            $scope.status = RESOURCES.sendersearchcriteria.status;
            for (i = 0; i < $scope.list.length; i++) {
                var deptime = $scope.list[i].till_date;
                $scope.list[i].till_date = new Date(deptime.split("-")[1] + "/" + deptime.split("-")[2] + "/" + deptime.split("-")[0]);
                console.log($scope.list[i].till_date);
                $scope.mainlist[i].till_date = new Date(deptime.split("-")[1] + "/" + deptime.split("-")[2] + "/" + deptime.split("-")[0]);
                if (($scope.mainlist[i].status == $scope.status || typeof $scope.status === 'undefined' || $scope.status === '' || $scope.status == null) && ($scope.mainlist[i].till_date.getDate() == new Date($scope.departureat).getDate() || typeof $scope.departureat === 'undefined' || $scope.departureat == '' || $scope.departureat == null) && (($scope.mainlist[i].ParcelID).indexOf($scope.TransporterID) != -1 || typeof $scope.TransporterID === 'undefined' || $scope.TransporterID === '' || $scope.TransporterID == null)) {
                    dTable.row.add([(($scope.mainlist[i].channelid > 0) ? "<a href='javascript:void(0);'  onclick='showchat(" + $scope.mainlist[i].channelid + "," + $scope.mainlist[i].id + ")'><span class='glyphicon glyphicon-comment'></span> </a> " : "") + "<a href='/viewparcel/" + $scope.mainlist[i].id + "' title='View parcel'>" + $scope.mainlist[i].ParcelID + "</a>", $scope.mainlist[i].source, $scope.mainlist[i].destination, $scope.mainlist[i].type == 'E' ? 'Envelope' : $scope.mainlist[i].type == 'B' ? 'Box' : $scope.mainlist[i].type == 'P' ? 'Packet' : $scope.mainlist[i].type, $scope.mainlist[i].weight + " kg.", ($scope.mainlist[i].transporterID > 0 ? "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].transporterID + ")'>" + $scope.mainlist[i].MCBTransporterID + "</a>" : "<a href='/viewparcel/" + $scope.mainlist[i].id + "#matches' title='View Trip'>Find Matching Trips</a>"), ($scope.mainlist[i].recv_id > 0 ? "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].recv_id + ")'>" + $scope.mainlist[i].MCBreceiverID + "</a>" : ""), moment($scope.mainlist[i].till_date).format("DD/MM/YYYY"), $scope.mainlist[i].statusdescription, "<div class='dropdown'>    <a href='javascript:void()' data-toggle='dropdown' class='dropdown-toggle'>Action<b class='caret'></b></a>    <ul class='dropdown-menu'>        <li><a href='/viewparcel/" + $scope.mainlist[i].id + "' title='View parcel'>View parcel</a> </li>" + (($scope.mainlist[i].status == 0 || $scope.mainlist[i].status == 1 || $scope.mainlist[i].status == 2) ? "<li> <a href='/editparcel/" + $scope.mainlist[i].id + "' title='Cancel parcel'>Edit parcel</a></li><li> <a href='javascript:void(0);'  onclick='cancelparcellist(" + $scope.mainlist[i].id + ")'   title='Cancel parcel'>Cancel parcel</a> </li>" : "") + ($scope.mainlist[i].status == 4 ? "<li><a href='javascript:void(0);'  onclick='changestatusparcel(" + $scope.mainlist[i].id + ",1)'   title='Cancel Status'>Delivered</a></li>" : "") + "</ul></div>"]).draw();
                } 
            }
        }
    });
    var _searchByFilter = function () {
        $scope.list = [];
        var result = document.getElementsByClassName("quote_date");
        if (result.data.value.length > 0) {
            $scope.departureat = new Date(result.data.value.split("-")[1] + "/" + result.data.value.split("-")[0] + "/" + result.data.value.split("-")[2]);
        } else {
            $scope.departureat = "";
        }
        RESOURCES.sendersearchcriteria.TransporterID = $scope.TransporterID;
        RESOURCES.sendersearchcriteria.departureat = $scope.departureat;
        RESOURCES.sendersearchcriteria.status = $scope.status;
        dTable.clear().draw();
        for (i = 0; i < $scope.mainlist.length; i++) {
            if (($scope.mainlist[i].status == $scope.status || typeof $scope.status === 'undefined' || $scope.status === '' || $scope.status == null) && ($scope.mainlist[i].till_date.getDate() == new Date($scope.departureat).getDate() || typeof $scope.departureat === 'undefined' || $scope.departureat == '' || $scope.departureat == null) && (($scope.mainlist[i].ParcelID).indexOf($scope.TransporterID) != -1 || typeof $scope.TransporterID === 'undefined' || $scope.TransporterID === '' || $scope.TransporterID == null)) {
                $scope.list.push($scope.mainlist[i]);
                dTable.row.add([(($scope.mainlist[i].channelid > 0) ? "<a href='javascript:void(0);'  onclick='showchat(" + $scope.mainlist[i].channelid + "," + $scope.mainlist[i].id + ")'><span class='glyphicon glyphicon-comment'></span> </a> " : "") + "<a href='/viewparcel/" + $scope.mainlist[i].id + "' title='View parcel'>" + $scope.mainlist[i].ParcelID + "</a>", $scope.mainlist[i].source, $scope.mainlist[i].destination, $scope.mainlist[i].type == 'E' ? 'Envelope' : $scope.mainlist[i].type == 'B' ? 'Box' : $scope.mainlist[i].type == 'P' ? 'Packet' : $scope.mainlist[i].type, $scope.mainlist[i].weight + " kg.", ($scope.mainlist[i].transporterID > 0 ? "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].transporterID + ")'>" + $scope.mainlist[i].MCBTransporterID + "</a>" : "<a href='/viewparcel/" + $scope.mainlist[i].id + "#matches' title='View Trip'>Find Matching Trips</a>"), ($scope.mainlist[i].recv_id > 0 ? "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].recv_id + ")'>" + $scope.mainlist[i].MCBreceiverID + "</a>" : ""), moment($scope.mainlist[i].till_date).format("DD/MM/YYYY"), $scope.mainlist[i].statusdescription, "<div class='dropdown'>    <a href='javascript:void()' data-toggle='dropdown' class='dropdown-toggle'>Action<b class='caret'></b></a>    <ul class='dropdown-menu'>        <li><a href='/viewparcel/" + $scope.mainlist[i].id + "' title='View parcel'>View parcel</a> </li>" + (($scope.mainlist[i].status == 0 || $scope.mainlist[i].status == 1 || $scope.mainlist[i].status == 2) ? "<li> <a href='/editparcel/" + $scope.mainlist[i].id + "' title='Cancel parcel'>Edit parcel</a></li><li> <a href='javascript:void(0);'  onclick='cancelparcellist(" + $scope.mainlist[i].id + ")'   title='Cancel parcel'>Cancel parcel</a> </li>" : "") + ($scope.mainlist[i].status == 4 ? "<li><a href='javascript:void(0);'  onclick='changestatusparcel(" + $scope.mainlist[i].id + ",1)'   title='Cancel Status'>Delivered</a></li>" : "") + "</ul></div>"]).draw();
            }
        }
    };
    $scope.searchByFilter = function () {
        _searchByFilter();
    };
    $scope.viewuserdetails = function (userid) {
        AuthService.getuserdetails(userid).then(function (results) {
            if (results.data.status != "Error") {
                $scope.userdetails = results.data.response[0];
                $("#userdetails").modal();
            }
        });

    };
    $scope.cancelparcellist = function (id) {
        $scope.successaddtripMessage = "";
        bootbox.prompt("Do you want to cancel this Parcel? Give Reason.", function (result) {
            if (result !== null) {
                var data = { "id": id, "status": 6, "process_by": AuthService.authentication.UserId, "reason": result };
                ParcelService.usrupdatestatus(data).then(function (results) {
                    if (results.status == 200) {
                        _searchByFilter();
                    }
                });
            }
        });
    }
    $scope.changestatusparcel = function (id, status)
    {
        $scope.successaddtripMessage = "";
        if (status == 1) {
            bootbox.prompt("Enter Feedback about Transporter.", function (result) {
                if (result !== null) {
                    var data = { "id": id, "status": 5, "process_by": sessionStorage.getItem("UserId"), "reason": result };
                    ReceiverService.usrupdatestatus(data).then(function (results) {
                        $scope.successaddtripMessage = "Updated Successfully";
                        if (results.status == 200) {
                            _searchByFilter();
                        }
                    });
                }
            });
        }
        if (status == 0) {
            bootbox.prompt("Enter Reason why Not Received?", function (result) {
                if (result !== null) {
                    var data = { "id": id, "status": 7, "process_by": sessionStorage.getItem("UserId"), "reason": result };
                    ReceiverService.usrupdatestatus(data).then(function (results) {
                        $scope.successaddtripMessage = "Updated Successfully";
                        if (results.status == 200) {
                            _searchByFilter();
                        }
                    });
                }
            });
        }
    }
});