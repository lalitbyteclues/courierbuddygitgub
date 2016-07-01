/**
 * Created by Lalit 28.05.2016.
 */
angular.module('courier').factory('ReceiverService', ['$http', '$q', 'RESOURCES', 'ValiDatedTokenObject', function ($http, $q, RESOURCES, ValiDatedTokenObject) {
    ValiDatedTokenObject.setValiDatedTokenObject(JSON.parse(sessionStorage.getItem("ValiDatedTokenObject")));
    var serviceBase = RESOURCES.API_BASE_PATH;
    var ReceiverServiceFactory = {}; 
    var _AddParcelData = function (data) {
        return $http.post(serviceBase + 'api/addparcel', data, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            return response;
        });
    };
    var _updateParcelData = function (data) { 
        return $http.post(serviceBase + 'api/updateparcel', data, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            return response;
        });
    };
    var _updatestatus = function (data) {
        return $http.post(serviceBase + 'api/updateParceltatus', data, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            return response;
        });
    };
    var _submitchat = function (data) {
        return $http.post(serviceBase + 'api/chatsubmit', data, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            return response;
        });
    };
    var _usrupdatestatus = function (data) {
        return $http.post(serviceBase + 'api/usrupdateParceltatus', data, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            return response;
        });
    };
    var _generateordernumber = function (data) {
        return $http.post(serviceBase + 'api/generateordernumber', data, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            return response;
        });
    };
    var _deletetrip = function (data) {
        return $http.post(serviceBase + 'api/deletesingleparcel', data, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            return response;
        });
    };
    var _getreceiverlist = function (UserID) {
        return $http.get(serviceBase + 'api/receiverlist/' + UserID, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (results) {
            return results;
        });
    };
    var _getParcelListall = function () {
        return $http.get(serviceBase + 'api/parcellistall/', {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (results) {
            return results;
        });
    };
    var _getcalcelledParcelList = function (UserID) {
        return $http.get(serviceBase + 'api/cancelparcellist/' + UserID, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (results) {
            return results;
        });
    };
    var _getrefundedParcelList = function (UserID) {
        return $http.get(serviceBase + 'api/refundedparcellist/' + UserID, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (results) {
            return results;
        });
    };
    var _getparceldetail = function (id) {
        return $http.get(serviceBase + 'api/getparceldetail/'+id,{headers:{'Content-Type':'application/json',}}).then(function (results) {
            return results;
        });
    };
    ReceiverServiceFactory.AddParcelData = _AddParcelData;
    ReceiverServiceFactory.updateParcelData = _updateParcelData;
    ReceiverServiceFactory.getreceiverlist = _getreceiverlist;
    ReceiverServiceFactory.getParcelListall = _getParcelListall;
    ReceiverServiceFactory.getcalcelledParcelList = _getcalcelledParcelList;
    ReceiverServiceFactory.getrefundedParcelList = _getrefundedParcelList;
    ReceiverServiceFactory.updatestatus = _updatestatus;
    ReceiverServiceFactory.submitchat = _submitchat;
    ReceiverServiceFactory.usrupdatestatus = _usrupdatestatus;
    ReceiverServiceFactory.deletetrip = _deletetrip;
    ReceiverServiceFactory.getparceldetail = _getparceldetail;
    ReceiverServiceFactory.generateordernumber = _generateordernumber;
    return ReceiverServiceFactory;
}]);