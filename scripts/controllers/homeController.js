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