/**
 * Created by Lalit 28.05.2016.
 */
angular.module('courier').factory('UsersService', ['$http', '$q', 'RESOURCES','ValiDatedTokenObject', function ($http, $q, RESOURCES, ValiDatedTokenObject) {
    ValiDatedTokenObject.setValiDatedTokenObject(JSON.parse(sessionStorage.getItem("ValiDatedTokenObject")));
    var serviceBase = RESOURCES.API_BASE_PATH;

    var usersServiceFactory = {};

    var _getMyInfo = function(){
        return $http.get(serviceBase + 'users/me',{
            headers: {
                'Content-Type': 'application/json',
                'Authorization': ValiDatedTokenObject.getValiDatedTokenObject().token_type+" "+ValiDatedTokenObject.getValiDatedTokenObject().access_token
            }
        }).then(function (results) {
            return results;
        });
    };

    usersServiceFactory.getMyInfo = _getMyInfo;

    return usersServiceFactory;
}]);
