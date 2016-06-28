var countries; 
$.ajax({
    async: false,

    url: "http://mycourierbuddy.in/home/country",
    cache: false,
    dataType: "html",
    success: function (data) { 
        var mydata = $.parseJSON(data); 
        countries = mydata;
    }
});   