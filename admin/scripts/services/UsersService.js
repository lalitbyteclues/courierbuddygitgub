/**
 * Created by Lalit 28.05.2016.
 */
angular.module('courier').filter('startFrom', function () {
    return function (input, start) {
        if (input) {
            start = +start; //parse to int
            return input.slice(start);
        }
        return [];
    }
});
angular.module('courier').factory('UsersService', ['$http', '$q', 'RESOURCES','ValiDatedTokenObject', function ($http, $q, RESOURCES, ValiDatedTokenObject) {
    ValiDatedTokenObject.setValiDatedTokenObject(JSON.parse(sessionStorage.getItem("ValiDatedTokenObject")));
    var serviceBase = RESOURCES.API_BASE_PATH; 
    var usersServiceFactory = {}; 
    var _getMypageslist = function(pageid){
        return $http.get(serviceBase + 'api/staticpageslist/' + pageid, {
            headers: {'Content-Type': 'application/json'}
        }).then(function (results) {
            return results;
        });
    };
    var _addstatics = function (data) {
        return $http.post(serviceBase + 'api/addstatics', data, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            return response;
        });
    };
    var _getMynewsletterlist = function () {
        return $http.get(serviceBase + 'api/newsletterslist', {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (results) {
            return results;
        });
    };
    var _addNewsletter = function (data) {
        return $http.post(serviceBase + 'api/addnewsletter', data, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            return response;
        });
    };
    var _sendNewsletter = function (data) {
        return $http.post(serviceBase + 'api/sendnewsletters', data, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            return response;
        });
    };
    var _getMysliderlist = function () {
        return $http.get(serviceBase + 'api/sliderimagelist/', {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (results) {
            return results;
        });
    }; 
	var _identitytypelist = function () {
        return $http.get(serviceBase + 'api/identitytypelist', {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (results) {
            return results;
        });
    };
    var _addslider = function (data) {
        return $http.post(serviceBase + 'api/addsliderimage', data, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            return response;
        });
    };
	 var _addidentitytype = function (data) {
        return $http.post(serviceBase + 'api/addidentitytype', data, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            return response;
        });
    };
    var _deleteslider = function (data) {
        return $http.post(serviceBase + 'api/deletesliderimage', data, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            return response;
        });
    }; 
	var _deleteidentity = function (data) {
        return $http.post(serviceBase + 'api/deleteidentitytype', data, {
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) {
            return response;
        });
    };
    usersServiceFactory.getMypageslist = _getMypageslist;
    usersServiceFactory.getMynewsletterlist = _getMynewsletterlist;
    usersServiceFactory.addstatics = _addstatics;
    usersServiceFactory.addNewsletter = _addNewsletter;
    usersServiceFactory.sendNewsletter = _sendNewsletter;
    usersServiceFactory.getMysliderlist = _getMysliderlist;
    usersServiceFactory.identitytypelist = _identitytypelist;
    usersServiceFactory.addslider = _addslider;
    usersServiceFactory.addidentitytype = _addidentitytype;
    usersServiceFactory.deleteslider = _deleteslider;
    usersServiceFactory.deleteidentity = _deleteidentity;
    return usersServiceFactory;
}]);
