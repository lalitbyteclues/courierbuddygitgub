function configState($stateProvider, $urlRouterProvider, $compileProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $compileProvider.debugInfoEnabled(true);
    $urlRouterProvider.otherwise(function ($injector) {
        var $state = $injector.get("$state");
        $state.go('login');
    });
    $stateProvider
       .state('admindashboard', {
           url: "/admin/dashboard",
           templateUrl: "admin/views/admin/dashboard.html",
           data: {
               pageTitle: 'Admin Dashboard'
           }
       }).state('adminprofile', {
           url: "/admin/profile",
           templateUrl: "admin/views/dashboard.html",
           data: {
               pageTitle: 'Admin Profile'
           }
       }).state('adminuserslist', {
           url: "/admin/userlist",
           templateUrl: "admin/views/admin/users.html",
           data: {
               pageTitle: 'Admin Users'
           }
       }).state('admintripslist', {
           url: "/admin/tripslist",
           templateUrl: "admin/views/admin/tripmanager.html",
           data: {
               pageTitle: 'Admin Trips'
           }
       }).state('adminslider', {
           url: "/admin/slider",
           templateUrl: "admin/views/admin/slider.html",
           data: {
               pageTitle: 'Admin Trips'
           }
       }).state('adminstatic', {
           url: "/admin/static",
           templateUrl: "admin/views/admin/static.html",
           data: {
               pageTitle: 'Admin Trips'
           }
       }).state('adminpricelist', {
           url: "/admin/pricelist",
           templateUrl: "admin/views/admin/adminpricelist.html",
           data: {
               pageTitle: 'Admin Price Range List'
           }
       }).state('pricerangelist', {
           url: "/admin/pricerange",
           templateUrl: "admin/views/admin/pricerange.html",
           data: {
               pageTitle: 'Admin Price List'
           }
       }).state('adminseomanager', {
           url: "/admin/seomanager",
           templateUrl: "admin/views/admin/seomanager.html",
           data: {
               pageTitle: 'admin seo manager'
           }
       }).state('adminparcellist', {
           url: "/admin/parcellist",
           templateUrl: "admin/views/admin/parcelmanager.html",
           data: {
               pageTitle: 'Admin Parcel List'
           }
       }).state('adminbookings', {
           url: "/admin/bookings",
           templateUrl: "admin/views/admin/bookingmanager.html",
           data: {
               pageTitle: 'Admin Booking List'
           }
       }).state('adminpayments', {
           url: "/admin/payments",
           templateUrl: "admin/views/admin/paymentmanager.html",
           data: {
               pageTitle: 'Admin Payments'
           }
       }).state('adminreports', {
           url: "/admin/reports",
           templateUrl: "admin/views/admin/reportmanager.html",
           data: {
               pageTitle: 'Admin Reports'
           }
       }).state('admindeliveryreports', {
           url: "/admin/deliveryreports",
           templateUrl: "admin/views/admin/deliveryreport.html",
           data: {
               pageTitle: 'Admin Delivery Reports'
           }
       }).state('adminairportslist', {
           url: "/admin/airportslist",
           templateUrl: "admin/views/admin/airportmanager.html",
           data: {
               pageTitle: 'Admin Airportslist'
           }
       }).state('adminfeedbackslist', {
           url: "/admin/feedbackslist",
           templateUrl: "admin/views/admin/feedbackmanager.html",
           data: {
               pageTitle: 'Admin FeedBack Manager'
           }
       }).state('adminnewsletters', {
           url: "/admin/newsletters",
           templateUrl: "admin/views/admin/newslettermanager.html",
           data: {
               pageTitle: 'Admin News Letters'
           }
       }).state('changepassword', {
           url: "/admin/changepassword",
           templateUrl: "admin/views/changepassword.html",
           data: {
               pageTitle: 'My Account | ChangePassword '
           }
       }).state('logout', {
           url: "/logout",
           controller: function ($state, $rootScope, AuthService) {
               AuthService.logOut();
               $state.go('login');
           },
           data: {
               pageTitle: 'logout'
           }
       })
        .state('login', {
            url: "admin/login",
            templateUrl: "admin/views/login.html",
            data: {
                pageTitle: 'Login'
            }
        }).state('pricelist', {
            url: "/pricelist",
            templateUrl: "views/static/pricelist.html",
            data: {
                pageTitle: 'Price List'
            }
        }).state('termsandcondition', {
            url: "/termsandcondition",
            templateUrl: "views/static/termsandcondition.html",
            data: {
                pageTitle: 'Terms and conditions'
            }
        }).state('aboutus', {
            url: "/aboutus",
            templateUrl: "views/static/aboutus.html",
            data: {
                pageTitle: 'About US | Mycourierbuddy '
            }
        }).state('contact', {
            url: "/contact",
            templateUrl: "views/static/contact.html",
            data: {
                pageTitle: 'Contact | MycourierBuddy '
            }
        }).state('faq', {
            url: "/faq",
            templateUrl: "views/static/faq.html",
            data: {
                pageTitle: 'Faq | Mycourierbuddy'
            }
        }).state('sendergoodpractices', {
            url: "/sendergoodpractices",
            templateUrl: "views/static/sendergoodpractices.html",
            data: {
                pageTitle: 'Sender Good Practices | mycourierbuddy'
            }
        }).state('transportergoodpractices', {
            url: "/transportergoodpractices",
            templateUrl: "views/static/transportergoodpractices.html",
            data: {
                pageTitle: 'Transporter Good Practices | mycourierbuddy'
            }
        }).state('guidelinessection', {
            url: "/guidelinessection",
            templateUrl: "views/static/guidelinessection.html",
            data: {
                pageTitle: 'Guidelines Section | mycourierbuddy'
            }
        })
}
angular.module('courier').config(configState).run(function ($rootScope, $state, Permission, ValiDatedTokenObject, AuthService) {

    $rootScope.numberWithCommas = function (x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }
    AuthService.fillAuthData();
    $rootScope.$state = $state;
    // Define anonymous role
    Permission.defineRole('anonymous', function (stateParams) {
        if (!sessionStorage.getItem("ValiDatedTokenObject")) {
            return true;
        }

        ValiDatedTokenObject.setValiDatedTokenObject(JSON.parse(sessionStorage.getItem("ValiDatedTokenObject")));
        if (!ValiDatedTokenObject.getValiDatedTokenObject()) {
            return true;
        }
        return false;
    })
        .defineRole('User', function (stateParams) {
            if (AuthService.authentication.isUser) {
                return true;
            }
            if (!sessionStorage.getItem("ValiDatedTokenObject")) {
                return false;
            }

            ValiDatedTokenObject.setValiDatedTokenObject(JSON.parse(sessionStorage.getItem("ValiDatedTokenObject")));
            if (ValiDatedTokenObject.getValiDatedTokenObject()) {
                console.log(ValiDatedTokenObject);
                var role = ValiDatedTokenObject.getValiDatedTokenObject().roles;
                if (role == 'User') {
                    return true;
                }
            }
            return false;
        })
        .defineRole('Admin', function (stateParams) {
            if (AuthService.authentication.isAdministrator) {
                return true;
            }
            ValiDatedTokenObject.setValiDatedTokenObject(JSON.parse(sessionStorage.getItem("ValiDatedTokenObject")));
            if (ValiDatedTokenObject.getValiDatedTokenObject()) {
                var role = ValiDatedTokenObject.getValiDatedTokenObject().roles;
                if (role == 'Admin') {
                    return true;
                }
            }
            return false;
        });

});
angular.isUndefinedOrNull = function (val) {
    return angular.isUndefined(val) || val === null
}