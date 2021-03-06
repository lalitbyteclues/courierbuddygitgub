angular.module('courier').controller("chatmessagesController", function ($rootScope, $state, $scope, $location, ValiDatedTokenObject, AuthService, searchService, ReceiverService) {
    $scope.loginuserid = AuthService.authentication.UserId;
    $scope.channelid = 0;
    $scope.chatslist = [];
    $scope.users = {};
    $scope.screenresolation = window.innerWidth;
    $scope.updatechat = function () {
        if (AuthService.authentication.UserId == 0) {
            $scope.chatslist = [];
        }
    } 
    $scope.showchat = function (channelid, parcelid) {
        $scope.loginuserid = AuthService.authentication.UserId;
        if (($.grep($scope.chatslist, function (a) { return a.channelid == channelid })).length == 0)
        {
            $scope.messages = [];
            $scope.channelid = channelid;
            AuthService.getchatlist($scope.channelid).then(function (response) {
                var index = 0;
                var datestore = "";
                var namestore = "";
                $scope.users = response.data.users[0];
                for (i = 0; i < response.data.message.length; i++) {
                    var dat = response.data.message[i].created.split("-");
                    var day = dat[2].split(" ");
                    response.data.message[i].created = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
                    response.data.message[i].created = calcTime(response.data.message[i].created.getTime(), 12.5);
                    if (datestore != (dat[1] + "/" + day[0] + "/" + dat[0])) {
                        $scope.messages.push({ "date": response.data.message[i].created, "messages": [response.data.message[i]] });
                        index = index + 1;
                        datestore = (dat[1] + "/" + day[0] + "/" + dat[0]);
                    }
                    else {
                        $scope.messages[index - 1].messages.push(response.data.message[i]);
                    }
                }
                for (i = 0; i < $scope.chatslist.length; i++) {
                    $scope.chatslist[i].isminimized = true;
                }
                $scope.chatslist.push({ "parcelid": parcelid, "chatmessage": "", "channelid": channelid, "messages": $scope.messages, isminimized: false });
             });
        }
    } 
    $scope.messages = [];
    var socket = io.connect('https://mycourierbuddy.com:3000');
    $scope.submit = function (channelid, message) {
        $scope.submitchat(channelid, message); 
    }
    $scope.submitchat = function (channelid, message) { 
        var dataString = { channelid: channelid, messageuserid: AuthService.authentication.UserId, message: message }; 
        $.ajax({
            type: "POST", url: apiBasePath+"api/chatsubmit", data: dataString, dataType: "json", cache: false, success: function (data) {
                $scope.messages = $.grep($scope.chatslist, function (a) { return a.channelid == channelid })[0].chatmessage = "";
                if (data.success == true) {
                    $("#notif").html(data.notif);
                    socket.emit('new_count_message', { new_count_message: data.new_count_message });
                    var newamitmessage = { channelid: channelid, parcelid: data.parcelid, senderid: data.senderid, transporterid: data.transporterid, receiverid: data.receiverid, username: data.username, created: data.created, message: data.message, id: data.id };
                    socket.emit('new_message', newamitmessage);
                } else if (data.success == false) {
                    $("#notif").html(data.notif);
                } 
            }, error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }
    $scope.removechat = function (index) {
        $scope.chatslist.splice(index, 1);
    }
    $scope.minimizechat = function (index) {
        for (i = 0; i < $scope.chatslist.length; i++) {
            $scope.chatslist[i].isminimized = true;
        }
        $scope.chatslist[index].isminimized=true;
    }
    $scope.maximizechat = function (index) {
        for (i = 0; i < $scope.chatslist.length; i++) {
            $scope.chatslist[i].isminimized = true;
        }
        $scope.chatslist[index].isminimized = false;
    }
    socket.on('new_count_message', function (data) {
        //  $("#new_count_message").html(data.new_count_message);
        $('#notif_audio')[0].play();
    });
    socket.on('update_count_message', function (data) {
        //$("#new_count_message").html(data.update_count_message);
    });
    socket.on('new_message', function (data) {
        if (AuthService.authentication.UserId == data.senderid || AuthService.authentication.UserId == data.transporterid || AuthService.authentication.UserId == data.receiverid) {
            if ($.grep($scope.chatslist, function (a) { return a.parcelid == data.parcelid }).length > 0) {
                $scope.messages = $.grep($scope.chatslist, function (a) { return a.parcelid == data.parcelid })[0].messages;
                var dat = data.created.split("-");
                var day = dat[2].split(" ");
                data.created = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
                data.created = calcTime(data.created.getTime(), 12.5);
                if ($.grep($scope.messages, function (a) { return moment(a.date).format('L') == moment(data.created).format('L') }).length > 0) {
                    $.grep($scope.messages, function (a) { return moment(a.date).format('L') == moment(data.created).format('L') })[0].messages.push(data);
                } else {
                    $scope.messages.push({ "date": data.created, "messages": [data] });
                }
                $.grep($scope.chatslist, function (a) { return a.parcelid == data.parcelid })[0].messages = $scope.messages;
                for (i = 0; i < $scope.chatslist.length; i++) {
                    $scope.chatslist[i].isminimized = true;
                }
                $.grep($scope.chatslist, function (a) { return a.parcelid == data.parcelid })[0].isminimized = false;
                $scope.$apply();
                $("#no-message-notif").html(''); 
                $("#new-message-notif").html('<div class="alert alert-success" role="alert"> <i class="fa fa-check"></i><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>New message ...</div>');
            }
            else {
                $scope.messages = [];
                AuthService.getchatlist(data.channelid).then(function (response) {
                    var index = 0;
                    var datestore = "";
                    var namestore = "";
                    $scope.users = response.data.users[0];
                    for (i = 0; i < response.data.message.length; i++) {
                        var dat = response.data.message[i].created.split("-");
                        var day = dat[2].split(" ");
                        response.data.message[i].created = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
                        response.data.message[i].created = calcTime(response.data.message[i].created.getTime(), 12.5);
                        if (datestore != (dat[1] + "/" + day[0] + "/" + dat[0])) {
                            $scope.messages.push({ "date": response.data.message[i].created, "messages": [response.data.message[i]] });
                            index = index + 1;
                            datestore = (dat[1] + "/" + day[0] + "/" + dat[0]);
                        }
                        else {
                            $scope.messages[index - 1].messages.push(response.data.message[i]);
                        }
                    }
                    for (i = 0; i < $scope.chatslist.length; i++) {
                        $scope.chatslist[i].isminimized = true;
                    }
                    $scope.chatslist.push({ "parcelid": data.parcelid, "chatmessage": "", "channelid": data.channelid, "messages": $scope.messages, isminimized: false });
                     
                });
            }
        }
    });
    socket.emit('get_history', 12);
    socket.on('history', function (msg) {
        console.log(msg);
    });
    function calcTime(utc, offset) {
        var nd = new Date(utc + (3600000 * offset));
        return nd;
    }
});