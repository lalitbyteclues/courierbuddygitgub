/**
 * Created by Van on 17.01.2016.
 */
angular.module('courier').factory('JobsService', ['$http', '$q', 'RESOURCES','ValiDatedTokenObject', function ($http, $q, RESOURCES, ValiDatedTokenObject) {
    ValiDatedTokenObject.setValiDatedTokenObject(JSON.parse(sessionStorage.getItem("ValiDatedTokenObject")));
    var serviceBase = RESOURCES.API_BASE_PATH;

    var jobsServiceFactory = {};

    var _searchAdvancedJobs = function (text, locationId, categoryId, employeeType, dateFrom, dateTo, orderByTitle, orderByLocation, orderByDate, orderDirection, skip, count) {
        params={};
        if (typeof text !== 'undefined' && text !==''&& text !=null)
        {
            params['text'] = text;
        }
        if (typeof locationId !== 'undefined' && locationId !==''&& locationId !=null)
        {
            params['locationId'] = locationId;
        }
        if (typeof categoryId !== 'undefined' && categoryId !==''&& categoryId !=null)
        {
            params['categoryId'] = categoryId;
        }
        if (typeof employeeType !== 'undefined' && employeeType !==''&& employeeType !=null)
        {
            params['employeeType'] = employeeType;
        }
        if (typeof dateFrom !== 'undefined'&& dateFrom !=null && dateFrom !=='' && dateFrom != 0)
        {
            params['dateFrom'] = new Date(dateFrom).getTime()/1000;
        }
        if (typeof dateTo !== 'undefined'&& dateTo !=null && dateTo !=='' && dateTo != 0)
        {
            params['dateTo'] = new Date(dateTo).getTime()/1000;
        }
        if (typeof orderByTitle !== 'undefined'&& orderByTitle !=null)
        {
            params['orderByTitle'] = orderByTitle;
        }
        if (typeof orderByLocation !== 'undefined'&& orderByLocation !=null)
        {
            params['orderByLocation'] = orderByLocation;
        }
        if (typeof orderByDate !== 'undefined'&& orderByDate !=null)
        {
            params['orderByDate'] = orderByDate;
        }
        if (typeof orderDirection !== 'undefined'&& orderDirection !=null)
        {
            params['orderDirection'] = orderDirection;
        }
        if (typeof skip !== 'undefined'&& skip !=null)
        {
            params['skip'] = skip;
        }
        if (typeof count !== 'undefined'&& count !=null)
        {
            params['count'] = count;
        }

        return $http.get(serviceBase + 'jobs/search_andavnced',{
            headers: {
                'Content-Type': 'application/json'
            },
            params: params
        }).then(function (results) {
            return results;
        });
    };
    var _getJob = function (id, referralId) {

        var token ='';
        if (ValiDatedTokenObject.getValiDatedTokenObject()!=null)
        {
            token = ValiDatedTokenObject.getValiDatedTokenObject().token_type+" "+ValiDatedTokenObject.getValiDatedTokenObject().access_token;
        }
        params={};
        if (typeof referralId !== 'undefined' && referralId !==''&& referralId !=null)
        {
            params['referralId'] = referralId;
        }
        return $http.get(serviceBase + 'jobs/'+id,{
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            params: params
        }).then(function (results) {
            return results;
        });
    };
    var _putJob = function (id, job) {
        return $http.put(serviceBase + 'jobs/'+id,
            job ,
            {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': ValiDatedTokenObject.getValiDatedTokenObject().token_type+" "+ValiDatedTokenObject.getValiDatedTokenObject().access_token
            }
        }).then(function (results) {
            return results;
        });
    };
    var _postJob = function (job) {
        return $http.post(serviceBase + 'jobs',
            job ,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': ValiDatedTokenObject.getValiDatedTokenObject().token_type+" "+ValiDatedTokenObject.getValiDatedTokenObject().access_token
                }
            }).then(function (results) {
            return results;
        });
    };
    var _deleteJob = function (id) {
        return $http.delete(serviceBase + 'jobs/'+id,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': ValiDatedTokenObject.getValiDatedTokenObject().token_type+" "+ValiDatedTokenObject.getValiDatedTokenObject().access_token
                }
            }).then(function (results) {
            return results;
        });
    };
    var _getMyJobs = function () {
        return $http.get(serviceBase + 'jobs/my',{
            headers: {
                'Content-Type': 'application/json',
                'Authorization': ValiDatedTokenObject.getValiDatedTokenObject().token_type+" "+ValiDatedTokenObject.getValiDatedTokenObject().access_token
            }
        }).then(function (results) {
            return results;
        });
    };

    var _getJobsApplied = function () {
        return $http.get(serviceBase + 'jobs/all/applied',{
            headers: {
                'Content-Type': 'application/json',
                'Authorization': ValiDatedTokenObject.getValiDatedTokenObject().token_type+" "+ValiDatedTokenObject.getValiDatedTokenObject().access_token
            }
        }).then(function (results) {
            return results;
        });
    };

    jobsServiceFactory.searchAdvancedJobs = _searchAdvancedJobs;
    jobsServiceFactory.getJob = _getJob;
    jobsServiceFactory.putJob = _putJob;
    jobsServiceFactory.postJob = _postJob;
    jobsServiceFactory.deleteJob = _deleteJob;
    jobsServiceFactory.getMyJobs = _getMyJobs;
    jobsServiceFactory.getJobsApplied = _getJobsApplied;

    return jobsServiceFactory;
}]);