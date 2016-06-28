/**
 * Created by Van on 18.01.2016.
 */


angular.module('courier').filter('trusted', ['$sce', function ($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);

angular.module('courier').filter('trustedHtml', ['$sce', function ($sce) {
    return function(html){
        return $sce.trustAsHtml(html)
    };
}]);

angular.module('courier').filter('limitHtml', function() {
    return function(text, limit) {

        var changedString = String(text).replace(/<[^>]+>/gm, '');
        var length = changedString.length;

        return changedString.length > limit ? changedString.substr(0, limit - 1) : changedString;
    }
});

angular.module('courier').filter('limitHightlightHtml', function() {
        return function(text, limit) {

            var changedString = String(text).replace(/<span class="hl">([^><]+)<\/span>/g, "[high6789]$1[/high6789]");

            changedString = String(changedString).replace(/<[^>]+>/gm, '');

            var start = changedString.indexOf("[high6789]");
            if (start <= 0){
                start = 0;
            }
            else{
                var diff = limit/4;
                if (start - diff >0){
                    start = start - diff;
                }
            }

            var length = changedString.length;

            changedString = changedString.length > limit ? changedString.substr(start, limit - 1) : changedString;

            changedString = String(changedString).replace(/\[high6789\]/g,"<span class='hl'>");
            changedString = String(changedString).replace(/\[\/high6789\]/g,"</span>");

            return changedString;
        }
});