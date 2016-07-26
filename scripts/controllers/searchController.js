angular.module('courier').controller("searchController", function ($scope, $location, $state, $http, $timeout, RESOURCES, searchService, AuthService, $filter, $compile) {
    $scope.transporters = [];
    $scope.classsetactive = 2;
    $scope.senders = [];
    $scope.authuser = AuthService.authentication;
    $scope.countries = [];
    $scope.submitted = true;
    $scope.countavailablequantities = 0;
    if (RESOURCES.searchcriteria.datefrom != "" && RESOURCES.searchcriteria.datefrom !="Invalid Date")
    {
        $scope.dateFrom = RESOURCES.searchcriteria.datefrom;
    }
    else
    {
        RESOURCES.searchcriteria.datefrom = "";
    }
    if (RESOURCES.searchcriteria.dateto != "" && RESOURCES.searchcriteria.dateto != "Invalid Date")
    {
        $scope.dateTo = RESOURCES.searchcriteria.dateto;
    } else {
        RESOURCES.searchcriteria.dateto = "";
    }
    function daydiff(first, second) {
        return Math.round((second - first) / (1000 * 60 * 60 * 24));
    } 
    var daysdifference = daydiff($scope.dateFrom, $scope.dateTo);
    if (daysdifference == 0 || daysdifference == 2 || daysdifference == 5)
    {
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