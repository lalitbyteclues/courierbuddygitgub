/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').factory('AirportService', ['$http', '$q', 'RESOURCES','ValiDatedTokenObject', function ($http, $q, RESOURCES, ValiDatedTokenObject) {
    ValiDatedTokenObject.setValiDatedTokenObject(JSON.parse(sessionStorage.getItem("ValiDatedTokenObject")));
    var serviceBase = RESOURCES.API_BASE_PATH; 
    var AirportServiceFactory = {};
    var _getairportslist = function () {
        return $http.get(serviceBase + 'api/getcountries', {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (results) {
            return results;
        });
    };
    var _getzonelist = function () {
        return $http.get(serviceBase + 'api/getzonelist', {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (results) {
            return results;
        });
    };
    var _getseolist = function () {
        return $http.get(serviceBase + 'api/getseolist', {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (results) {
            return results;
        });
    };
    var _getweightrangelist = function () {
        return $http.get(serviceBase + 'api/getweightrangelist', {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (results) {
            return results;
        });
    };
    var _savezonepricelist = function (data) {
        return $http.post(serviceBase + 'api/savezonepricelist', data, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            console.log(response);
            return response;
        });
    };
    var _saveairportdate = function (data) { 
        return $http.post(serviceBase + 'api/saveairportlist', data, {
            headers: {'Content-Type': 'application/json'}
        }).then(function (response) {
            console.log(response);
            return response;
        }); 
    };
    var _saveseolist = function (data) {
        return $http.post(serviceBase + 'api/saveseolist', data, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            console.log(response);
            return response;
        });
    };
    var _saveweightrangelist = function (data) {
        return $http.post(serviceBase + 'api/saveweightrangelist', data, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            console.log(response);
            return response;
        });
    };
    var _deleteairportlist = function (id) {
        return $http.get(serviceBase + 'api/deleteairportlist/' + id, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (results) {
            return results;
        });
    };
    var _deleteseolist = function (id) {
        return $http.get(serviceBase + 'api/deleteseolist/' + id, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (results) {
            return results;
        });
    };
    var _deletepricerecord = function (id) {
        return $http.get(serviceBase + 'api/deleteweightrangelist/' + id, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (results) {
            return results;
        });
    };
    var _getpricelist = function () {
        return $http.get(serviceBase + 'api/getzonepricelist', {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (results) {
            return results;
        });
    }; 
    var _deletepricelist = function (id) {
        return $http.get(serviceBase + 'api/deleteairportlist/' + id, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (results) {
            return results;
        });
    }; 
    AirportServiceFactory.getzonelist = _getzonelist; 
    AirportServiceFactory.getseolist = _getseolist; 
    AirportServiceFactory.getweightrangelist = _getweightrangelist;
    AirportServiceFactory.getairportslist = _getairportslist;
    AirportServiceFactory.saveairportdate = _saveairportdate; 
    AirportServiceFactory.saveseolist = _saveseolist;  
    AirportServiceFactory.saveweightrangelist = _saveweightrangelist;
    AirportServiceFactory.savezonepricelist = _savezonepricelist;
    AirportServiceFactory.deleteairportlist = _deleteairportlist; 
    AirportServiceFactory.deleteseolist = _deleteseolist;
    AirportServiceFactory.deletepricerecord = _deletepricerecord;
    AirportServiceFactory.getpricelist = _getpricelist; 
    AirportServiceFactory.deletepricelist = _deletepricelist;
    return AirportServiceFactory;
}]);