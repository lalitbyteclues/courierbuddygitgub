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