angular.module('courier').controller("PricelistController", function ($rootScope, $scope, $location, ValiDatedTokenObject, AirportService, AuthService) {
    $scope.zonelist = [];
    $scope.searchfromzoneid = 0;
    $scope.searchtozoneid = 0;
    $scope.weightrangelist = [];
    AirportService.getzonelist().then(function (results) {
        $scope.zonelist = results.data.response;
    });
    AirportService.getweightrangelist().then(function (results) {
        $scope.weightrangelist = results.data.response;
        $scope.checkgridlist();
    });
    dTable = $('#example').DataTable({ searching: false, "paging": true });
    $scope.checkgridlist = function () {
        $scope.successmessage = "";
        if ($scope.searchfromzoneid >= 0 && $scope.searchtozoneid >= 0) {
            AirportService.getpricelist().then(function (results) {
                $scope.list = [];
                dTable.clear().draw();
                for (i = 0; i < $scope.weightrangelist.length; i++) {
                    var datacount = $.grep(results.data.response, function (pp) { return (pp.fromzoneid == $scope.searchfromzoneid || $scope.searchfromzoneid == 0) && (pp.tozoneid == $scope.searchtozoneid || $scope.searchtozoneid == 0) && pp.weightrangeid == $scope.weightrangelist[i].id });
                    if (datacount.length > 0) {
                        for (j = 0; j < datacount.length; j++) {
                            $scope.list.push({ "weightrangeid": parseInt($scope.weightrangelist[i].id), "weightrangename": $scope.weightrangelist[i].name, "transportershare": parseFloat(datacount[j].transportershare), "price": parseFloat(datacount[j].price), "id": datacount[j].id, "fromzoneid": datacount[j].fromzoneid, "tozoneid": datacount[j].tozoneid });
                            dTable.row.add(["Zone " + datacount[j].fromzoneid, "Zone " + datacount[j].tozoneid, $scope.weightrangelist[i].name, parseFloat(datacount[j].price), parseFloat(datacount[j].transportershare)]).draw();;
                        }
                    } else {
                        $scope.list.push({ "weightrangeid": parseInt($scope.weightrangelist[i].id), "weightrangename": $scope.weightrangelist[i].name, "transportershare": 0, "price": 0, "id": 0, "fromzoneid": $scope.searchfromzoneid, "tozoneid": $scope.searchtozoneid });
                    }
                }
                console.log($scope.list);
            });
        } else {
            $scope.list = [];
        }
    }
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