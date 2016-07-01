/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("adminpaymentmanagerController", function ($rootScope, $state, $scope, $location, AuthService, searchService) {
    $scope.errormessage = '';
    $scope.successMessage = "";
    $scope.listexportcsv = [];
    $scope.edit = false;
    if (!AuthService.authentication.isAdministrator) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
     $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
     };
     $scope.updatebankdetails = function (isValid) {
         $scope.errormessage = '';
         $scope.successMessage = "";
         if (!isValid) {
             $scope.errormessage = "Please, fill out all fields!";
             return;
         }
         AuthService.updateuserdetails($scope.userdetails).then(function (results) {
             if (results.status == 200) {
                 $scope.successMessage = "Profile Updated successfully";
                 $scope.edit = false;
             }
         }); 
     }
     $scope.editform = function () {
         $scope.edit = true;
     }
     $scope.approvetrip = function (data) { 
         bootbox.prompt("Enter Bank Transaction No?", function (result) {
             if (result !== null) {
                 var datapost = { "id": data.id, "status": 1, "reason": result };
                 searchService.createpaymentrequest(datapost).then(function (results) {
                     if (results.status == 200) {
                         searchService.paymentrequestlist(0).then(function (results) {
                             if (results.status == 200) {
                                 $scope.tripslist = results.data.response;
                                 $scope.listexportcsv = [];
                                 for (i = 0; i < $scope.tripslist.length; i++) {
                                     var deptime = $scope.tripslist[i].created.split(" ");
                                     $scope.tripslist[i].created = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                                     $scope.listexportcsv.push({ "UserID": $scope.tripslist[i].UserID, "BankName": $scope.tripslist[i].bank_name, "amount": $scope.tripslist[i].amount, "acct_no": $scope.tripslist[i].acct_no, "ifsc": $scope.tripslist[i].ifsc, "swift_code": $scope.tripslist[i].swift_code, "act_name": $scope.tripslist[i].act_name, "created": $scope.tripslist[i].created, "Status": $scope.tripslist[i].status == 'Y' ? "Approved" : "Request Sent" });
                                 }
                                 $scope.currentPage = 1; //current page
                                 $scope.entryLimit = 10; //max no of items to display in a page
                                 $scope.filteredItems = $scope.tripslist.length; //Initially for no filter  
                                 $scope.totalItems = $scope.tripslist.length;
                             }
                         });
                     }
                 });
             }
         }); 
     }
     $scope.viewuserdetails = function (userid)
     {
         AuthService.getuserdetails(userid).then(function (results) {
             $scope.userdetails = results.data.response[0];
             $("#userdetails").modal();
         });

     };
     searchService.paymentrequestlist(0).then(function (results) {
         if (results.status == 200) {
             $scope.tripslist = results.data.response;
             $scope.listexportcsv = [];
             for (i = 0; i < $scope.tripslist.length; i++)
             {   var deptime = $scope.tripslist[i].created.split(" ");
             $scope.tripslist[i].created = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
             $scope.listexportcsv.push({ "UserID": $scope.tripslist[i].UserID, "BankName": $scope.tripslist[i].bank_name, "amount": $scope.tripslist[i].amount, "acct_no": $scope.tripslist[i].acct_no, "ifsc": $scope.tripslist[i].ifsc, "swift_code": $scope.tripslist[i].swift_code, "act_name": $scope.tripslist[i].act_name, "created": $scope.tripslist[i].created, "Status": $scope.tripslist[i].status == 'Y' ? "Approved" : "Request Sent" });
             }
             $scope.currentPage = 1; //current page
             $scope.entryLimit = 10; //max no of items to display in a page
             $scope.filteredItems = $scope.tripslist.length; //Initially for no filter  
             $scope.totalItems = $scope.tripslist.length;
         }
     }); 
     $scope.setPage = function (pageNo) {
         $scope.currentPage = pageNo;
     };
     $scope.filter = function () {
         $timeout(function () {
             $scope.filteredItems = $scope.filtered.length;
         }, 10);
     };
     $scope.sort_by = function (predicate) {
         $scope.predicate = predicate;
         $scope.reverse = !$scope.reverse;
     }; 
     $scope.search = function (item) { 
         if ((item.status == $scope.status || typeof $scope.status === 'undefined' || $scope.status === '' || $scope.status == null) && (item.created.getDate() == new Date($scope.departureat).getDate() || typeof $scope.departureat === 'undefined' || $scope.departureat === '' || $scope.departureat == null) && (item.UserID.toLowerCase().indexOf($scope.TransporterID) != -1 || typeof $scope.TransporterID === 'undefined' || $scope.TransporterID === '' || $scope.TransporterID == null)) {
             return true;
         }
         return false;
     };
     $scope.dt = new Date();
     $scope.disabled = function (date, mode) { return (mode === 'day' && false); };
     var date = new Date();
     $scope.maxDate = date.setDate((new Date()).getDate() + 900);
     $scope.open0 = function ($event) { $event.preventDefault(); $event.stopPropagation(); $scope.status0.opened = true; };
     $scope.status0 = { opened: false };

});