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
            $scope.maxcapicity = $scope.transporter.awailableweight;
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