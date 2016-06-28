angular.module('courier').controller("PricelistController", function ($rootScope, $scope, $location, ValiDatedTokenObject, locationHistoryService, AuthService) {
   
});
angular.module('courier').controller("TermsandconditionController", function ($rootScope, $scope, $location, ValiDatedTokenObject, locationHistoryService, AuthService) {
 });
angular.module('courier').controller("aboutusController", function ($rootScope, $scope, $location, ValiDatedTokenObject, locationHistoryService, AuthService) {

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
        var postdata = {"name":$scope.name,"email":$scope.email,"phone":$scope.phone,"message":$scope.message};
        ParcelService.addcontacts(postdata).then(function (response) {
            $scope.successmessage = response.data.response;

        });
    }
}); 
angular.module('courier').controller("faqController", function ($rootScope, $scope, $location, ValiDatedTokenObject, locationHistoryService, AuthService) {

}); 
angular.module('courier').controller("sendergoodpracticesController", function ($rootScope, $scope, $location, ValiDatedTokenObject, locationHistoryService, AuthService) {
 
}); 
angular.module('courier').controller("transportergoodpracticesController", function ($rootScope, $scope, $location, ValiDatedTokenObject, locationHistoryService, AuthService) {
  });
angular.module('courier').controller("guidelinessectionController", function ($rootScope, $scope, $location, ValiDatedTokenObject, locationHistoryService, AuthService) {

});