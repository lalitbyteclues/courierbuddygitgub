var apiBasePath = 'https://mycourierbuddy.com/apis/index.php/';
var clientId = "P600Us6Y476QiK331u5yEzb22dpX_y6NS75!9I-a";
(function () {
    angular.module('courier', ['ui.router','ngSanitize','ui.bootstrap','ngAnimate','ui.autocomplete','bcherny/formatAsCurrency','angular-loading-bar','base64','naif.base64']).constant('RESOURCES', (function () {
        var searchcriteria = { datefrom: "", dateto: "", locationfrom: "", locationto: "", type: "Transporter" };
        var sendersearchcriteria = { TransporterID: "", departureat: "", status: "" };
        var tripsearchcriteria = { TransporterID: "", departureat: "", status: "" };
        return {
            searchcriteria: searchcriteria, tripid: "", parcelid: "", sendersearchcriteria: sendersearchcriteria, tripsearchcriteria: tripsearchcriteria, API_BASE_PATH: apiBasePath, CLIENT_ID: clientId
        }
    })())
        .config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
            cfpLoadingBarProvider.includeSpinner = true;
            cfpLoadingBarProvider.includeBar = false;
            cfpLoadingBarProvider.spinnerTemplate = '<div id="outer" style="width:100%;position: absolute; top:0px;background:rgba(0, 0, 0, 0.6);height:200%;z-index: 9999999999; "><div class="progress" style=" margin: 30% auto;  width: 200px; height: 10px; z-index: 9999999999;"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"><span class="sr-only"></span></div></div></div>';

        }])
})();

