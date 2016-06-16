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
