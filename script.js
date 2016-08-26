function require(script) {
    $.ajax({
        url: script,
        dataType: "script",
        async: false,           // <-- This is the key
        success: function () {
            // all good...
        },
        error: function () {
            throw new Error("Could not load script " + script);
        }
    });
} 
require("/libs/jquery/intlTelInput.min.js");
require("/js/zebra_datepicker.js");
require("/libs/jquery-ui/jquery-ui.min.js");
require("/libs/slimScroll/jquery.slimscroll.min.js");
require("/libs/jquery/dist/jquery.timepicker.js");
require("/libs/angular/angular.min.js");
require("/libs/angular-sanitize/angular-sanitize.min.js");
require("/libs/angular-animate/angular-animate.min.js");
require("/libs/angular-ui-router/release/angular-ui-router.min.js");
require("/libs/angular-ui-autocomplete/autocomplete.js");
require("/libs/angular-bootstrap/ui-bootstrap-tpls.min.js");
require("/libs/bootstrap/dist/js/bootstrap.min.js");
require("/libs/iCheck/icheck.min.js");
require("/libs/moment/min/moment.min.js");
require("/libs/fullcalendar/dist/fullcalendar.min.js");
require("/libs/angular-ui-calendar/src/calendar.js");
require("/libs/ng-grid/ng-grid-2.0.14.min.js");
require("/libs/bootstrap-tour/build/js/bootstrap-tour.min.js");
require("/libs/resgrid/js/jquery.dataTables.min.js");
require("/libs/resgrid/js/dataTables.bootstrap.min.js");
require("/libs/resgrid/js/dataTables.responsive.min.js");
require("/libs/resgrid/js/responsive.bootstrap.min.js");
require("/libs/angular-datatables/dist/angular-datatables.min.js");
require("/libs/ui-select/dist/select.min.js");
require("/libs/angular-ui-sortable/sortable.min.js");
require("/libs/footable/dist/footable.all.min.js");
require("/libs/angular-footable/dist/angular-footable.min.js");
require("/libs/angular-permission/angular-permission.js");
require("/libs/angular-timer/angular-timer.min.js");
require("/libs/angular-timer/humanize-duration.js");
require("/libs/angular-timer/moment.js");
require("/libs/format-as-currency/format-as-currency.js");
require("/libs/angular-loading-bar/loading-bar.min.js");
require("/libs/angular-base64-master/angular-base64.min.js");
require("/libs/angular-base64-master/angular-base64-upload.js");
require("/libs/angular-bootstrap/bootbox.js");
require("/libs/moment/jquery.ui.durationPicker.js");
require("/libs/moment/date.js");
require("/libs/angular/angular-recaptcha.min.js");
require("/scripts/app.js"); 
require("/scripts/directives/directives.js");
require("/scripts/config.js");
require("/scripts/services/appminified.js");
require("/admin/scripts/services/UsersService.js");
require("/scripts/controllers/appminified.js");
require("/js/socket.io.js");
require("/demo/popupwindow.js"); 