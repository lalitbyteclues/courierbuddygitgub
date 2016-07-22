/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("viewparcelController", function ($http, $scope, $state, $location, RESOURCES, AuthService, ParcelService, searchService, $stateParams, ValiDatedTokenObject, ReceiverService) {
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
            scrollTop: 300
        }, 'slow');
    }
    $scope.usewalletamount = false;
    $scope.loginuser = ValiDatedTokenObject.getValiDatedTokenObject()[0];
    AuthService.getuserdetails($scope.loginuser.id).then(function (results) {
        $scope.loginuser = results.data.response[0];
    });
    trans = $('#example').DataTable();
    $scope.trip = [];
    $scope.tripsmatch = [];
    $scope.orderlist = [];
    $scope.parcel = {};
    $scope.issummary = false;
    $scope.ordernumber = false;
    ParcelService.getparceldetail($stateParams.id).then(function (response) {
        if (response.data.status == "success") {
            $scope.parcel = response.data.response[0];
            if (AuthService.authentication.UserId != $scope.parcel.usr_id) {
                $state.transitionTo('home');
            }
            $scope.trip = response.data.trip;
            if (typeof $scope.trip != 'undefined')
            {
                var dat = $scope.trip[0].dep_time.split("-");
                var day = dat[2].split(" ");
                $scope.trip[0].dep_time = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
                var dat = $scope.trip[0].arrival_time.split("-");
                var day = dat[2].split(" ");
                $scope.trip[0].arrival_time = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
            }
            AuthService.getuserdetails($scope.parcel.recv_id).then(function (results) {
                $scope.userlist = results.data.response;

            });
            $('#example2').DataTable({ searching: false, paging: false });
            if ($scope.parcel.trans_id !== null && typeof $scope.parcel.trans_id !== 'undefined' && $scope.parcel.trans_id > 0 && $scope.parcel.status == 1) {
                searchService.gettransporterdetails($scope.parcel.trans_id).then(function (response) {
                    if (response.data.status == "success") {
                        $scope.issummary = true;
                        $scope.transporter = response.data.response[0];
                    }
                });
            } else {

                if (response.data.tripsmatch !== null && typeof response.data.tripsmatch !== 'undefined') {
                    $scope.tripsmatch = response.data.tripsmatch;
                    trans.clear().draw();
                    for (i = 0; i < $scope.tripsmatch.length; i++) {
                        var dat = $scope.tripsmatch[i].dep_time.split("-");
                        var day = dat[2].split(" ");
                        $scope.tripsmatch[i].dep_time = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
                        var dat = $scope.tripsmatch[i].arrival_time.split("-");
                        var day = dat[2].split(" ");
                        $scope.tripsmatch[i].arrival_time = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
                        trans.row.add([$scope.tripsmatch[i].TripID, $scope.tripsmatch[i].source, $scope.tripsmatch[i].destination, moment($scope.tripsmatch[i].dep_time).format('DD/MM/YYYY, h:mm a'), moment($scope.tripsmatch[i].arrival_time).format('DD/MM/YYYY, h:mm a'), $scope.tripsmatch[i].capacity, "<a href='javascript:void(0);' ng-click='createcourierrequest(" + $scope.tripsmatch[i].id + ")' onclick='createcourierrequest(" + $scope.tripsmatch[i].id + ")' class='btn btn-primary'>Create Courier Request</a>"]).draw();
                    }
                } else {
                    $scope.tripsmatch = [];
                }
            }
        }
    });
    $scope.showchat = function (id, parcelid) {
        angular.element('.chatmessagepopup').scope().showchat(id, parcelid);
    }
    $scope.cancelparcellist = function (id) {
        $scope.successaddtripMessage = "";
        bootbox.prompt("Do you want to cancel this Parcel? Give Reason.", function (result) {
            if (result !== null) {
                var data = { "id": id, "status": 6, "process_by": AuthService.authentication.UserId, "reason": result };
                ParcelService.usrupdatestatus(data).then(function (results) {
                    if (results.status == 200) {
                        ParcelService.getparceldetail($stateParams.id).then(function (response) {
                            if (response.data.status == "success") {
                                $scope.parcel = response.data.response[0];
                                $scope.trip = response.data.trip;
                                if (response.data.tripsmatch !== null && typeof response.data.tripsmatch !== 'undefined') {
                                    $scope.tripsmatch = response.data.tripsmatch;
                                    trans.clear().draw();
                                    for (i = 0; i < $scope.tripsmatch.length; i++) {
                                        var dat = $scope.tripsmatch[i].dep_time.split("-");
                                        var day = dat[2].split(" ");
                                        $scope.tripsmatch[i].dep_time = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
                                        var dat = $scope.tripsmatch[i].arrival_time.split("-");
                                        var day = dat[2].split(" ");
                                        $scope.tripsmatch[i].arrival_time = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
                                        trans.row.add([$scope.tripsmatch[i].TripID, $scope.tripsmatch[i].source, $scope.tripsmatch[i].destination, moment($scope.tripsmatch[i].dep_time).format('DD/MM/YYYY, h:mm a'), moment($scope.tripsmatch[i].arrival_time).format('DD/MM/YYYY, h:mm a'), $scope.tripsmatch[i].capacity, "<a href='javascript:void(0);' ng-click='createcourierrequest(" + $scope.tripsmatch[i].id + ")' onclick='createcourierrequest(" + $scope.tripsmatch[i].id + ")' class='btn btn-primary'>Create Courier Request</a>"]).draw();
                                    }
                                }
                                else {
                                    $scope.tripsmatch = [];
                                }
                            }
                        });
                    }
                });
            }
        });
    }
    $scope.createcourierrequest = function (id) {
        console.log($.grep($scope.tripsmatch, function (a) { return a.id == id })[0]);
        if (parseInt($.grep($scope.tripsmatch, function (a) { return a.id == id })[0].capacity) < parseInt($scope.parcel.weight)) {
            bootbox.confirm("Trip weight capicity is less than your need. Do you want to Book with quantity:" + $.grep($scope.tripsmatch, function (a) { return a.id == id })[0].capacity + "?", function (result) {
                if (result) {
                    $scope.parcel.weight = $.grep($scope.tripsmatch, function (a) { return a.id == id })[0].capacity;
                    var data = { "weight": $scope.parcel.weight, "id": $scope.parcel.id };
                    ParcelService.updateparcelweight(data).then(function (results) {
                        if (results.status == 200) {
                            searchService.gettransporterdetails(id).then(function (response) {
                                if (response.data.status == "success") {
                                    $scope.issummary = true;
                                    $scope.transporter = response.data.response[0];
                                }
                            });
                        }
                    });
                }
            });
        }
        else {
            searchService.gettransporterdetails(id).then(function (response) {
                if (response.data.status == "success") {
                    $scope.issummary = true;
                    $scope.transporter = response.data.response[0];
                }
            });
        }
    }
    $scope.generateordernumber = function () {
        var datapost = { "ParcelID": $scope.parcel.id, "TransID": $scope.transporter.id, "status": $scope.parcel.status, "ordernumber": new Date().getTime(), "Amount": $scope.parcel.payment, "Paymentvia": "Payu Money Gateway", "usewalletamount": $scope.usewalletamount, "walletamount": $scope.loginuser.wallet, "loginuserid": $scope.loginuser.id };
        ParcelService.generateordernumber(datapost).then(function (results) {
            if (results.data.status == "successpayment") {
                $scope.tripsmatch = [];
                $scope.issummary = false;
                $scope.ordernumber = false;
                ParcelService.getparceldetail($stateParams.id).then(function (response) {
                    if (response.data.status == "success") {
                        $scope.parcel = response.data.response[0];
                        $scope.trip = response.data.trip;
                        AuthService.getuserdetails($scope.parcel.recv_id).then(function (results) {
                            $scope.userlist = results.data.response;

                        });
                        if ($scope.parcel.trans_id !== null && typeof $scope.parcel.trans_id !== 'undefined' && $scope.parcel.trans_id > 0 && $scope.parcel.status == 1) {
                            searchService.gettransporterdetails($scope.parcel.trans_id).then(function (response) {
                                if (response.data.status == "success") {
                                    $scope.issummary = true;
                                    $scope.transporter = response.data.response[0];
                                }
                            });
                        }
                    }
                });
            }
            else {
                $scope.orderlist = results.data.response;
                $scope.orderlist[0].Amount = parseFloat($scope.orderlist[0].Amount);
                $scope.parcel.payment = parseFloat($scope.parcel.payment);
            }
        });
    }
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
            RESOURCES.searchcriteria.type = "Transporter";
            $location.path('/search');
        } else {
            $scope.locationto = "";
        }
    }

    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
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
                            ParcelService.getparceldetail($stateParams.id).then(function (response) {
                                if (response.data.status == "success") {
                                    $scope.parcel = response.data.response[0];
                                    if (AuthService.authentication.UserId != $scope.parcel.usr_id) {
                                        $state.transitionTo('home');
                                    }
                                    $scope.trip = response.data.trip;
                                    AuthService.getuserdetails($scope.parcel.recv_id).then(function (results) {
                                        $scope.userlist = results.data.response;

                                    });

                                    if ($scope.parcel.trans_id !== null && typeof $scope.parcel.trans_id !== 'undefined' && $scope.parcel.trans_id > 0 && $scope.parcel.status == 1) {
                                        searchService.gettransporterdetails($scope.parcel.trans_id).then(function (response) {
                                            if (response.data.status == "success") {
                                                $scope.issummary = true;
                                                $scope.transporter = response.data.response[0];
                                            }
                                        });
                                    } else {

                                        if (response.data.tripsmatch !== null && typeof response.data.tripsmatch !== 'undefined') {
                                            $scope.tripsmatch = response.data.tripsmatch;
                                            trans.clear().draw();
                                            for (i = 0; i < $scope.tripsmatch.length; i++) {
                                                var dat = $scope.tripsmatch[i].dep_time.split("-");
                                                var day = dat[2].split(" ");
                                                $scope.tripsmatch[i].dep_time = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
                                                var dat = $scope.tripsmatch[i].arrival_time.split("-");
                                                var day = dat[2].split(" ");
                                                $scope.tripsmatch[i].arrival_time = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
                                                trans.row.add([$scope.tripsmatch[i].TripID, $scope.tripsmatch[i].source, $scope.tripsmatch[i].destination, moment($scope.tripsmatch[i].dep_time).format('DD/MM/YYYY, h:mm a'), moment($scope.tripsmatch[i].arrival_time).format('DD/MM/YYYY, h:mm a'), $scope.tripsmatch[i].capacity, "<a href='javascript:void(0);' ng-click='createcourierrequest(" + $scope.tripsmatch[i].id + ")' onclick='createcourierrequest(" + $scope.tripsmatch[i].id + ")' class='btn btn-primary'>Create Courier Request</a>"]).draw();

                                            }
                                        } else {
                                            $scope.tripsmatch = [];
                                        }
                                    }
                                }
                            });
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
                            ParcelService.getparceldetail($stateParams.id).then(function (response) {
                                if (response.data.status == "success") {
                                    $scope.parcel = response.data.response[0];
                                    if (AuthService.authentication.UserId != $scope.parcel.usr_id) {
                                        $state.transitionTo('home');
                                    }
                                    $scope.trip = response.data.trip;
                                    AuthService.getuserdetails($scope.parcel.recv_id).then(function (results) {
                                        $scope.userlist = results.data.response;

                                    });

                                    if ($scope.parcel.trans_id !== null && typeof $scope.parcel.trans_id !== 'undefined' && $scope.parcel.trans_id > 0 && $scope.parcel.status == 1) {
                                        searchService.gettransporterdetails($scope.parcel.trans_id).then(function (response) {
                                            if (response.data.status == "success") {
                                                $scope.issummary = true;
                                                $scope.transporter = response.data.response[0];
                                            }
                                        });
                                    } else {

                                        if (response.data.tripsmatch !== null && typeof response.data.tripsmatch !== 'undefined') {
                                            $scope.tripsmatch = response.data.tripsmatch;
                                            trans.clear().draw();
                                            for (i = 0; i < $scope.tripsmatch.length; i++) {
                                                var dat = $scope.tripsmatch[i].dep_time.split("-");
                                                var day = dat[2].split(" ");
                                                $scope.tripsmatch[i].dep_time = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
                                                var dat = $scope.tripsmatch[i].arrival_time.split("-");
                                                var day = dat[2].split(" ");
                                                $scope.tripsmatch[i].arrival_time = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
                                                trans.row.add([$scope.tripsmatch[i].TripID, $scope.tripsmatch[i].source, $scope.tripsmatch[i].destination, moment($scope.tripsmatch[i].dep_time).format('DD/MM/YYYY, h:mm a'), moment($scope.tripsmatch[i].arrival_time).format('DD/MM/YYYY, h:mm a'), $scope.tripsmatch[i].capacity, "<a href='javascript:void(0);' ng-click='createcourierrequest(" + $scope.tripsmatch[i].id + ")' onclick='createcourierrequest(" + $scope.tripsmatch[i].id + ")' class='btn btn-primary'>Create Courier Request</a>"]).draw();

                                            }
                                        } else {
                                            $scope.tripsmatch = [];
                                        }
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