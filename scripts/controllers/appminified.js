/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("AddparcelController", function ($http, $scope, $state, $location, RESOURCES, AuthService, ParcelService, searchService, $stateParams) {
    if (!AuthService.authentication.isAuth) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
    $http.get(RESOURCES.API_BASE_PATH + 'api/getcountries', { headers: { 'Content-Type': 'application/json' }, }).then(function (results) {
        $scope.countries = results.data.response;
    });
    $scope.registeremail = "";
    $scope.registername = "";
    $scope.usersearchclicked = false;
    $scope.usersearchvisible = true;
    $scope.deliverytill = new Date();
    $scope.dateFromsearch = RESOURCES.searchcriteria.datefrom;
    $scope.dateTosearch = RESOURCES.searchcriteria.dateto;
    if (RESOURCES.searchcriteria.dateto != "") {
        $scope.deliverytill = RESOURCES.searchcriteria.dateto;
    }
    $scope.searchfromlocation = RESOURCES.searchcriteria.locationfrom;
    $scope.parcelfromloation = RESOURCES.searchcriteria.locationfrom;
    $scope.searchtolocation = RESOURCES.searchcriteria.locationto;
    $scope.parceltoloation = RESOURCES.searchcriteria.locationto;

    $scope.ParcelHeight = 0; $scope.ParcelWidth = 0; $scope.ParcelLength = 0;
    $scope.userlist = [];
    $scope.issummary = false;
    $scope.successaddtripMessage = "";
    $scope.errormessage = "";
    $scope.totalamount = 0.00;
    var userlisttableentity = $('#userlist').DataTable({ searching: false, paging: false });
    var userlisttableentity1 = $('#userlist1').DataTable({ searching: false, paging: false });
    $scope.changereceiveruser = function () {
        $scope.usersearchvisible = true;
        $scope.$apply();
    }
    $scope.sendinviteuser = function () {
        var EMAIL_REGEXP = /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
        $scope.successaddtripMessage = "";
        $scope.errormessageuser = "";
        if ($scope.registeremail == "" || $scope.registername == "") {
            $scope.errormessageuser = "Please fill all mandatory fields!";
            return;
        }
        if (!EMAIL_REGEXP.test($scope.registeremail)) {
            $scope.errormessageuser = "Please enter a valid Email ID !";
            return;
        }
        var data = { "email": $scope.registeremail, "name": $scope.registername, "number": $scope.registermobile, "message": $scope.registermessage, "UserID": AuthService.authentication.UserId };
        AuthService.inviteuser(data).then(function (results) {
            if (results.status == 200) {
                $scope.successaddtripMessage = "User Invited Successfully";
                $scope.userlist = results.data.response;
                if ($scope.userlist.length > 0) {
                    userlisttableentity.clear().draw();
                    userlisttableentity.row.add([$scope.userlist[0].UserID, $scope.userlist[0].username, $scope.userlist[0].name, $scope.userlist[0].mobile == 0 ? "" : $scope.userlist[0].mobile, ' <a href="javascript:void(0);" onclick="changereceiveruser()">Change</a>']).draw();
                    userlisttableentity1.clear().draw();
                    userlisttableentity1.row.add([$scope.userlist[0].UserID, $scope.userlist[0].username, $scope.userlist[0].name, $scope.userlist[0].mobile == 0 ? "" : $scope.userlist[0].mobile, ' <a href="javascript:void(0);" onclick="changereceiveruser()">Change</a>']).draw();
                    $scope.usersearchvisible = false;
                }
            }
        });
    }
    function getpriceusingweight(weight) {
        return weight < 0.02 ? 500 : weight < .05 ? 800 : weight < 1 ? 1000 : weight < 2 ? 1950 : weight < 3 ? 2900 : weight < 4 ? 3800 : weight < 5 ? 4700 : weight < 6 ? 5600 : weight < 7 ? 6500 : weight < 8 ? 7400 : weight < 9 ? 8300 : weight <= 10 ? 9200 : 0;
    }
    $scope.editparcel = function () {
        $scope.issummary = false;
    }
    $scope.submitsummarypaynow = function (isValid) {
        $scope.errormessage = "";
        $scope.successaddtripMessage = "";
        if (!isValid) {
            $scope.errormessage = "Please fill all mandatory fields!";
            return;
        }
        if (AuthService.authentication.isAuth) {
            AuthService.getuserdetails(AuthService.authentication.UserId).then(function (results) {
                if (results.status == 200) {
                    if (results.data.response[0].status == "Y") {
                        if ($scope.userlist.length == 0) {
                            $scope.errormessage = "Please Select receiver !";
                            return;
                        }
                        if ($(".quote_date").val().length == 0) {
                            $scope.errormessage = "Departure Time Required!";
                            return;
                        }
                        $scope.deliverytill = new Date($(".quote_date").val().split("-")[1] + "/" + $(".quote_date").val().split("-")[0] + "/" + $(".quote_date").val().split("-")[2] + " ");
                        var tilldate = $(".quote_date").val().split("-")[2] + "/" + $(".quote_date").val().split("-")[1] + "/" + $(".quote_date").val().split("-")[0];
                        var amount = getpriceusingweight(parseFloat($scope.ParcelWeight));
                        $scope.parcel = { "source": $scope.parcelfromloation, "destination": $scope.parceltoloation, "till_date": tilldate, "type": $scope.parceltype, "weight": parseFloat($scope.ParcelWeight), "height": $scope.ParcelHeight, "width": $scope.ParcelWidth, "length": $scope.ParcelLength, "created": new Date(), "usr_id": sessionStorage.getItem("UserId"), "recv_id": $scope.userlist[0].id, "status": 0, "description": $scope.parceldecsription, "payment": parseFloat(amount) };
                        ParcelService.calculateamount($scope.parcel).then(function (results) {
                            if (results.status == 200) {
                                $scope.parcel.amount = results.data.price;
                                $scope.issummary = true;
                                setTimeout(function () {
                                    $('.parcelsummary').DataTable({ searching: false, paging: false });
                                }, 500);
                            }
                        });
                    }
                    else {
                        $scope.errormessage = "Please verify your email before adding Parcel ! ";
                        return;
                    }
                }
            })
        }
    }
    $scope.paynow = function (isValid) {
        $scope.errormessage = "";
        $scope.successaddtripMessage = "";
        if (!isValid) {
            $scope.errormessage = "Please fill all mandatory fields!";
            return;
        }
        if (AuthService.authentication.isAuth) {
            AuthService.getuserdetails(AuthService.authentication.UserId).then(function (results) {
                if (results.status == 200) {
                    if (results.data.response[0].status == "Y") {
                        if ($scope.userlist.length == 0) {
                            $scope.errormessage = "Please Select receiver !";
                            return;
                        }
                        if ($(".quote_date").val().length == 0) {
                            $scope.errormessage = "Departure Time Required!";
                            return;
                        }
                        $scope.deliverytill = new Date($(".quote_date").val().split("-")[1] + "/" + $(".quote_date").val().split("-")[0] + "/" + $(".quote_date").val().split("-")[2] + " ");
                        var tilldate = $(".quote_date").val().split("-")[2] + "/" + $(".quote_date").val().split("-")[1] + "/" + $(".quote_date").val().split("-")[0];
                        var amount = getpriceusingweight(parseFloat($scope.ParcelWeight));
                        var datapost = { "source": $scope.parcelfromloation, "destination": $scope.parceltoloation, "till_date": tilldate, "type": $scope.parceltype, "weight": parseFloat($scope.ParcelWeight), "height": $scope.ParcelHeight, "width": $scope.ParcelWidth, "length": $scope.ParcelLength, "created": new Date(), "usr_id": sessionStorage.getItem("UserId"), "recv_id": $scope.userlist[0].id, "status": 0, "description": $scope.parceldecsription, "payment": parseFloat(amount) };
                        ParcelService.AddParcelData(datapost).then(function (results) {
                            if (results.status == 200) {
                                $state.go("viewparcel", { id: results.data.response.id });
                                $scope.successaddtripMessage = 'Parcel Created Successfully.  <a style="float:right;" href="/viewparcel/' + results.data.response.id + '" aria-controls="home" role="tab" data-toggle="tab"><i class="fa fa-plane" aria-hidden="true"></i> View Parcel</a>';
                                $scope.tripsavemessage = "Parcel Created Successfully.";
                            }
                        });
                    }
                    else {
                        $scope.errormessage = "Please verify your email before adding Parcel ! ";
                        return;
                    }
                }
            })
        }
    }
    $scope.errormessage = "";
    $scope.userlist = [];
    $scope.showheight = false;
    $scope.showwidth = false;
    $scope.showlength = false;
    $scope.exitingemail = ""; $scope.exitingmobilenumber = ""; $scope.value1 = 'true';
    $scope.searchuser = function () {
        $scope.errormessage = "";
        $scope.successaddtripMessage = "";
        AuthService.getuserdetails(AuthService.authentication.UserId).then(function (results) {
            if (results.status == 200) {
                if (results.data.response[0].status == "Y") {
                    $scope.usersearchclicked = false;
                    if ((typeof $scope.exitingemail === 'undefined' || $scope.exitingemail === '' || $scope.exitingemail == null) && (typeof $scope.exitingmobilenumber === 'undefined' || $scope.exitingmobilenumber === '' || $scope.exitingmobilenumber == null)) {

                    } else {
                        searchService.searchuser($scope.exitingmobilenumber, $scope.exitingemail, AuthService.authentication.UserId).then(function (response) {
                            $scope.userlist = response.data.response;
                            if ($scope.userlist.length > 0) {
                                userlisttableentity.clear().draw();
                                userlisttableentity.row.add([$scope.userlist[0].UserID, $scope.userlist[0].username, $scope.userlist[0].name, $scope.userlist[0].mobile == 0 ? "" : $scope.userlist[0].mobile, ' <a href="javascript:void(0);" onclick="changereceiveruser()">Change</a>']).draw();
                                userlisttableentity1.clear().draw();
                                userlisttableentity1.row.add([$scope.userlist[0].UserID, $scope.userlist[0].username, $scope.userlist[0].name, $scope.userlist[0].mobile == 0 ? "" : $scope.userlist[0].mobile, ' <a href="javascript:void(0);" onclick="changereceiveruser()">Change</a>']).draw();

                                $scope.usersearchvisible = false;
                            }
                            $scope.usersearchclicked = true;
                        });
                    }
                }
                else {
                    $scope.errormessage = "Please verify your email before adding Parcel ! ";
                    return;
                }
            }
        });
    };
    $scope.checkdimensions = function () {
        if ($scope.parceltype == "B") {
            $scope.showheight = true;
            $scope.showwidth = true;
            $scope.showlength = true;
        } else {
            $scope.showheight = false;
            $scope.showwidth = false;
            $scope.showlength = false;
        }
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
                results = _suggestLocations(request.term);
                res = results;
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
        RESOURCES.searchcriteria.datefrom = new Date($(".quote_datesearch").val().split("-")[1] + "/" + $(".quote_datesearch").val().split("-")[0] + "/" + $(".quote_datesearch").val().split("-")[2]);
        RESOURCES.searchcriteria.dateto = new Date($(".quote_datesearch1").val().split("-")[1] + "/" + $(".quote_datesearch1").val().split("-")[0] + "/" + $(".quote_datesearch1").val().split("-")[2]);
        if ($scope.searchfromlocation.trim() != $scope.searchtolocation.trim()) {
            RESOURCES.searchcriteria.locationfrom = $scope.searchfromlocation;
            RESOURCES.searchcriteria.locationto = $scope.searchtolocation;
            RESOURCES.searchcriteria.type = "Transporter";
            $location.path('/search');
        } else {
            $scope.searchtolocation = "";
        }
    }
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
});
/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("addtripsController", function ($rootScope, $scope, $http, $state, $location, AuthService, AddTripsService, $stateParams, RESOURCES) {
    $scope.errormessage = "";
    $scope.tripsavemessage = "";
    $scope.ticket = { "base64": "" };
    $scope.successaddtripMessage = "";
    $scope.countries = [];
    $http.get(RESOURCES.API_BASE_PATH + 'api/getcountries', { headers: { 'Content-Type': 'application/json' }, }).then(function (results) {
        $scope.countries = results.data.response;
        $("#durationPicker").durationPicker("seconds", $scope.tripduration)
    });
    $scope.addtripsdata = function (isValid) {
        $scope.errormessage = '';
        $scope.tripsavemessage = "";
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
                        if ($(".quote_date").val().length == 0) {
                            $scope.errormessage = "Departure Time Required!";
                            return;
                        }
                        $scope.departureon = new Date($(".quote_date").val().split("-")[1] + "/" + $(".quote_date").val().split("-")[0] + "/" + $(".quote_date").val().split("-")[2] + " " + $scope.dtime);
                        var dep_time = $(".quote_date").val().split("-")[2] + "/" + $(".quote_date").val().split("-")[1] + "/" + $(".quote_date").val().split("-")[0] + " " + $scope.dtime;
                        if ($(".quote_date1").val().length == 0) {
                            $scope.errormessage = "Arrival Time Required!";
                            return;
                        }
                        $scope.atime = angular.element('#setTimeExample1').val();
                        $scope.arrivalon = new Date($(".quote_date1").val().split("-")[1] + "/" + $(".quote_date1").val().split("-")[0] + "/" + $(".quote_date1").val().split("-")[2] + " " + $scope.atime);
                        var arrivaltime = $(".quote_date1").val().split("-")[2] + "/" + $(".quote_date1").val().split("-")[1] + "/" + $(".quote_date1").val().split("-")[0] + " " + $scope.atime;
                        if (!angular.isDate($scope.arrivalon)) {
                            $scope.errormessage = "Invalid Arrival Time or select Estimate Trip Duration!";
                            return;
                        }
                        var datapost = { "source": $scope.locationfrom, "destination": $scope.locationto, "d_date": dep_time, "a_date": arrivaltime, "flight_no": $scope.flightno, "pnr": $scope.bookingpnr, "capacity": $scope.capacity, "comment": $scope.tripcomment, "t_id": sessionStorage.getItem("UserId"), "duration": $scope.tripduration };
                        if (typeof $scope.ticket.base64 !== 'undefined' && $scope.ticket.base64 !== '' && $scope.ticket.base64 != null) {
                            datapost['ticket'] = $scope.ticket.base64;
                        }
                        else {
                            datapost['ticket'] = "";
                        }
                        AddTripsService.AddTripsData(datapost).then(function (results) {
                            if (results.status == 200) {
                                $scope.successaddtripMessage = "Trip Created Successfully Sent for admin Approval";
                                $scope.tripsavemessage = 'Trip Created Successfully Sent for admin Approval. <a style="float:right;" href="/viewtrip/' + results.data.response.id + '" aria-controls="home" role="tab" data-toggle="tab"><i class="fa fa-plane" ></i> View Trip</a>';
                            }
                        });
                    }
                    else {
                        $scope.tripsavemessage = "";
                        $scope.errormessage = "Please verify your email before adding trip ! ";
                        return;
                    }
                }
            });
        }
    }
    $scope.changedurationwithoutjavascript = function () {
        if ($(".quote_date").val().length == 0) {
            $scope.arrivalon = "";
            return;
        } else {
            if (parseInt($scope.tripduration) > 0) {
                d = new Date($(".quote_date").val().split("-")[1] + "/" + $(".quote_date").val().split("-")[0] + "/" + $(".quote_date").val().split("-")[2] + " " + $scope.dtime.split(":")[0] + ":" + $scope.dtime.split(":")[1].substring(0, 2) + " " + $scope.dtime.split(":")[1].substring(2));;
                var totalseconds = parseFloat($scope.tripduration * 60);
                var indtotime = (d.getTime() + (1000 * totalseconds));
                $scope.arrivalon = indtotime;
            } else {
                $scope.arrivalon = new Date($(".quote_date").val().split("-")[1] + "/" + $(".quote_date").val().split("-")[0] + "/" + $(".quote_date").val().split("-")[2] + " " + $scope.dtime.split(":")[0] + ":" + $scope.dtime.split(":")[1].substring(0, 2) + " " + $scope.dtime.split(":")[1].substring(2));;
            }
        }
        if (typeof $scope.locationfrom === 'undefined' || $scope.locationfrom == '' || $scope.locationfrom == null) {
            return;
        }
        if (typeof $scope.locationto === 'undefined' || $scope.locationto == '' || $scope.locationto == null) {
            return;
        }
        if (typeof $scope.dtime === 'undefined' || $scope.dtime == '' || $scope.dtime == null) {
            return;
        }
        if (typeof $scope.tripduration !== 'undefined' && $scope.tripduration !== '' && $scope.tripduration != null) {
            var locfrom = $.grep($scope.countries, function (country) { return country.location == $scope.locationfrom })[0];
            var locto = $.grep($scope.countries, function (country) { return country.location == $scope.locationto })[0];
            var d = new Date($(".quote_date").val().split("-")[1] + "/" + $(".quote_date").val().split("-")[0] + "/" + $(".quote_date").val().split("-")[2] + " " + $scope.dtime.split(":")[0] + ":" + $scope.dtime.split(":")[1].substring(0, 2) + " " + $scope.dtime.split(":")[1].substring(2));
            var totalseconds = parseFloat($scope.tripduration * 60);
            var indtotime = (d.getTime() + (1000 * totalseconds));
            var centraltime = new Date(indtotime).getTime() + (-(locfrom.zone * 60) * 60000);
            $scope.arrivalon = calcTime(centraltime, locto.zone);
        }
    }
    $scope.changeduration = function () {
        if ($(".quote_date").val().length == 0) {
            $scope.arrivalon = "";
            return;
        } else {
            if (parseInt($scope.tripduration) > 0) {
                d = new Date($(".quote_date").val().split("-")[1] + "/" + $(".quote_date").val().split("-")[0] + "/" + $(".quote_date").val().split("-")[2] + " " + $scope.dtime.split(":")[0] + ":" + $scope.dtime.split(":")[1].substring(0, 2) + " " + $scope.dtime.split(":")[1].substring(2));;
                var totalseconds = parseFloat($scope.tripduration * 60);
                var indtotime = (d.getTime() + (1000 * totalseconds));
                $scope.arrivalon = indtotime;
            } else {
                $scope.arrivalon = new Date($(".quote_date").val().split("-")[1] + "/" + $(".quote_date").val().split("-")[0] + "/" + $(".quote_date").val().split("-")[2] + " " + $scope.dtime.split(":")[0] + ":" + $scope.dtime.split(":")[1].substring(0, 2) + " " + $scope.dtime.split(":")[1].substring(2));;
            }
            $scope.$apply();
        }
        if (typeof $scope.locationfrom === 'undefined' || $scope.locationfrom == '' || $scope.locationfrom == null) {
            return;
        }
        if (typeof $scope.locationto === 'undefined' || $scope.locationto == '' || $scope.locationto == null) {
            return;
        }
        if (typeof $scope.dtime === 'undefined' || $scope.dtime == '' || $scope.dtime == null) {
            return;
        }
        if (typeof $scope.tripduration !== 'undefined' && $scope.tripduration !== '' && $scope.tripduration != null) {
            var locfrom = $.grep($scope.countries, function (country) { return country.location == $scope.locationfrom })[0];
            var locto = $.grep($scope.countries, function (country) { return country.location == $scope.locationto })[0];
            var d = new Date($(".quote_date").val().split("-")[1] + "/" + $(".quote_date").val().split("-")[0] + "/" + $(".quote_date").val().split("-")[2] + " " + $scope.dtime.split(":")[0] + ":" + $scope.dtime.split(":")[1].substring(0, 2) + " " + $scope.dtime.split(":")[1].substring(2));
            var totalseconds = parseFloat($scope.tripduration * 60);
            var indtotime = (d.getTime() + (1000 * totalseconds));
            var centraltime = new Date(indtotime).getTime() + (-(locfrom.zone * 60) * 60000);
            $scope.arrivalon = calcTime(centraltime, locto.zone);
            $scope.$apply();
        }
    }
    $scope.applychanges = function () {
        $scope.$apply();
    }
    function calcTime(utc, offset) {
        var nd = new Date(utc + (3600000 * offset));
        return nd;
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
                results = _suggestLocations(request.term);
                res = results;
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
    if (!AuthService.authentication.isAuth) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    $scope.dateFromsearch = RESOURCES.searchcriteria.datefrom;
    $scope.dateTosearch = RESOURCES.searchcriteria.dateto;
    $scope.searchfromlocation = RESOURCES.searchcriteria.locationfrom;
    $scope.locationfrom = RESOURCES.searchcriteria.locationfrom;
    $scope.searchtolocation = RESOURCES.searchcriteria.locationto;
    $scope.locationto = RESOURCES.searchcriteria.locationto;
    $scope.search = function () {
        RESOURCES.searchcriteria.datefrom = new Date($(".quote_datesearch").val().split("-")[1] + "/" + $(".quote_datesearch").val().split("-")[0] + "/" + $(".quote_datesearch").val().split("-")[2]);
        RESOURCES.searchcriteria.dateto = new Date($(".quote_datesearch1").val().split("-")[1] + "/" + $(".quote_datesearch1").val().split("-")[0] + "/" + $(".quote_datesearch1").val().split("-")[2]);
        if ($scope.searchfromlocation.trim() != $scope.searchtolocation.trim()) {
            RESOURCES.searchcriteria.locationfrom = $scope.searchfromlocation;
            RESOURCES.searchcriteria.locationto = $scope.searchtolocation;
            RESOURCES.searchcriteria.type = "Sender";
            $location.path('/search');
        } else {
            $scope.searchtolocation = "";
        }
    }
});
angular.module('courier').controller("PricelistController", function ($rootScope, $scope, $location, ValiDatedTokenObject, AirportService, AuthService) {
    $scope.zonelist = [];
    $scope.searchfromzoneid = 0;
    $scope.searchtozoneid = 0; 
    $scope.weightrangelist = [];
    AirportService.getzonelist().then(function (results) {
        $scope.zonelist = results.data.response;
    });
    AirportService.getweightrangelist().then(function (results) {
        $scope.weightrangelist = results.data.response;
        $scope.checkgridlist();
    });
    dTable = $('#example').DataTable({ searching: false, "paging": true });
    $scope.checkgridlist = function () {
        $scope.successmessage = "";
        if ($scope.searchfromzoneid >= 0 && $scope.searchtozoneid >= 0) {
            AirportService.getpricelist().then(function (results) {
                $scope.list = [];
                dTable.clear().draw();
                for (i = 0; i < $scope.weightrangelist.length; i++) {
                    var datacount = $.grep(results.data.response, function (pp) { return (pp.fromzoneid == $scope.searchfromzoneid || $scope.searchfromzoneid == 0) && (pp.tozoneid == $scope.searchtozoneid || $scope.searchtozoneid == 0) && pp.weightrangeid == $scope.weightrangelist[i].id });
                   if (datacount.length > 0) {
                        for (j = 0; j < datacount.length; j++) {
                            $scope.list.push({ "weightrangeid": parseInt($scope.weightrangelist[i].id), "weightrangename": $scope.weightrangelist[i].name, "transportershare": parseFloat(datacount[j].transportershare), "price": parseFloat(datacount[j].price), "id": datacount[j].id, "fromzoneid": datacount[j].fromzoneid, "tozoneid": datacount[j].tozoneid });
                            dTable.row.add(["Zone " + datacount[j].fromzoneid, "Zone " + datacount[j].tozoneid, $scope.weightrangelist[i].name, parseFloat(datacount[j].price), parseFloat(datacount[j].transportershare)]).draw();;
                        }
                    } else {
                        $scope.list.push({ "weightrangeid": parseInt($scope.weightrangelist[i].id), "weightrangename": $scope.weightrangelist[i].name, "transportershare": 0, "price": 0, "id": 0, "fromzoneid": $scope.searchfromzoneid, "tozoneid": $scope.searchtozoneid });
                    }
                }
                console.log($scope.list);
            });              
        } else {
            $scope.list = [];
        }
    }
});
angular.module('courier').controller("TermsandconditionController", function ($rootScope, $scope, $location, UsersService, locationHistoryService, AuthService) {
    UsersService.getMypageslist(3).then(function (results) {
        $scope.content = results.data.response[0];
    });
});
angular.module('courier').controller("aboutusController", function ($rootScope, $scope, $location, UsersService, locationHistoryService, AuthService) {
    UsersService.getMypageslist(1).then(function (results) {
        $scope.content = results.data.response[0];
    });
});
angular.module('courier').controller("contactController", function ($rootScope, $scope, $location, ValiDatedTokenObject, ParcelService, AuthService) {
    $scope.publicKey = "6Lc74SETAAAAACLHIKZWgJJaFFyXn4cxe6EjuYaJ";
    $scope.successmessage = "";
    $scope.errorDescription = "";
    $scope.submitformdata = function (isValid) {
        $scope.successmessage = "";
        $scope.errorDescription = "";
        if (!isValid) {
            $scope.errorDescription = "Please, fill out all fields!";
            return;
        }
        var postdata = { "name": $scope.name, "email": $scope.email, "phone": $scope.phone, "message": $scope.message, "created": new Date(), "status": "N" };
        ParcelService.addcontacts(postdata).then(function (response) {
            $scope.successmessage = response.data.response;

        });
    }
});
angular.module('courier').controller("faqController", function ($rootScope, $scope, $location, ValiDatedTokenObject, UsersService, AuthService) {
    UsersService.getMypageslist(2).then(function (results) {
        $scope.content = results.data.response[0];
    });

});
angular.module('courier').controller("sendergoodpracticesController", function ($rootScope, $scope, $location, UsersService, locationHistoryService, AuthService) {
    UsersService.getMypageslist(5).then(function (results) {
        $scope.content = results.data.response[0];
    });
});
angular.module('courier').controller("transportergoodpracticesController", function ($rootScope, $scope, $location, UsersService, locationHistoryService, AuthService) {
    UsersService.getMypageslist(5).then(function (results) {
        $scope.content = results.data.response[0];
    });
});
angular.module('courier').controller("guidelinessectionController", function ($rootScope, $scope, $location, UsersService, locationHistoryService, AuthService) {
    UsersService.getMypageslist(7).then(function (results) {
        $scope.content = results.data.response[0];
    });
});
/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("BankdetailsController", function ($rootScope, $state, $scope, $location, ValiDatedTokenObject, AuthService, searchService, $stateParams) {
    $scope.errormessage = '';
    $scope.successMessage = "";
    if (!AuthService.authentication.isAuth) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    $scope.updatebankdetails = function (isValid) {
        $scope.errormessage = '';
        $scope.successMessage = "";
        if (!isValid) {
            $scope.errormessage = "Please, fill out all fields!";
            return;
        }
        AuthService.updateuserdetails($scope.userdetails).then(function (results) {
            if (results.status == 200) {
                $scope.successMessage = " Bank details added successfully ";
            }
        });
    }
    AuthService.getuserdetails(sessionStorage.getItem("UserId")).then(function (results) {
        if (results.status == 200) {
            $scope.userdetails = results.data.response[0];
            $scope.rbank_act_no = results.data.response[0].bank_act_no;
        }
    });
});
/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("CancelledtripsController", function ($rootScope, $scope, $state, $location, AuthService, AddTripsService) {

    if (!AuthService.authentication.isAuth) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
    $scope.list = [];
    $scope.mainlist = [];
    dTable = $('#example').DataTable();
    AddTripsService.getcalcelledTripsList(sessionStorage.getItem("UserId")).then(function (results) {
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
                dTable.row.add([$scope.mainlist[i].TripID, $scope.mainlist[i].source, $scope.mainlist[i].destination, $scope.mainlist[i].flight_no, $scope.mainlist[i].capacity, $scope.mainlist[i].capacity, $scope.mainlist[i].statusdescription]).draw();
            }
        }
    });
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
});
/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("CancelParcelController", function ($scope, $state, $location, AuthService, ParcelService, RESOURCES) {
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
    ParcelService.getcalcelledParcelList(sessionStorage.getItem("UserId")).then(function (results) {
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
                    dTable.row.add([(($scope.mainlist[i].channelid > 0) ? "<a href='javascript:void(0);'  onclick='showchat(" + $scope.mainlist[i].channelid + "," + $scope.mainlist[i].id + ")'><span class='glyphicon glyphicon-comment'></span> </a> " : "") + "<a href='/viewparcel/" + $scope.mainlist[i].id + "' title='View parcel'>" + $scope.mainlist[i].ParcelID + "</a>", $scope.mainlist[i].source, $scope.mainlist[i].destination, $scope.mainlist[i].type == 'E' ? 'Envelope' : $scope.mainlist[i].type == 'B' ? 'Box' : $scope.mainlist[i].type == 'P' ? 'Packet' : $scope.mainlist[i].type, $scope.mainlist[i].weight + " kg.", ($scope.mainlist[i].transporterID > 0 ? "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].transporterID + ")'>" + $scope.mainlist[i].MCBTransporterID + "</a>" : ($scope.mainlist[i].Isactive == 1 ? "<a href='/viewparcel/" + $scope.mainlist[i].id + "#matches' title='View Trip'>Find Matching Trips</a>" : "Expired")), ($scope.mainlist[i].recv_id > 0 ? "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].recv_id + ")'>" + $scope.mainlist[i].MCBreceiverID + "</a>" : ""), moment($scope.mainlist[i].till_date).format("DD/MM/YYYY"), $scope.mainlist[i].statusdescription, "<div class='dropdown'>    <a href='javascript:void()' data-toggle='dropdown' class='dropdown-toggle'>Action<b class='caret'></b></a>    <ul class='dropdown-menu'>        <li><a href='/viewparcel/" + $scope.mainlist[i].id + "' title='View parcel'>View parcel</a> </li>" + (($scope.mainlist[i].status == 0 || $scope.mainlist[i].status == 1 || $scope.mainlist[i].status == 2) ? "<li> <a href='/editparcel/" + $scope.mainlist[i].id + "' title='Cancel parcel'>Edit parcel</a></li><li> <a href='javascript:void(0);'  onclick='cancelparcellist(" + $scope.mainlist[i].id + ")'   title='Cancel parcel'>Cancel parcel</a> </li>" : "") + ($scope.mainlist[i].status == 4 ? "<li><a href='javascript:void(0);'  onclick='changestatusparcel(" + $scope.mainlist[i].id + ",1)'   title='Cancel Status'>Delivered</a></li>" : "") + "</ul></div>"]).draw();
                }
            }
        }
    });
    var _searchByFilter = function () {
        $scope.list = [];
        if ($(".quote_date").val().length > 0) {
            $scope.departureat = new Date($(".quote_date").val().split("-")[1] + "/" + $(".quote_date").val().split("-")[0] + "/" + $(".quote_date").val().split("-")[2]);
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
    $scope.changestatusparcel = function (id, status) {
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
/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("ChangePasswordController", function ($rootScope, $scope, $state, $location, ValiDatedTokenObject, locationHistoryService, AuthService) {
    if (!AuthService.authentication.isAuth) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
    $scope.errormessage = '';
    $scope.successMessage = "";
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    $scope.changepassword = function () {
        $scope.errormessage = '';
        $scope.successMessage = "";
        var data = { "userID": sessionStorage.getItem("UserId"), "password": $scope.user.changepasswordcurrentpassword, "newpassword": $scope.user.changepasswordpassword };
        AuthService.changepassword(data).then(function (results) {
            if (results.data.status == "success") {
                $scope.successMessage = results.data.response;
                $scope.reset();
            }
            else {
                $scope.errormessage = results.data.errorMessage;
            }
        });
    }
    $scope.reset = function () {
        $scope.user = angular.copy($scope.master);
    };
});
angular.module('courier').controller("chatmessagesController", function ($rootScope, $state, $scope, $location, ValiDatedTokenObject, AuthService, searchService, ReceiverService) {
    $scope.loginuserid = AuthService.authentication.UserId;
    $scope.channelid = 0;
    $scope.chatslist = [];
    $scope.users = {};
    $scope.screenresolation = window.innerWidth;
    $scope.updatechat = function () {
        if (AuthService.authentication.UserId == 0) {
            $scope.chatslist = [];
        }
    }
    $scope.showchat = function (channelid, parcelid) {
        $scope.loginuserid = AuthService.authentication.UserId;
        if (($.grep($scope.chatslist, function (a) { return a.channelid == channelid })).length == 0) {
            $scope.messages = [];
            $scope.channelid = channelid;
            AuthService.getchatlist($scope.channelid).then(function (response) {
                var index = 0;
                var datestore = "";
                var namestore = "";
                $scope.users = response.data.users[0];
                for (i = 0; i < response.data.message.length; i++) {
                    var dat = response.data.message[i].created.split("-");
                    var day = dat[2].split(" ");
                    response.data.message[i].created = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
                    response.data.message[i].created = calcTime(response.data.message[i].created.getTime(), 12.5);
                    if (datestore != (dat[1] + "/" + day[0] + "/" + dat[0])) {
                        $scope.messages.push({ "date": response.data.message[i].created, "messages": [response.data.message[i]] });
                        index = index + 1;
                        datestore = (dat[1] + "/" + day[0] + "/" + dat[0]);
                    }
                    else {
                        $scope.messages[index - 1].messages.push(response.data.message[i]);
                    }
                }
                for (i = 0; i < $scope.chatslist.length; i++) {
                    $scope.chatslist[i].isminimized = true;
                }
                $scope.chatslist.push({ "parcelid": parcelid, "chatmessage": "", "channelid": channelid, "messages": $scope.messages, isminimized: false });
            });
        }
    }
    $scope.messages = [];
    var socket = io.connect('https://mycourierbuddy.com:3000');
    $scope.submit = function (channelid, message) {
        $scope.submitchat(channelid, message);
    }
    $scope.submitchat = function (channelid, message) {
        var dataString = { channelid: channelid, messageuserid: AuthService.authentication.UserId, message: message };
        $.ajax({
            type: "POST", url: apiBasePath + "api/chatsubmit", data: dataString, dataType: "json", cache: false, success: function (data) {
                $scope.messages = $.grep($scope.chatslist, function (a) { return a.channelid == channelid })[0].chatmessage = "";
                if (data.success == true) {
                    $("#notif").html(data.notif);
                    socket.emit('new_count_message', { new_count_message: data.new_count_message });
                    var newamitmessage = { channelid: channelid, parcelid: data.parcelid, senderid: data.senderid, transporterid: data.transporterid, receiverid: data.receiverid, username: data.username, created: data.created, message: data.message, id: data.id };
                    socket.emit('new_message', newamitmessage);
                } else if (data.success == false) {
                    $("#notif").html(data.notif);
                }
            }, error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }
    $scope.removechat = function (index) {
        $scope.chatslist.splice(index, 1);
    }
    $scope.minimizechat = function (index) {
        for (i = 0; i < $scope.chatslist.length; i++) {
            $scope.chatslist[i].isminimized = true;
        }
        $scope.chatslist[index].isminimized = true;
    }
    $scope.maximizechat = function (index) {
        for (i = 0; i < $scope.chatslist.length; i++) {
            $scope.chatslist[i].isminimized = true;
        }
        $scope.chatslist[index].isminimized = false;
    }
    socket.on('new_count_message', function (data) {
        //  $("#new_count_message").html(data.new_count_message);
        $('#notif_audio')[0].play();
    });
    socket.on('update_count_message', function (data) {
        //$("#new_count_message").html(data.update_count_message);
    });
    socket.on('new_message', function (data) {
        if (AuthService.authentication.UserId == data.senderid || AuthService.authentication.UserId == data.transporterid || AuthService.authentication.UserId == data.receiverid) {
            if ($.grep($scope.chatslist, function (a) { return a.parcelid == data.parcelid }).length > 0) {
                $scope.messages = $.grep($scope.chatslist, function (a) { return a.parcelid == data.parcelid })[0].messages;
                var dat = data.created.split("-");
                var day = dat[2].split(" ");
                data.created = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
                data.created = calcTime(data.created.getTime(), 12.5);
                if ($.grep($scope.messages, function (a) { return moment(a.date).format('L') == moment(data.created).format('L') }).length > 0) {
                    $.grep($scope.messages, function (a) { return moment(a.date).format('L') == moment(data.created).format('L') })[0].messages.push(data);
                } else {
                    $scope.messages.push({ "date": data.created, "messages": [data] });
                }
                $.grep($scope.chatslist, function (a) { return a.parcelid == data.parcelid })[0].messages = $scope.messages;
                for (i = 0; i < $scope.chatslist.length; i++) {
                    $scope.chatslist[i].isminimized = true;
                }
                $.grep($scope.chatslist, function (a) { return a.parcelid == data.parcelid })[0].isminimized = false;
                $scope.$apply();
                $("#no-message-notif").html('');
                $("#new-message-notif").html('<div class="alert alert-success" role="alert"> <i class="fa fa-check"></i><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>New message ...</div>');
            }
            else {
                $scope.messages = [];
                AuthService.getchatlist(data.channelid).then(function (response) {
                    var index = 0;
                    var datestore = "";
                    var namestore = "";
                    $scope.users = response.data.users[0];
                    for (i = 0; i < response.data.message.length; i++) {
                        var dat = response.data.message[i].created.split("-");
                        var day = dat[2].split(" ");
                        response.data.message[i].created = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
                        response.data.message[i].created = calcTime(response.data.message[i].created.getTime(), 12.5);
                        if (datestore != (dat[1] + "/" + day[0] + "/" + dat[0])) {
                            $scope.messages.push({ "date": response.data.message[i].created, "messages": [response.data.message[i]] });
                            index = index + 1;
                            datestore = (dat[1] + "/" + day[0] + "/" + dat[0]);
                        }
                        else {
                            $scope.messages[index - 1].messages.push(response.data.message[i]);
                        }
                    }
                    for (i = 0; i < $scope.chatslist.length; i++) {
                        $scope.chatslist[i].isminimized = true;
                    }
                    $scope.chatslist.push({ "parcelid": data.parcelid, "chatmessage": "", "channelid": data.channelid, "messages": $scope.messages, isminimized: false });

                });
            }
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
/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("dashboardController", function ($rootScope, $state, $scope, $location, ValiDatedTokenObject, locationHistoryService, AuthService) {
    $scope.errormessage = '';
    $scope.successMessage = "";
    $scope.countrycodes = [{ "name": "Israel", "dial_code": "972", "code": "IL" }, { "name": "Afghanistan", "dial_code": "93", "code": "AF" }, { "name": "Albania", "dial_code": "355", "code": "AL" }, { "name": "Algeria", "dial_code": "213", "code": "DZ" }, { "name": "AmericanSamoa", "dial_code": "684", "code": "AS" }, { "name": "Andorra", "dial_code": "376", "code": "AD" }, { "name": "Angola", "dial_code": "244", "code": "AO" }, { "name": "Anguilla", "dial_code": "264", "code": "AI" }, { "name": "Antigua and Barbuda", "dial_code": "1268", "code": "AG" }, { "name": "Argentina", "dial_code": "54", "code": "AR" }, { "name": "Armenia", "dial_code": "374", "code": "AM" }, { "name": "Aruba", "dial_code": "297", "code": "AW" }, { "name": "Australia", "dial_code": "61", "code": "AU" }, { "name": "Austria", "dial_code": "43", "code": "AT" }, { "name": "Azerbaijan", "dial_code": "994", "code": "AZ" }, { "name": "Bahamas", "dial_code": "242", "code": "BS" }, { "name": "Bahrain", "dial_code": "973", "code": "BH" }, { "name": "Bangladesh", "dial_code": "880", "code": "BD" }, { "name": "Barbados", "dial_code": "246", "code": "BB" }, { "name": "Belarus", "dial_code": "375", "code": "BY" }, { "name": "Belgium", "dial_code": "32", "code": "BE" }, { "name": "Belize", "dial_code": "501", "code": "BZ" }, { "name": "Benin", "dial_code": "229", "code": "BJ" }, { "name": "Bermuda", "dial_code": "441", "code": "BM" }, { "name": "Bhutan", "dial_code": "975", "code": "BT" }, { "name": "Bosnia and Herzegovina", "dial_code": "387", "code": "BA" }, { "name": "Botswana", "dial_code": "267", "code": "BW" }, { "name": "Brazil", "dial_code": "55", "code": "BR" }, { "name": "British Indian Ocean Territory", "dial_code": "246", "code": "IO" }, { "name": "Bulgaria", "dial_code": "359", "code": "BG" }, { "name": "Burkina Faso", "dial_code": "226", "code": "BF" }, { "name": "Burundi", "dial_code": "257", "code": "BI" }, { "name": "Cambodia", "dial_code": "855", "code": "KH" }, { "name": "Cameroon", "dial_code": "237", "code": "CM" }, { "name": "Canada", "dial_code": "1", "code": "CA" }, { "name": "Cape Verde", "dial_code": "238", "code": "CV" }, { "name": "Cayman Islands", "dial_code": " 345", "code": "KY" }, { "name": "Central African Republic", "dial_code": "236", "code": "CF" }, { "name": "Chad", "dial_code": "235", "code": "TD" }, { "name": "Chile", "dial_code": "56", "code": "CL" }, { "name": "China", "dial_code": "86", "code": "CN" }, { "name": "Christmas Island", "dial_code": "61", "code": "CX" }, { "name": "Colombia", "dial_code": "57", "code": "CO" }, { "name": "Comoros", "dial_code": "269", "code": "KM" }, { "name": "Congo", "dial_code": "242", "code": "CG" }, { "name": "Cook Islands", "dial_code": "682", "code": "CK" }, { "name": "Costa Rica", "dial_code": "506", "code": "CR" }, { "name": "Croatia", "dial_code": "385", "code": "HR" }, { "name": "Cuba", "dial_code": "53", "code": "CU" }, { "name": "Cyprus", "dial_code": "537", "code": "CY" }, { "name": "Czech Republic", "dial_code": "420", "code": "CZ" }, { "name": "Denmark", "dial_code": "45", "code": "DK" }, { "name": "Djibouti", "dial_code": "253", "code": "DJ" }, { "name": "Dominica", "dial_code": "767", "code": "DM" }, { "name": "Dominican Republic", "dial_code": "849", "code": "DO" }, { "name": "Ecuador", "dial_code": "593", "code": "EC" }, { "name": "Egypt", "dial_code": "20", "code": "EG" }, { "name": "El Salvador", "dial_code": "503", "code": "SV" }, { "name": "Equatorial Guinea", "dial_code": "240", "code": "GQ" }, { "name": "Eritrea", "dial_code": "291", "code": "ER" }, { "name": "Estonia", "dial_code": "372", "code": "EE" }, { "name": "Ethiopia", "dial_code": "251", "code": "ET" }, { "name": "Faroe Islands", "dial_code": "298", "code": "FO" }, { "name": "Fiji", "dial_code": "679", "code": "FJ" }, { "name": "Finland", "dial_code": "358", "code": "FI" }, { "name": "France", "dial_code": "33", "code": "FR" }, { "name": "French Guiana", "dial_code": "594", "code": "GF" }, { "name": "French Polynesia", "dial_code": "689", "code": "PF" }, { "name": "Gabon", "dial_code": "241", "code": "GA" }, { "name": "Gambia", "dial_code": "220", "code": "GM" }, { "name": "Georgia", "dial_code": "995", "code": "GE" }, { "name": "Germany", "dial_code": "49", "code": "DE" }, { "name": "Ghana", "dial_code": "233", "code": "GH" }, { "name": "Gibraltar", "dial_code": "350", "code": "GI" }, { "name": "Greece", "dial_code": "30", "code": "GR" }, { "name": "Greenland", "dial_code": "299", "code": "GL" }, { "name": "Grenada", "dial_code": "473", "code": "GD" }, { "name": "Guadeloupe", "dial_code": "590", "code": "GP" }, { "name": "Guam", "dial_code": "671", "code": "GU" }, { "name": "Guatemala", "dial_code": "502", "code": "GT" }, { "name": "Guinea", "dial_code": "224", "code": "GN" }, { "name": "Guinea-Bissau", "dial_code": "245", "code": "GW" }, { "name": "Guyana", "dial_code": "595", "code": "GY" }, { "name": "Haiti", "dial_code": "509", "code": "HT" }, { "name": "Honduras", "dial_code": "504", "code": "HN" }, { "name": "Hungary", "dial_code": "36", "code": "HU" }, { "name": "Iceland", "dial_code": "354", "code": "IS" }, { "name": "India", "dial_code": "91", "code": "IN" }, { "name": "Indonesia", "dial_code": "62", "code": "ID" }, { "name": "Iraq", "dial_code": "964", "code": "IQ" }, { "name": "Ireland", "dial_code": "353", "code": "IE" }, { "name": "Israel", "dial_code": "972", "code": "IL" }, { "name": "Italy", "dial_code": "39", "code": "IT" }, { "name": "Jamaica", "dial_code": "876", "code": "JM" }, { "name": "Japan", "dial_code": "81", "code": "JP" }, { "name": "Jordan", "dial_code": "962", "code": "JO" }, { "name": "Kazakhstan", "dial_code": "7 7", "code": "KZ" }, { "name": "Kenya", "dial_code": "254", "code": "KE" }, { "name": "Kiribati", "dial_code": "686", "code": "KI" }, { "name": "Kuwait", "dial_code": "965", "code": "KW" }, { "name": "Kyrgyzstan", "dial_code": "996", "code": "KG" }, { "name": "Latvia", "dial_code": "371", "code": "LV" }, { "name": "Lebanon", "dial_code": "961", "code": "LB" }, { "name": "Lesotho", "dial_code": "266", "code": "LS" }, { "name": "Liberia", "dial_code": "231", "code": "LR" }, { "name": "Liechtenstein", "dial_code": "423", "code": "LI" }, { "name": "Lithuania", "dial_code": "370", "code": "LT" }, { "name": "Luxembourg", "dial_code": "352", "code": "LU" }, { "name": "Madagascar", "dial_code": "261", "code": "MG" }, { "name": "Malawi", "dial_code": "265", "code": "MW" }, { "name": "Malaysia", "dial_code": "60", "code": "MY" }, { "name": "Maldives", "dial_code": "960", "code": "MV" }, { "name": "Mali", "dial_code": "223", "code": "ML" }, { "name": "Malta", "dial_code": "356", "code": "MT" }, { "name": "Marshall Islands", "dial_code": "692", "code": "MH" }, { "name": "Martinique", "dial_code": "596", "code": "MQ" }, { "name": "Mauritania", "dial_code": "222", "code": "MR" }, { "name": "Mauritius", "dial_code": "230", "code": "MU" }, { "name": "Mayotte", "dial_code": "262", "code": "YT" }, { "name": "Mexico", "dial_code": "52", "code": "MX" }, { "name": "Monaco", "dial_code": "377", "code": "MC" }, { "name": "Mongolia", "dial_code": "976", "code": "MN" }, { "name": "Montenegro", "dial_code": "382", "code": "ME" }, { "name": "Montserrat", "dial_code": "1664", "code": "MS" }, { "name": "Morocco", "dial_code": "212", "code": "MA" }, { "name": "Myanmar", "dial_code": "95", "code": "MM" }, { "name": "Namibia", "dial_code": "264", "code": "NA" }, { "name": "Nauru", "dial_code": "674", "code": "NR" }, { "name": "Nepal", "dial_code": "977", "code": "NP" }, { "name": "Netherlands", "dial_code": "31", "code": "NL" }, { "name": "Netherlands Antilles", "dial_code": "599", "code": "AN" }, { "name": "New Caledonia", "dial_code": "687", "code": "NC" }, { "name": "New Zealand", "dial_code": "64", "code": "NZ" }, { "name": "Nicaragua", "dial_code": "505", "code": "NI" }, { "name": "Niger", "dial_code": "227", "code": "NE" }, { "name": "Nigeria", "dial_code": "234", "code": "NG" }, { "name": "Niue", "dial_code": "683", "code": "NU" }, { "name": "Norfolk Island", "dial_code": "672", "code": "NF" }, { "name": "Northern Mariana Islands", "dial_code": "670", "code": "MP" }, { "name": "Norway", "dial_code": "47", "code": "NO" }, { "name": "Oman", "dial_code": "968", "code": "OM" }, { "name": "Pakistan", "dial_code": "92", "code": "PK" }, { "name": "Palau", "dial_code": "680", "code": "PW" }, { "name": "Panama", "dial_code": "507", "code": "PA" }, { "name": "Papua New Guinea", "dial_code": "675", "code": "PG" }, { "name": "Paraguay", "dial_code": "595", "code": "PY" }, { "name": "Peru", "dial_code": "51", "code": "PE" }, { "name": "Philippines", "dial_code": "63", "code": "PH" }, { "name": "Poland", "dial_code": "48", "code": "PL" }, { "name": "Portugal", "dial_code": "351", "code": "PT" }, { "name": "Puerto Rico", "dial_code": "939", "code": "PR" }, { "name": "Qatar", "dial_code": "974", "code": "QA" }, { "name": "Romania", "dial_code": "40", "code": "RO" }, { "name": "Rwanda", "dial_code": "250", "code": "RW" }, { "name": "Samoa", "dial_code": "685", "code": "WS" }, { "name": "San Marino", "dial_code": "378", "code": "SM" }, { "name": "Saudi Arabia", "dial_code": "966", "code": "SA" }, { "name": "Senegal", "dial_code": "221", "code": "SN" }, { "name": "Serbia", "dial_code": "381", "code": "RS" }, { "name": "Seychelles", "dial_code": "248", "code": "SC" }, { "name": "Sierra Leone", "dial_code": "232", "code": "SL" }, { "name": "Singapore", "dial_code": "65", "code": "SG" }, { "name": "Slovakia", "dial_code": "421", "code": "SK" }, { "name": "Slovenia", "dial_code": "386", "code": "SI" }, { "name": "Solomon Islands", "dial_code": "677", "code": "SB" }, { "name": "South Africa", "dial_code": "27", "code": "ZA" }, { "name": "South Georgia and the South Sandwich Islands", "dial_code": "500", "code": "GS" }, { "name": "Spain", "dial_code": "34", "code": "ES" }, { "name": "Sri Lanka", "dial_code": "94", "code": "LK" }, { "name": "Sudan", "dial_code": "249", "code": "SD" }, { "name": "Suriname", "dial_code": "597", "code": "SR" }, { "name": "Swaziland", "dial_code": "268", "code": "SZ" }, { "name": "Sweden", "dial_code": "46", "code": "SE" }, { "name": "Switzerland", "dial_code": "41", "code": "CH" }, { "name": "Tajikistan", "dial_code": "992", "code": "TJ" }, { "name": "Thailand", "dial_code": "66", "code": "TH" }, { "name": "Togo", "dial_code": "228", "code": "TG" }, { "name": "Tokelau", "dial_code": "690", "code": "TK" }, { "name": "Tonga", "dial_code": "676", "code": "TO" }, { "name": "Trinidad and Tobago", "dial_code": "868", "code": "TT" }, { "name": "Tunisia", "dial_code": "216", "code": "TN" }, { "name": "Turkey", "dial_code": "90", "code": "TR" }, { "name": "Turkmenistan", "dial_code": "993", "code": "TM" }, { "name": "Turks and Caicos Islands", "dial_code": "649", "code": "TC" }, { "name": "Tuvalu", "dial_code": "688", "code": "TV" }, { "name": "Uganda", "dial_code": "256", "code": "UG" }, { "name": "Ukraine", "dial_code": "380", "code": "UA" }, { "name": "United Arab Emirates", "dial_code": "971", "code": "AE" }, { "name": "United Kingdom", "dial_code": "44", "code": "GB" }, { "name": "United States", "dial_code": "1", "code": "US" }, { "name": "Uruguay", "dial_code": "598", "code": "UY" }, { "name": "Uzbekistan", "dial_code": "998", "code": "UZ" }, { "name": "Vanuatu", "dial_code": "678", "code": "VU" }, { "name": "Wallis and Futuna", "dial_code": "681", "code": "WF" }, { "name": "Yemen", "dial_code": "967", "code": "YE" }, { "name": "Zambia", "dial_code": "260", "code": "ZM" }, { "name": "Zimbabwe", "dial_code": "263", "code": "ZW" }, { "name": "land Islands", "dial_code": "", "code": "AX" }, { "name": "Antarctica", "dial_code": null, "code": "AQ" }, { "name": "Bolivia, Plurinational State of", "dial_code": "591", "code": "BO" }, { "name": "Brunei Darussalam", "dial_code": "673", "code": "BN" }, { "name": "Cocos (Keeling) Islands", "dial_code": "61", "code": "CC" }, { "name": "Congo, The Democratic Republic of the", "dial_code": "243", "code": "CD" }, { "name": "Cote d'Ivoire", "dial_code": "225", "code": "CI" }, { "name": "Falkland Islands (Malvinas)", "dial_code": "500", "code": "FK" }, { "name": "Guernsey", "dial_code": "44", "code": "GG" }, { "name": "Holy See (Vatican City State)", "dial_code": "379", "code": "VA" }, { "name": "Hong Kong", "dial_code": "852", "code": "HK" }, { "name": "Iran, Islamic Republic of", "dial_code": "98", "code": "IR" }, { "name": "Isle of Man", "dial_code": "44", "code": "IM" }, { "name": "Jersey", "dial_code": "44", "code": "JE" }, { "name": "Korea, Democratic People's Republic of", "dial_code": "850", "code": "KP" }, { "name": "Korea, Republic of", "dial_code": "82", "code": "KR" }, { "name": "Lao People's Democratic Republic", "dial_code": "856", "code": "LA" }, { "name": "Libyan Arab Jamahiriya", "dial_code": "218", "code": "LY" }, { "name": "Macao", "dial_code": "853", "code": "MO" }, { "name": "Macedonia, The Former Yugoslav Republic of", "dial_code": "389", "code": "MK" }, { "name": "Micronesia, Federated States of", "dial_code": "691", "code": "FM" }, { "name": "Moldova, Republic of", "dial_code": "373", "code": "MD" }, { "name": "Mozambique", "dial_code": "258", "code": "MZ" }, { "name": "Palestinian Territory, Occupied", "dial_code": "970", "code": "PS" }, { "name": "Pitcairn", "dial_code": "872", "code": "PN" }, { "name": "Réunion", "dial_code": "262", "code": "RE" }, { "name": "Russia", "dial_code": "7", "code": "RU" }, { "name": "Saint Barthélemy", "dial_code": "590", "code": "BL" }, { "name": "Saint Helena, Ascension and Tristan Da Cunha", "dial_code": "290", "code": "SH" }, { "name": "Saint Kitts and Nevis", "dial_code": "869", "code": "KN" }, { "name": "Saint Lucia", "dial_code": "758", "code": "LC" }, { "name": "Saint Martin", "dial_code": "590", "code": "MF" }, { "name": "Saint Pierre and Miquelon", "dial_code": "508", "code": "PM" }, { "name": "Saint Vincent and the Grenadines", "dial_code": "784", "code": "VC" }, { "name": "Sao Tome and Principe", "dial_code": "239", "code": "ST" }, { "name": "Somalia", "dial_code": "252", "code": "SO" }, { "name": "Svalbard and Jan Mayen", "dial_code": "47", "code": "SJ" }, { "name": "Syrian Arab Republic", "dial_code": "963", "code": "SY" }, { "name": "Taiwan, Province of China", "dial_code": "886", "code": "TW" }, { "name": "Tanzania, United Republic of", "dial_code": "255", "code": "TZ" }, { "name": "Timor-Leste", "dial_code": "670", "code": "TL" }, { "name": "Venezuela, Bolivarian Republic of", "dial_code": "58", "code": "VE" }, { "name": "Viet Nam", "dial_code": "84", "code": "VN" }, { "name": "Virgin Islands, British", "dial_code": "284", "code": "VG" }, { "name": "Virgin Islands, U.S.", "dial_code": "340", "code": "VI" }];

    $scope.edit = false;
    if (!AuthService.authentication.isAuth) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    $scope.updatebankdetails = function (isValid) {
        $scope.errormessage = '';
        $scope.successMessage = "";
        if (!isValid) {
            $scope.errormessage = "Please, fill out all fields!";
            return;
        }
        $scope.userdetails.country_code = $('#mobile').intlTelInput("getSelectedCountryData").dialCode;
        AuthService.updateuserdetails($scope.userdetails).then(function (results) {
            if (results.status == 200) {
                $scope.successMessage = "Profile Updated successfully";
                $scope.edit = false;
            }
        });
    }
    $scope.editform = function () {
        $scope.errormessage = '';
        $scope.successMessage = "";
        $scope.edit = true;
    }
    $scope.canceleditform = function () {
        $scope.errormessage = '';
        $scope.successMessage = "";
        $scope.edit = false;
    }
    AuthService.getuserdetails(sessionStorage.getItem("UserId")).then(function (results) {
        if (results.status == 200) {
            $scope.userdetails = results.data.response[0];
            $scope.userdetails.phone = $scope.userdetails.phone == 0 ? "" : $scope.userdetails.phone;
            $scope.userdetails.altr_mobile = $scope.userdetails.altr_mobile == 0 ? "" : $scope.userdetails.altr_mobile;
            $("#mobile").intlTelInput({
                numberType: "MOBILE",
                initialCountry: $.grep($scope.countrycodes, function (country) { return country.dial_code == $scope.userdetails.country_code })[0].code.toLowerCase()
            });
        }
    });

});
/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("editparcelController", function ($http, $scope, $state, $location, RESOURCES, AuthService, ParcelService, searchService, $stateParams) {
    if (!AuthService.authentication.isAuth) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
    $http.get(RESOURCES.API_BASE_PATH + 'api/getcountries', { headers: { 'Content-Type': 'application/json' }, }).then(function (results) {
        $scope.countries = results.data.response;
    });
    var userlisttableentity = $('#userlist').DataTable({ searching: false, paging: false });
    $scope.parcel = {};
    $scope.usersearchclicked = false;
    $scope.usersearchvisible = true;
    $scope.ParcelHeight = 0; $scope.ParcelWidth = 0; $scope.ParcelLength = 0;
    $scope.userlist = [];
    $scope.issummary = false;
    $scope.successaddtripMessage = "";
    $scope.totalamount = 0.00;
    $scope.deliverytill = new Date();
    $scope.errormessage = "";
    $scope.userlist = [];
    $scope.showheight = false;
    $scope.showwidth = false;
    $scope.showlength = false;
    $scope.exitingemail = ""; $scope.exitingmobilenumber = ""; $scope.value1 = 'true';
    $scope.changereceiveruser = function () {
        $scope.usersearchvisible = true;
        $scope.$apply();
    }
    ParcelService.getparceldetail($stateParams.id).then(function (response) {
        if (response.data.status == "success") {
            $scope.parcel = response.data.response[0];
            if (!($scope.parcel.status == 0 || $scope.parcel.status == 1 || $scope.parcel.status == 2)) {
                $state.go("viewparcel", { id: $scope.parcel.id });
            }
            if (AuthService.authentication.UserId != $scope.parcel.usr_id) {
                $state.transitionTo('home');
            }
            $scope.trip = response.data.trip;
            $scope.parcelfromloation = $scope.parcel.source;
            $scope.parceltoloation = $scope.parcel.destination;
            $scope.deliverytill = $scope.parcel.till_date;
            $scope.parceltype = $scope.parcel.type;
            $scope.ParcelWeight = parseFloat($scope.parcel.weight);
            $scope.ParcelHeight = parseFloat($scope.parcel.height);
            $scope.ParcelWidth = parseFloat($scope.parcel.width);
            $scope.ParcelLength = parseFloat($scope.parcel.length);
            $scope.parceldecsription = $scope.parcel.description;
            $scope.status = $scope.parcel.status;
            AuthService.getuserdetails($scope.parcel.recv_id).then(function (results) {
                $scope.userlist = results.data.response;
                if ($scope.userlist.length > 0) {
                    userlisttableentity.clear().draw();
                    userlisttableentity.row.add([$scope.userlist[0].UserID, $scope.userlist[0].username, $scope.userlist[0].name, $scope.userlist[0].mobile == 0 ? "" : $scope.userlist[0].mobile, ' <a href="javascript:void(0);" onclick="changereceiveruser()">Change</a>']).draw();

                    $scope.usersearchvisible = false;
                }

            });
        }
    });
    $scope.sendinviteuser = function () {
        $scope.successaddtripMessage = "";
        var data = { "email": $scope.registeremail, "name": $scope.registername, "number": $scope.registermobile, "message": $scope.registermessage, "UserID": AuthService.authentication.UserId };
        AuthService.inviteuser(data).then(function (results) {
            if (results.status == 200) {
                //   $scope.successaddtripMessage = "User Invited Successfully";
                $scope.userlist = results.data.response;
                if ($scope.userlist.length > 0) {
                    userlisttableentity.clear().draw();
                    userlisttableentity.row.add([$scope.userlist[0].UserID, $scope.userlist[0].username, $scope.userlist[0].name, $scope.userlist[0].mobile == 0 ? "" : $scope.userlist[0].mobile, ' <a href="javascript:void(0);" onclick="changereceiveruser()">Change</a>']).draw();
                    $scope.usersearchvisible = false;
                }
            }
        });
    }
    function getpriceusingweight(weight) {
        return weight < 0.02 ? 500 : weight < .05 ? 800 : weight < 1 ? 1000 : weight < 2 ? 1950 : weight < 3 ? 2900 : weight < 4 ? 3800 : weight < 5 ? 4700 : weight < 6 ? 5600 : weight < 7 ? 6500 : weight < 8 ? 7400 : weight < 9 ? 8300 : weight <= 10 ? 9200 : 0;
    }
    $scope.paynow = function (isValid) {
        window.scrollTo(0, 0);
        if (!isValid) {
            $scope.errormessage = "Please fill all mandatory fields!";
            return;
        }
        if ($scope.status == 2) {
            bootbox.confirm("This Parcel has a confirmed Booking. Changing the Parcel will cancel the booking   Want To Proceed ?", function (result) {
                if (result) {
                    saveparceldata();
                }
                else {
                    this.modal("hide");
                    return false;
                }
            });
        } else {
            saveparceldata();
        }

    }
    function saveparceldata() {
        if (AuthService.authentication.isAuth) {
            AuthService.getuserdetails(AuthService.authentication.UserId).then(function (results) {
                if (results.status == 200) {
                    if (results.data.response[0].status == "Y") {
                        if ($scope.userlist.length == 0) {
                            $scope.errormessage = "Please Select receiver !";
                            return;
                        }
                        if ($(".quote_date").val().length == 0) {
                            $scope.errormessage = "Departure Time Required!";
                            return;
                        }
                        $scope.deliverytill = new Date($(".quote_date").val().split("-")[1] + "/" + $(".quote_date").val().split("-")[0] + "/" + $(".quote_date").val().split("-")[2] + " ");
                        var amount = getpriceusingweight(parseFloat($scope.ParcelWeight));
                        var datapost = { "source": $scope.parcelfromloation, "destination": $scope.parceltoloation, "till_date": $(".quote_date").val().split("-")[2] + "/" + $(".quote_date").val().split("-")[1] + "/" + $(".quote_date").val().split("-")[0], "type": $scope.parceltype, "weight": parseFloat($scope.ParcelWeight), "height": $scope.ParcelHeight, "width": $scope.ParcelWidth, "length": $scope.ParcelLength, "usr_id": sessionStorage.getItem("UserId"), "recv_id": $scope.userlist[0].id, "description": $scope.parceldecsription, "payment": parseFloat(amount), "id": $stateParams.id, "trans_id": "", "status": $scope.status };
                        if ($scope.status == 4 || $scope.status == 5 || $scope.status == 3) {
                            $scope.errormessage = "Can't Able to edit its delivery is about to be completed.";
                            return;
                        }
                        ParcelService.updateParcelData(datapost).then(function (results) {
                            if (results.status == 200) {
                                $state.go("viewparcel", { id: $scope.parcel.id });
                                $scope.successaddtripMessage = 'Parcel Updated Successfully.  <a style="float:right;" href="/#viewparcel/' + $scope.parcel.id + '" aria-controls="home" role="tab" data-toggle="tab"><i class="fa fa-plane" aria-hidden="true"></i> View Parcel</a>';
                                $scope.tripsavemessage = "Parcel Updated Successfully.";
                            }
                        });
                    }
                    else {
                        $scope.errormessage = "Verification Email Sent on your Email please verify.";
                        return;
                    }
                }
            })
        }
    }
    $scope.searchuser = function () {
        $scope.errormessage = "";
        $scope.successaddtripMessage = "";
        $scope.usersearchclicked = false;
        if ((typeof $scope.exitingemail === 'undefined' || $scope.exitingemail === '' || $scope.exitingemail == null) && (typeof $scope.exitingmobilenumber === 'undefined' || $scope.exitingmobilenumber === '' || $scope.exitingmobilenumber == null)) {

        } else {
            searchService.searchuser($scope.exitingmobilenumber, $scope.exitingemail, AuthService.authentication.UserId).then(function (response) {
                $scope.userlist = response.data.response;
                if ($scope.userlist.length > 0) {
                    userlisttableentity.clear().draw();
                    userlisttableentity.row.add([$scope.userlist[0].UserID, $scope.userlist[0].username, $scope.userlist[0].name, $scope.userlist[0].mobile == 0 ? "" : $scope.userlist[0].mobile, ' <a href="javascript:void(0);" onclick="changereceiveruser()">Change</a>']).draw();

                    $scope.usersearchvisible = false;
                }
                $scope.usersearchclicked = true;
            });
        }
    };
    $scope.checkdimensions = function () {
        if ($scope.parceltype == "B") {
            $scope.showheight = true;
            $scope.showwidth = true;
            $scope.showlength = true;
        } else {
            $scope.showheight = false;
            $scope.showwidth = false;
            $scope.showlength = false;
        }
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
                results = _suggestLocations(request.term);
                res = results;
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
        RESOURCES.searchcriteria.datefrom = new Date($(".quote_datesearch").val().split("-")[1] + "/" + $(".quote_datesearch").val().split("-")[0] + "/" + $(".quote_datesearch").val().split("-")[2]);
        RESOURCES.searchcriteria.dateto = new Date($(".quote_datesearch1").val().split("-")[1] + "/" + $(".quote_datesearch1").val().split("-")[0] + "/" + $(".quote_datesearch1").val().split("-")[2]);
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
});
/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("edittripsController", function ($rootScope, $scope, $http, $state, $location, AuthService, AddTripsService, $stateParams, RESOURCES, searchService) {
    var Id = $stateParams.id;
    $http.get(RESOURCES.API_BASE_PATH + 'api/getcountries', { headers: { 'Content-Type': 'application/json' }, }).then(function (results) {
        $scope.countries = results.data.response;
    });
    searchService.gettransporterdetails($stateParams.id).then(function (response) {
        if (response.data.status == "success") {
            $scope.transporter = response.data.response[0];
            $scope.locationfrom = $scope.transporter.source;
            $scope.locationto = $scope.transporter.destination;
            var dat = $scope.transporter.dep_time.split("-");
            var day = dat[2].split(" ");
            if (AuthService.authentication.UserId != $scope.transporter.t_id) {
                $state.transitionTo('home');
            }
            $scope.dtime = day[1].substring(0, 5);
            $scope.tripduration = parseInt($scope.transporter.duration);
            $("#durationPicker").durationPicker("seconds", $scope.tripduration);
            $scope.departureon = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
            var dat = $scope.transporter.arrival_time.split("-");
            var day = dat[2].split(" ");
            $scope.atime = day[1].substring(0, 5);
            $scope.arrivalon = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
            $scope.flightno = $scope.transporter.flight_no;
            $scope.bookingpnr = $scope.transporter.pnr;
            $scope.capacity = parseFloat($scope.transporter.capacity);
            $scope.tripcomment = $scope.transporter.comment;
        }
    });
    $scope.errormessage = "";
    $scope.ticket = { "base64": "" };
    $scope.successaddtripMessage = "";
    $scope.addtripsdata = function (isValid) {
        $scope.errormessage = '';
        $scope.successaddtripMessage = "";
        if (!isValid) {
            $scope.errormessage = "Please fill all mandatory fields!";
            return;
        }
        if ($scope.transporter.status == 3) {
            bootbox.confirm("This trip has a confirmed Booking. Changing the trip will cancel the booking  \n Want To Proceed ?", function (result) {
                if (result) {
                    savetripdata();
                }
                else {
                    this.modal("hide");
                    return false;
                }
            });
        }
        else {
            savetripdata();
        }

    }
    function savetripdata() {
        if (AuthService.authentication.isAuth) {
            AuthService.getuserdetails(AuthService.authentication.UserId).then(function (results) {
                if (results.status == 200) {
                    if (results.data.response[0].status == "Y") {
                        $scope.departureon = new Date($(".quote_date").val().split("-")[1] + "/" + $(".quote_date").val().split("-")[0] + "/" + $(".quote_date").val().split("-")[2] + " " + $scope.dtime);
                        var deptime = $(".quote_date").val().split("-")[2] + "/" + $(".quote_date").val().split("-")[1] + "/" + $(".quote_date").val().split("-")[0] + " " + $scope.dtime;
                        $scope.atime = moment($scope.arrivalon).format("h:mm");
                        $scope.arrivalon = new Date($(".quote_date1").val().split("-")[1] + "/" + $(".quote_date1").val().split("-")[0] + "/" + $(".quote_date1").val().split("-")[2] + " " + $scope.atime);
                        var arrivaltime = $(".quote_date1").val().split("-")[2] + "/" + $(".quote_date1").val().split("-")[1] + "/" + $(".quote_date1").val().split("-")[0] + " " + $scope.atime;
                        $scope.arrivalon = new Date($(".quote_date1").val().split("-")[1] + "/" + $(".quote_date1").val().split("-")[0] + "/" + $(".quote_date1").val().split("-")[2] + " " + $scope.atime.split(":")[0] + ":" + $scope.atime.split(":")[1].substring(0, 2) + " " + $scope.atime.split(":")[1].substring(2));
                        if (!angular.isDate($scope.departureon)) {
                            $scope.errormessage = "Invalid Departure!";
                            return;
                        }
                        var datapost = { "source": $scope.locationfrom, "destination": $scope.locationto, "d_date": deptime, "a_date": arrivaltime, "flight_no": $scope.flightno, "pnr": $scope.bookingpnr, "capacity": $scope.capacity, "comment": $scope.tripcomment, "t_id": sessionStorage.getItem("UserId"), "id": $stateParams.id, "duration": $scope.tripduration, "status": $scope.transporter.status };
                        AddTripsService.updateTripsData(datapost).then(function (results) {
                            if (results.status == 200) {
                                searchService.gettransporterdetails($stateParams.id).then(function (response) {
                                    if (response.data.status == "success") {
                                        $scope.transporter = response.data.response[0];
                                        $scope.locationfrom = $scope.transporter.source;
                                        $scope.locationto = $scope.transporter.destination;
                                        var dat = $scope.transporter.dep_time.split("-");
                                        var day = dat[2].split(" ");
                                        $scope.dtime = day[1];
                                        $scope.departureon = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
                                        var dat = $scope.transporter.arrival_time.split("-");
                                        var day = dat[2].split(" ");
                                        $scope.atime = day[1];
                                        $scope.arrivalon = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
                                        $scope.flightno = $scope.transporter.flight_no;
                                        $scope.bookingpnr = $scope.transporter.pnr;
                                        $scope.capacity = parseFloat($scope.transporter.capacity);
                                        $scope.tripcomment = $scope.transporter.comment;
                                        //$scope.departureon = convertUTCDateToLocalDate($scope.departureon);
                                        //$scope.arrivalon = convertUTCDateToLocalDate($scope.arrivalon);
                                        $scope.tripduration = parseInt($scope.transporter.duration);
                                    }
                                });
                                $scope.successaddtripMessage = 'Trip Updated Successfully Sent for admin Approval.  <a style="float:right;" href="/viewtrip/' + $scope.transporter.id + '" aria-controls="home" role="tab" data-toggle="tab"><i class="fa fa-plane" ></i> View Trip</a>';
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
    $scope.changedurationwithoutjavascript = function () {
        if ($(".quote_date").val().value.length == 0) {
            $scope.arrivalon = "";
            return;
        } else {
            if (parseInt($scope.tripduration) > 0) {
                d = new Date($(".quote_date").val().value.split("-")[1] + "/" + $(".quote_date").val().value.split("-")[0] + "/" + $(".quote_date").val().value.split("-")[2] + " " + $scope.dtime.split(":")[0] + ":" + $scope.dtime.split(":")[1].substring(0, 2) + " " + $scope.dtime.split(":")[1].substring(2));;
                var totalseconds = parseFloat($scope.tripduration * 60);
                var indtotime = (d.getTime() + (1000 * totalseconds));
                $scope.arrivalon = indtotime;
            } else {
                $scope.arrivalon = new Date($(".quote_date").val().value.split("-")[1] + "/" + $(".quote_date").val().value.split("-")[0] + "/" + $(".quote_date").val().value.split("-")[2] + " " + $scope.dtime.split(":")[0] + ":" + $scope.dtime.split(":")[1].substring(0, 2) + " " + $scope.dtime.split(":")[1].substring(2));;
            }
        }
        if (typeof $scope.locationfrom === 'undefined' || $scope.locationfrom == '' || $scope.locationfrom == null) {
            return;
        }
        if (typeof $scope.locationto === 'undefined' || $scope.locationto == '' || $scope.locationto == null) {
            return;
        }
        if (typeof $scope.dtime === 'undefined' || $scope.dtime == '' || $scope.dtime == null) {
            return;
        }
        if (typeof $scope.tripduration !== 'undefined' && $scope.tripduration !== '' && $scope.tripduration != null) {
            var locfrom = $.grep($scope.countries, function (country) { return country.location == $scope.locationfrom })[0];
            var locto = $.grep($scope.countries, function (country) { return country.location == $scope.locationto })[0];
            var d = new Date($(".quote_date").val().value.split("-")[1] + "/" + $(".quote_date").val().value.split("-")[0] + "/" + $(".quote_date").val().value.split("-")[2] + " " + $scope.dtime.split(":")[0] + ":" + $scope.dtime.split(":")[1].substring(0, 2) + " " + $scope.dtime.split(":")[1].substring(2));
            var totalseconds = parseFloat($scope.tripduration * 60);
            var indtotime = (d.getTime() + (1000 * totalseconds));
            var centraltime = new Date(indtotime).getTime() + (-(locfrom.zone * 60) * 60000);
            $scope.arrivalon = calcTime(centraltime, locto.zone);
        }
    }
    $scope.changeduration = function () {
        if ($(".quote_date").val().value.length == 0) {
            $scope.arrivalon = "";
            return;
        } else {
            if (parseInt($scope.tripduration) > 0) {
                d = new Date($(".quote_date").val().value.split("-")[1] + "/" + $(".quote_date").val().value.split("-")[0] + "/" + $(".quote_date").val().value.split("-")[2] + " " + $scope.dtime.split(":")[0] + ":" + $scope.dtime.split(":")[1].substring(0, 2) + " " + $scope.dtime.split(":")[1].substring(2));;
                var totalseconds = parseFloat($scope.tripduration * 60);
                var indtotime = (d.getTime() + (1000 * totalseconds));
                $scope.arrivalon = indtotime;
            } else {
                $scope.arrivalon = new Date($(".quote_date").val().value.split("-")[1] + "/" + $(".quote_date").val().value.split("-")[0] + "/" + $(".quote_date").val().value.split("-")[2] + " " + $scope.dtime.split(":")[0] + ":" + $scope.dtime.split(":")[1].substring(0, 2) + " " + $scope.dtime.split(":")[1].substring(2));;
            }
            $scope.$apply();
        }
        if (typeof $scope.locationfrom === 'undefined' || $scope.locationfrom == '' || $scope.locationfrom == null) {
            return;
        }
        if (typeof $scope.locationto === 'undefined' || $scope.locationto == '' || $scope.locationto == null) {
            return;
        }
        if (typeof $scope.dtime === 'undefined' || $scope.dtime == '' || $scope.dtime == null) {
            return;
        }
        if (typeof $scope.tripduration !== 'undefined' && $scope.tripduration !== '' && $scope.tripduration != null) {
            var locfrom = $.grep($scope.countries, function (country) { return country.location == $scope.locationfrom })[0];
            var locto = $.grep($scope.countries, function (country) { return country.location == $scope.locationto })[0];
            var d = new Date($(".quote_date").val().value.split("-")[1] + "/" + $(".quote_date").val().value.split("-")[0] + "/" + $(".quote_date").val().value.split("-")[2] + " " + $scope.dtime.split(":")[0] + ":" + $scope.dtime.split(":")[1].substring(0, 2) + " " + $scope.dtime.split(":")[1].substring(2));
            var totalseconds = parseFloat($scope.tripduration * 60);
            var indtotime = (d.getTime() + (1000 * totalseconds));
            var centraltime = new Date(indtotime).getTime() + (-(locfrom.zone * 60) * 60000);
            $scope.arrivalon = calcTime(centraltime, locto.zone);
            $scope.$apply();
        }
    }
    $scope.applychanges = function () {
        $scope.$apply();
    }
    function calcTime(utc, offset) {
        var nd = new Date(utc + (3600000 * offset));
        return nd;
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
    if (!AuthService.authentication.isAuth) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    $scope.search = function () {
        RESOURCES.searchcriteria.datefrom = new Date($(".quote_datesearch").val().split("-")[1] + "/" + $(".quote_datesearch").val().split("-")[0] + "/" + $(".quote_datesearch").val().split("-")[2]);
        RESOURCES.searchcriteria.dateto = new Date($(".quote_datesearch1").val().split("-")[1] + "/" + $(".quote_datesearch1").val().split("-")[0] + "/" + $(".quote_datesearch1").val().split("-")[2]);
        if ($scope.searchfromlocation.trim() != $scope.searchtolocation.trim()) {
            RESOURCES.searchcriteria.locationfrom = $scope.searchfromlocation;
            RESOURCES.searchcriteria.locationto = $scope.searchtolocation;
            RESOURCES.searchcriteria.type = "Sender";
            $location.path('/search');
        } else {
            $scope.searchtolocation = "";
        }
    }
    function convertUTCDateToLocalDate(date) {
        var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);

        var offset = date.getTimezoneOffset() / 60;
        var hours = date.getHours();

        newDate.setHours(hours - offset);

        return newDate;
    }
});
/**
 * Created by Lalit on 21.05.2016.
 */
/// <reference path="angular.min.js" />  
/// <reference path="Module.js" />  
/// <reference path="Service.js" />   
angular.module('courier').controller("forgetpasswordController", function ($scope, $rootScope, $location, locationHistoryService, ValiDatedTokenObject, AuthService, RESOURCES, $modal, $timeout) {
    if (AuthService.authentication.isAuth) {
        $location.path('/home');
    }
    $scope.forgetpasswordData = { userName: '' };
    $scope.errorforgetpasswordDescription = '';
    $scope.successforgetpasswordDescription = '';
    $scope.forgetpassword = function (isValid) {
        $scope.errorforgetpasswordDescription = '';
        $scope.successforgetpasswordDescription = '';
        if (!isValid) {
            $scope.errorforgetpasswordDescription = "Please, fill out all fields!";
            return;
        }
        AuthService.resetPassword($scope.forgetpasswordData).then(function (response) {
            if (response.data.status == "success") {
                $scope.successforgetpasswordDescription = response.data.response;
                $scope.forgetpasswordData = { userName: '' };
            } else {
                $scope.errorforgetpasswordDescription = response.data.errorMessage;
            }
        },
            function (err) {
                if (err != null) {
                    $scope.errorforgetpasswordDescription = err.error_description;
                }
                else {
                    $scope.errorforgetpasswordDescription = "Internal Server Error";
                }
            });
    };
});
/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("HeaderController", function ($scope, AuthService, $location, AirportService) {
    angular.element('.chatmessagepopup').scope().updatechat();
    $scope.isAuth = AuthService.authentication.isAuth;
    $scope.userName = AuthService.authentication.userName;
    $scope.isAdministrator = AuthService.authentication.isAdministrator;
    $scope.isUser = AuthService.authentication.isUser;
    $scope.totalmessages = 0;
    $scope.chatchannelslist = [];
    if ($scope.isAuth) {
        AuthService.getuserdetails(AuthService.authentication.UserId).then(function (results) {
            if (results.data.status == "success") {
                if (results.data.response[0].status == "Y") { }
                else {
                    $scope.verificationmessage = "Verification link send on your Email please verify.";
                }
            }
        });
        AuthService.getchannelslist(AuthService.authentication.UserId).then(function (results) {
            $scope.chatchannelslist = results.data;
            for (i = 0; i < $scope.chatchannelslist.length; i++) {
                $scope.totalmessages = $scope.totalmessages + parseInt($scope.chatchannelslist[i].messagecount);
            }
        });
    }
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    AirportService.getseolist().then(function (results) {
        $scope.list = results.data.response;
        for (i = 0; i < $scope.list.length; i++) {
            if ($scope.list[i].location == $location.path()) {
                $('head').append('<meta name="description" content="' + $scope.list[i].description + '">');
                $('head').append('<meta name="keywords" content="' + $scope.list[i].keyword + '">');
                $('head').append('<title>' + $scope.list[i].title + '</title> ');
            }
        }
    });
    $scope.showchatopen = function (id, parcelid, index) {
        $scope.chatchannelslist.splice(index, 1);
        angular.element('.chatmessagepopup').scope().showchat(id, parcelid);
    }
})
/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("homeController", function ($scope, ValiDatedTokenObject, $location, $http, $timeout, RESOURCES, $filter, UsersService) {
    $scope.classsetactive = 2;
    $scope.locationfrom = "";
    $scope.locationto = "";
    $scope.serviceBase = RESOURCES.API_BASE_PATH;
    $http.get(RESOURCES.API_BASE_PATH + 'api/getcountries', { headers: { 'Content-Type': 'application/json' }, }).then(function (results) {
        $scope.countries = results.data.response;
        $scope.getLocation();
    });
    $scope.search = function () {
        if ($(".quote_date").val().length == 0) {
            return;
        }
        RESOURCES.searchcriteria.datefrom = new Date($(".quote_date").val().split("-")[1] + "/" + $(".quote_date").val().split("-")[0] + "/" + $(".quote_date").val().split("-")[2]);
        if ($(".quote_date1").val().length == 0) {
            return;
        }
        RESOURCES.searchcriteria.dateto = new Date($(".quote_date1").val().split("-")[1] + "/" + $(".quote_date1").val().split("-")[0] + "/" + $(".quote_date1").val().split("-")[2]);
        if ($scope.locationto.trim() != $scope.locationfrom.trim()) {
            RESOURCES.searchcriteria.locationfrom = $scope.locationfrom;
            RESOURCES.searchcriteria.locationto = $scope.locationto;
            RESOURCES.searchcriteria.type = $scope.type;
            $location.path('/search');
        } else {
            $scope.locationto = "";
        }
    }
    $scope.updatesearchtype = function (type) {
        $scope.type = type;
    }
    $scope.type = "Transporter";
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
                results = _suggestLocations(request.term);
                res = results;
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
    var date = new Date();
    $scope.dateFrom = date.setDate((new Date()).getDate() + 0);
    $scope.dateTo = date.setDate((new Date()).getDate() + 2);
    $scope.setdate = function (days) {
        $(".quote_date").val('');
        $(".quote_date1").val('');
        days = parseInt(days);
        if (days == 0) {
            $scope.classsetactive = 0;
            var date = new Date();
            $scope.dateFrom = new Date();
            $scope.dateTo = date.setDate((new Date()).getDate() + 0);
            $(".quote_date").val(moment($scope.dateFrom).format("DD-MM-YYYY"));
            $(".quote_date1").val(moment($scope.dateTo).format("DD-MM-YYYY"));
        }
        if (days == 2) {
            $scope.classsetactive = 2;
            var date = new Date();
            $scope.dateFrom = new Date();
            $scope.dateTo = date.setDate((new Date()).getDate() + 2);
            $(".quote_date").val(moment($scope.dateFrom).format("DD-MM-YYYY"));
            $(".quote_date1").val(moment($scope.dateTo).format("DD-MM-YYYY"));
        }
        if (days == 5) {
            $scope.classsetactive = 5;
            var date = new Date();
            $scope.dateFrom = new Date();
            $scope.dateTo = date.setDate((new Date()).getDate() + 5);
            $(".quote_date").val(moment($scope.dateFrom).format("DD-MM-YYYY"));
            $(".quote_date1").val(moment($scope.dateTo).format("DD-MM-YYYY"));
        }
    }
    $scope.dt = new Date();
    $scope.disabled = function (date, mode) {
        return (mode === 'day' && false);

    };
    var date = new Date();
    $scope.maxDate = date.setDate((new Date()).getDate() + 180);
    $scope.open0 = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status0.opened = true;

    }; 
    $scope.open1 = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status1.opened = true;
    };
    $scope.status0 = {
        opened: false
    };
    $scope.status1 = {
        opened: false
    };
    $scope.lat = "0";
    $scope.lng = "0";
    $scope.accuracy = "0";
    $scope.error = "";
    $scope.model = { myMap: undefined };
    $scope.myMarkers = [];
    $scope.showResult = function () {
        return $scope.error == "";
    }
    $scope.mapOptions = {
        center: new google.maps.LatLng($scope.lat, $scope.lng),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    $scope.showPosition = function (position) {
        $scope.lat = position.coords.latitude;
        $scope.lng = position.coords.longitude;
        $scope.accuracy = position.coords.accuracy;
        $scope.$apply();
        var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var geocoder = new google.maps.Geocoder();
        var city;
        geocoder.geocode({ 'latLng': latlng }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    var add = results[0].formatted_address;
                    var value = add.split(",");
                    count = value.length;
                    country = value[count - 1];
                    state = value[count - 2];
                    city = value[count - 3];
                    for (i = 0; i < $scope.countries.length; i++) {
                        if ($scope.countries[i].location.toLowerCase().indexOf(city.toLowerCase().trim()) == 0) {
                            $scope.locationfrom = $scope.countries[i].location;
                            break;
                        }
                    }
                }
                else {
                }
            }
        });
    }
    $scope.showError = function (error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                $scope.error = "User denied the request for Geolocation."
                break;
            case error.POSITION_UNAVAILABLE:
                $scope.error = "Location information is unavailable."
                break;
            case error.TIMEOUT:
                $scope.error = "The request to get user location timed out."
                break;
            case error.UNKNOWN_ERROR:
                $scope.error = "An unknown error occurred."
                break;
        }
        $scope.$apply();
    }
    $scope.getLocation = function () {
        if (typeof google !== 'undefined' && google !== '' && google != null) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition($scope.showPosition, $scope.showError);
            }
            else {
                $scope.error = "Geolocation is not supported by this browser.";
            }
        }
    }
});
/**
 * Created by Lalit on 21.05.2016.
 */
/// <reference path="angular.min.js" />  
/// <reference path="Module.js" />  
/// <reference path="Service.js" />   
angular.module('courier').controller("Login", function ($scope, $rootScope, $location, locationHistoryService, ValiDatedTokenObject, AuthService, RESOURCES, $modal, $timeout) {
    if (AuthService.authentication.isAuth) {
        $location.path('/home');
    }
    $scope.loginData = { userName: '', password: '' };
    $scope.errorLoginDescription = '';
    $scope.login = function (isValid) {
        $scope.errorLoginDescription = '';
        if (!isValid) {
            $scope.errorLoginDescription = "Please, fill out all fields!";
            return;
        }
        AuthService.login($scope.loginData).then(function (response) {
            if (response.status == "success") {
                var return_url = sessionStorage.getItem("return_url");
                if (return_url != null) {
                    sessionStorage.removeItem("return_url");
                    $location.path(return_url);
                } else {
                    $location.path('/home');
                }
            } else {
                if (response.errorMessage == "Your Acoount is not verified.") {
                    $scope.id = response.response;
                    bootbox.prompt("Enter Otp Sent on Your Email?", function (result) {
                        var data = { "id": $scope.id, "code": result };
                        AuthService.verifyuser(data).then(function (responseuser) {
                            console.log(responseuser);
                            if (responseuser.data.status == "success") {
                                AuthService.login($scope.loginData).then(function (response) {
                                    if (response.status == "success") {
                                        var return_url = sessionStorage.getItem("return_url");
                                        if (return_url != null) {
                                            sessionStorage.removeItem("return_url");
                                            $location.path(return_url);
                                        } else {
                                            $location.path('/home');
                                        }
                                    }
                                });
                            } else {
                                bootbox.alert("Error ! Opt is not Matched", function () {
                                    $location.path('/login');
                                });
                            }

                        });
                    });
                }
                $scope.errorLoginDescription = response.errorMessage;
            }
        },
            function (err) {
                if (err != null) {
                    $scope.errorLoginDescription = err.error_description;
                }
                else {
                    $scope.errorLoginDescription = "Internal Server Error";
                }
            });
    };
    $scope.authExternalProvider = function (provider) {
        var redirectUri = location.protocol + '//' + location.host + '/authcomplete.html';
        if (location.pathname.indexOf('Development2') != -1) {
            redirectUri = location.protocol + '//' + location.host + '/Development2/authcomplete.html';
        }
        var externalProviderUrl = RESOURCES.API_BASE_PATH + "Account/ExternalLogin?provider=" + provider
            + "&response_type=token&client_id=" + RESOURCES.CLIENT_ID
            + "&redirect_uri=" + redirectUri;
        window.$windowScope = $scope;
        var oauthWindow = window.open(externalProviderUrl, "Authenticate Account", "location=0,status=0,width=600,height=750");
    };
    $scope.authCompletedCB = function (fragment) {
        $scope.$apply(function () {
            if (fragment.haslocalaccount == 'False') {
                AuthService.logOut();
                AuthService.externalAuthData = {
                    provider: fragment.provider,
                    userName: fragment.external_user_name,
                    externalAccessToken: fragment.external_access_token,
                    email: fragment.email,
                    firstName: fragment.first_name,
                    lastName: fragment.last_name
                };
            }
            else {
                var externalData = { provider: fragment.provider, externalAccessToken: fragment.external_access_token };
                AuthService.obtainAccessToken(externalData).then(function (response) {
                    var return_url = sessionStorage.getItem("return_url");
                    if (return_url != null) {
                        sessionStorage.removeItem("return_url");
                        $location.path(return_url);
                    } else {
                        $location.path('/dashboard');
                    }
                },
                    function (err) {
                        $scope.message = err.error_description;
                    });
            }

        });
    };
    var showHelpWindow = function (templateName) {
        var modalInstance = $modal.open({
            animation: true,
            templateUrl: templateName,
            controller: function () { }, size: 'lg'
        });
    };

    $scope.showTerms = function () {
        showHelpWindow('views/TermsView.html');
    };

    $scope.showPrivacy = function () {
        showHelpWindow('views/PrivacyView.html');
    };

});
/**
 * Created by Lalit on 18.06.2016.
 */
angular.module('courier').controller("mywalletController", function ($scope, $state, $location, AuthService, ParcelService, searchService) {
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
            $scope.list = results.data.response;
            $scope.mainlist = results.data.response;
            for (i = 0; i < $scope.list.length; i++) {
                var deptime = $scope.list[i].insertdate.split(" ");
                $scope.list[i].insertdate = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                $scope.mainlist[i].insertdate = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                dTable.row.add([($scope.mainlist[i].tripid > 0 ? "<a href='javascript:void(0);' onclick='openpopup(" + $scope.mainlist[i].tripid + ",2)'>" + $scope.mainlist[i].MTripID + "</a>" : "-"), ($scope.mainlist[i].parcelid > 0 ? "<a href='javascript:void(0);' onclick='openpopup(" + $scope.mainlist[i].parcelid + ",1)'>" + $scope.mainlist[i].MParcelID + "</a>" : "-"), ($scope.mainlist[i].withdrawID == null ? "-" : "<a href='javascript:void(0);' onclick='openpopup(\"" + $scope.mainlist[i].withdrawID + "\",3)'>" + $scope.mainlist[i].withdrawID + "</a>"), moment($scope.mainlist[i].insertdate).format("DD/MM/YYYY hh:mm:ss"), $scope.mainlist[i].credit, $scope.mainlist[i].debit, $scope.mainlist[i].withdrawamount == 0 ? "0.00" : $scope.mainlist[i].withdrawamount, $scope.mainlist[i].statusdescription == "Y" ? "Approved" : ($scope.mainlist[i].statusdescription == "N" ? "Pending" : $scope.mainlist[i].statusdescription)]).draw();
            }
        }
    });
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    $scope.openpopup = function (id, status) {
        console.log(id);
        if (status == 1) {
            ParcelService.getparceldetail(id).then(function (response) {
                $scope.parcelsingle = response.data.response[0];
                $("#parceldetails").modal();

            });
        }
        if (status == 2) {
            searchService.gettransporterdetails(id).then(function (response) {
                console.log(response.data.response);
                $scope.tripsingle = response.data.response[0];

                $("#tripdetails").modal();
            });
        }
        if (status == 3) {
            searchService.paymentrequestlist(sessionStorage.getItem("UserId")).then(function (results) {
                $scope.paymentlist = results.data.response;
                $scope.paymentsingle = $.grep($scope.paymentlist, function (payment) { return payment.withdrawID == id })[0];

                $("#paymentdetails").modal();
            });
        }
    };
});
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
                    if ($scope.tripsmatchdata[i].t_id == $scope.loginuser.id) {
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
        AddTripsService.senderbookingrequest($scope.parcel.id, id).then(function (results) {
            if (results.data.status == "success") {
                $scope.successMessage = results.data.response + '  <a style="float:right;" href="/viewtrip/' + id + '" aria-controls="home" role="tab" data-toggle="tab"><i class="fa fa-plane" ></i> View Trip</a>';
            }
        });
    }
});
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
                dTable.row.add([(($scope.mainlist[i].channelid > 0) ? "<a href='javascript:void(0);'  onclick='showchat(" + $scope.mainlist[i].channelid + "," + $scope.mainlist[i].id + ")'><span class='glyphicon glyphicon-comment'></span> </a> " : "") + "<a href='javascript:void(0);' onclick='parceldetails(" + $scope.mainlist[i].id + ")'>" + $scope.mainlist[i].ParcelID + "</a>", $scope.mainlist[i].flight_no, "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].usr_id + ")'>" + $scope.mainlist[i].MCBSenderID + "</a>", "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].Transporterid + ")'>" + $scope.mainlist[i].MCBtransporterid + "</a>", $scope.mainlist[i].statusdescription, (($scope.mainlist[i].status == 2 || $scope.mainlist[i].status == 3 || $scope.mainlist[i].status == 4) ? "<a href='javascript:void(0);'    onclick='changestatusparcel(" + $scope.mainlist[i].id + ",1)'   title='Received'>Received</a>" : "")]).draw();
            }
        }
    });
    var _searchByFilter = function () {
        $scope.list = [];
        dTable.clear().draw();
        for (i = 0; i < $scope.mainlist.length; i++) {
            console.log($scope.mainlist[i].status);
            if (($scope.mainlist[i].status == $scope.status || typeof $scope.status === 'undefined' || $scope.status === '' || $scope.status == null) && ($scope.mainlist[i].dep_time.getDate() == new Date($scope.departureat).getDate() || typeof $scope.departureat === 'undefined' || $scope.departureat === '' || $scope.departureat == null) && ($scope.mainlist[i].ParcelID.toLowerCase().indexOf($scope.TransporterID) != -1 || typeof $scope.TransporterID === 'undefined' || $scope.TransporterID === '' || $scope.TransporterID == null)) {
                $scope.list.push($scope.mainlist[i]);
                dTable.row.add([(($scope.mainlist[i].channelid > 0) ? "<a href='javascript:void(0);'  onclick='showchat(" + $scope.mainlist[i].channelid + "," + $scope.mainlist[i].id + ")'><span class='glyphicon glyphicon-comment'></span> </a> " : "") + "<a href='javascript:void(0);' onclick='parceldetails(" + $scope.mainlist[i].id + ")'>" + $scope.mainlist[i].ParcelID + "</a>", $scope.mainlist[i].flight_no, "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].usr_id + ")'>" + $scope.mainlist[i].MCBSenderID + "</a>", "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].Transporterid + ")'>" + $scope.mainlist[i].MCBtransporterid + "</a>", $scope.mainlist[i].statusdescription, (($scope.mainlist[i].status == 2 || $scope.mainlist[i].status == 3 || $scope.mainlist[i].status == 4) ? "<a href='javascript:void(0);'  onclick='changestatusparcel(" + $scope.mainlist[i].id + ",1)'   title='Received'>Received</a>" : "")]).draw();
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
        if ($.grep($scope.mainlist, function (parcel) { return parcel.id == id }).length > 0) {
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
                                        dTable.row.add([(($scope.mainlist[i].channelid > 0) ? "<a href='javascript:void(0);'  onclick='showchat(" + $scope.mainlist[i].channelid + "," + $scope.mainlist[i].id + ")'><span class='glyphicon glyphicon-comment'></span> </a> " : "") + "<a href='javascript:void(0);' onclick='parceldetails(" + $scope.mainlist[i].id + ")'>" + $scope.mainlist[i].ParcelID + "</a>", $scope.mainlist[i].flight_no, "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].usr_id + ")'>" + $scope.mainlist[i].MCBSenderID + "</a>", "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].Transporterid + ")'>" + $scope.mainlist[i].MCBtransporterid + "</a>", $scope.mainlist[i].statusdescription, (($scope.mainlist[i].status == 2 || $scope.mainlist[i].status == 3 || $scope.mainlist[i].status == 4) ? "<a href='javascript:void(0);'   onclick='changestatusparcel(" + $scope.mainlist[i].id + ",1)'   title='Received'>Received</a>" : "")]).draw();
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
                                        dTable.row.add([(($scope.mainlist[i].channelid > 0) ? "<a href='javascript:void(0);'  onclick='showchat(" + $scope.mainlist[i].channelid + "," + $scope.mainlist[i].id + ")'><span class='glyphicon glyphicon-comment'></span> </a> " : "") + "<a href='javascript:void(0);' onclick='parceldetails(" + $scope.mainlist[i].id + ")'>" + $scope.mainlist[i].ParcelID + "</a>", $scope.mainlist[i].flight_no, "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].usr_id + ")'>" + $scope.mainlist[i].MCBSenderID + "</a>", "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].Transporterid + ")'>" + $scope.mainlist[i].MCBtransporterid + "</a>", $scope.mainlist[i].statusdescription, (($scope.mainlist[i].status == 2 || $scope.mainlist[i].status == 3 || $scope.mainlist[i].status == 4) ? "<a href='javascript:void(0);'   onclick='changestatusparcel(" + $scope.mainlist[i].id + ",1)'   title='Received'>Received</a>" : "")]).draw();
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
/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("RefundParcelController", function ($scope, $state, $location, AuthService, ParcelService) {
    if (!AuthService.authentication.isAuth) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
    $scope.list = [];
    $scope.mainlist = [];
    dTable = $('#example').DataTable();
    ParcelService.getrefundedParcelList(sessionStorage.getItem("UserId")).then(function (results) {
        if (results.status == 200) {
            $scope.list = results.data.response;
            $scope.mainlist = results.data.response;
            for (i = 0; i < $scope.list.length; i++) {
                var deptime = $scope.list[i].till_date.split(" ");
                $scope.list[i].till_date = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                $scope.mainlist[i].till_date = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                dTable.row.add(["P" + $scope.mainlist[i].id, $scope.mainlist[i].source, $scope.mainlist[i].destination, $scope.mainlist[i].type == 'E' ? 'Envelope' : $scope.mainlist[i].type == 'B' ? 'Box' : $scope.mainlist[i].type == 'P' ? 'Packet' : $scope.mainlist[i].type, $scope.mainlist[i].weight + " kg.", $scope.mainlist[i].transemail, $scope.mainlist[i].receiveremail, $scope.mainlist[i].status == 0 ? "Parcel ID Created" : $scope.mainlist[i].status == 1 ? "Created Payment Due" : $scope.mainlist[i].status == 2 ? "Booked With TR" : $scope.mainlist[i].status == 3 ? "Parcel Collected" : $scope.mainlist[i].status == 4 ? "Parcel Delivered" : $scope.mainlist[i].status == 5 ? "Delivery Complete" : $scope.mainlist[i].status == 6 ? "Cancelled" : "Undelivered"]).draw();
            }
        }
    });
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
});
angular.module('courier').controller("searchController", function ($scope, $location, $state, $http, $timeout, RESOURCES, searchService, AuthService, $filter, $compile) {
    $scope.transporters = [];
    $scope.classsetactive = 2;
    $scope.senders = [];
    $scope.authuser = AuthService.authentication;
    $scope.countries = [];
    $scope.submitted = true;
    $scope.countavailablequantities = 0;
    if (RESOURCES.searchcriteria.datefrom != "" && RESOURCES.searchcriteria.datefrom != "Invalid Date") {
        $scope.dateFrom = RESOURCES.searchcriteria.datefrom;
    }
    else {
        RESOURCES.searchcriteria.datefrom = "";
    }
    if (RESOURCES.searchcriteria.dateto != "" && RESOURCES.searchcriteria.dateto != "Invalid Date") {
        $scope.dateTo = RESOURCES.searchcriteria.dateto;
    } else {
        RESOURCES.searchcriteria.dateto = "";
    }
    function daydiff(first, second) {
        return Math.round((second - first) / (1000 * 60 * 60 * 24));
    }
    var daysdifference = daydiff($scope.dateFrom, $scope.dateTo);
    if (daysdifference == 0 || daysdifference == 2 || daysdifference == 5) {
        $scope.classsetactive = daysdifference;
    }
    $scope.locationfrom = RESOURCES.searchcriteria.locationfrom;
    $scope.locationto = RESOURCES.searchcriteria.locationto;
    $scope.type = RESOURCES.searchcriteria.type;
    $http.get(RESOURCES.API_BASE_PATH + 'api/getcountries', { headers: { 'Content-Type': 'application/json' }, }).then(function (results) {
        $scope.countries = results.data.response;
    });
    trans = $('#example').DataTable();
    sender = $('#example1').DataTable();
    var _searchByFilter = function () {
        $scope.submitted = false;
        $scope.transporters = [];
        $scope.senders = [];
        searchService.searchAdvanced($scope.dateFrom, $scope.dateTo, $scope.locationfrom, $scope.locationto, $scope.type).then(function (results) {
            var res = results.data.response;
            $scope.countavailablequantities = 0;
            $scope.submitted = true;
            trans.clear().draw();
            sender.clear().draw();
            if ($scope.type == "Transporter") {
                $scope.senders = [];
                $scope.transporters = res;
                for (i = 0; i < $scope.transporters.length; i++) {
                    var dat = $scope.transporters[i].dep_time.split("-");
                    var day = dat[2].split(" ");
                    $scope.transporters[i].dep_time = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
                    var dat = $scope.transporters[i].arrival_time.split("-");
                    var day = dat[2].split(" ");
                    $scope.transporters[i].arrival_time = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
                    $scope.countavailablequantities = parseFloat($scope.countavailablequantities) + parseFloat($scope.transporters[i].capacity);
                    trans.row.add(["T" + $scope.transporters[i].id, $scope.transporters[i].source, $scope.transporters[i].destination, moment($scope.transporters[i].dep_time).format('DD/MM/YYYY, h:mm a'), moment($scope.transporters[i].arrival_time).format('DD/MM/YYYY, h:mm a'), $scope.transporters[i].capacity, $scope.transporters[i].capacity > 0 ? "<a href='javascript:void(0);' ng-click='createcourierrequest(" + $scope.transporters[i].id + ")' onclick='createcourierrequest(" + $scope.transporters[i].id + ")' class='btn btn-primary'>Create Courier Request</a>" : "<span class='alert-danger'>Fully Booked</span>"]).draw();
                    $compile($('#example').html())($scope);
                }

            } else {
                $scope.transporters = [];
                $scope.senders = res;
                for (i = 0; i < $scope.senders.length; i++) {
                    $scope.countavailablequantities = parseFloat($scope.countavailablequantities) + parseFloat($scope.senders[i].weight);
                    sender.row.add([$scope.senders[i].source, $scope.senders[i].destination, $scope.senders[i].till_date, $scope.senders[i].type == 'E' ? 'Envelope' : $scope.senders[i].type == 'B' ? 'Box' : $scope.senders[i].type == 'P' ? 'Packet' : $scope.senders[i].type, $scope.senders[i].weight, "<a href='javascript:void(0);' ng-click='senderbooknow(" + $scope.senders[i].id + ")' onclick='senderbooknow(" + $scope.senders[i].id + ")' class='btn btn-primary'>Book Now</a>"]).draw();
                    $compile($('#example1').html())($scope);
                }
            }
        });
    }
    $scope.createcourierrequest = function (transportedid) {
        if (AuthService.authentication.isAuth) {
            $state.go('transbooking', { 'id': transportedid });
        } else {
            sessionStorage.setItem("return_url", '/transbooking/' + transportedid);
            $state.go('login');
        }
    }
    $scope.senderbooknow = function (senderid) {
        if (AuthService.authentication.isAuth) {
            $state.go('parcelbooking', { 'id': senderid });
        } else {
            sessionStorage.setItem("return_url", '/parcelbooking/' + senderid);
            $state.go('login');
        }
    }
    $scope.search = function () {
        if ($(".quote_date").val().length > 0) {
            $scope.dateFrom = new Date($(".quote_date").val().split("-")[1] + "/" + $(".quote_date").val().split("-")[0] + "/" + $(".quote_date").val().split("-")[2]);
        }
        if ($(".quote_date1").val().length > 0) {
            $scope.dateTo = new Date($(".quote_date1").val().split("-")[1] + "/" + $(".quote_date1").val().split("-")[0] + "/" + $(".quote_date1").val().split("-")[2]);
        }
        if ($scope.locationto.trim().length == 0 || $scope.locationfrom.trim().length == 0) {
            return;
        }
        if ($scope.locationto.trim() != $scope.locationfrom.trim()) {
            _searchByFilter();
            RESOURCES.searchcriteria.datefrom = $scope.dateFrom;
            RESOURCES.searchcriteria.dateto = $scope.dateTo;
            RESOURCES.searchcriteria.locationfrom = $scope.locationfrom;
            RESOURCES.searchcriteria.locationto = $scope.locationto;
            RESOURCES.searchcriteria.type = $scope.type;
        }
    };
    _searchByFilter();
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
    $scope.setdate = function (days) {
        days = parseInt(days);
        if (days == 0) {
            $scope.classsetactive = 0;
            var date = new Date();
            $scope.dateFrom = new Date();
            $scope.dateTo = date.setDate((new Date()).getDate() + 0);
            $(".quote_date").val(moment($scope.dateFrom).format("DD-MM-YYYY"));
            $(".quote_date1").val(moment($scope.dateTo).format("DD-MM-YYYY"));
        }
        if (days == 2) {
            $scope.classsetactive = 2;
            var date = new Date();
            $scope.dateFrom = new Date();
            $scope.dateTo = date.setDate((new Date()).getDate() + 2);
            $(".quote_date").val(moment($scope.dateFrom).format("DD-MM-YYYY"));
            $(".quote_date1").val(moment($scope.dateTo).format("DD-MM-YYYY"));
        }
        if (days == 5) {
            $scope.classsetactive = 5;
            var date = new Date();
            $scope.dateFrom = new Date();
            $scope.dateTo = date.setDate((new Date()).getDate() + 5);
            $(".quote_date").val(moment($scope.dateFrom).format("DD-MM-YYYY"));
            $(".quote_date1").val(moment($scope.dateTo).format("DD-MM-YYYY"));
        }
    }
    $scope.dt = new Date();
    $scope.disabled = function (date, mode) {
        return (mode === 'day' && false);

    };
    var date = new Date();
    $scope.maxDate = date.setDate((new Date()).getDate() + 180);
    $scope.open0 = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status0.opened = true;

    };
    $scope.open1 = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status1.opened = true;
    };
    $scope.status0 = {
        opened: false
    };
    $scope.status1 = {
        opened: false
    };
    $scope.updatesearchtype = function (type) {
        $scope.type = type;
    }
});
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
    $scope.fillgrid = function () {
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
                        dTable.row.add([(($scope.mainlist[i].channelid > 0) ? "<a href='javascript:void(0);'  onclick='showchat(" + $scope.mainlist[i].channelid + "," + $scope.mainlist[i].id + ")'><span class='glyphicon glyphicon-comment'></span> </a> " : "") + "<a href='/viewparcel/" + $scope.mainlist[i].id + "' title='View parcel'>" + $scope.mainlist[i].ParcelID + "</a>", $scope.mainlist[i].source, $scope.mainlist[i].destination, $scope.mainlist[i].type == 'E' ? 'Envelope' : $scope.mainlist[i].type == 'B' ? 'Box' : $scope.mainlist[i].type == 'P' ? 'Packet' : $scope.mainlist[i].type, $scope.mainlist[i].weight + " kg.", ($scope.mainlist[i].transporterID > 0 ? "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].transporterID + ")'>" + $scope.mainlist[i].MCBTransporterID + "</a>" : "<a href='/viewparcel/" + $scope.mainlist[i].id + "#matches' title='View Trip'>Find Matching Trips</a>"), ($scope.mainlist[i].recv_id > 0 ? "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].recv_id + ")'>" + $scope.mainlist[i].MCBreceiverID + "</a>" : ""), moment($scope.mainlist[i].till_date).format("DD/MM/YYYY"), ($scope.mainlist[i].status == 1 ? "<a href='/viewparcel/" + $scope.mainlist[i].id + "' title='View parcel'>Make Payment</a>" : $scope.mainlist[i].statusdescription), "<div class='dropdown'>    <a href='javascript:void()' data-toggle='dropdown' class='dropdown-toggle'>Action<b class='caret'></b></a>    <ul class='dropdown-menu'>        <li><a href='/viewparcel/" + $scope.mainlist[i].id + "' title='View parcel'>View parcel</a> </li>" + (($scope.mainlist[i].status == 0 || $scope.mainlist[i].status == 1 || $scope.mainlist[i].status == 2) ? "<li> <a href='/editparcel/" + $scope.mainlist[i].id + "' title='Cancel parcel'>Edit parcel</a></li><li> <a href='javascript:void(0);'  onclick='cancelparcellist(" + $scope.mainlist[i].id + ")'   title='Cancel parcel'>Cancel parcel</a> </li>" : "") + ($scope.mainlist[i].status == 4 ? "<li><a href='javascript:void(0);'  onclick='changestatusparcel(" + $scope.mainlist[i].id + ",1)'   title='Cancel Status'>Received</a></li>" : "") + "</ul></div>"]).draw();
                    }
                }
            }
        });
    }
    dTable = $('#example').DataTable({ searching: false });
    $scope.fillgrid();
    var _searchByFilter = function () {
        $scope.list = [];
        if ($(".quote_date").val().length > 0) {
            $scope.departureat = new Date($(".quote_date").val().split("-")[1] + "/" + $(".quote_date").val().split("-")[0] + "/" + $(".quote_date").val().split("-")[2]);
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
                dTable.row.add([(($scope.mainlist[i].channelid > 0) ? "<a href='javascript:void(0);'  onclick='showchat(" + $scope.mainlist[i].channelid + "," + $scope.mainlist[i].id + ")'><span class='glyphicon glyphicon-comment'></span> </a> " : "") + "<a href='/viewparcel/" + $scope.mainlist[i].id + "' title='View parcel'>" + $scope.mainlist[i].ParcelID + "</a>", $scope.mainlist[i].source, $scope.mainlist[i].destination, $scope.mainlist[i].type == 'E' ? 'Envelope' : $scope.mainlist[i].type == 'B' ? 'Box' : $scope.mainlist[i].type == 'P' ? 'Packet' : $scope.mainlist[i].type, $scope.mainlist[i].weight + " kg.", ($scope.mainlist[i].transporterID > 0 ? "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].transporterID + ")'>" + $scope.mainlist[i].MCBTransporterID + "</a>" : "<a href='/viewparcel/" + $scope.mainlist[i].id + "#matches' title='View Trip'>Find Matching Trips</a>"), ($scope.mainlist[i].recv_id > 0 ? "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].recv_id + ")'>" + $scope.mainlist[i].MCBreceiverID + "</a>" : ""), moment($scope.mainlist[i].till_date).format("DD/MM/YYYY"), ($scope.mainlist[i].status == 1 ? "<a href='/viewparcel/" + $scope.mainlist[i].id + "' title='View parcel'>Make Payment</a>" : $scope.mainlist[i].statusdescription), "<div class='dropdown'>    <a href='javascript:void()' data-toggle='dropdown' class='dropdown-toggle'>Action<b class='caret'></b></a>    <ul class='dropdown-menu'>        <li><a href='/viewparcel/" + $scope.mainlist[i].id + "' title='View parcel'>View parcel</a> </li>" + (($scope.mainlist[i].status == 0 || $scope.mainlist[i].status == 1 || $scope.mainlist[i].status == 2) ? "<li> <a href='/editparcel/" + $scope.mainlist[i].id + "' title='Cancel parcel'>Edit parcel</a></li><li> <a href='javascript:void(0);'  onclick='cancelparcellist(" + $scope.mainlist[i].id + ")'   title='Cancel parcel'>Cancel parcel</a> </li>" : "") + ($scope.mainlist[i].status == 4 ? "<li><a href='javascript:void(0);'  onclick='changestatusparcel(" + $scope.mainlist[i].id + ",1)'   title='Cancel Status'>Received</a></li>" : "") + "</ul></div>"]).draw();
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
                        $scope.fillgrid();
                    }
                });
            }
        });
    }
    $scope.changestatusparcel = function (id, status) {
        $scope.successaddtripMessage = "";
        if (status == 1) {
            bootbox.prompt("Enter Feedback about Transporter.", function (result) {
                if (result !== null) {
                    var data = { "id": id, "status": 5, "process_by": sessionStorage.getItem("UserId"), "reason": result };
                    ReceiverService.usrupdatestatus(data).then(function (results) {
                        $scope.successaddtripMessage = "Updated Successfully";
                        if (results.status == 200) {
                            $scope.fillgrid();
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
                            $scope.fillgrid();
                        }
                    });
                }
            });
        }
    }
});
/// <reference path="angular.min.js" />  
/// <reference path="Module.js" />  
/// <reference path="Service.js" />   
angular.module('courier').controller("signupcontroller", function ($scope, $rootScope, $location, locationHistoryService, ValiDatedTokenObject, AuthService, RESOURCES, $modal, $timeout, $base64) {
    if (AuthService.authentication.isAuth) {
        $location.path('/home');
    }
    $scope.registerData = { firstName: '', lastName: '', email: '', countrycode: '', mobilenumber: '', password: '', passwordRepeat: '' };
    $scope.register = function (isValid) {
        $scope.successRegisterMessage = '';
        $scope.errorRegisterDescription = '';
        $scope.errorLoginDescription = '';
        if (!isValid) {
            $scope.errorRegisterDescription = "Please, fill out all fields!";
            return;
        }
        //$scope.registerData.countrycode = $('#registerDatamobilenumber').intlTelInput("getSelectedCountryData").dialCode;
        AuthService.saveRegistration($scope.registerData).then(function (response) {
            if ((response.data.status == "success")) {
                var return_url = sessionStorage.getItem("return_url");
                if (return_url != null) {
                    sessionStorage.removeItem("return_url");
                    $location.path(return_url);
                } else {
                    $location.path('/home');
                }
            }
            else {
                $scope.errorRegisterDescription = response.data.errorMessage;
            }
        }, function (response) {
            var errors = [];
            //for (var key in response.data.ModelState) {
            //    for (var i = 0; i < response.data.ModelState[key].length; i++) {
            //        errors.push(response.data.ModelState[key][i]);
            //    }
            //}
            $scope.errorRegisterDescription = "Failed to register user due to:Check Network Connection " + errors.join(' ');

        });
    };
    $scope.authExternalProvider = function (provider) {

        var redirectUri = location.protocol + '//' + location.host + '/authcomplete.html';

        if (location.pathname.indexOf('Development2') != -1) {
            redirectUri = location.protocol + '//' + location.host + '/Development2/authcomplete.html';
        }
        //


        var externalProviderUrl = RESOURCES.API_BASE_PATH + "Account/ExternalLogin?provider=" + provider
            + "&response_type=token&client_id=" + RESOURCES.CLIENT_ID
            + "&redirect_uri=" + redirectUri;

        window.$windowScope = $scope;

        var oauthWindow = window.open(externalProviderUrl, "Authenticate Account", "location=0,status=0,width=600,height=750");
    };

    $scope.authCompletedCB = function (fragment) {

        $scope.$apply(function () {

            if (fragment.haslocalaccount == 'False') {

                AuthService.logOut();

                AuthService.externalAuthData = {
                    provider: fragment.provider,
                    userName: fragment.external_user_name,
                    externalAccessToken: fragment.external_access_token,
                    email: fragment.email,
                    firstName: fragment.first_name,
                    lastName: fragment.last_name
                };

                $location.path('/associate');

            }
            else {
                //Obtain access token and redirect to orders
                var externalData = { provider: fragment.provider, externalAccessToken: fragment.external_access_token };
                AuthService.obtainAccessToken(externalData).then(function (response) {
                    var return_url = sessionStorage.getItem("return_url");
                    if (return_url != null) {
                        sessionStorage.removeItem("return_url");
                        $location.path(return_url);
                    } else {
                        $location.path('/dashboard');
                    }

                },
                    function (err) {
                        $scope.message = err.error_description;
                    });
            }

        });
    };
    var showHelpWindow = function (templateName) {
        var modalInstance = $modal.open({
            animation: true,
            templateUrl: templateName,
            controller: function () {

            },
            size: 'lg'
        });
    };

    $scope.showTerms = function () {
        showHelpWindow('views/TermsView.html');
    };

    $scope.showPrivacy = function () {
        showHelpWindow('views/PrivacyView.html');
    };

});
/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("transbookingController", function (ParcelService, $state, $location, $scope, ValiDatedTokenObject, AuthService, searchService, $stateParams) {
    var Id = $stateParams.id;
    searchService.gettransporterdetails($stateParams.id).then(function (response) {
        if (response.data.status == "success") {
            $scope.transporter = response.data.response[0];
            $scope.parcelfromloation = $scope.transporter.source;
            $scope.parceltoloation = $scope.transporter.destination;
            $scope.maxcapacity = $scope.transporter.awailableweight;
            $scope.deliverytill = $scope.transporter.arrival_time;
        }
    });
    var userlisttableentity = $('#userlist').DataTable({ searching: false, paging: false });
    $scope.registeremail = "";
    $scope.registername = "";
    if (!AuthService.authentication.isAuth) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
    $scope.changereceiveruser = function () {
        $scope.usersearchvisible = true;
        $scope.$apply();
    }
    $scope.ParcelHeight = 0; $scope.ParcelWidth = 0; $scope.ParcelLength = 0;
    $scope.userlist = [];
    $scope.issummary = false;
    $scope.usersearchclicked = false;
    $scope.usersearchvisible = true;
    $scope.successaddtripMessage = "";
    $scope.totalamount = 0.00;
    $scope.sendinviteuser = function () {
        var EMAIL_REGEXP = /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
        $scope.successaddtripMessage = "";
        $scope.errormessageuser = "";
        if ($scope.registeremail == "" || $scope.registername == "") {
            $scope.errormessageuser = "Please fill all mandatory fields!";
            return;
        }
        if (!EMAIL_REGEXP.test($scope.registeremail)) {
            $scope.errormessageuser = "Please enter a valid Email ID !";
            return;
        }
        var data = { "email": $scope.registeremail, "name": $scope.registername, "number": $scope.registermobile, "message": $scope.registermessage, "UserID": AuthService.authentication.UserId };
        AuthService.inviteuser(data).then(function (results) {
            if (results.status == 200) {
                $scope.successaddtripMessage = "User Invited Successfully";
                $scope.userlist = results.data.response;
                if ($scope.userlist.length > 0) {
                    userlisttableentity.clear().draw();
                    userlisttableentity.row.add([$scope.userlist[0].UserID, $scope.userlist[0].username, $scope.userlist[0].name, $scope.userlist[0].mobile == 0 ? "" : $scope.userlist[0].mobile, ' <a href="javascript:void(0);" onclick="changereceiveruser()">Change</a>']).draw();
                    $scope.usersearchvisible = false;
                }
            }
        });
    }
    function getpriceusingweight(weight) {
        return weight < 0.02 ? 500 : weight < .05 ? 800 : weight < 1 ? 1000 : weight < 2 ? 1950 : weight < 3 ? 2900 : weight < 4 ? 3800 : weight < 5 ? 4700 : weight < 6 ? 5600 : weight < 7 ? 6500 : weight < 8 ? 7400 : weight < 9 ? 8300 : weight <= 10 ? 9200 : 0;
    }
    $scope.paynow = function (isValid) {
        if (!isValid) {
            $scope.errormessage = "Please fill all mandatory fields!";
            return;
        }
        if (AuthService.authentication.isAuth) {
            AuthService.getuserdetails(AuthService.authentication.UserId).then(function (results) {
                if (results.status == 200) {
                    if (results.data.response[0].status == "Y") {
                        if ($scope.userlist.length == 0) {
                            $scope.errormessage = "Please Select receiver !";
                            return;
                        }
                        var amount = getpriceusingweight(parseFloat($scope.ParcelWeight));
                        var datapost = { "source": $scope.parcelfromloation, "destination": $scope.parceltoloation, "till_date": $scope.deliverytill, "type": $scope.parceltype, "weight": parseFloat($scope.ParcelWeight), "height": $scope.ParcelHeight, "width": $scope.ParcelWidth, "length": $scope.ParcelLength, "created": new Date(), "usr_id": sessionStorage.getItem("UserId"), "recv_id": $scope.userlist[0].id, "status": 1, "description": $scope.parceldecsription, "payment": parseFloat(amount), "trans_id": $stateParams.id };
                        ParcelService.AddParcelData(datapost).then(function (results) {
                            if (results.status == 200) {
                                location = "/#viewparcel/" + results.data.response.id;
                            }
                        });
                    }
                    else {
                        $scope.errormessage = "Verification Email Sent on your Email please verify.";
                        return;
                    }
                }
            })
        }
    }
    $scope.deliverytill = new Date();
    $scope.errormessage = "";
    $scope.userlist = [];
    $scope.showheight = false;
    $scope.showwidth = false;
    $scope.showlength = false;
    $scope.exitingemail = ""; $scope.exitingmobilenumber = ""; $scope.value1 = 'true';
    $scope.searchuser = function () {
        $scope.usersearchclicked = false;
        if ((typeof $scope.exitingemail === 'undefined' || $scope.exitingemail === '' || $scope.exitingemail == null) && (typeof $scope.exitingmobilenumber === 'undefined' || $scope.exitingmobilenumber === '' || $scope.exitingmobilenumber == null)) {

        } else {
            console.log(AuthService.authentication.UserId);
            searchService.searchuser($scope.exitingmobilenumber, $scope.exitingemail, AuthService.authentication.UserId).then(function (response) {
                $scope.userlist = response.data.response;
                if ($scope.userlist.length > 0) {
                    userlisttableentity.clear().draw();
                    userlisttableentity.row.add([$scope.userlist[0].UserID, $scope.userlist[0].username, $scope.userlist[0].name, $scope.userlist[0].mobile == 0 ? "" : $scope.userlist[0].mobile, ' <a href="javascript:void(0);" onclick="changereceiveruser()">Change</a>']).draw();
                    $scope.usersearchvisible = false;
                }
                $scope.usersearchclicked = true;
            });
        }
    };
    $scope.checkdimensions = function () {
        if ($scope.parceltype == "B") {
            $scope.showheight = true;
            $scope.showwidth = true;
            $scope.showlength = true;
        } else {
            $scope.showheight = false;
            $scope.showwidth = false;
            $scope.showlength = false;
        }
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

        RESOURCES.searchcriteria.datefrom = new Date($(".quote_datesearch").val().split("-")[1] + "/" + $(".quote_datesearch").val().split("-")[0] + "/" + $(".quote_datesearch").val().split("-")[2]);
        RESOURCES.searchcriteria.dateto = new Date($(".quote_datesearch1").val().split("-")[1] + "/" + $(".quote_datesearch1").val().split("-")[0] + "/" + $(".quote_datesearch1").val().split("-")[2]);
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
});
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
                        dTable.row.add([(($scope.mainlist[i].status == 3 || $scope.mainlist[i].status == 2 || $scope.mainlist[i].status == 6) ? "<a  href='javascript:void(0);'  onclick='findmatchingparcels(" + $scope.mainlist[i].id + ")'   title='Find Matching Parcels'>" + $scope.mainlist[i].TripID + "</a>" : $scope.mainlist[i].TripID), $scope.mainlist[i].source, $scope.mainlist[i].destination, ($scope.mainlist[i].awailableweight == null ? $scope.mainlist[i].capacity : $scope.mainlist[i].awailableweight), $scope.mainlist[i].statusdescription, (($scope.mainlist[i].status == 1 || (($scope.mainlist[i].status == 3 || $scope.mainlist[i].status == 2) && $scope.mainlist[i].awailableweight > 0)) ? "<a href='/viewtrip/" + $scope.mainlist[i].id + "#matches' title='View Trip'>Find Matching Parcels</a>" : "--NA--"), $scope.mainlist[i].flight_no, moment($scope.mainlist[i].dep_time).format("DD/MM/YYYY"), moment($scope.mainlist[i].arrival_time).format("DD/MM/YYYY"), "<div class='dropdown'>    <a href='javascript:void()' data-toggle='dropdown' class='dropdown-toggle'>Action<b class='caret'></b></a>    <ul class='dropdown-menu'>        <li><a href='/viewtrip/" + $scope.mainlist[i].id + "' title='View Trip'>View Trip</a> </li>        <li> <a href='/tripedit/" + $scope.mainlist[i].id + "' title='Edit Trip'>Edit Trip</a> </li>        <li> <a target='" + ($scope.mainlist[i].image.length > 0 ? "_blank" : "_self") + "' href='" + ($scope.mainlist[i].image.length > 0 ? RESOURCES.API_BASE_PATH + $scope.mainlist[i].image : "/uploadtripticket/" + $scope.mainlist[i].id) + "'  title='" + ($scope.mainlist[i].image.length > 0 ? "View Ticket" : "Upload Ticket") + "'>" + ($scope.mainlist[i].image.length > 0 ? "View Ticket" : "Upload Ticket") + "</a> </li><li> <a href='javascript:void(0);'  onclick='canceltriplist(" + $scope.mainlist[i].id + ")'   title='Cancel Trip'>Cancel Trip</a> </li></ul></div>"]).draw();
                    }
                }
            }
        });
    }
    $scope.navigate = function (id, action) {
        RESOURCES.tripid = id;
        $state.transitionTo('login');
    }
    $scope.fillgrid();
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    var _searchByFilter = function () {
        $scope.list = [];
        dTable.clear().draw();
        if ($(".quote_date").val().length > 0) {
            $scope.departureat = new Date($(".quote_date").val().split("-")[1] + "/" + $(".quote_date").val().split("-")[0] + "/" + $(".quote_date").val().split("-")[2]);
        } else {
            $scope.departureat = "";
        }
        RESOURCES.tripsearchcriteria.TransporterID = $scope.TransporterID;
        RESOURCES.tripsearchcriteria.departureat = $scope.departureat;
        RESOURCES.tripsearchcriteria.status = $scope.status;
        for (i = 0; i < $scope.mainlist.length; i++) {
            if (($scope.mainlist[i].status == $scope.status || typeof $scope.status === 'undefined' || $scope.status === '' || $scope.status == null) && ($scope.mainlist[i].dep_time.getDate() == new Date($scope.departureat).getDate() || typeof $scope.departureat === 'undefined' || $scope.departureat === '' || $scope.departureat == null) && (($scope.mainlist[i].TripID).toLowerCase().indexOf($scope.TransporterID.toLowerCase()) != -1 || typeof $scope.TransporterID === 'undefined' || $scope.TransporterID === '' || $scope.TransporterID == null)) {
                $scope.list.push($scope.mainlist[i]);
                dTable.row.add([(($scope.mainlist[i].status == 3 || $scope.mainlist[i].status == 2 || $scope.mainlist[i].status == 6) ? "<a  href='javascript:void(0);'  onclick='findmatchingparcels(" + $scope.mainlist[i].id + ")'   title='Find Matching Parcels'>" + $scope.mainlist[i].TripID + "</a>" : $scope.mainlist[i].TripID), $scope.mainlist[i].source, $scope.mainlist[i].destination, ($scope.mainlist[i].awailableweight == null ? $scope.mainlist[i].capacity : $scope.mainlist[i].awailableweight), $scope.mainlist[i].statusdescription, (($scope.mainlist[i].status == 1 || ($scope.mainlist[i].status == 3 && $scope.mainlist[i].awailableweight > 0)) ? "<a href='/viewtrip/" + $scope.mainlist[i].id + "#matches' title='View Trip'>Find Matching Parcels</a>" : ""), $scope.mainlist[i].flight_no, moment($scope.mainlist[i].dep_time).format("DD/MM/YYYY"), moment($scope.mainlist[i].arrival_time).format("DD/MM/YYYY"), "<div class='dropdown'>    <a href='javascript:void()' data-toggle='dropdown' class='dropdown-toggle'>Action<b class='caret'></b></a>    <ul class='dropdown-menu'>        <li><a href='/viewtrip/" + $scope.mainlist[i].id + "' title='View Trip'>View Trip</a> </li>        <li> <a href='/tripedit/" + $scope.mainlist[i].id + "' title='Cancel Trip'>Edit Trip</a> </li>        <li> <a target='" + ($scope.mainlist[i].image.length > 0 ? "_blank" : "_self") + "' href='" + ($scope.mainlist[i].image.length > 0 ? RESOURCES.API_BASE_PATH + $scope.mainlist[i].image : "/uploadtripticket/" + $scope.mainlist[i].id) + "'  title='" + ($scope.mainlist[i].image.length > 0 ? "View Ticket" : "Upload Ticket") + "'>" + ($scope.mainlist[i].image.length > 0 ? "View Ticket" : "Upload Ticket") + "</a> </li><li> <a href='javascript:void(0);'  onclick='canceltriplist(" + $scope.mainlist[i].id + ")'   title='Cancel Trip'>Cancel Trip</a> </li></ul></div>"]).draw();
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
                var data = { "id": $scope.transporter.id, "status": 3, "process_by": AuthService.authentication.UserId, "reason": "Parcel Collected", "parcelid": id };
                AddTripsService.usrupdatestatus(data).then(function (results) {
                    searchService.gettransporterdetails($scope.transporter.id).then(function (response) {
                        $scope.parcel = response.data.parcel;
                        $scope.transporter = response.data.response[0];
                        $("#userdetails").modal("hide");
                    });
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
                    searchService.gettransporterdetails($scope.transporter.id).then(function (response) {
                        $scope.parcel = response.data.parcel;
                        $scope.transporter = response.data.response[0];
                        $("#userdetails").modal("hide");
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
        bootbox.prompt("Reject Reason?", function (result) {
            if (result !== null) {
                var data = { "id": $scope.transporter.id, "status": 9, "process_by": AuthService.authentication.UserId, "reason": result, "parcelid": id };
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
                var data = { "id": id, "status": 4, "process_by": AuthService.authentication.UserId, "reason": result };
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
    $scope.showchat = function (id, parcelid) {
        $("#userdetails").modal("hide");
        angular.element('.chatmessagepopup').scope().showchat(id, parcelid);
    }
});
/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("uploadtripsticketController", function ($rootScope, $scope, $http, $state, $location, AuthService, AddTripsService, $stateParams, RESOURCES) {
    var Id = $stateParams.id;
    $scope.errormessage = "";
    $scope.ticket = { "base64": "" };
    $scope.successaddtripMessage = "";
    $http.get(RESOURCES.API_BASE_PATH + 'api/getcountries', { headers: { 'Content-Type': 'application/json' }, }).then(function (results) {
        $scope.countries = results.data.response;
    });
    $scope.addtripsdata = function (isValid) {
        $scope.errormessage = '';
        $scope.successaddtripMessage = "";
        if (!isValid) {
            $scope.errormessage = "Please fill all mandatory fields!";
            return;
        }
        if (AuthService.authentication.isAuth) {
            AuthService.getuserdetails(AuthService.authentication.UserId).then(function (results) {
                if (results.status == 200) {
                    if (results.data.response[0].status == "Y") {
                        var datapost = { "id": $stateParams.id };
                        if (typeof $scope.ticket.base64 !== 'undefined' && $scope.ticket.base64 !== '' && $scope.ticket.base64 != null) {
                            datapost['ticket'] = $scope.ticket.base64;
                        }
                        else {
                            datapost['ticket'] = "";
                        }
                        AddTripsService.updateticketTripsData(datapost).then(function (results) {
                            if (results.status == 200) {
                                bootbox.alert("Trip Ticket Added Successfully.", function () {
                                    $state.transitionTo('transporter');
                                });
                                $scope.successaddtripMessage = "Trip Ticket Added Successfully.";
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
    if (!AuthService.authentication.isAuth) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    $scope.search = function () {
        RESOURCES.searchcriteria.datefrom = new Date($(".quote_datesearch").val().split("-")[1] + "/" + $(".quote_datesearch").val().split("-")[0] + "/" + $(".quote_datesearch").val().split("-")[2]);
        RESOURCES.searchcriteria.dateto = new Date($(".quote_datesearch1").val().split("-")[1] + "/" + $(".quote_datesearch1").val().split("-")[0] + "/" + $(".quote_datesearch1").val().split("-")[2]);
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
/**
 * Created by Lalit on 21.05.2016.
 */
/// <reference path="angular.min.js" />  
/// <reference path="Module.js" />  
/// <reference path="Service.js" />   
angular.module('courier').controller("VerifyUserController", function ($scope, $state, $location, locationHistoryService, ValiDatedTokenObject, AuthService, RESOURCES, $modal, $timeout, $stateParams) {
    var Id = $stateParams.id;
    var code = $stateParams.code;
    var data = { "id": Id, "code": code };
    AuthService.verifyuser(data).then(function (responseuser) {
        if (responseuser.data.status == "success") {
            $scope.successverifyuserDescription = "Success ! Your Email is Successfully Verified";
            setTimeout(function () { $state.go('dashboard'); }, 1000);
        }
        else {
            $scope.errorverifyuserDescription = "Error ! Invalid Request";
        }
    });
});

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
            if (typeof $scope.trip != 'undefined') {
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
                        trans.row.add([$scope.tripsmatch[i].TripID, $scope.tripsmatch[i].source, $scope.tripsmatch[i].destination, moment($scope.tripsmatch[i].dep_time).format('DD/MM/YYYY, h:mm a'), moment($scope.tripsmatch[i].arrival_time).format('DD/MM/YYYY, h:mm a'), $scope.tripsmatch[i].capacity, $scope.tripsmatch[i].capacity > 0 ? "<a href='javascript:void(0);' ng-click='createcourierrequest(" + $scope.tripsmatch[i].id + ")' onclick='createcourierrequest(" + $scope.tripsmatch[i].id + ")' class='btn btn-primary'>Create Courier Request</a>" : "<span class='alert-danger'>Fully Booked</span>"]).draw();
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
    $scope.backconfirmbutton = function () {
        $scope.orderlist = [];
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
            bootbox.confirm("Trip weight capacity is less than your need. Do you want to Book with quantity:" + $.grep($scope.tripsmatch, function (a) { return a.id == id })[0].capacity + "?", function (result) {
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
    $scope.confirmpaymentorder = function () {
        if ($scope.orderlist[0].ordernumber == "") {
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
                    $("#txnid").val($scope.orderlist[0].ordernumber);
                    $("#amount").val($scope.orderlist[0].Amount);
                    console.log($scope.orderlist[0]);
                    setTimeout(function () {
                        $("#txnid").val($scope.orderlist[0].ordernumber);
                        $("#amount").val($scope.orderlist[0].Amount);
                        $('#accept-and-pay').attr("action", "/pay.php");
                        console.log($('#accept-and-pay').attr("action"));
                        console.log($("#amount").val());
                        $('#accept-and-pay').submit();
                    }, 500);
                }
            });
        } else {
            $('#accept-and-pay').attr("action", "/pay.php");
            $('#accept-and-pay').submit();
        }
    }
    $scope.generateordernumber = function () {
        if ($scope.usewalletamount && $scope.parcel.payment > $scope.loginuser.wallet) {
            $scope.orderlist = [{ Amount: $scope.parcel.payment - $scope.loginuser.wallet, ordernumber: "" }];
            return;
        }
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
        RESOURCES.searchcriteria.datefrom = new Date($(".quote_datesearch").val().split("-")[1] + "/" + $(".quote_datesearch").val().split("-")[0] + "/" + $(".quote_datesearch").val().split("-")[2]);
        RESOURCES.searchcriteria.dateto = new Date($(".quote_datesearch1").val().split("-")[1] + "/" + $(".quote_datesearch1").val().split("-")[0] + "/" + $(".quote_datesearch1").val().split("-")[2]);
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
/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("viewtripsController", function ($scope, $filter, $http, $state, $location, AuthService, AddTripsService, $stateParams, RESOURCES, searchService) {
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
    $scope.parcellist = [];
    sender = $('#example1').DataTable();
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    var Id = $stateParams.id;
    $scope.parcel = [];
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
                var deptime = $scope.transporter.dep_time.split(" ");
                $scope.transporter.dep_time = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]).getTime();
                var arrtime = $scope.transporter.arrival_time.split(" ");
                $scope.transporter.arrival_time = new Date(arrtime[0].split("-")[1] + "/" + arrtime[0].split("-")[2] + "/" + arrtime[0].split("-")[0] + " " + arrtime[1]).getTime();
                if (response.data.parcellist !== null && typeof response.data.parcellist !== 'undefined') {
                    $scope.parcellist = response.data.parcellist;
                    sender.clear().draw();
                    for (i = 0; i < $scope.parcellist.length; i++) {
                        sender.row.add([$scope.parcellist[i].source, $scope.parcellist[i].destination, $scope.parcellist[i].till_date, $scope.parcellist[i].type == 'E' ? 'Envelope' : $scope.parcellist[i].type == 'B' ? 'Box' : $scope.parcellist[i].type == 'P' ? 'Packet' : $scope.parcellist[i].type, $scope.parcellist[i].weight, $filter('currency')($scope.parcellist[i].payment, "&#8377;"), "<a href='javascript:void(0);' ng-click='senderbooknow(" + $scope.parcellist[i].id + ")' onclick='senderbooknow(" + $scope.parcellist[i].id + ")' class='btn btn-primary'>Book Now</a>"]).draw();
                    }
                } else {
                    $scope.parcellist = [];
                }
                if ($scope.transporter.status == 3 || $scope.transporter.status == 2 || $scope.transporter.status == 6) {
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
    $scope.showchat = function (id, parcelid) {
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
        if (!($.grep($scope.parcellist, function (parcel) { return parcel.id == id })[0].weight <= (parseFloat($scope.transporter.awailableweight == null ? $scope.transporter.capacity : $scope.transporter.awailableweight) + (parseFloat($scope.transporter.awailableweight == null ? $scope.transporter.capacity : $scope.transporter.awailableweight) * .2)))) {
            bootbox.alert("You can't book parcel having weight more than 20% of your available capacity !", function () {
            });
            return false;
        }
        AddTripsService.senderbookingrequest(id, $stateParams.id).then(function (results) {
            if (results.data.status == "success") {
                $scope.successaddtripMessage = results.data.response;
                $scope.filldetails();
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
                        $scope.departureon = new Date($(".quote_date").val().split("-")[1] + "/" + $(".quote_date").val().split("-")[0] + "/" + $(".quote_date").val().split("-")[2] + " " + $scope.dtime.split(":")[0] + ":" + $scope.dtime.split(":")[1].substring(0, 2) + " " + $scope.dtime.split(":")[1].substring(2));
                        $scope.arrivalon = new Date($(".quote_date1").val().split("-")[1] + "/" + $(".quote_date1").val().split("-")[0] + "/" + $(".quote_date1").val().split("-")[2] + " " + $scope.atime.split(":")[0] + ":" + $scope.atime.split(":")[1].substring(0, 2) + " " + $scope.atime.split(":")[1].substring(2));
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
        RESOURCES.searchcriteria.datefrom = new Date($(".quote_datesearch").val().split("-")[1] + "/" + $(".quote_datesearch").val().split("-")[0] + "/" + $(".quote_datesearch").val().split("-")[2]);
        RESOURCES.searchcriteria.dateto = new Date($(".quote_datesearch1").val().split("-")[1] + "/" + $(".quote_datesearch1").val().split("-")[0] + "/" + $(".quote_datesearch1").val().split("-")[2]);
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
angular.module('courier').controller("WidrowamountController", function ($rootScope, $scope, $state, $location, AuthService, searchService) {
    if (!AuthService.authentication.isAuth) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
    $scope.errormessage = '';
    $scope.successMessage = "";
    $scope.paymentlist = [];
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    AuthService.getuserdetails(sessionStorage.getItem("UserId")).then(function (results) {
        if (results.status == 200) {
            $scope.userdetails = results.data.response[0];
            $scope.userdetails.targetamount = parseFloat($scope.userdetails.wallet);
            $scope.userdetails.rbank_act_no = results.data.response[0].bank_act_no;
        }
    });
    searchService.paymentrequestlist(sessionStorage.getItem("UserId")).then(function (results) {
        $scope.paymentlist = results.data.response;
    });
    $scope.submitbankdetails = function (isValid) {
        $scope.errormessage = '';
        $scope.successMessage = "";
        if (!isValid) {
            $scope.errormessage = "Please, fill out all fields!";
            return;
        }
        var datapost = { "trans_id": sessionStorage.getItem("UserId"), "amount": $scope.userdetails.targetamount, "bank_name": $scope.userdetails.bank_name, "acct_no": $scope.userdetails.bank_act_no, "ifsc": $scope.userdetails.bank_ifsc, "status": "N", "created": new Date(), "swift_code": $scope.userdetails.bank_swift_code, "act_name": $scope.userdetails.bank_act_name };
        searchService.createpaymentrequest(datapost).then(function (results) {
            if (results.status == 200) {
                searchService.paymentrequestlist(sessionStorage.getItem("UserId")).then(function (results) {
                    $scope.paymentlist = results.data.response;
                    AuthService.getuserdetails(sessionStorage.getItem("UserId")).then(function (results) {
                        if (results.status == 200) {
                            $scope.userdetails = results.data.response[0];
                            $scope.userdetails.targetamount = parseFloat($scope.userdetails.wallet);
                            $scope.successMessage = "Payment Request Created Successfully";
                            $("#login-modal").modal("hide");
                        }
                    });

                });
            }
        });

    }
});