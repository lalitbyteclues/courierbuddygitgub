/**
 * Created by Lalit on 18.06.2016.
 */
angular.module('courier').controller("mywalletController", function ($scope, $state, $location, AuthService, ParcelService, searchService) {
    if (!AuthService.authentication.isAuth) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
    $scope.list = [];
    $scope.mainlist = [];
    AuthService.getuserdetails(sessionStorage.getItem("UserId")).then(function (results) {
        if (results.status == 200) {
            $scope.userdetails = results.data.response[0];
            $scope.userdetails.targetamount = parseFloat($scope.userdetails.wallet);
        }
    });
    dTable = $('#example').DataTable();
    ParcelService.getwalletstatement(AuthService.authentication.UserId).then(function (results) {
        if (results.status == 200) {
            $scope.list = results.data.response;
            $scope.mainlist = results.data.response;
            for (i = 0; i < $scope.list.length; i++) {
                var deptime = $scope.list[i].insertdate.split(" ");
                $scope.list[i].insertdate = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                $scope.mainlist[i].insertdate = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                dTable.row.add([($scope.mainlist[i].tripid > 0 ? "<a href='javascript:void(0);' onclick='openpopup(" + $scope.mainlist[i].tripid + ",2)'>" + $scope.mainlist[i].MTripID + "</a>" : "-"), ($scope.mainlist[i].parcelid > 0 ? "<a href='javascript:void(0);' onclick='openpopup(" + $scope.mainlist[i].parcelid + ",1)'>" + $scope.mainlist[i].MParcelID + "</a>" : "-"), ($scope.mainlist[i].withdrawID == null ? "-" : "<a href='javascript:void(0);' onclick='openpopup(\"" + $scope.mainlist[i].withdrawID + "\",3)'>" + $scope.mainlist[i].withdrawID + "</a>"), moment($scope.mainlist[i].insertdate).format("DD/MM/YYYY hh:mm:ss"), $scope.mainlist[i].credit, $scope.mainlist[i].debit, $scope.mainlist[i].withdrawamount == 0 ? "0.00" : $scope.mainlist[i].withdrawamount, $scope.mainlist[i].statusdescription == "Y" ? "Approved" : ($scope.mainlist[i].statusdescription == "N" ? "Pending" : $scope.mainlist[i].statusdescription)]).draw();
            }
        }
    });
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    $scope.openpopup = function (id, status) {
        console.log(id);
        if (status == 1)
        {
            ParcelService.getparceldetail(id).then(function (response) {
                $scope.parcelsingle = response.data.response[0]; 
                $("#parceldetails").modal();

            }); 
        }
        if (status == 2) {
            searchService.gettransporterdetails(id).then(function (response) {
                console.log(response.data.response);
                $scope.tripsingle = response.data.response[0];
              
                $("#tripdetails").modal();
            }); 
        }
        if (status == 3)
        {      searchService.paymentrequestlist(sessionStorage.getItem("UserId")).then(function (results) {
                $scope.paymentlist = results.data.response;
                $scope.paymentsingle = $.grep($scope.paymentlist, function (payment) { return payment.withdrawID == id })[0]; 
                  
                    $("#paymentdetails").modal(); 
            }); 
        }
    };
});