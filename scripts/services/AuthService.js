/**
 * Created by Lalit on 18.04.2016.
 */
angular.module('courier').factory("AuthService", ['$http', '$q', 'ValiDatedTokenObject', 'RESOURCES', function ($http, $q, ValiDatedTokenObject, RESOURCES) {
    function isInArray(value, array) {
        return array.indexOf(value) > -1;
    }
    var serviceBase = RESOURCES.API_BASE_PATH;
    var authServiceFactory = {};
    var _authentication = { isAuth: false, userName: "", isUser: false, isAdministrator: false,UserId:"",isActive:false };
    var _externalAuthData = { provider: "", userName: "", externalAccessToken: "", email: "", firstName: "", lastName: "" };
    var _getReferences = function () {
        var referralObj = sessionStorage.getItem("reference_friend_ids");
        var referralsArr = [];
        if (referralObj != null) {
            referralsArr = JSON.parse(referralObj);
            if (referralsArr == null) {
                referralsArr = [];
            }
        }
        return referralsArr;
    };
    var _deleteReferences = function () {
        sessionStorage.removeItem("reference_friend_ids");
    };
    var _trackReferences = function () {
        var model = {};
        model.referenceIds = _getReferences(); 
        if (_authentication.isUser && model.referenceIds.length > 0) {
            $http.post(serviceBase + 'tracking/references', model, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': ValiDatedTokenObject.getValiDatedTokenObject().token_type + " " + ValiDatedTokenObject.getValiDatedTokenObject().access_token
                }
            }).then(function (response) {
                _deleteReferences();
                return response;
            });
        } else {
            _deleteReferences();
        }
    }; 
    var _getReferrals = function () {
        var referralObj = sessionStorage.getItem("referrals");
        var referralsArr = [];
        if (referralObj != null) {
            referralsArr = JSON.parse(referralObj);
            if (referralsArr == null) {
                referralsArr = [];
            }
        }
        return referralsArr;
    }; 
    var _deleteReferrals = function () {
        sessionStorage.removeItem("referrals");
    }; 
    var _trackReferrals = function () { 
        var model = {}; 
        model.referralIds = _getReferrals(); 
        if (_authentication.isUser && model.referralIds.length > 0) {
            $http.post(serviceBase + 'tracking/referrals', model, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': ValiDatedTokenObject.getValiDatedTokenObject().token_type + " " + ValiDatedTokenObject.getValiDatedTokenObject().access_token
                }
            }).then(function (response) {
                _deleteReferrals();
                return response;
            });
        } else {
            _deleteReferrals();
        }
    }; 
    var _saveRegistration = function (registration) {
        _logOut();
        var deferred = $q.defer();
        return $http.post(serviceBase + 'api/registeruser', registration).then(function (response) { 
            if (response.data.status == "success") {
                ValiDatedTokenObject.setValiDatedTokenObject(response.data.response);
                sessionStorage.setItem("ValiDatedTokenObject", JSON.stringify(ValiDatedTokenObject.getValiDatedTokenObject()));
                _authentication.isAuth = true;
                _authentication.userName = response.data.response[0].name;
                _authentication.isUser = (parseInt(response.data.response[0].role_id) == 2);
                _authentication.isAdministrator = (parseInt(response.data.response[0].role_id) == 1);
                _authentication.UserId = response.data.response[0].id;
                _authentication.isActive = false;
                sessionStorage.setItem("UserId", response.data.response[0].id); 
                deferred.resolve(response);
                return response;
            } else { deferred.resolve(response); return response; }
        });
    };
    var _verifyuser = function (data) {
        var deferred = $q.defer();
        return $http.post(serviceBase + 'api/verifyuser', data).then(function (response) { 
            return response;
        });
    };
    var _inviteuser = function (data) {
        var deferred = $q.defer();
        return $http.post(serviceBase + 'api/sendinvite', data).then(function (response) {
            return response;
        });
    };
    var _login = function (loginData) {  
        var deferred = $q.defer();
        $http({method: 'POST', url: serviceBase + "api/getloginuser", data: { 'email': loginData.userName, 'password': loginData.password },headers: { 'Content-Type': 'application/json' }}).success(function (response) {
            if (response.status == "success") {
                ValiDatedTokenObject.setValiDatedTokenObject(response.response);
                sessionStorage.setItem("ValiDatedTokenObject", JSON.stringify(ValiDatedTokenObject.getValiDatedTokenObject())); 
                _authentication.isAuth = true;
                _authentication.userName = response.response[0].name;
                _authentication.isUser = (parseInt(response.response[0].role_id) == 2);
                _authentication.isAdministrator = (parseInt(response.response[0].role_id) == 1);
                _authentication.UserId = response.response[0].id;
                _authentication.isActive = (response.response[0].status == "Y");
                sessionStorage.setItem("UserId", response.response[0].id); 
                deferred.resolve(response);
            } else { deferred.resolve(response); }
        }).error(function (response) {
            _logOut();
            deferred.reject(err);
        }); 
        return deferred.promise; 
    }; 
    var _logOut = function () {
        sessionStorage.removeItem("ValiDatedTokenObject");
        _authentication.isAuth = false;
        _authentication.userName = "";
        _authentication.isUser = false;
        _authentication.isAdministrator = false;
        _authentication.UserId = "";
        _authentication.isActive = false;
        sessionStorage.removeItem("UserId"); 
    };

    var _fillAuthData = function () {
        var authData = sessionStorage.getItem("ValiDatedTokenObject") 
        if (authData) {
            ValiDatedTokenObject.setValiDatedTokenObject(JSON.parse(authData));
            authData = ValiDatedTokenObject.getValiDatedTokenObject(); 
            _authentication.isAuth = true;
            _authentication.isUser = (parseInt(authData[0].role_id) == 2);
            _authentication.isAdministrator = (parseInt(authData[0].role_id) == 1);
            _authentication.UserId = authData[0].id;
            _authentication.isActive = (authData[0].status == "Y");
            sessionStorage.setItem("UserId", authData[0].id); 
            _authentication.userName = authData[0].name; 
        }
    };
    var _obtainAccessToken = function (externalData) {
       var deferred = $q.defer();
        $http.get(serviceBase + 'account/ObtainLocalAccessToken', { params: { provider: externalData.provider, externalAccessToken: externalData.externalAccessToken } }).success(function (response) {
            var isUser = response.roles == "User";
            var isAdministrator = response.roles == "Admin";
            response['isUser'] = isUser;
            response['isAdministrator'] = isAdministrator;
            ValiDatedTokenObject.setValiDatedTokenObject(response);
            sessionStorage.setItem("ValiDatedTokenObject", JSON.stringify(ValiDatedTokenObject.getValiDatedTokenObject()));
            _authentication.isAuth = true;
            _authentication.userName = response.userName;
            _authentication.isUser = isUser;
            _authentication.isAdministrator = isAdministrator;
            _trackReferrals();
            _trackReferences();
            deferred.resolve(response);
           }).error(function (err, status) {
            _logOut();
            deferred.reject(err);
        });
      return deferred.promise;
     };
    var _getuserdetails = function (UserID) {
        return $http.get(serviceBase + 'api/getuserdetails/' + UserID, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (results) {
            return results;
        });
    };
    var _getuserslist = function (UserID) {
        return $http.get(serviceBase + 'api/getuserslist', {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (results) {
            return results;
        });
    };
    var _getchatlist = function (channelid) {
        return $http.get(serviceBase + 'api/getchannelmessageslist/' + channelid, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (results) {
            return results;
        });
    };
    var _resetPasswordToken = function (resetPasswordTokenData) {
        return $http.post(serviceBase + 'account/resetpasswordtoken', resetPasswordTokenData).then(function (response) {
            return response;
        });
    };
    var _resetPassword = function (resetPasswordData) {
        return $http.post(serviceBase + 'api/forgetpassword', resetPasswordData).then(function (response) {
            return response;
        });
    };
    var _updateuserdetails = function (data) { 
        return $http.post(serviceBase + 'api/updateuserdetails', data).then(function (response) {
            return response;
        });
    };
    var _changepassword = function (data) {
        return $http.post(serviceBase + 'api/changepassword', data).then(function (response) {
            return response;
        });
    };
    authServiceFactory.saveRegistration = _saveRegistration;
    authServiceFactory.login = _login;
    authServiceFactory.logOut = _logOut;
    authServiceFactory.fillAuthData = _fillAuthData;
    authServiceFactory.authentication = _authentication;
    authServiceFactory.obtainAccessToken = _obtainAccessToken;
    authServiceFactory.externalAuthData = _externalAuthData;
    authServiceFactory.getuserdetails = _getuserdetails; 
    authServiceFactory.getuserslist = _getuserslist;
    authServiceFactory.getchatlist = _getchatlist;
    authServiceFactory.resetPasswordToken = _resetPasswordToken;
    authServiceFactory.resetPassword = _resetPassword;
    authServiceFactory.changepassword = _changepassword;
    authServiceFactory.updateuserdetails = _updateuserdetails; 
    authServiceFactory.verifyuser = _verifyuser;
    authServiceFactory.inviteuser = _inviteuser;
    return authServiceFactory;
}]);