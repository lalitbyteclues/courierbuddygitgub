angular.module('courier').controller("WidrowamountController", function ($rootScope, $scope, $state, $location, AuthService, searchService) {
    if (!AuthService.authentication.isAuth) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
    $scope.errormessage = '';
    $scope.successMessage = "";
    $scope.paymentlist = [];
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    AuthService.getuserdetails(sessionStorage.getItem("UserId")).then(function (results) {
        if (results.status == 200) {
            $scope.userdetails = results.data.response[0];
            $scope.userdetails.targetamount = parseFloat($scope.userdetails.wallet);
        }
    });
    searchService.paymentrequestlist(sessionStorage.getItem("UserId")).then(function (results) {
        $scope.paymentlist = results.data.response;
    });
    $scope.submitbankdetails = function (isValid) {
        $scope.errormessage = '';
        $scope.successMessage = "";
        if (!isValid) {
            $scope.errormessage = "Please, fill out all fields!";
            return;
        }
        var datapost = { "trans_id": sessionStorage.getItem("UserId"), "amount": $scope.userdetails.targetamount, "bank_name": $scope.userdetails.bank_name, "acct_no": $scope.userdetails.bank_act_no, "ifsc": $scope.userdetails.bank_ifsc, "status": "N", "created": new Date(), "swift_code": $scope.userdetails.bank_swift_code, "act_name": $scope.userdetails.bank_act_name };
        searchService.createpaymentrequest(datapost).then(function (results) {
            if (results.status == 200) {
                searchService.paymentrequestlist(sessionStorage.getItem("UserId")).then(function (results) {
                    $scope.paymentlist = results.data.response;
                    AuthService.getuserdetails(sessionStorage.getItem("UserId")).then(function (results) {
                        if (results.status == 200) {
                            $scope.userdetails = results.data.response[0];
                            $scope.userdetails.targetamount = parseFloat($scope.userdetails.wallet);
                            $scope.successMessage = "Payment Request Created Successfully";
                            $("#login-modal").modal("hide");
                        }
                    });
                   
                });
            } 
        });

    }
});