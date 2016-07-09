/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("viewtripsController", function ($scope, $http, $state, $location, AuthService, AddTripsService, $stateParams, RESOURCES, searchService) {
    if (!AuthService.authentication.isAuth) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
    $http.get(RESOURCES.API_BASE_PATH + 'api/getcountries', { headers: { 'Content-Type': 'application/json' }, }).then(function (results) {
        $scope.countries = results.data.response;
    });
    var dat = $location.url();
    if (dat.match("#matches")) {
        $('html, body').animate({
            scrollTop:300
        }, 'slow');
    }
    $scope.parcellist = [];
    sender = $('#example1').DataTable(); 
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    var Id = $stateParams.id;
    $scope.parcel =[];
    $scope.transporter = {};
    $scope.cancelparcel = function (id) {
        $scope.successaddtripMessage = "";
        bootbox.prompt("Reject Reason?", function (result) {
            if (result !== null) {
                var data = { "id": $scope.transporter.id, "status": 9, "process_by": AuthService.authentication.UserId, "reason": result, "parcelid": id };
                AddTripsService.cancelparcelbytransporter(data).then(function (results) {
                    $("#userdetails").modal("hide");
                    if (results.status == 200) {
                        $state.go($state.current, {}, { reload: true });
                    }
                });
            }
        });
    }
    $scope.filldetails = function () {
        searchService.gettransporterdetails($stateParams.id).then(function (response) {
            if (response.data.status == "success") {
                $scope.transporter = response.data.response[0];
                if (AuthService.authentication.UserId != $scope.transporter.t_id) {
                    $state.transitionTo('home');
                }
                $('#example2').DataTable({ searching: false, paging: false });
                var deptime = $scope.transporter.dep_time.split(" ");
                $scope.transporter.dep_time = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]).getTime();
                var arrtime = $scope.transporter.arrival_time.split(" ");
                $scope.transporter.arrival_time = new Date(arrtime[0].split("-")[1] + "/" + arrtime[0].split("-")[2] + "/" + arrtime[0].split("-")[0] + " " + arrtime[1]).getTime();
                if (response.data.parcellist !== null && typeof response.data.parcellist !== 'undefined') {
                    $scope.parcellist = response.data.parcellist;
                    sender.clear().draw();
                    for (i = 0; i < $scope.parcellist.length; i++) {
                        sender.row.add([$scope.parcellist[i].source, $scope.parcellist[i].destination, $scope.parcellist[i].till_date, $scope.parcellist[i].type == 'E' ? 'Envelope' : $scope.parcellist[i].type == 'B' ? 'Box' : $scope.parcellist[i].type == 'P' ? 'Packet' : $scope.parcellist[i].type, $scope.parcellist[i].weight, "<a href='javascript:void(0);' ng-click='senderbooknow(" + $scope.parcellist[i].id + ")' onclick='senderbooknow(" + $scope.parcellist[i].id + ")' class='btn btn-primary'>Book Now</a>"]).draw();
                    }
                } else {
                    $scope.parcellist = [];
                }
                if ($scope.transporter.status == 3 || $scope.transporter.status == 6) {
                    $scope.parcel = response.data.parcel;
                }
                $scope.transporter.link = "<a target='" + ($scope.transporter.image.length > 0 ? "_blank" : "_self") + "' href='" + ($scope.transporter.image.length > 0 ? RESOURCES.API_BASE_PATH + $scope.transporter.image : "/uploadtripticket/" + $scope.transporter.id) + "'  title='" + ($scope.transporter.image.length > 0 ? "View Ticket" : "Upload Ticket") + "'>" + ($scope.transporter.image.length > 0 ? "View Ticket" : "Upload Ticket") + "</a>";
            }
        });
    }
    $scope.filldetails();
    $scope.viewuserdetails = function (userid) {
        AuthService.getuserdetails(userid).then(function (results) {
            if (results.data.status != "Error") {
                $scope.userdetails = results.data.response[0];
                $("#userdetails").modal();
            }
        });

    };
    $scope.showchat=function(id,parcelid)
    {
        angular.element('.chatmessagepopup').scope().showchat(id, parcelid);
    }
    $scope.canceltriplist = function (id) {
        $scope.successaddtripMessage = "";
        bootbox.prompt("Do you want to cancel this Trip? Give Reason.", function (result) {
            if (result !== null) {
                var data = { "id": id, "status": 4, "process_by": AuthService.authentication.UserId, "reason": result };
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
                                $scope.successaddtripMessage = "Trip Successfully Updated.";
                                $scope.transporter.link = "<a target='" + ($scope.transporter.image.length > 0 ? "_blank" : "_self") + "' href='" + ($scope.transporter.image.length > 0 ? RESOURCES.API_BASE_PATH + $scope.transporter.image : "/uploadtripticket/" + $scope.transporter.id) + "'  title='" + ($scope.transporter.image.length > 0 ? "View Ticket" : "Upload Ticket") + "'>" + ($scope.transporter.image.length > 0 ? "View Ticket" : "Upload Ticket") + "</a>";

                            }
                        });
                    }
                });
            }
        });

    }
    $scope.parcelcollected = function (id) {
        $scope.successaddtripMessage = "";
        bootbox.confirm("Are you sure you have collected the parcel?", function (result) {
            if (result) {
                var data = { "id": $scope.transporter.id, "status": 3, "process_by": AuthService.authentication.UserId, "reason": "Parcel Collected", "parcelid": id };
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
        bootbox.confirm("Are you sure you have delivered the parcel?", function (result) {
            if (result) {
                var data = { "id": $scope.transporter.id, "status": 6, "process_by": AuthService.authentication.UserId, "reason": "Parcel Delivered", "parcelid": id };
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
    $scope.senderbooknow = function (id) { 
		if (!($.grep($scope.parcellist, function (parcel) { return parcel.id == id })[0].weight <= (parseFloat($scope.transporter.awailableweight==null?$scope.transporter.capacity:$scope.transporter.awailableweight) + (parseFloat($scope.transporter.awailableweight==null?$scope.transporter.capacity:$scope.transporter.awailableweight) * .2)))) {
            bootbox.alert("You can't book parcel having weight mare than 20% of your available capacity !", function () { 
            });
            return false;
        } 
        AddTripsService.senderbookingrequest(id, $stateParams.id).then(function (results) {
            if (results.data.status == "success") {
                $scope.successaddtripMessage = results.data.response;
            }
        });
    }
    $scope.errormessage = "";
    $scope.ticket = { "base64": "" };
    $scope.successaddtripMessage = "";
    $scope.addtripsdata = function (isValid) {
        $scope.errormessage = '';
        $scope.successaddtripMessage = "";
        console.log(isValid);
        if (!isValid) {
            $scope.errormessage = "Please fill all mandatory fields!";
            return;
        }
        if (AuthService.authentication.isAuth) {
            AuthService.getuserdetails(AuthService.authentication.UserId).then(function (results) {
                if (results.status == 200) {
                    if (results.data.response[0].status == "Y") {
                        var result = document.getElementsByClassName("quote_date");
                        $scope.departureon = new Date(result.d_date.value.split("-")[1] + "/" + result.d_date.value.split("-")[0] + "/" + result.d_date.value.split("-")[2] + " " + $scope.dtime.split(":")[0] + ":" + $scope.dtime.split(":")[1].substring(0, 2) + " " + $scope.dtime.split(":")[1].substring(2));
                        result = document.getElementsByClassName("quote_date1");
                        $scope.arrivalon = new Date(result.a_date.value.split("-")[1] + "/" + result.a_date.value.split("-")[0] + "/" + result.a_date.value.split("-")[2] + " " + $scope.atime.split(":")[0] + ":" + $scope.atime.split(":")[1].substring(0, 2) + " " + $scope.atime.split(":")[1].substring(2));
                        if (!angular.isDate($scope.departureon)) {
                            $scope.errormessage = "Invalid Depa!";
                            return;
                        }
                        var datapost = { "source": $scope.locationfrom, "destination": $scope.locationto, "d_date": $scope.departureon, "a_date": $scope.arrivalon, "flight_no": $scope.flightno, "pnr": $scope.bookingpnr, "capacity": $scope.capacity, "comment": $scope.tripcomment, "t_id": sessionStorage.getItem("UserId") };
                        if (typeof $scope.ticket.base64 !== 'undefined' && $scope.ticket.base64 !== '' && $scope.ticket.base64 != null) {
                            datapost['ticket'] = $scope.ticket.base64;
                        }
                        else {
                            datapost['ticket'] = "";
                        }
                        AddTripsService.AddTripsData(datapost).then(function (results) {
                            if (results.status == 200) {
                                bootbox.alert("Trip Created Successfully Sent for admin Approval", function () {
                                    $state.transitionTo('transporter');
                                });
                                $scope.successaddtripMessage = "Trip Created Successfully Sent for admin Approval";
                            }
                        });
                    }
                    else {
                        $scope.errormessage = "Verification Email Sent on your Email please verify.";
                        return;
                    }
                }
            });
        }
    }
    $scope.dhours = "1";
    $scope.dminutes = "0";
    $scope.dampm = "am";
    $scope.ahours = "1";
    $scope.aminutes = "0";
    $scope.aampm = "am";
    $scope.checklocation = function () {
        var fromflag = 0;
        if (typeof $scope.locationfrom !== 'undefined' && $scope.locationfrom !== '' && $scope.locationfrom != null) {
            if ($scope.locationfrom.length > 0) {
                for (i = 0; i < $scope.countries.length; i++) {
                    if ($scope.countries[i].location == $scope.locationfrom) {
                        fromflag == 1;
                    }
                    if (fromflag == 0 && ($scope.countries.length - 1) == i) {
                        //$scope.locationfrom = "";
                    }
                }

            }
        }
        var toflag = 0;
        if (typeof $scope.locationto !== 'undefined' && $scope.locationto !== '' && $scope.locationto != null) {
            if ($scope.locationto.length > 0) {
                for (i = 0; i < $scope.countries.length; i++) {
                    if ($scope.countries[i].location == $scope.locationto) {
                        toflag == 1;
                    }
                    if (toflag == 0 && ($scope.countries.length - 1) == i) {
                        //$scope.locationfrom = "";
                    }
                }

            }
        }
    }
    $scope.locationStateOption = {
        options: {
            html: false, focusOpen: false, onlySelectValid: true, source: function (request, response) {
                if (request.term.length == 0)
                    return;
                res = _suggestLocations(request.term);
                var data = [];
                for (var i = 0; i < res.length; i++) {
                    var r = res[i];
                    data.push({ label: r.location, value: r.location, id: r.id, name: r.location });
                }
                response(data);

            }
        },
        methods: {}
    };
    var _suggestLocations = function (text) {
        var result = [];
        for (i = 0; i < $scope.countries.length; i++) {
            if (result.length > 10) {
                break;
            }
            if ($scope.countries[i].location.toLowerCase().indexOf(text.toLowerCase()) == 0) {
                result.push($scope.countries[i]);
            }
        }
        for (i = 0; i < $scope.countries.length; i++) {
            if (result.length > 10) {
                break;
            }
            if ($scope.countries[i].location.toLowerCase().indexOf(text.toLowerCase()) > 0) {
                result.push($scope.countries[i]);
            }
        }
        return result;
    };

    $scope.search = function () {
        var result = document.getElementsByClassName("quote_datesearch");
        console.log(result);
        RESOURCES.searchcriteria.datefrom = new Date(result.data.value.split("-")[1] + "/" + result.data.value.split("-")[0] + "/" + result.data.value.split("-")[2]);
        result = document.getElementsByClassName("quote_datesearch1");
        console.log(result);
        RESOURCES.searchcriteria.dateto = new Date(result.data.value.split("-")[1] + "/" + result.data.value.split("-")[0] + "/" + result.data.value.split("-")[2]);
        if ($scope.searchfromlocation.trim() != $scope.searchtolocation.trim()) {
            RESOURCES.searchcriteria.locationfrom = $scope.searchfromlocation;
            RESOURCES.searchcriteria.locationto = $scope.searchtolocation;
            RESOURCES.searchcriteria.type = "Sender";
            $location.path('/search');
        } else {
            $scope.locationto = "";
        }
    }
});