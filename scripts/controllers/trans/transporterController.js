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
    $scope.loginuserid = AuthService.authentication.UserId;
    dTable = $('#example').DataTable();
    $scope.fillgrid = function () {
        AddTripsService.getTripsList(sessionStorage.getItem("UserId")).then(function (results) {
            if (results.status == 200) {
                dTable.clear().draw();
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
                    if (($scope.mainlist[i].status == $scope.status || typeof $scope.status === 'undefined' || $scope.status === '' || $scope.status == null) && ($scope.mainlist[i].dep_time.getDate() == new Date($scope.departureat).getDate() || typeof $scope.departureat === 'undefined' || $scope.departureat === '' || $scope.departureat == null) && (($scope.mainlist[i].TripID).toLowerCase().indexOf($scope.TransporterID.toLowerCase()) != -1 || typeof $scope.TransporterID === 'undefined' || $scope.TransporterID === '' || $scope.TransporterID == null)) {
                        dTable.row.add([(($scope.mainlist[i].status == 3 || $scope.mainlist[i].status == 6) ? "<a  href='javascript:void(0);'  onclick='findmatchingparcels(" + $scope.mainlist[i].id + ")'   title='Find Matching Parcels'>" + $scope.mainlist[i].TripID + "</a>" : $scope.mainlist[i].TripID), $scope.mainlist[i].source, $scope.mainlist[i].destination, ($scope.mainlist[i].awailableweight == null ? $scope.mainlist[i].capacity : $scope.mainlist[i].awailableweight), $scope.mainlist[i].statusdescription, (($scope.mainlist[i].status == 1 || ($scope.mainlist[i].status == 3 && $scope.mainlist[i].awailableweight > 0)) ? "<a href='/viewtrip/" + $scope.mainlist[i].id + "#matches' title='View Trip'>Find Matching Parcels</a>" : "--NA--"), $scope.mainlist[i].airlinelink == null ? $scope.mainlist[i].flight_no : "<a href='" + $scope.mainlist[i].airlinelink + "' target='_blank' title='View Ticket'>" + $scope.mainlist[i].flight_no + "</a>", moment($scope.mainlist[i].dep_time).format("DD/MM/YYYY"), moment($scope.mainlist[i].arrival_time).format("DD/MM/YYYY"), "<div class='dropdown'>    <a href='javascript:void()' data-toggle='dropdown' class='dropdown-toggle'>Action<b class='caret'></b></a>    <ul class='dropdown-menu'>        <li><a href='/viewtrip/" + $scope.mainlist[i].id + "' title='View Trip'>View Trip</a> </li>        <li> <a href='/tripedit/" + $scope.mainlist[i].id + "' title='Edit Trip'>Edit Trip</a> </li>        <li> <a target='" + ($scope.mainlist[i].image.length > 0 ? "_blank" : "_self") + "' href='" + ($scope.mainlist[i].image.length > 0 ? RESOURCES.API_BASE_PATH + $scope.mainlist[i].image : "/uploadtripticket/" + $scope.mainlist[i].id) + "'  title='" + ($scope.mainlist[i].image.length > 0 ? "View Ticket" : "Upload Ticket") + "'>" + ($scope.mainlist[i].image.length > 0 ? "View Ticket" : "Upload Ticket") + "</a> </li><li> <a href='javascript:void(0);'  onclick='canceltriplist(" + $scope.mainlist[i].id + ")'   title='Cancel Trip'>Cancel Trip</a> </li></ul></div>"]).draw();
                    }
                }
            }
        });
    }
    $scope.fillgrid();
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
            if (($scope.mainlist[i].status == $scope.status || typeof $scope.status === 'undefined' || $scope.status === '' || $scope.status == null) && ($scope.mainlist[i].dep_time.getDate() == new Date($scope.departureat).getDate() || typeof $scope.departureat === 'undefined' || $scope.departureat === '' || $scope.departureat == null) && (($scope.mainlist[i].TripID).toLowerCase().indexOf($scope.TransporterID.toLowerCase()) != -1 || typeof $scope.TransporterID === 'undefined' || $scope.TransporterID === '' || $scope.TransporterID == null)) {
                $scope.list.push($scope.mainlist[i]);
                dTable.row.add([(($scope.mainlist[i].status == 3 || $scope.mainlist[i].status == 6) ? "<a  href='javascript:void(0);'  onclick='findmatchingparcels(" + $scope.mainlist[i].id + ")'   title='Find Matching Parcels'>" + $scope.mainlist[i].TripID + "</a>" : $scope.mainlist[i].TripID), $scope.mainlist[i].source, $scope.mainlist[i].destination, ($scope.mainlist[i].awailableweight == null ? $scope.mainlist[i].capacity : $scope.mainlist[i].awailableweight), $scope.mainlist[i].statusdescription, (($scope.mainlist[i].status == 1 || ($scope.mainlist[i].status == 3 && $scope.mainlist[i].awailableweight > 0)) ? "<a href='/viewtrip/" + $scope.mainlist[i].id + "#matches' title='View Trip'>Find Matching Parcels</a>" : ""), $scope.mainlist[i].airlinelink == null ? $scope.mainlist[i].flight_no : "<a href='" + $scope.mainlist[i].airlinelink + "' target='_blank' title='View Ticket'>" + $scope.mainlist[i].flight_no + "</a>", moment($scope.mainlist[i].dep_time).format("DD/MM/YYYY"), moment($scope.mainlist[i].arrival_time).format("DD/MM/YYYY"), "<div class='dropdown'>    <a href='javascript:void()' data-toggle='dropdown' class='dropdown-toggle'>Action<b class='caret'></b></a>    <ul class='dropdown-menu'>        <li><a href='/viewtrip/" + $scope.mainlist[i].id + "' title='View Trip'>View Trip</a> </li>        <li> <a href='/tripedit/" + $scope.mainlist[i].id + "' title='Cancel Trip'>Edit Trip</a> </li>        <li> <a target='" + ($scope.mainlist[i].image.length > 0 ? "_blank" : "_self") + "' href='" + ($scope.mainlist[i].image.length > 0 ? RESOURCES.API_BASE_PATH + $scope.mainlist[i].image : "/uploadtripticket/" + $scope.mainlist[i].id) + "'  title='" + ($scope.mainlist[i].image.length > 0 ? "View Ticket" : "Upload Ticket") + "'>" + ($scope.mainlist[i].image.length > 0 ? "View Ticket" : "Upload Ticket") + "</a> </li><li> <a href='javascript:void(0);'  onclick='canceltriplist(" + $scope.mainlist[i].id + ")'   title='Cancel Trip'>Cancel Trip</a> </li></ul></div>"]).draw();
            }
        }
    };
    $scope.searchByFilter = function () {
        _searchByFilter();
    };
    $scope.parcelcollected = function (id) {
        $scope.successaddtripMessage = "";
        bootbox.confirm("Are you sure you have collected the parcel?", function (result) {
            if (result) {
                var data = { "id": $scope.transporter.id, "status": 3, "process_by": sessionStorage.getItem("UserId"), "reason": "Parcel Collected", "parcelid": id };
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
    $scope.parceldelivered = function (id) {
        $scope.successaddtripMessage = "";
        bootbox.confirm("Are you sure you have delivered the parcel?", function (result) {
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
    $scope.cancelparcel = function (id) { 
        $scope.successaddtripMessage = "";
        bootbox.prompt("Do you want to cancel this Booking? Give Reason.", function (result) {
            if (result !== null) {
                var data = { "id": $scope.transporter.id, "status": 0, "process_by": sessionStorage.getItem("UserId"), "reason": result,"parcelid":id };
                AddTripsService.cancelparcelbytransporter(data).then(function (results) {
                    $("#userdetails").modal("hide");
                    if (results.status == 200) {
                        $scope.fillgrid();
                    }
                });
            }
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
    $scope.channelid = 0;
    $scope.showchat = function (channelid) {
        $scope.channelid = channelid; 
        AuthService.getchatlist($scope.channelid).then(function (response) {
            var index = 0;
            var datestore = "";
            var namestore = "";
            for (i = 0; i < response.data.length; i++) {
                var dat = response.data[i].created.split("-");
                var day = dat[2].split(" ");
                response.data[i].created = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
                response.data[i].created = calcTime(response.data[i].created.getTime(), 12.5);
                if (datestore != (dat[1] + "/" + day[0] + "/" + dat[0])) {
                    $scope.messages.push({ "date": response.data[i].created, "messages": [response.data[i]] });
                    index = index + 1;
                    datestore = (dat[1] + "/" + day[0] + "/" + dat[0]);
                }
                else {
                    $scope.messages[index - 1].messages.push(response.data[i]);
                }
            }
            $('#qnimate').addClass('popup-box-on');
            $(".popup-messages").animate({ scrollTop: 9999999 }, 500);
            $("#userdetails").modal("hide");
        });
    }
    $scope.chatmessage = "";
    $scope.messages = [];
    var socket = io.connect('http://webservice.mycourierbuddy.com:3000');
    $scope.submitchat = function () {
        var dataString = { channelid: $scope.channelid, messageuserid: AuthService.authentication.UserId, message: $scope.chatmessage }; 
        $.ajax({
            type: "POST", url: "http://webservice.mycourierbuddy.com/api/chatsubmit", data: dataString, dataType: "json", cache: false, success: function (data) {
                $scope.chatmessage = "";
                if (data.success == true) {
                    $("#notif").html(data.notif);
                    socket.emit('new_count_message', { new_count_message: data.new_count_message });
                    socket.emit('new_message', { channelid: data.channelid, username: data.username, created: data.created, message: data.message, id: data.id });
                } else if (data.success == false) {
                    $("#notif").html(data.notif);
                }
                $(".popup-messages").animate({ scrollTop: 9999999 }, 50);
            }, error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }
    socket.on('new_count_message', function (data) {
        //  $("#new_count_message").html(data.new_count_message);
        $('#notif_audio')[0].play();
    });
    socket.on('update_count_message', function (data) {
        //$("#new_count_message").html(data.update_count_message);
    });
    socket.on('new_message', function (data) {
        if ($scope.channelid == data.channelid) {
            var dat = data.created.split("-");
            var day = dat[2].split(" ");
            data.created = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
            data.created = calcTime(data.created.getTime(), 12.5);
            if ($.grep($scope.messages, function (a) { return moment(a.date).format('L') == moment(data.created).format('L') }).length > 0) {
                $.grep($scope.messages, function (a) { return moment(a.date).format('L') == moment(data.created).format('L') })[0].messages.push(data);
            } else {
                $scope.messages.push({ "date": data.created, "messages": [data] });
            }
            $scope.$apply();
            $("#no-message-notif").html('');
            $(".popup-messages").animate({ scrollTop: 9999999 }, 50);
            $("#new-message-notif").html('<div class="alert alert-success" role="alert"> <i class="fa fa-check"></i><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>New message ...</div>');
        }
    });
    socket.emit('get_history', 12);
    socket.on('history', function (msg) {
        console.log(msg);
    });
    function calcTime(utc, offset) {
        var nd = new Date(utc + (3600000 * offset));
        return nd;
    }
});