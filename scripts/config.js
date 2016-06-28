function configState($stateProvider, $urlRouterProvider, $compileProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $compileProvider.debugInfoEnabled(true);
    $urlRouterProvider.otherwise(function ($injector) {
        var $state = $injector.get("$state");
        $state.go('home');
    });
    $stateProvider
        .state('receiver', {
            url: "/receiver",
            templateUrl: "views/receiver.html",
            data: {
                pageTitle: 'receiver'
            }
        })
        .state('dashboard', {
            url: "/dashboard",
            templateUrl: "views/dashboard.html",
            data: {
                pageTitle: 'Dashboard'
            }
        }).state('addtrip', {
            url: "/transporter/addtrip",
            templateUrl: "views/trips/addtrips.html",
            data: {
                pageTitle: 'Transporter | Add trip '
            }
        }).state('changepassword', {
            url: "/changepassword",
            templateUrl: "views/changepassword.html",
            data: {
                pageTitle: 'My Account | ChangePassword '
            }
        }).state('cancelledtrips', {
            url: "/transporter/canceltrips",
            templateUrl: "views/trips/canceltrips.html",
            data: {
                pageTitle: 'Transporter | cancelled trips '
            }
        }).state('bankdetails', {
            url: "/transporter/bankdetails",
            templateUrl: "views/trips/bankdetails.html",
            data: {
                pageTitle: 'Transporter | Bank Details '
            }
        }).state('withdraw', {
            url: "/transporter/withdraw",
            templateUrl: "views/withdrawamount.html",
            data: {
                pageTitle: 'Transporter | Widrow Amount '
            }
        }).state('transporter', {
            url: "/transporter",
            templateUrl: "views/trips/transporter.html",
            data: {
                pageTitle: 'My trips'
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
        .state('home', {
            url: "/home",
            templateUrl: "views/home.html",
            data: {
                pageTitle: 'Home Courier Buddy'
            }
        })
        .state('search', {
            url: "/search",
            templateUrl: "views/search.html",
            data: {
                pageTitle: 'Home Courier Buddy Search'
            }
        }).state('sender', {
            url: "/sender",
            templateUrl: "views/parcel/sender.html",
            data: {
                pageTitle: 'Sender | My Courier Buddy'
            }
        }).state('addparcel', {
            url: "/addparcel",
            templateUrl: "views/parcel/addparcel.html",
            data: {
                pageTitle: 'Add Parcel | My Courier Buddy'
            }
        }).state('cancelparcel', {
            url: "/cancelparcel",
            templateUrl: "views/parcel/cancelparcel.html",
            data: {
                pageTitle: 'Cancel Parcel | My Courier Buddy'
            }
        }).state('refundparcel', {
            url: "/refundparcel",
            templateUrl: "views/parcel/refundparcel.html",
            data: {
                pageTitle: 'Refund Parcel | My Courier Buddy',
            }
        }).state('mywallet', {
            url: "/mywallet",
            templateUrl: "views/parcel/mywallet.html",
            data: {
                pageTitle: 'Refund Parcel | My Courier Buddy',
            }
        }).state('transbooking', {
            url: "/transbooking/:id",
            templateUrl: "views/trips/transbooking.html",
            data: {
                pageTitle: 'Transporter Booking'
            }
        })
        .state('tripedit', {
            url: "/tripedit/:id",
            templateUrl: "views/trips/edittripdetails.html",
            data: {
                pageTitle: 'Edit Trip'
            }
        }).state('tripview', {
            url: "/viewtrip/:id",
            templateUrl: "views/trips/viewtripdetails.html",
            data: {
                pageTitle: 'View Trip'
            }
        }).state('editparcel', {
            url: "/editparcel/:id",
            templateUrl: "views/parcel/editparcel.html",
            data: {
                pageTitle: 'Edit Parcel'
            }
        }).state('viewparcel', {
            url: "/viewparcel/:id",
            templateUrl: "views/parcel/viewparcel.html",
            data: {
                pageTitle: 'View Parcel'
            }
        })
        .state('uploadtripticket', {
            url: "/uploadtripticket/:id",
            templateUrl: "views/trips/uploadtriptickets.html",
            data: {
                pageTitle: 'Upload Trip Tickets'
            }
        })
        .state('verifyuser', {
            url: "/verifyuser/:id/:code",
            templateUrl: "views/verifyuser.html",
            data: {
                pageTitle: 'Verifyuser'
            }
        })
        .state('parcelbooking', {
            url: "/parcelbooking/:id",
            templateUrl: "views/parcel/parcelbooking.html",
            data: {
                pageTitle: 'Parcel Booking'
            }
        })
        .state('login', {
            url: "/login",
            templateUrl: "views/login.html",
            data: {
                pageTitle: 'Login'
            }
        }).state('forgetpassword', {
            url: "/forgetpassword",
            templateUrl: "views/forgetpassword.html",
            data: {
                pageTitle: 'forgetpassword'
            }
        })
        .state('associate', {
            url: "/associate",
            templateUrl: "views/associate.html",
            data: {
                pageTitle: 'Associate'
            }
        })
        .state('register', {
            url: "/register",
            templateUrl: "views/signup.html",
            data: {
                pageTitle: 'Sign Up | MyCpurierBuddy.in'
            }
        })
        .state('resetpassword', {
            url: "/resetpassword",
            templateUrl: "views/resetpassword.html",
            data: {
                pageTitle: 'Reset password'
            }
        })
        .state('resetpasswordverify', {
            url: "/resetpasswordverify",
            templateUrl: "views/resetpasswordverify.html",
            data: {
                pageTitle: 'Change password'
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
angular.module('courier').config(configState).run(function ($rootScope, $state,  Permission, ValiDatedTokenObject, AuthService) {
    
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