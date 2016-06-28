angular.module('courier').controller("PricelistController", function ($rootScope, $scope, $location, ValiDatedTokenObject, locationHistoryService, AuthService) {
   
});
angular.module('courier').controller("TermsandconditionController", function ($rootScope, $scope, $location, UsersService, locationHistoryService, AuthService) {
    UsersService.getMypageslist(3).then(function (results) {
        $scope.content = results.data.response[0];
    });
 });
angular.module('courier').controller("aboutusController", function ($rootScope, $scope, $location, UsersService, locationHistoryService, AuthService) {
    UsersService.getMypageslist(1).then(function (results) {
        $scope.content = results.data.response[0];
    }); 
});
angular.module('courier').controller("contactController", function ($rootScope, $scope, $location, ValiDatedTokenObject, ParcelService, AuthService) {
    $scope.publicKey = "6Lc74SETAAAAACLHIKZWgJJaFFyXn4cxe6EjuYaJ";
    $scope.successmessage = "";
    $scope.errorDescription = "";
    $scope.submitformdata = function (isValid) {
        $scope.successmessage = "";
        $scope.errorDescription = ""; 
        if (!isValid) {
            $scope.errorDescription = "Please, fill out all fields!";
            return;
        }
        var postdata = {"name":$scope.name,"email":$scope.email,"phone":$scope.phone,"message":$scope.message,"created":new Date(),"status":"N"};
        ParcelService.addcontacts(postdata).then(function (response) {
            $scope.successmessage = response.data.response;

        });
    }
}); 
angular.module('courier').controller("faqController", function ($rootScope, $scope, $location, ValiDatedTokenObject, UsersService, AuthService) {
    UsersService.getMypageslist(2).then(function (results) {
        $scope.content = results.data.response[0];
    });

}); 
angular.module('courier').controller("sendergoodpracticesController", function ($rootScope, $scope, $location, UsersService, locationHistoryService, AuthService) {
    UsersService.getMypageslist(5).then(function (results) {
        $scope.content = results.data.response[0];
    });
}); 
angular.module('courier').controller("transportergoodpracticesController", function ($rootScope, $scope, $location, UsersService, locationHistoryService, AuthService) {
    UsersService.getMypageslist(5).then(function (results) {
        $scope.content = results.data.response[0];
    });
});
angular.module('courier').controller("guidelinessectionController", function ($rootScope, $scope, $location, UsersService, locationHistoryService, AuthService) {
    UsersService.getMypageslist(7).then(function (results) {
        $scope.content = results.data.response[0];
    });
});