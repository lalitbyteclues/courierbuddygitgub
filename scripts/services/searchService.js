/**
 * Created by Lalit 28.05.2016.
 */
angular.module('courier').factory('searchService', ['$http', '$q', 'RESOURCES','ValiDatedTokenObject', function ($http, $q, RESOURCES, ValiDatedTokenObject) {
    ValiDatedTokenObject.setValiDatedTokenObject(JSON.parse(sessionStorage.getItem("ValiDatedTokenObject")));
    var serviceBase = RESOURCES.API_BASE_PATH; 
    var searchServiceFactory = {}; 
    var _searchAdvanced = function (dateFrom, dateTo, locationfrom, locationto, type) {
        params={};
        if (typeof dateFrom !== 'undefined' && dateFrom !== '' && dateFrom != null)
        {
            var date = new Date(dateFrom);
            params['dateFrom'] = moment(date).format('YYYY/MM/DD');
        } else {
            params['dateFrom'] = "";
        }
        if (typeof dateTo !== 'undefined' && dateTo !== '' && dateTo != null)
        {
            var date = new Date(dateTo);
            params['dateTo'] = moment(date).format('YYYY/MM/DD');
        } else {
            params['dateTo'] = "";
        }
        if (typeof locationfrom !== 'undefined' && locationfrom !== '' && locationfrom != null) {
            params['locationfrom'] = locationfrom;
        } else { 
            params['locationfrom'] = "";
        }
        if (typeof locationto !== 'undefined' && locationto !== '' && locationto != null) {
            params['locationto'] = locationto;
        } else {
            params['locationto'] = "";
        }
        if (typeof type !== 'undefined' && type !== '' && type != null) {
            params['type'] = type;
        } else {
            params['type'] = "Transporter";
        }
        return $http.post(serviceBase + 'api/searchhome', { headers: { 'Content-Type': 'application/json' }, params: params }).then(function (results) {
            return results;
        });
    }; 
    var _gettransporterdetails = function (id) {  
        return $http.get(serviceBase + 'api/gettransporterdetail/' + id, {
            headers: {
                'Content-Type': 'application/json', 
            } 
        }).then(function (results) {
            return results;
        });
    };
    var _searchuser = function (mobileno, email, UserId) {
        params = {};
        if (typeof mobileno !== 'undefined' && mobileno !== '' && mobileno != null) { 
            params['mobile'] = mobileno;
        } else {
            params['mobile'] = "";
        }
        if (typeof email !== 'undefined' && email !== '' && email != null) {
            params['email'] = email;
        } else {
            params['email'] = "";
        }
        params['UserId'] = UserId;
        return $http.post(serviceBase + 'api/searchuser', { headers: { 'Content-Type': 'application/json' }, params: params }).then(function (results) {
            return results;
        });
    };
    var _createpaymentrequest = function (data) { 
        return $http.post(serviceBase + 'api/createpaymentrequest', data, { headers: { 'Content-Type': 'application/json' } }).then(function (results) {
            return results;
        });
    };
    var _paymentrequestlist = function (userid) {
        return $http.get(serviceBase + 'api/paymentrequestlist/' + userid, { headers: { 'Content-Type': 'application/json' } }).then(function (results) {
            return results;
        });
    };
    searchServiceFactory.searchuser = _searchuser;
    searchServiceFactory.searchAdvanced = _searchAdvanced; 
    searchServiceFactory.gettransporterdetails = _gettransporterdetails;
    searchServiceFactory.paymentrequestlist = _paymentrequestlist;
    searchServiceFactory.createpaymentrequest = _createpaymentrequest;
    return searchServiceFactory;
}]);