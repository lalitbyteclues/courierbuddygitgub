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
