angular.module('courier').service("ValiDatedTokenObject", function() {
        var ValiDatedTokenObject = {};

        var getValiDatedTokenObject = function() {
        return ValiDatedTokenObject;
    }

    var setValiDatedTokenObject = function(data) {
        ValiDatedTokenObject = angular.copy(data);
    }

    return {
        getValiDatedTokenObject: getValiDatedTokenObject,
        setValiDatedTokenObject: setValiDatedTokenObject
    } 
    });
