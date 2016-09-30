/**
 * Created by Lalit on 07.07.2016.
 */
angular.module('courier').filter('startFrom', function () {
    return function (input, start) {
        if (input) {
            start = +start; //parse to int
            return input.slice(start);
        }
        return [];
    }
});
angular.module('courier').controller("pricerangeController", function ($state, $scope, $location, AirportService, AuthService, $timeout) {
    $scope.errormessage = "";
    $scope.warningmessage = "";
    $scope.successmessage = "";
	$scope.newentry={ "id": "0", "name": "", "minweight": "", "maxweight": "" };
    $scope.edit = false;
    if (!AuthService.authentication.isAdministrator) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    $scope.weightrangelist = []; 
    $scope.fillgrid = function () {
        AirportService.getweightrangelist().then(function (results) {
            $scope.list = results.data.response;
            for (i = 0; i < $scope.list.length; i++) {
                $scope.list[i].minweight = parseFloat($scope.list[i].minweight);
                $scope.list[i].maxweight = parseFloat($scope.list[i].maxweight);
            }
            $scope.currentPage = 1;
            $scope.entryLimit = 50;
            $scope.filteredItems = $scope.list.length;
            $scope.totalItems = $scope.list.length;  
			$scope.predicate="minweight";
			$scope.reverse=false;
        });
    }
    $scope.fillgrid();
    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };
    $scope.filter = function () {
        $timeout(function () {
            $scope.filteredItems = $scope.filtered.length;
        }, 10);
    };
    $scope.addRow = function () { 
	 $scope.errormessage = "";
    $scope.warningmessage = "";
    $scope.successmessage = "";
       $scope.newentry={ "id": "0", "name": "", "minweight": "", "maxweight": "" };
	   $("#userdetails").modal();
    };
    $scope.deleterecords = function (field) {
		 $scope.errormessage = "";
    $scope.warningmessage = "";
    $scope.successmessage = "";
 bootbox.confirm("Do you want to delete ?", function (result) {
                if (result) {
	AirportService.deletepricerecord(field).then(function (results) {
            $scope.list = results.data.response; 
            for (i = 0; i < $scope.list.length; i++) { 
                $scope.list[i].minweight = parseFloat($scope.list[i].minweight);
                $scope.list[i].maxweight = parseFloat($scope.list[i].maxweight);
            }
            $scope.filteredItems = $scope.list.length;
            $scope.totalItems = $scope.list.length;
            if (results.data.status == 'error') {
                $scope.errormessage = results.data.response;
            } else {
                $scope.successmessage = "Deleted SuccessFully";
            } 
			var mintotal = 0;
			var maxtotal = 0;
			for (i = 0; i < $scope.list.length; i++)
			{
				mintotal += parseFloat(Math.round($scope.list[i].minweight * 10) / 10);
				maxtotal += parseFloat(Math.round($scope.list[i].maxweight * 10) / 10);
			}  
			if ((maxtotal - mintotal) != 30)
			{
				$scope.warningmessage = "Your range total is not 30kg kindly adjust other ranges !";  
			}
 }); }});	
    };
    $scope.editAppKey = function (field) {
   $scope.errormessage = "";
    $scope.warningmessage = "";
    $scope.successmessage = "";
		 $scope.newentry={ "id": field.id, "name": field.name, "minweight": field.minweight, "maxweight": field.maxweight}; 
		$("#userdetails").modal();
    }
    $scope.saverecords = function () {
       $scope.errormessage = "";
    $scope.warningmessage = "";
    $scope.successmessage = "";
        if ($scope.newentry.minweight > 30) {
            $scope.errormessage = "Max weight 30 kg  !"; 
            return;
        }
        if ($scope.newentry.maxweight > 30) {
            $scope.errormessage = "Max weight 30 kg !"; 
            return;
        }
        if ($scope.newentry.minweight == $scope.newentry.maxweight) {
            $scope.errormessage = "Min weight and max weight same !";  
            return;
        }
		if ($scope.newentry.minweight > $scope.newentry.maxweight) {
            $scope.errormessage = "min weight is less than max weight !";  
            return;
        } 
		for (i = 0; i < $scope.list.length; i++) {  
		   if(($scope.filterrange($scope.newentry.minweight,$scope.list[i]) || $scope.filterrange($scope.newentry.maxweight,$scope.list[i])) && $scope.list[i].id != $scope.newentry.id){
			   $scope.errormessage = "This weight range is already exists !";  
            return;
		  }
		} 
        $scope.newentry.name = $scope.newentry.minweight + "-" + $scope.newentry.maxweight;
        AirportService.saveweightrangelist($scope.newentry).then(function (results) {
            $scope.list = results.data.response; 
            for (i = 0; i < $scope.list.length; i++) { 
                $scope.list[i].minweight = parseFloat($scope.list[i].minweight);
                $scope.list[i].maxweight = parseFloat($scope.list[i].maxweight);
            }
		var mintotal = 0;
        var maxtotal = 0;
        for (i = 0; i < $scope.list.length; i++)
        {
            mintotal += parseFloat(Math.round($scope.list[i].minweight * 10) / 10);
            maxtotal += parseFloat(Math.round($scope.list[i].maxweight * 10) / 10);
        }  
        if ((maxtotal - mintotal) != 30)
        {
            $scope.warningmessage = "Your range total is not 30kg kindly adjust other ranges !";  
        }
            $scope.currentPage = 1;   
            $scope.filteredItems = $scope.list.length;  
            $scope.totalItems = $scope.list.length; 
			$("#userdetails").modal("hide");
            $scope.successmessage = "Updated SuccessFully"; 
        });
    };
    $scope.sort_by = function (predicate) {
        $scope.predicate = predicate;
        $scope.reverse = !$scope.reverse;
    };
	$scope.filterrange = function(val,list) {
	  return (val >= list.minweight && val <= list.maxweight);
	};
});