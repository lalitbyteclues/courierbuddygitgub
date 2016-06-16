angular
    .module('courier').service('locationHistoryService', function(){
    return {
        previousLocation: null,

        store: function(location){
            this.previousLocation = location;
        },

        get: function(){
            return this.previousLocation;
        }
}
})
.run(['$rootScope', 'locationHistoryService', function($rootScope, locationHistoryService){
    $rootScope.$on('$locationChangeSuccess', function(e, newLocation, oldLocation){
        locationHistoryService.store(oldLocation);
    });
}]);