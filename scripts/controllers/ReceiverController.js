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
    $scope.parcelsingle = {};
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
                dTable.row.add(["<a href='javascript:void(0);' onclick='parceldetails(" + $scope.mainlist[i].id + ")'>P" + $scope.mainlist[i].id + "</a>", $scope.mainlist[i].flight_no, "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].usr_id + ")'>MCB" + $scope.mainlist[i].usr_id + "</a>", "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].Transporterid + ")'>MCB" + $scope.mainlist[i].Transporterid + "</a>", $scope.mainlist[i].statusdescription, (($scope.mainlist[i].status == 2 || $scope.mainlist[i].status == 3 || $scope.mainlist[i].status == 4) ? "<a href='javascript:void(0);'    onclick='changestatusparcel(" + $scope.mainlist[i].id + ",1)'   title='Received'>Received</a><br><a href='javascript:void(0);'    onclick='changestatusparcel(" + $scope.mainlist[i].id + ",0)'   title='Not Received'>Not Received</a>" : "")]).draw();
            }
        }
    });
    var _searchByFilter = function () {
        $scope.list = [];
        dTable.clear().draw();
        for (i = 0; i < $scope.mainlist.length; i++) {
            if (($scope.mainlist[i].status == $scope.status || typeof $scope.status === 'undefined' || $scope.status === '' || $scope.status == null) && ($scope.mainlist[i].dep_time.getDate() == new Date($scope.departureat).getDate() || typeof $scope.departureat === 'undefined' || $scope.departureat === '' || $scope.departureat == null) && ($scope.mainlist[i].id.toLowerCase().indexOf($scope.TransporterID) != -1 || typeof $scope.TransporterID === 'undefined' || $scope.TransporterID === '' || $scope.TransporterID == null)) {
                $scope.list.push($scope.mainlist[i]);
                dTable.row.add(["<a href='javascript:void(0);' onclick='parceldetails(" + $scope.mainlist[i].id + ")'>P" + $scope.mainlist[i].id + "</a>", $scope.mainlist[i].flight_no, "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].usr_id + ")'>MCB" + $scope.mainlist[i].usr_id + "</a>", "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].Transporterid + ")'>MCB" + $scope.mainlist[i].Transporterid + "</a>", $scope.mainlist[i].statusdescription, (($scope.mainlist[i].status == 2 || $scope.mainlist[i].status == 3 || $scope.mainlist[i].status == 4) ? "<a href='javascript:void(0);'  onclick='changestatusparcel(" + $scope.mainlist[i].id + ",1)'   title='Received'>Received</a><br><a href='javascript:void(0);'    onclick='changestatusparcel(" + $scope.mainlist[i].id + ",0)'   title='Not Received'>Not Received</a>" : "")]).draw();
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
    $scope.parceldetails = function (id) { 
        $scope.parcelsingle = $.grep($scope.mainlist, function (parcel) { return parcel.id == id })[0];
        if ($.grep($scope.mainlist, function (parcel) { return parcel.id == id }).length > 0)
        {
            $scope.$apply();
            $("#parceldetails").modal();
        }
    };
    $scope.changestatusparcel = function (id, status) {
        $scope.successaddtripMessage = "";
        if (status == 1) {
            bootbox.prompt("Enter Feedback about Transporter.", function (result) {
                if (result !== null) {
                    var data = { "id": id, "status": 5, "process_by": sessionStorage.getItem("UserId"), "reason": result };
                    ReceiverService.usrupdatestatus(data).then(function (results) {
                        $scope.successaddtripMessage = "Updated Successfully";
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
                                        dTable.row.add(["<a href='javascript:void(0);' onclick='parceldetails(" + $scope.mainlist[i].id + ")'>P" + $scope.mainlist[i].id + "</a>", $scope.mainlist[i].flight_no, "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].usr_id + ")'>MCB" + $scope.mainlist[i].usr_id + "</a>", "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].Transporterid + ")'>MCB" + $scope.mainlist[i].Transporterid + "</a>", $scope.mainlist[i].statusdescription, (($scope.mainlist[i].status == 2 || $scope.mainlist[i].status == 3 || $scope.mainlist[i].status == 4) ? "<a href='javascript:void(0);'   onclick='changestatusparcel(" + $scope.mainlist[i].id + ",1)'   title='Received'>Received</a><br><a href='javascript:void(0);'  onclick='changestatusparcel(" + $scope.mainlist[i].id + ",0)'     title='Not Received'>Not Received</a>" : "")]).draw();
                                    }
                                }
                            });
                        }
                    });
                }
            });
        }
        if (status ==0) {
            bootbox.prompt("Enter Reason why Not Received?", function (result) {
                if (result !== null) {
                    var data = { "id": id, "status": 7, "process_by": sessionStorage.getItem("UserId"), "reason": result };
                    ReceiverService.usrupdatestatus(data).then(function (results) {
                        $scope.successaddtripMessage = "Updated Successfully";
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
                                        dTable.row.add(["<a href='javascript:void(0);' onclick='parceldetails(" + $scope.mainlist[i].id + ")'>P" + $scope.mainlist[i].id + "</a>", $scope.mainlist[i].flight_no, "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].usr_id + ")'>MCB" + $scope.mainlist[i].usr_id + "</a>", "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].Transporterid + ")'>MCB" + $scope.mainlist[i].Transporterid + "</a>", $scope.mainlist[i].statusdescription, (($scope.mainlist[i].status == 2 || $scope.mainlist[i].status == 3 || $scope.mainlist[i].status == 4) ? "<a href='javascript:void(0);'   onclick='changestatusparcel(" + $scope.mainlist[i].id + ",1)'   title='Received'>Received</a><br><a href='javascript:void(0);'  onclick='changestatusparcel(" + $scope.mainlist[i].id + ",0)'  title='Not Received'>Not Received</a>" : "")]).draw();
                                    }
                                }
                            });
                        }
                    });
                }
            });
        }
    }
});