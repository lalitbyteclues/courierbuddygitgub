$(document).ready(function () {
	

    //basic pop-up
    $('#open-pop-up-1').click(function(e) {
        e.preventDefault();
        $('#pop-up-1').popUpWindow({action: "open"});
    });

    //Buttons pop-up
    $('#open-pop-up-2').click(function (e) {
        e.preventDefault();
        $('#pop-up-2').popUpWindow({
            action: "open",
            buttons: [{
                text: "Yes",
                click: function () {
                    this.close();
                }
            }, {
                text: "No",
                click: function () {
                    this.close();
                }
            }]
        });
    });

    //Custom buttons popup
    $('#open-pop-up-3').click(function (e) {
        e.preventDefault();
        $('#pop-up-3').popUpWindow({
            action: "open",
            buttons: [{
                text: "Yes",
                cssClass: "btn-yes",
                click: function () {
                    this.close();
                }
            }, {
                text: "No",
                cssClass: "btn-no",
                click: function () {
                    this.close();
                }
            }]
        });
    });

    //On close callback
    $('#open-pop-up-4').click(function (e) {
        e.preventDefault();
        $('#pop-up-4').popUpWindow({
            action: "open",
            onClose: function(){
                alert('Window Closed');
            }
        });
    });

    //advanced modal popup
    $('#open-pop-up-5').click(function (e) {
        e.preventDefault();
        $('#pop-up-5').popUpWindow({
            action: "open",
            modal: true,
            onClose: function () {
                alert('Window Closed');
            },
            buttons: [{
                text: "Yes",
                click: function () {
                    alert('Yes clicked');
                    this.close();
                }
            }]
        });
    });

    //small size popup
    $('#open-pop-up-6').click(function (e) {
        e.preventDefault();
        $('#pop-up-6').popUpWindow({
            action: "open",
            size: "small"
        });
    });
    //small size popup
    $('.open-pop-up-6').click(function (e) {
        e.preventDefault();
       
        id=$(this).data('id');

        typ=$(this).data('type');
        if(typ=='trans'){
		var actn='trans_details';
			}
		else if(typ=='send')
		{
		var actn='send_details';
			}
		else if(typ=='recv')
		{
		var actn='recv_details';
			}
		else if(typ=='trans_pay')
		{
		var actn='trans_pay_details';
			}
		else if(typ=='send_pay')
		{
		var actn='send_pay_details';
			}
		else if(typ=='resenttrans')
		{
		var actn='resenttrans';
			}
		else if(typ=='resentsend')
		{
		var actn='resentsend';
			}
		else if(typ=='resentrecv')
		{
		var actn='resentrecv';
			}
		
 $.ajax({
       dataType: "html",
            type: "post",
            evalScripts: true,
          //  url: 'users/'+actn,
            url: 'users/trans_details',
            data: ({id:id,actn:actn}),
            success:function(response){
      $('#mypop-contnt').empty();
      $('#mypop-contnt').html(response);
 
            }
           
        });
        
        
        
        
        
        $('#pop-up-6').popUpWindow({
            action: "open",
            size: "role"
        });
    });
    $('#open6').click(function (e) {
        e.preventDefault();
        $('#pop-up-6').popUpWindow({
            action: "open",
            size: "small"
        });
    });

    //medium size popup
    $('#open-pop-up-7').click(function (e) {
        e.preventDefault();
        $('#pop-up-7').popUpWindow({
            action: "open",
            size: "medium"
        });
    });
        //small size popup
    $('#open-pop-up-6-1').click(function (e) {
        e.preventDefault();
        $('#pop-up-6-1').popUpWindow({
            action: "open",
            size: "small2"
        });
    });
        //small size popup
    $('#open-pop-up-6-2').click(function (e) {
        e.preventDefault();
        	$( "#pop-up" ).addClass( "myClass" );
        $('#pop-up-6-2').popUpWindow({
            action: "open",
            size: "small2"
        });
    });
        //small size popup

        $('#pop-up-6-1-3').popUpWindow({
            action: "open",
            size: "small3"
        });
	 $('#pop-up-6-1-4').popUpWindow({
            action: "open",
            size: "small3"
        });
	  $('#pop-up-6-1-5').popUpWindow({
	    action: "open",
            size: "small3"
        });
	  $('#pop-up-6-1-6').popUpWindow({
	    action: "open",
            size: "small3"
        });
	  $('#pop-up-6-1-7').popUpWindow({
	    action: "open",
            size: "small3"
        });

            //small size popup
    $('#open-pop-up-8').click(function (e) {
        e.preventDefault();
        $('#pop-up-8').popUpWindow({
            action: "open",
            size: "small2"
        });
    });
    $('.newsletter').click(function (e) {
		var id=($(this).data('id'));
        e.preventDefault();
        
        
         $.ajax({
       dataType: "html",
            type: "post",
            evalScripts: true,
          //  url: 'users/'+actn,
            url: 'letter/sub_send/',
            data: ({id:id}),
            success:function(response){
      $('#mypop-contnt').empty();
      $('#mypop-contnt').html(response);
 
            }
           
        });
        
        
        
        
        
        $('#news').popUpWindow({
            action: "open",
            size: "small3"
        });
    });

    
    
    $('.my-message-box').click(function (e) {
		//alert($(this).data('item'));

		$('#m_id').val($(this).data('item'));
        e.preventDefault();
        $('#message-box').popUpWindow({
            action: "open",
            size: "small2"
        });
    });
    $('.my-message-box-snd').click(function (e) {
		//alert($(this).data('item'));

		$('#m_id_snd').val($(this).data('item'));
        e.preventDefault();
        $('#message-box-snd').popUpWindow({
            action: "open",
            size: "small2"
        });
    });
    $('.my-receiver-box-updt').click(function (e) {
		//alert($(this).data('item'));
		var bid=($(this).data('item'));

	//	$('.buk_id').val($(this).data('item'));
        e.preventDefault();
        $('#receiver-box-updt').popUpWindow({
            action: "open",
            size: "small2"
        });
		         $.ajax({
       dataType: "html",
            type: "post",
            async: false,
            evalScripts: true,
          //  url: 'users/'+actn,
            url: 'dashboard/recupdpop',
            data: ({bid:bid}),
            success:function(response){
		$('.chnge-sts-cntnt').html(response);
 
            }
           
        });

        
    });
    
    
    // change status codes start here
    
    
    $('.my-status-box').on('click',function (e) {
$('.cncel-opt-rad').empty();


var item=$(this).data('item');
var page=$(this).data('page');



if(page=='receiver')
{
$('.cncel-opt-rad').html('<input type="radio" value="Y" class="p-check" id="StatusChoiceY" name="data[Status][choice]">Received<input type="radio" value="N" class="p-check" id="StatusChoiceN" name="data[Status][choice]">Not Received<input type="hidden" class="b_idd" id="b_id" required="required" name="data[Status][b_id]" value="'+item+'"><input type="hidden" class="b_idd" id="pgg"  name="data[Status][page]" value="'+page+'"> ');
}
else if(page=='sender')
{
$('.cncel-opt-rad').html('<input type="radio" value="Y" class="p-check" id="StatusChoiceY" name="data[Status][choice]">Received<input type="radio" value="N" class="p-check" id="StatusChoiceN" name="data[Status][choice]">Not Received<input type="hidden" class="b_idd" id="b_id" required="required" name="data[Status][b_id]" value="'+item+'"><input type="hidden" class="b_idd" id="pgg"  name="data[Status][page]" value="'+page+'">  ');	
}
else
{
$('.cncel-opt-rad').html('<input type="radio" value="Y" class="p-check" id="StatusChoiceY" name="data[Status][choice]" required >Delivered<input type="radio" value="N" class="p-check" id="StatusChoiceN" name="data[Status][choice]" required>Not Received<input type="hidden" class="b_idd" id="b_id" required="required" name="data[Status][b_id]" value="'+item+'"><input type="hidden" class="b_idd" id="pgg"  name="data[Status][page]" value="'+page+'">  ');
}

$('.cncel-opt-rad').append('<div class="feed_bx" style="display:none"><label> Feedback</label><input type="textarea" name="data[Status][feed]" required id="feed" class="feed-req" ></div><div class="resn_bx" style="display:none"><label> Reason</label><input type="textarea" name="data[Status][reason]" required id="resn" class="res-req" ></div>');


$('.cncel-opt-rad').append('<script>	$(document).on("change", ":radio", function () { var rad_ch=($(this).val());  	if(rad_ch=="Y"){  	 	$(".feed_bx").css("display","block"); $(".res-req").removeAttr("required");   $(".feed-req").attr("required");                  $(".resn_bx").css("display","none");	} else {		$(".feed_bx").css("display","none");    $(".resn_bx").css("display","block"); $(".res-req").attr("required"); $(".feed-req").removeAttr("required");}	}); 	</script>');


		//$('.b_idd').val('');
		//$('.b_idd').val($(this).data('item'));
		$(".alrt").css('display','block');
		$(".cncel-rsn").css('display','none');
		
        e.preventDefault();
        $('#status-box').popUpWindow({
            action: "open",
            size: "small2"
        });
    });
    
 	$(".my-status-chng").on("click",function(){

$('.cncel-opt-rad').empty();


var item=$(this).data('item');
var page=$(this).data('page');
		
$("#pay-content").load(site_url+"dashboard/chngstatus/"+item+"/"+page);

		
		
		
		
/*
		$("#pay-content").load("dashboard/recupdpop/"+bid);
*/
		});   
    
    
    // change status codes end here
    
        $('.my-booking-box').click(function (e) {
		//alert($(this).data('item'));
var tid = $(this).data('item');
		         $.ajax({
       dataType: "html",
            type: "post",
            async: false,
            evalScripts: true,
          //  url: 'users/'+actn,
            url: 'dashboard/viewbooking',
            data: ({tid:tid}),
            success:function(response){
		$('.vwbuking').html(response);
 //alert(response);
            }
           
        });
		//$('#m_id').val($(this).data('item'));
        e.preventDefault();
        $('#booking-box').popUpWindow({
            action: "open",
            size: "large"
        });
    });
    

});
