angular.module('courier').controller("ReceiverController", function ($rootScope, $state, $scope, $location, ValiDatedTokenObject, AuthService, searchService, ReceiverService) {
    if (!AuthService.authentication.isAuth) {
        var path = $location.path();
        sessionStorage.setItem("return_url", path);
        $state.transitionTo('login');
    }
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    $scope.idupdate = "";
    $scope.parcelsingle = {};
    $scope.resaonoifupdate = "";
    $scope.list = [];
    $scope.mainlist = [];
    $scope.statusupdate = true;
    dTable = $('#example').DataTable({ searching: false });
    ReceiverService.getreceiverlist(sessionStorage.getItem("UserId")).then(function (results) {
        if (results.status == 200) {
            $scope.list = results.data.response;
            $scope.mainlist = results.data.response;
            for (i = 0; i < $scope.list.length; i++) {
                var deptime = $scope.list[i].dep_time.split(" ");
                $scope.list[i].dep_time = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                $scope.mainlist[i].dep_time = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                var arrtime = $scope.list[i].arrival_time.split(" ");
                $scope.list[i].arrival_time = new Date(arrtime[0].split("-")[1] + "/" + arrtime[0].split("-")[2] + "/" + arrtime[0].split("-")[0] + " " + arrtime[1]);
                $scope.mainlist[i].arrival_time = new Date(arrtime[0].split("-")[1] + "/" + arrtime[0].split("-")[2] + "/" + arrtime[0].split("-")[0] + " " + arrtime[1]);
                $scope.list[i].status = parseInt($scope.list[i].status);
                $scope.mainlist[i].status = parseInt($scope.list[i].status);
                dTable.row.add(["<a href='javascript:void(0);' onclick='parceldetails(" + $scope.mainlist[i].id + ")'>" + $scope.mainlist[i].ParcelID + "</a>", $scope.mainlist[i].flight_no, "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].usr_id + ")'>" + $scope.mainlist[i].MCBSenderID + "</a>", "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].Transporterid + ")'>" + $scope.mainlist[i].MCBtransporterid + "</a>", $scope.mainlist[i].statusdescription, (($scope.mainlist[i].status == 2 || $scope.mainlist[i].status == 3 || $scope.mainlist[i].status == 4) ? "<a href='javascript:void(0);'    onclick='changestatusparcel(" + $scope.mainlist[i].id + ",1)'   title='Received'>Received</a><br><a href='javascript:void(0);'    onclick='changestatusparcel(" + $scope.mainlist[i].id + ",0)'   title='Not Received'>Not Received</a>" : "") + (($scope.mainlist[i].channelid > 0) ? "<a href='javascript:void(0);'  onclick='showchat(" + $scope.mainlist[i].channelid + ")'><span class='glyphicon glyphicon-comment'></span> </a> " : "")]).draw();
            }
        }
    });
    var _searchByFilter = function () {
        $scope.list = [];
        dTable.clear().draw();
        for (i = 0; i < $scope.mainlist.length; i++) {
            if (($scope.mainlist[i].status == $scope.status || typeof $scope.status === 'undefined' || $scope.status === '' || $scope.status == null) && ($scope.mainlist[i].dep_time.getDate() == new Date($scope.departureat).getDate() || typeof $scope.departureat === 'undefined' || $scope.departureat === '' || $scope.departureat == null) && ($scope.mainlist[i].ParcelID.toLowerCase().indexOf($scope.TransporterID) != -1 || typeof $scope.TransporterID === 'undefined' || $scope.TransporterID === '' || $scope.TransporterID == null)) {
                $scope.list.push($scope.mainlist[i]);
                dTable.row.add(["<a href='javascript:void(0);' onclick='parceldetails(" + $scope.mainlist[i].id + ")'>" + $scope.mainlist[i].ParcelID + "</a>", $scope.mainlist[i].flight_no, "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].usr_id + ")'>" + $scope.mainlist[i].MCBSenderID + "</a>", "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].Transporterid + ")'>" + $scope.mainlist[i].MCBtransporterid + "</a>", $scope.mainlist[i].statusdescription, (($scope.mainlist[i].status == 2 || $scope.mainlist[i].status == 3 || $scope.mainlist[i].status == 4) ? "<a href='javascript:void(0);'  onclick='changestatusparcel(" + $scope.mainlist[i].id + ",1)'   title='Received'>Received</a><br><a href='javascript:void(0);'    onclick='changestatusparcel(" + $scope.mainlist[i].id + ",0)'   title='Not Received'>Not Received</a>" : "") + (($scope.mainlist[i].channelid > 0) ? "<a href='javascript:void(0);'  onclick='showchat(" + $scope.mainlist[i].channelid + ")'><span class='glyphicon glyphicon-comment'></span> </a> " : "")]).draw();
            }
        }
    };
    $scope.searchByFilter = function () {
        _searchByFilter();  
    };
    $scope.viewuserdetails = function (userid) {
        AuthService.getuserdetails(userid).then(function (results) {
            if (results.data.status != "Error") {
                $scope.userdetails = results.data.response[0];
                $("#userdetails").modal();
            }
        }); 
    };
    $scope.parceldetails = function (id) { 
        $scope.parcelsingle = $.grep($scope.mainlist, function (parcel) { return parcel.id == id })[0];
        if ($.grep($scope.mainlist, function (parcel) { return parcel.id == id }).length > 0)
        {
            $scope.$apply();
            $("#parceldetails").modal();
        }
    };
    $scope.changestatusparcel = function (id, status) {
        $scope.successaddtripMessage = "";
        if (status == 1) {
            bootbox.prompt("Enter Feedback about Transporter.", function (result) {
                if (result !== null) {
                    var data = { "id": id, "status": 5, "process_by": sessionStorage.getItem("UserId"), "reason": result };
                    ReceiverService.usrupdatestatus(data).then(function (results) {
                        $scope.successaddtripMessage = "Updated Successfully";
                        if (results.status == 200) {
                            ReceiverService.getreceiverlist(sessionStorage.getItem("UserId")).then(function (results) {
                                if (results.status == 200) {
                                    $scope.list = results.data.response;
                                    $scope.mainlist = results.data.response;
                                    dTable.clear().draw();
                                    for (i = 0; i < $scope.list.length; i++) {
                                        var deptime = $scope.list[i].dep_time.split(" ");
                                        $scope.list[i].dep_time = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                                        $scope.mainlist[i].dep_time = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                                        var arrtime = $scope.list[i].arrival_time.split(" ");
                                        $scope.list[i].arrival_time = new Date(arrtime[0].split("-")[1] + "/" + arrtime[0].split("-")[2] + "/" + arrtime[0].split("-")[0] + " " + arrtime[1]);
                                        $scope.mainlist[i].arrival_time = new Date(arrtime[0].split("-")[1] + "/" + arrtime[0].split("-")[2] + "/" + arrtime[0].split("-")[0] + " " + arrtime[1]);
                                        $scope.list[i].status = parseInt($scope.list[i].status);
                                        $scope.mainlist[i].status = parseInt($scope.list[i].status);
                                        dTable.row.add(["<a href='javascript:void(0);' onclick='parceldetails(" + $scope.mainlist[i].id + ")'>" + $scope.mainlist[i].ParcelID + "</a>", $scope.mainlist[i].flight_no, "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].usr_id + ")'>" + $scope.mainlist[i].MCBSenderID + "</a>", "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].Transporterid + ")'>" + $scope.mainlist[i].MCBtransporterid + "</a>", $scope.mainlist[i].statusdescription, (($scope.mainlist[i].status == 2 || $scope.mainlist[i].status == 3 || $scope.mainlist[i].status == 4) ? "<a href='javascript:void(0);'   onclick='changestatusparcel(" + $scope.mainlist[i].id + ",1)'   title='Received'>Received</a><br><a href='javascript:void(0);'  onclick='changestatusparcel(" + $scope.mainlist[i].id + ",0)'     title='Not Received'>Not Received</a>" : "") + (($scope.mainlist[i].channelid > 0) ? "<a href='javascript:void(0);'  onclick='showchat(" + $scope.mainlist[i].channelid + ")'><span class='glyphicon glyphicon-comment'></span> </a> " : "")]).draw();
                                    }
                                }
                            });
                        }
                    });
                }
            });
        }
        if (status ==0) {
            bootbox.prompt("Enter Reason why Not Received?", function (result) {
                if (result !== null) {
                    var data = { "id": id, "status": 7, "process_by": sessionStorage.getItem("UserId"), "reason": result };
                    ReceiverService.usrupdatestatus(data).then(function (results) {
                        $scope.successaddtripMessage = "Updated Successfully";
                        if (results.status == 200) {
                            ReceiverService.getreceiverlist(sessionStorage.getItem("UserId")).then(function (results) {
                                if (results.status == 200) {
                                    $scope.list = results.data.response;
                                    $scope.mainlist = results.data.response;
                                    dTable.clear().draw();
                                    for (i = 0; i < $scope.list.length; i++) {
                                        var deptime = $scope.list[i].dep_time.split(" ");
                                        $scope.list[i].dep_time = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                                        $scope.mainlist[i].dep_time = new Date(deptime[0].split("-")[1] + "/" + deptime[0].split("-")[2] + "/" + deptime[0].split("-")[0] + " " + deptime[1]);
                                        var arrtime = $scope.list[i].arrival_time.split(" ");
                                        $scope.list[i].arrival_time = new Date(arrtime[0].split("-")[1] + "/" + arrtime[0].split("-")[2] + "/" + arrtime[0].split("-")[0] + " " + arrtime[1]);
                                        $scope.mainlist[i].arrival_time = new Date(arrtime[0].split("-")[1] + "/" + arrtime[0].split("-")[2] + "/" + arrtime[0].split("-")[0] + " " + arrtime[1]);
                                        $scope.list[i].status = parseInt($scope.list[i].status);
                                        $scope.mainlist[i].status = parseInt($scope.list[i].status);
                                        dTable.row.add(["<a href='javascript:void(0);' onclick='parceldetails(" + $scope.mainlist[i].id + ")'>" + $scope.mainlist[i].ParcelID + "</a>", $scope.mainlist[i].flight_no, "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].usr_id + ")'>" + $scope.mainlist[i].MCBSenderID + "</a>", "<a href='javascript:void(0);' onclick='getuserdetails(" + $scope.mainlist[i].Transporterid + ")'>" + $scope.mainlist[i].MCBtransporterid + "</a>", $scope.mainlist[i].statusdescription, (($scope.mainlist[i].status == 2 || $scope.mainlist[i].status == 3 || $scope.mainlist[i].status == 4) ? "<a href='javascript:void(0);'   onclick='changestatusparcel(" + $scope.mainlist[i].id + ",1)'   title='Received'>Received</a><br><a href='javascript:void(0);'  onclick='changestatusparcel(" + $scope.mainlist[i].id + ",0)'  title='Not Received'>Not Received</a>" : "") + (($scope.mainlist[i].channelid > 0) ? "<a href='javascript:void(0);'  onclick='showchat(" + $scope.mainlist[i].channelid + ")'><span class='glyphicon glyphicon-comment'></span> </a> " : "")]).draw();
                                    }
                                }
                            });
                        }
                    });
                }
            });
        }
    }

    $scope.loginuserid = AuthService.authentication.UserId;
    $scope.channelid = 0;
    $scope.showchat = function (channelid) {
        $scope.channelid = channelid;
        AuthService.getchatlist($scope.channelid).then(function (response) {
            var index = 0;
            var datestore = "";
            var namestore = "";
            for (i = 0; i < response.data.length; i++) {
                var dat = response.data[i].created.split("-");
                var day = dat[2].split(" ");
                response.data[i].created = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
                response.data[i].created = calcTime(response.data[i].created.getTime(), 12.5);
                if (datestore != (dat[1] + "/" + day[0] + "/" + dat[0])) {
                    $scope.messages.push({ "date": response.data[i].created, "messages": [response.data[i]] });
                    index = index + 1;
                    datestore = (dat[1] + "/" + day[0] + "/" + dat[0]);
                }
                else {
                    $scope.messages[index - 1].messages.push(response.data[i]);
                }
            }
            $('#qnimate').addClass('popup-box-on');
            $(".popup-messages").animate({ scrollTop: 9999999 }, 500);
        });
    }
    $scope.chatmessage = "";
    $scope.messages = [];
    var socket = io.connect('http://webservice.mycourierbuddy.com:3000');
    $scope.submitchat = function () {
        var dataString = { channelid: $scope.channelid, messageuserid: AuthService.authentication.UserId, message: $scope.chatmessage };
        $.ajax({
            type: "POST", url: "http://webservice.mycourierbuddy.com/api/chatsubmit", data: dataString, dataType: "json", cache: false, success: function (data) {
                $scope.chatmessage = "";
                if (data.success == true) {
                    $("#notif").html(data.notif);
                    socket.emit('new_count_message', { new_count_message: data.new_count_message });
                    socket.emit('new_message', { channelid: data.channelid, username: data.username, created: data.created, message: data.message, id: data.id });
                } else if (data.success == false) {
                    $("#notif").html(data.notif);
                }
                $(".popup-messages").animate({ scrollTop: 9999999 }, 50);
            }, error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }
    socket.on('new_count_message', function (data) {
        //  $("#new_count_message").html(data.new_count_message);
        $('#notif_audio')[0].play();
    });
    socket.on('update_count_message', function (data) {
        //$("#new_count_message").html(data.update_count_message);
    });
    socket.on('new_message', function (data) {
        if ($scope.channelid == data.channelid) {
            var dat = data.created.split("-");
            var day = dat[2].split(" ");
            data.created = new Date((dat[1] + "/" + day[0] + "/" + dat[0] + " " + day[1]));
            data.created = calcTime(data.created.getTime(), 12.5);
            if ($.grep($scope.messages, function (a) { return moment(a.date).format('L') == moment(data.created).format('L') }).length > 0) {
                $.grep($scope.messages, function (a) { return moment(a.date).format('L') == moment(data.created).format('L') })[0].messages.push(data);
            } else {
                $scope.messages.push({ "date": data.created, "messages": [data] });
            }
            $scope.$apply();
            $("#no-message-notif").html('');
            $(".popup-messages").animate({ scrollTop: 9999999 }, 50);
            $("#new-message-notif").html('<div class="alert alert-success" role="alert"> <i class="fa fa-check"></i><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>New message ...</div>');
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