/**
 * Created by Lalit 16.05.2016.
 *Modify by Lalit   18.06.2016 --added wallet statement service
 */
angular.module('courier').factory('ParcelService', ['$http', '$q', 'RESOURCES', 'ValiDatedTokenObject', function ($http, $q, RESOURCES, ValiDatedTokenObject) {
    ValiDatedTokenObject.setValiDatedTokenObject(JSON.parse(sessionStorage.getItem("ValiDatedTokenObject")));
    var serviceBase = RESOURCES.API_BASE_PATH;
    var ParcelServiceFactory = {}; 
    var _AddParcelData = function (data) {
        return $http.post(serviceBase + 'api/addparcel', data, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            return response;
        });
    };
    var _calculateamount = function (data) {
        return $http.post(serviceBase + 'api/calculateamount', data, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            return response;
        });
    };
    var _addcontacts = function (data) {
        return $http.post(serviceBase + 'api/addcontacts', data, {
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
    var _updateparcelweight = function (data) {
        return $http.post(serviceBase + 'api/updateparcelweight', data, {
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
    var _getParcelList = function (UserID) {
        return $http.get(serviceBase + 'api/parcellist/' + UserID, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (results) {
            return results;
        });
    }; 
    var _getParcelListall = function (data) {
        return $http.post(serviceBase + 'api/parcellistall', data, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (results) {
            return results;
        });
    };
    var _getallbookinglist = function (data) {
        return $http.post(serviceBase + 'api/allbookinglist', data, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (results) {
            return results;
        });
    };
    var _contactslist = function () {
        return $http.get(serviceBase + 'api/contactslist', {
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
    var _getwalletstatement = function (UserID) {
        return $http.get(serviceBase + 'api/getwalletstatement/' + UserID, {
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
    ParcelServiceFactory.addcontacts = _addcontacts;
    ParcelServiceFactory.AddParcelData = _AddParcelData;
    ParcelServiceFactory.calculateamount = _calculateamount;
    ParcelServiceFactory.updateParcelData = _updateParcelData; 
    ParcelServiceFactory.updateparcelweight = _updateparcelweight;
    ParcelServiceFactory.getParcelList = _getParcelList;
    ParcelServiceFactory.getParcelListall = _getParcelListall; 
    ParcelServiceFactory.getallbookinglist = _getallbookinglist; 
    ParcelServiceFactory.contactslist = _contactslist;
    ParcelServiceFactory.getcalcelledParcelList = _getcalcelledParcelList;
    ParcelServiceFactory.getrefundedParcelList = _getrefundedParcelList;
    ParcelServiceFactory.getwalletstatement = _getwalletstatement;
    ParcelServiceFactory.updatestatus = _updatestatus;
    ParcelServiceFactory.usrupdatestatus = _usrupdatestatus;
    ParcelServiceFactory.deletetrip = _deletetrip;
    ParcelServiceFactory.getparceldetail = _getparceldetail;
    ParcelServiceFactory.generateordernumber = _generateordernumber;
    return ParcelServiceFactory;
}]);