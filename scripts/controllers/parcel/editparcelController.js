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
    }
    ParcelService.getparceldetail($stateParams.id).then(function (response) {
        if (response.data.status == "success") {
            $scope.parcel = response.data.response[0];
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
                        var result = document.getElementsByClassName("quote_date");
                        if (result.data.value.length == 0) {
                            $scope.errormessage = "Departure Time Required!";
                            return;
                        }
                        $scope.deliverytill = new Date(result.data.value.split("-")[1] + "/" + result.data.value.split("-")[0] + "/" + result.data.value.split("-")[2] + " ");
                        var amount = getpriceusingweight(parseFloat($scope.ParcelWeight));
                        var datapost = { "source": $scope.parcelfromloation, "destination": $scope.parceltoloation, "till_date": result.data.value.split("-")[2] + "/" + result.data.value.split("-")[1] + "/" + result.data.value.split("-")[0], "type": $scope.parceltype, "weight": parseFloat($scope.ParcelWeight), "height": $scope.ParcelHeight, "width": $scope.ParcelWidth, "length": $scope.ParcelLength, "usr_id": sessionStorage.getItem("UserId"), "recv_id": $scope.userlist[0].id, "description": $scope.parceldecsription, "payment": parseFloat(amount), "id": $stateParams.id, "trans_id": "", "status": $scope.status };
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
});