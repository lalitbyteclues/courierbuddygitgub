/**
 * Created by Lalit 28.05.2016.
 */
angular.module('courier').factory('AddTripsService', ['$http', '$q', 'RESOURCES','ValiDatedTokenObject', function ($http, $q, RESOURCES, ValiDatedTokenObject) {
    ValiDatedTokenObject.setValiDatedTokenObject(JSON.parse(sessionStorage.getItem("ValiDatedTokenObject")));
    var serviceBase = RESOURCES.API_BASE_PATH; 
    var AddTripsServiceFactory = {};

    var _AddTripsData = function (data) {
        return $http.post(serviceBase + 'api/addtrip', data, {
            headers: {'Content-Type': 'application/json'}
        }).then(function (response) { 
            return response;
        }); 
    };
    var _updateTripsData = function (data) {
        return $http.post(serviceBase + 'api/updatetrip', data, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            return response;
        });
    };
    var _updateticketTripsData = function (data) {
        return $http.post(serviceBase + 'api/updatetripticket', data, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            return response;
        });
    };
    var _cancelparcelbytransporter = function (data) {
        return $http.post(serviceBase + 'api/cancelparcelbytransporter', data, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            return response;
        });
    };
    var _updatestatus = function (data) {
        return $http.post(serviceBase + 'api/updatetripstatus', data, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            return response;
        });
    };
    var _usrupdatestatus = function (data) {
        return $http.post(serviceBase + 'api/usrupdatetripstatus', data, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            return response;
        });
    };
    var _deletetrip = function (data) {
        return $http.post(serviceBase + 'api/deletesingletrip', data, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            return response;
        });
    };
    var _getTripsList = function (UserID) {
        return $http.get(serviceBase + 'api/triplist/' + UserID, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (results) {
            return results;
        });
    };
    var _senderbookingrequest = function (parcelid,tripid) {
        return $http.get(serviceBase + 'api/senderbookingrequest/' + parcelid + '/' + tripid, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (results) {
            return results;
        });
    };
    var _getTripsListall = function () {
        return $http.get(serviceBase + 'api/triplistall/', {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (results) {
            return results;
        });
    };
    var _getcalcelledTripsList = function (UserID) {
        return $http.get(serviceBase + 'api/canceltripslist/' + UserID, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (results) {
            return results;
        });
    };
    AddTripsServiceFactory.AddTripsData = _AddTripsData; 
    AddTripsServiceFactory.updateticketTripsData = _updateticketTripsData;
    AddTripsServiceFactory.updateTripsData = _updateTripsData;
    AddTripsServiceFactory.getTripsList = _getTripsList;
    AddTripsServiceFactory.getTripsListall = _getTripsListall;
    AddTripsServiceFactory.getcalcelledTripsList = _getcalcelledTripsList; 
    AddTripsServiceFactory.updatestatus = _updatestatus;
    AddTripsServiceFactory.cancelparcelbytransporter = _cancelparcelbytransporter;
    AddTripsServiceFactory.usrupdatestatus = _usrupdatestatus;
    AddTripsServiceFactory.deletetrip = _deletetrip; 
    AddTripsServiceFactory.senderbookingrequest = _senderbookingrequest; 
    return AddTripsServiceFactory;
}]);