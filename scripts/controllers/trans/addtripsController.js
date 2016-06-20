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
                        var result = document.getElementsByClassName("quote_date");
                        if (result.d_date.value.length == 0) {
                            $scope.errormessage = "Departure Time Required!";
                            return;
                        }
                        $scope.departureon = new Date(result.d_date.value.split("-")[1] + "/" + result.d_date.value.split("-")[0] + "/" + result.d_date.value.split("-")[2] + " " + $scope.dtime.split(":")[0] + ":" + $scope.dtime.split(":")[1].substring(0, 2) + " " + $scope.dtime.split(":")[1].substring(2));
                        var dep_time = "";
                        if ($scope.dtime.split(":")[1].substring(2) == "pm" && parseInt($scope.dtime.split(":")[0]) < 12) {
                            dep_time = result.d_date.value.split("-")[2] + "/" + result.d_date.value.split("-")[1] + "/" + result.d_date.value.split("-")[0] + " " + (parseInt($scope.dtime.split(":")[0]) + 12) + ":" + $scope.dtime.split(":")[1].substring(0, 2);
                        }
                        else {
                            dep_time = result.d_date.value.split("-")[2] + "/" + result.d_date.value.split("-")[1] + "/" + result.d_date.value.split("-")[0] + " " + $scope.dtime.split(":")[0] + ":" + $scope.dtime.split(":")[1].substring(0, 2);
                        }

                        var result = document.getElementsByClassName("quote_date1");
                        if (result.a_date.value.length == 0) {
                            $scope.errormessage = "Arrival Time Required!";
                            return;
                        }
                        $scope.atime = angular.element('#setTimeExample1').val();
                        $scope.arrivalon = new Date(result.a_date.value.split("-")[1] + "/" + result.a_date.value.split("-")[0] + "/" + result.a_date.value.split("-")[2] + " " + $scope.atime.split(":")[0] + ":" + $scope.atime.split(":")[1].substring(0, 2) + " " + $scope.atime.split(":")[1].substring(2));
                        var arrivaltime = "";
                        if ($scope.atime.split(":")[1].substring(2).toLowerCase() == "pm" && parseInt($scope.atime.split(":")[0]) < 12) {
                            arrivaltime = result.a_date.value.split("-")[2] + "/" + result.a_date.value.split("-")[1] + "/" + result.a_date.value.split("-")[0] + " " + (parseInt($scope.atime.split(":")[0]) + 12) + ":" + $scope.atime.split(":")[1].substring(0, 2);
                        }
                        else {
                            arrivaltime = result.a_date.value.split("-")[2] + "/" + result.a_date.value.split("-")[1] + "/" + result.a_date.value.split("-")[0] + " " + $scope.atime.split(":")[0] + ":" + $scope.atime.split(":")[1].substring(0, 2);
                        }
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
        var result = document.getElementsByClassName("quote_date");
        if (result.d_date.value.length == 0) {
            $scope.arrivalon = "";
            return;
        } else {
            if (parseInt($scope.tripduration) > 0) {
                d = new Date(result.d_date.value.split("-")[1] + "/" + result.d_date.value.split("-")[0] + "/" + result.d_date.value.split("-")[2] + " " + $scope.dtime.split(":")[0] + ":" + $scope.dtime.split(":")[1].substring(0, 2) + " " + $scope.dtime.split(":")[1].substring(2));;
                var totalseconds = parseFloat($scope.tripduration * 60);
                var indtotime = (d.getTime() + (1000 * totalseconds));
                $scope.arrivalon = indtotime;
            } else {
                $scope.arrivalon = new Date(result.d_date.value.split("-")[1] + "/" + result.d_date.value.split("-")[0] + "/" + result.d_date.value.split("-")[2] + " " + $scope.dtime.split(":")[0] + ":" + $scope.dtime.split(":")[1].substring(0, 2) + " " + $scope.dtime.split(":")[1].substring(2));;
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
            var d = new Date(result.d_date.value.split("-")[1] + "/" + result.d_date.value.split("-")[0] + "/" + result.d_date.value.split("-")[2] + " " + $scope.dtime.split(":")[0] + ":" + $scope.dtime.split(":")[1].substring(0, 2) + " " + $scope.dtime.split(":")[1].substring(2));
            var totalseconds = parseFloat($scope.tripduration * 60);
            var indtotime = (d.getTime() + (1000 * totalseconds));
            var centraltime = new Date(indtotime).getTime() + (-(locfrom.zone * 60) * 60000);
            $scope.arrivalon = calcTime(centraltime, locto.zone); 
        }
    }
    $scope.changeduration = function () {
        var result = document.getElementsByClassName("quote_date"); 
        if (result.d_date.value.length == 0) {
            $scope.arrivalon = "";
            return;
        } else { 
            if (parseInt($scope.tripduration) > 0) {
               d = new Date(result.d_date.value.split("-")[1] + "/" + result.d_date.value.split("-")[0] + "/" + result.d_date.value.split("-")[2] + " " + $scope.dtime.split(":")[0] + ":" + $scope.dtime.split(":")[1].substring(0, 2) + " " + $scope.dtime.split(":")[1].substring(2));;
               var totalseconds = parseFloat($scope.tripduration * 60); 
               var indtotime = (d.getTime() + (1000 * totalseconds)); 
                $scope.arrivalon = indtotime;
            } else {
                $scope.arrivalon = new Date(result.d_date.value.split("-")[1] + "/" + result.d_date.value.split("-")[0] + "/" + result.d_date.value.split("-")[2] + " " + $scope.dtime.split(":")[0] + ":" + $scope.dtime.split(":")[1].substring(0, 2) + " " + $scope.dtime.split(":")[1].substring(2));;
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
            var d = new Date(result.d_date.value.split("-")[1] + "/" + result.d_date.value.split("-")[0] + "/" + result.d_date.value.split("-")[2] + " " + $scope.dtime.split(":")[0] + ":" + $scope.dtime.split(":")[1].substring(0, 2) + " " + $scope.dtime.split(":")[1].substring(2));
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
        var result = document.getElementsByClassName("quote_datesearch"); 
        RESOURCES.searchcriteria.datefrom = new Date(result.data.value.split("-")[1] + "/" + result.data.value.split("-")[0] + "/" + result.data.value.split("-")[2]);
        result = document.getElementsByClassName("quote_datesearch1");
        RESOURCES.searchcriteria.dateto = new Date(result.data.value.split("-")[1] + "/" + result.data.value.split("-")[0] + "/" + result.data.value.split("-")[2]);
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