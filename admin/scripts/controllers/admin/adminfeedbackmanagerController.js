/**
 * Created by Lalit on 21.05.2016.
 */
angular.module('courier').controller("adminfeedbackmanagerController", function ($rootScope, $state, $scope, $location, ValiDatedTokenObject, ParcelService, AuthService) {
    $scope.errormessage = '';
    $scope.successMessage = "";
    $scope.TransporterID = "";
    $scope.status = "";
    $scope.possiblematchid = 0;
    $scope.currentPage = 1; //current page
    $scope.entryLimit = 10; //max no of items to display in a page
    // trans = $('#example').DataTable();
    if (!AuthService.authentication.isAdministrator) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    }; 
    $scope.delete = function (id) {
        var data = { "id": id };
        ParcelService.deletetrip(data).then(function (results) {
            if (results.status == 200) {
            }
        });
    }
    $scope.approvetrip = function (data) {
        $scope.successMessage = "";
        data.status = "Y";
        ParcelService.addcontacts(data).then(function (response) {
            $scope.successMessage = "Updated Successfully";
            $scope.searchdatabyuser();
        });
    }
    $scope.tripslist = []; 
    $scope.searchdatabyuser = function () { 
        ParcelService.contactslist().then(function (results) {
            if (results.status == 200) {
                $scope.tripslist = results.data.response; 
                $scope.filteredItems = $scope.tripslist.length; //Initially for no filter  
                $scope.totalItems = $scope.tripslist.length;
                for (i = 0; i < $scope.tripslist.length; i++) {
                    $scope.tripslist[i].created = new Date($scope.tripslist[i].created);
                }
            }
        });

    }
    $scope.searchdatabyuser();
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
        if ((item.status == $scope.status || typeof $scope.status === 'undefined' || $scope.status === '' || $scope.status == null) && (item.created.getDate() == new Date($scope.departureat).getDate() || typeof $scope.departureat === 'undefined' || $scope.departureat === '' || $scope.departureat == null) && (item.id.toLowerCase().indexOf($scope.TransporterID) != -1 || typeof $scope.TransporterID === 'undefined' || $scope.TransporterID === '' || $scope.TransporterID == null)) {
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