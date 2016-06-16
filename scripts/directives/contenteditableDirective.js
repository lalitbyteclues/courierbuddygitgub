angular
    .module('courier').directive('contenteditable', function ($sce) {
    return {
        restrict: 'A', require: '?ngModel', link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; ngModel.$render = function () { element.html($sce.getTrustedHtml(ngModel.$viewValue || '')); }; element.on('blur keyup change', function () { scope.$evalAsync(read); }); read();
            function read() {
                var html = element.html();
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                } ngModel.$setViewValue(html);
            }
        }
    }
});


angular.module('courier').directive('datepickerPopup', function (dateFilter, datepickerPopupConfig) {
    return {
        restrict: 'A',
        priority: 1,
        require: 'ngModel',
        link: function(scope, element, attr, ngModel) {
            var dateFormat = attr.datepickerPopup || datepickerPopupConfig.datepickerPopup;
            ngModel.$formatters.push(function (value) {
                return dateFilter(value, dateFormat);
            });
        }
    };
});

