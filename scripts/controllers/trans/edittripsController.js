/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("edittripsController", function ($rootScope, $scope, $http, $state, $location, AuthService, AddTripsService, $stateParams, RESOURCES, searchService) {
    var Id = $stateParams.id;
    $http.get(RESOURCES.API_BASE_PATH + 'api/getcountries', { headers: { 'Content-Type': 'application/json' }, }).then(function (results) {
        $scope.countries = results.data.response;
    });
    searchService.gettransporterdetails($stateParams.id).then(function (response) {
        if (response.data.status == "success")
        { 
            $scope.transporter = response.data.response[0];
            $scope.locationfrom = $scope.transporter.source;
            $scope.locationto = $scope.transporter.destination;
            var dat = $scope.transporter.dep_time.split("-");
            var day = dat[2].split(" ");
            if (AuthService.authentication.UserId != $scope.transporter.t_id)
            {
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
                else
                {
                    this.modal("hide");
                    return false;
                }
            });
        }
        else
        {
            savetripdata();
        }
      
    }
    function savetripdata() {
        if (AuthService.authentication.isAuth) {
            AuthService.getuserdetails(AuthService.authentication.UserId).then(function (results) {
                if (results.status == 200) {
                    if (results.data.response[0].status == "Y") {
                        var result = document.getElementsByClassName("quote_date");
                        $scope.departureon = new Date(result.d_date.value.split("-")[1] + "/" + result.d_date.value.split("-")[0] + "/" + result.d_date.value.split("-")[2] + " " + $scope.dtime);
                        var deptime = result.d_date.value.split("-")[2] + "/" + result.d_date.value.split("-")[1] + "/" + result.d_date.value.split("-")[0] + " " + $scope.dtime;
                        result = document.getElementsByClassName("quote_date1");
                        $scope.atime = moment($scope.arrivalon).format("h:mm");
                        $scope.arrivalon = new Date(result.a_date.value.split("-")[1] + "/" + result.a_date.value.split("-")[0] + "/" + result.a_date.value.split("-")[2] + " " + $scope.atime);
                        var arrivaltime = result.a_date.value.split("-")[2] + "/" + result.a_date.value.split("-")[1] + "/" + result.a_date.value.split("-")[0] + " " + $scope.atime;
                        $scope.arrivalon = new Date(result.a_date.value.split("-")[1] + "/" + result.a_date.value.split("-")[0] + "/" + result.a_date.value.split("-")[2] + " " + $scope.atime.split(":")[0] + ":" + $scope.atime.split(":")[1].substring(0, 2) + " " + $scope.atime.split(":")[1].substring(2));
                        if (!angular.isDate($scope.departureon)) {
                            $scope.errormessage = "Invalid Depa!";
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
    function convertUTCDateToLocalDate(date) {
        var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);

        var offset = date.getTimezoneOffset() / 60;
        var hours = date.getHours();

        newDate.setHours(hours - offset);

        return newDate;
    } 
});