/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("transporterController", function (searchService, $state, $scope, $location, AuthService, AddTripsService, RESOURCES) {
    if (!AuthService.authentication.isAuth) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
    $scope.list = [];
    $scope.mainlist = [];
    dTable = $('#example').DataTable();
    AddTripsService.getTripsList(sessionStorage.getItem("UserId")).then(function (results) {
        if (results.status == 200) {
            $scope.list = results.data.response;
            $scope.mainlist = results.data.response;
            $scope.TransporterID = RESOURCES.tripsearchcriteria.TransporterID;
            $scope.departureat = RESOURCES.tripsearchcriteria.departureat;
            $scope.status = RESOURCES.tripsearchcriteria.status;
            for (i = 0; i < $scope.list.length; i++) {
                var deptime = $scope.list[i].dep_time.split(" ");
                $scope.list[i].dep_time = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                $scope.mainlist[i].dep_time = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                var arrtime = $scope.list[i].arrival_time.split(" ");
                $scope.list[i].arrival_time = new Date(arrtime[0].split("-")[1] + "/" + arrtime[0].split("-")[2] + "/" + arrtime[0].split("-")[0] + " " + arrtime[1]);
                $scope.mainlist[i].arrival_time = new Date(arrtime[0].split("-")[1] + "/" + arrtime[0].split("-")[2] + "/" + arrtime[0].split("-")[0] + " " + arrtime[1]);
                $scope.list[i].status = parseInt($scope.list[i].status);
                $scope.mainlist[i].status = parseInt($scope.list[i].status);
                if (($scope.mainlist[i].status == $scope.status || typeof $scope.status === 'undefined' || $scope.status === '' || $scope.status == null) && ($scope.mainlist[i].dep_time.getDate() == new Date($scope.departureat).getDate() || typeof $scope.departureat === 'undefined' || $scope.departureat === '' || $scope.departureat == null) && (("T" + $scope.mainlist[i].id).toLowerCase().indexOf($scope.TransporterID.toLowerCase()) != -1 || typeof $scope.TransporterID === 'undefined' || $scope.TransporterID === '' || $scope.TransporterID == null)) {
                    dTable.row.add(["T" + $scope.mainlist[i].id, $scope.mainlist[i].source, $scope.mainlist[i].destination, $scope.mainlist[i].capacity, ($scope.mainlist[i].awailableweight == null ? $scope.mainlist[i].capacity : $scope.mainlist[i].awailableweight), $scope.mainlist[i].status == 0 ? "Pending" : $scope.mainlist[i].status == 1 ? "Approved" : $scope.mainlist[i].status == 2 ? "Booking Request Sent" : $scope.mainlist[i].status == 3 ? "Booked" : $scope.mainlist[i].status == 6 ? "Delivered" : "Undelivered", (($scope.mainlist[i].status == 1 || ($scope.mainlist[i].status == 3 && $scope.mainlist[i].awailableweight > 0)) ? "<a href='/viewtrip/" + $scope.mainlist[i].id + "#matches' title='View Trip'>Find Matching Parcels</a>" : ""), (($scope.mainlist[i].status == 3 || $scope.mainlist[i].status == 6) ? "<a  href='javascript:void(0);'  onclick='findmatchingparcels(" + $scope.mainlist[i].id + ")'   title='Find Matching Parcels'>Find Matching Parcels</a>" : ""), "<div class='dropdown'>    <a href='javascript:void()' data-toggle='dropdown' class='dropdown-toggle'>Action<b class='caret'></b></a>    <ul class='dropdown-menu'>        <li><a href='/viewtrip/" + $scope.mainlist[i].id + "' title='View Trip'>View Trip</a> </li>        <li> <a href='/tripedit/" + $scope.mainlist[i].id + "' title='Edit Trip'>Edit Trip</a> </li>        <li> <a target='" + ($scope.mainlist[i].image.length > 0 ? "_blank" : "_self") + "' href='" + ($scope.mainlist[i].image.length > 0 ? RESOURCES.API_BASE_PATH + $scope.mainlist[i].image : "/uploadtripticket/" + $scope.mainlist[i].id) + "'  title='" + ($scope.mainlist[i].image.length > 0 ? "View Ticket" : "Upload Ticket") + "'>" + ($scope.mainlist[i].image.length > 0 ? "View Ticket" : "Upload Ticket") + "</a> </li><li> <a href='javascript:void(0);'  onclick='canceltriplist(" + $scope.mainlist[i].id + ")'   title='Cancel Trip'>Cancel Trip</a> </li></ul></div>", $scope.mainlist[i].flight_no, moment($scope.mainlist[i].dep_time).format("DD/MM/YYYY"), moment($scope.mainlist[i].arrival_time).format("MMMM Do YYYY, h:mm:ss a")]).draw();
                }
                //  dTable.row.add(["T" + $scope.mainlist[i].id, $scope.mainlist[i].source, $scope.mainlist[i].destination, $scope.mainlist[i].flight_no, $scope.mainlist[i].capacity, ($scope.mainlist[i].awailableweight == null ? $scope.mainlist[i].capacity : $scope.mainlist[i].awailableweight), moment($scope.mainlist[i].dep_time).format("DD/MM/YYYY"), moment($scope.mainlist[i].arrival_time).format("DD/MM/YYYY"), $scope.mainlist[i].status == 0 ? "Pending" : $scope.mainlist[i].status == 1 ? "Approved" : $scope.mainlist[i].status == 2 ? "Booking Request Sent" : $scope.mainlist[i].status == 3 ? "Booked" : $scope.mainlist[i].status == 6 ? "Delivered" : "Undelivered", "<div class='dropdown'>    <a href='javascript:void()' data-toggle='dropdown' class='dropdown-toggle'>Action<b class='caret'></b></a>    <ul class='dropdown-menu'>        <li><a href='/viewtrip/" + $scope.mainlist[i].id + "' title='View Trip'>View Trip</a> </li>        <li> <a href='/tripedit/" + $scope.mainlist[i].id + "' title='Cancel Trip'>Edit Trip</a> </li>        <li> <a target='" + ($scope.mainlist[i].image.length > 0 ? "_blank" : "_self") + "' href='" + ($scope.mainlist[i].image.length > 0 ? RESOURCES.API_BASE_PATH + $scope.mainlist[i].image : "/uploadtripticket/" + $scope.mainlist[i].id) + "'  title='" + ($scope.mainlist[i].image.length > 0 ? "View Ticket" : "Upload Ticket") + "'>" + ($scope.mainlist[i].image.length > 0 ? "View Ticket" : "Upload Ticket") + "</a> </li><li> <a href='javascript:void(0);'  onclick='canceltriplist(" + $scope.mainlist[i].id + ")'   title='Cancel Trip'>Cancel Trip</a> </li></ul></div>"]).draw();
            }
        }
    });
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    var _searchByFilter = function () {
        $scope.list = [];
        dTable.clear().draw();
        var result = document.getElementsByClassName("quote_date");
        if (result.data.value.length > 0) {
            $scope.departureat = new Date(result.data.value.split("-")[1] + "/" + result.data.value.split("-")[0] + "/" + result.data.value.split("-")[2]);
        } else {
            $scope.departureat = "";
        }
        RESOURCES.tripsearchcriteria.TransporterID = $scope.TransporterID;
        RESOURCES.tripsearchcriteria.departureat = $scope.departureat;
        RESOURCES.tripsearchcriteria.status = $scope.status;
        for (i = 0; i < $scope.mainlist.length; i++) {
            if (($scope.mainlist[i].status == $scope.status || typeof $scope.status === 'undefined' || $scope.status === '' || $scope.status == null) && ($scope.mainlist[i].dep_time.getDate() == new Date($scope.departureat).getDate() || typeof $scope.departureat === 'undefined' || $scope.departureat === '' || $scope.departureat == null) && (("T" + $scope.mainlist[i].id).toLowerCase().indexOf($scope.TransporterID.toLowerCase()) != -1 || typeof $scope.TransporterID === 'undefined' || $scope.TransporterID === '' || $scope.TransporterID == null)) {
                $scope.list.push($scope.mainlist[i]);
                dTable.row.add(["T" + $scope.mainlist[i].id, $scope.mainlist[i].source, $scope.mainlist[i].destination, $scope.mainlist[i].capacity, ($scope.mainlist[i].awailableweight == null ? $scope.mainlist[i].capacity : $scope.mainlist[i].awailableweight), $scope.mainlist[i].status == 0 ? "Pending" : $scope.mainlist[i].status == 1 ? "Approved" : $scope.mainlist[i].status == 2 ? "Booking Request Sent" : $scope.mainlist[i].status == 3 ? "Booked" : $scope.mainlist[i].status == 6 ? "Delivered" : "Undelivered", (($scope.mainlist[i].status == 1 || ($scope.mainlist[i].status == 3 && $scope.mainlist[i].awailableweight > 0)) ? "<a href='/viewtrip/" + $scope.mainlist[i].id + "#matches' title='View Trip'>Find Matching Parcels</a>" : ""), (($scope.mainlist[i].status == 3 || $scope.mainlist[i].status == 6) ? "<a  href='javascript:void(0);'  onclick='findmatchingparcels(" + $scope.mainlist[i].id + ")'   title='Find Matching Parcels'>Find Matching Parcels</a>" : ""), "<div class='dropdown'>    <a href='javascript:void()' data-toggle='dropdown' class='dropdown-toggle'>Action<b class='caret'></b></a>    <ul class='dropdown-menu'>        <li><a href='/viewtrip/" + $scope.mainlist[i].id + "' title='View Trip'>View Trip</a> </li>        <li> <a href='/tripedit/" + $scope.mainlist[i].id + "' title='Cancel Trip'>Edit Trip</a> </li>        <li> <a target='" + ($scope.mainlist[i].image.length > 0 ? "_blank" : "_self") + "' href='" + ($scope.mainlist[i].image.length > 0 ? RESOURCES.API_BASE_PATH + $scope.mainlist[i].image : "/uploadtripticket/" + $scope.mainlist[i].id) + "'  title='" + ($scope.mainlist[i].image.length > 0 ? "View Ticket" : "Upload Ticket") + "'>" + ($scope.mainlist[i].image.length > 0 ? "View Ticket" : "Upload Ticket") + "</a> </li><li> <a href='javascript:void(0);'  onclick='canceltriplist(" + $scope.mainlist[i].id + ")'   title='Cancel Trip'>Cancel Trip</a> </li></ul></div>", $scope.mainlist[i].flight_no, moment($scope.mainlist[i].dep_time).format("DD/MM/YYYY"), moment($scope.mainlist[i].arrival_time).format("DD/MM/YYYY")]).draw();
            }
        }
    };
    $scope.searchByFilter = function () {
        _searchByFilter();
    };
    $scope.parcelcollected = function (id) {
        $scope.successaddtripMessage = "";
        bootbox.confirm("Are you Sure that you have Collected Parcel ?", function (result) {
            if (result) {
                var data = { "id": $scope.transporter.id, "status": 3, "process_by": sessionStorage.getItem("UserId"), "reason": "Parcel Collected", "parcelid": id };
                AddTripsService.usrupdatestatus(data).then(function (results) {
                    if (results.status == 200) {
                        searchService.gettransporterdetails($stateParams.id).then(function (response) {
                            if (response.data.status == "success") {
                                $scope.transporter = response.data.response[0];
                                if (response.data.parcellist !== null && typeof response.data.parcellist !== 'undefined') {
                                    $scope.parcellist = response.data.parcellist;
                                    sender.clear().draw();
                                    for (i = 0; i < $scope.parcellist.length; i++) {
                                        sender.row.add([$scope.parcellist[i].source, $scope.parcellist[i].destination, $scope.parcellist[i].till_date, $scope.parcellist[i].type == 'E' ? 'Envelope' : $scope.parcellist[i].type == 'B' ? 'Box' : $scope.parcellist[i].type == 'P' ? 'Packet' : $scope.parcellist[i].type, "<a href='javascript:void(0);' ng-click='senderbooknow(" + $scope.parcellist[i].id + ")' onclick='senderbooknow(" + $scope.parcellist[i].id + ")' class='btn btn-primary'>Book Now</a>"]).draw();
                                    }
                                } else {
                                    $scope.parcellist = [];
                                }
                                if ($scope.transporter.status == 3 || $scope.transporter.status == 6) {
                                    $scope.parcel = response.data.parcel;
                                }
                                $scope.successaddtripMessage = "Parcel Updated Successfully";
                                $scope.transporter.link = "<a target='" + ($scope.transporter.image.length > 0 ? "_blank" : "_self") + "' href='" + ($scope.transporter.image.length > 0 ? RESOURCES.API_BASE_PATH + $scope.transporter.image : "/uploadtripticket/" + $scope.transporter.id) + "'  title='" + ($scope.transporter.image.length > 0 ? "View Ticket" : "Upload Ticket") + "'>" + ($scope.transporter.image.length > 0 ? "View Ticket" : "Upload Ticket") + "</a>";

                            }
                        });
                    }
                });
            }
        });
    }
    $scope.parceldelivered = function (id) {
        $scope.successaddtripMessage = "";
        bootbox.confirm("Are you Sure that you have Delivered Parcel ?", function (result) {
            if (result) {
                var data = { "id": $scope.transporter.id, "status": 6, "process_by": sessionStorage.getItem("UserId"), "reason": "Parcel Delivered", "parcelid": id };
                AddTripsService.usrupdatestatus(data).then(function (results) {
                        searchService.gettransporterdetails($scope.transporter.id).then(function (response) {
                            $scope.parcel = response.data.parcel;
                            $scope.transporter = response.data.response[0];
                            $("#userdetails").modal();
                        });
                });
            }
        });
    }
    $scope.findmatchingparcels = function (id) {
        searchService.gettransporterdetails(id).then(function (response) {
            $scope.parcel = response.data.parcel;
            $scope.transporter = response.data.response[0];
            $("#userdetails").modal();
        });
    }
    $scope.canceltriplist = function (id) {
        $scope.successaddtripMessage = "";
        bootbox.prompt("Do you want to cancel this Trip? Give Reason.", function (result) {
            if (result !== null) {
                var data = { "id": id, "status": 4, "process_by": sessionStorage.getItem("UserId"), "reason": result };
                AddTripsService.usrupdatestatus(data).then(function (results) {
                    searchService.gettransporterdetails($scope.transporter.id).then(function (response) {
                        $scope.parcel = response.data.parcel;
                        $scope.transporter = response.data.response[0];
                        $("#userdetails").modal();
                    });
                });
            }
        });

    }
});