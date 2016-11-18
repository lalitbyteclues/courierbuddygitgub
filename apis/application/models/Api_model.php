<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class Api_model extends CI_Model {
    
    public function __construct()
    {
        parent::__construct();
		$config = Array( 'protocol' => 'smtp',    'smtp_host' => 'mail.mycourierbuddy.com',    'smtp_port' => 25,    'smtp_user' => 'info@mycourierbuddy.com','smtp_pass' => 'Interior@123','mailtype' => 'html','charset' => 'iso-8859-1','wordwrap' => TRUE);
		$this->load->library('email', $config);
    }
	function checkregisteruser($email) 
	{
		$this->db->where("username",$email);          
        $query=$this->db->get("users");
        if($query->num_rows()>0)
        { return false;            
		} 
		return true;
    }
	function checkregistermobile($mobile)    
	{ 
		$this->db->where("mobile",$mobile);        
        $query=$this->db->get("users");
        if($query->num_rows()>0)
        { return false;            
		} 
		return true;
    }
	function gettransporterdetail($transporterid)
	{      $data=new stdclass();
		   $tripquery = $this->db->query("SELECT a.*, (a.capacity - awailableweight.totalweight) AS awailableweight,trstatus.status as statusdescription,al.link airlinelink FROM cms_trips a LEFT JOIN (SELECT SUM( weight ) AS totalweight, trans_id as t_id FROM  `cms_parcels` WHERE STATUS not in(6,0) GROUP BY trans_id )awailableweight ON a.id = awailableweight.t_id left join cms_tripstatus trstatus on a.status=trstatus.id  left join cms_airlineinfo al on SUBSTR(a.flight_no,1,2)=al.code where a.id=".$transporterid); 
		   $trip=$tripquery->result();
		   $tp=$trip[0];
			if( $tp->status==3 || $tp->status==2 || $tp->status==6)
			{ 
			  $booking = $this->db->query("SELECT a.*,IFNULL(b.username,'') as senderemail,IFNULL(b.name,'') as sendername,IFNULL(c.username,'') as receiveremail ,IFNULL(c.name,'') as receivername,d.BookingID,prstatus.status as statusdescription,IFNULL(channel.id,0) as channelid FROM cms_parcels a left join (select * from cms_chatchannel where isactive=1) channel on a.id=channel.parcelid left join cms_users b on a.usr_id=b.id left join cms_users c on a.recv_id=c.id inner join (select par.id ParcelID,ifnull(bk.id,0) BookingID,par.trans_id as t_id from cms_parcels par left join cms_bookings bk on par.id=bk.p_id and bk.status<>4 where par.status<>0) d on a.id=d.ParcelID left join cms_parcelstatus prstatus on a.status=prstatus.id where `t_id`=".$tp->id.""); 
			  $data->parcel=$booking->result();
			}
			if($tp->status==1 || $tp->status==2 || $tp->status==3){ 
			$dt = new DateTime($tp->arrival_time); 
				$booking = $this->db->query("SELECT a.*,prstatus.status as statusdescription FROM `cms_parcels` a left join cms_parcelstatus prstatus on a.status=prstatus.id  where  a.status =0 and source ='".$tp->source."' and  a.destination='".$tp->destination."' and  '".$dt->format('Y/m/d')."'<= a.till_date and  a.till_date >= CURDATE() "); 
			  $data->parcellist=$booking->result();
			} 
			$data->status="success";
			$data->response=$trip;
			$json_response = json_encode($data);   
		    return $json_response; 
	} 
	function getparceldetail($parcelid)
	{       $data=new stdclass();
		    $query = $this->db->query("SELECT a.*,IFNULL(b.username,'') as receiveremail,IFNULL(b.name,'') as receivername,IFNULL(b.mobile,'') as receivermobile,IFNULL(b.country_code,'') as receivercountrycode,IFNULL(c.username,'') as transemail,prstatus.status as statusdescription,IFNULL(channel.id,0) as channelid FROM cms_parcels a left join (select * from cms_chatchannel where isactive=1) channel on a.id=channel.parcelid left join cms_users b on a.recv_id=b.id left join cms_users c on a.trans_id=c.id  left join cms_parcelstatus prstatus on a.status=prstatus.id where a.id=".$parcelid." "); 
			$parcel=new stdclass();
			$parcel=$query->result(); 
			$tp=$parcel[0]; 			
			if( $tp->status==2 || $tp->status==3 || $tp->status==4 || $tp->status==5)
			{ $booking = $this->db->query("SELECT a.*,IFNULL(b.username,'') as transporteremail,IFNULL(b.name,'') as transportername,d.id as BookingID FROM cms_trips a left join cms_users b on a.t_id=b.id inner join cms_bookings d on a.id=d.t_id where d.p_id=".$tp->id.""); 
				 $data->trip=$booking->result();
			}else{
				if($tp->status==0){
				$booking = $this->db->query("SELECT id,a.TripID,source,destination,dep_time,arrival_time,image,flight_no,pnr,comment,(a.capacity-COALESCE(c.totalweight,0)) capacity,a.t_id,created,status,processed_by,'update' FROM `cms_trips` a left join (SELECT SUM( weight ) AS totalweight, trans_id as t_id FROM  `cms_parcels` WHERE STATUS not in(6,0) GROUP BY trans_id)c on a.id=c.t_id where (a.status=1 or a.status=3) and destination='".$tp->destination."' and source='".$tp->source."' and arrival_time<='".$tp->till_date." 23:59' and arrival_time >= CURDATE()  "); 
				 $data->tripsmatch=$booking->result();
			} }
			$data->status="success";
			$data->response=$parcel;
			$json_response = json_encode($data);   
	     	return $json_response; 
	}  
	function triplist($userID)
	{
			$data=new stdclass();
			$query = $this->db->query("SELECT a . * , (a.capacity - c.totalweight) AS awailableweight,trstatus.status as statusdescription,al.link airlinelink  FROM cms_trips a LEFT JOIN (SELECT SUM( weight ) AS totalweight, trans_id as t_id FROM  `cms_parcels` WHERE STATUS not in(6,0) GROUP BY trans_id )c ON a.id = c.t_id left join cms_tripstatus trstatus on a.status=trstatus.id  left join cms_airlineinfo al on SUBSTR(a.flight_no,1,2) =al.code WHERE a.status not IN (4) AND a.arrival_time >= CURDATE() AND a.t_id =".$userID.""); 
			$data->status="success";
			$data->response=$query->result();		
			$json_response = json_encode($data); 
			print_r($json_response); 
	} 
	function newsletterslist()
	{ 	$data=new stdclass();
			$query = $this->db->query("SELECT * from cms_letters"); 
			$data->status="success";
			$data->response=$query->result();		
			$json_response = json_encode($data); 
			print_r($json_response); 
	}
	function sendnewsletters($post)
	{ 	    
	$query = $this->db->query("SELECT * from cms_letters where id=".$post["id"]); 
	$news=$query->result()[0]; 
	foreach ($post["users"] as $aa) 
	{ 	if($aa["selected"])
		{
				$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
				$this->email->to($aa["username"].',admin@mycourierbuddy.com'); 
				$this->email->subject($news->title);   
			 	$this->email->message($news->description);
				$this->email->send();
		}
	}
	        $data=new stdclass(); 
			$data->status="success";
			$data->response="send Successfully";		
			$json_response = json_encode($data); 
			print_r($json_response); 
	}
	function staticpageslist($id)
	{ 	$data=new stdclass();
			$query = $this->db->query("SELECT * from cms_statics where id=".$id." or ".$id."=0"); 
			$data->status="success";
			$data->response=$query->result();		
			$json_response = json_encode($data); 
			print_r($json_response); 
	}
	function receiverlist($userID) 
	{   $query = $this->db->query("select a.id,a.usr_id,a.source,a.destination,a.till_date,a.type,a.height,a.width,a.weight,a.length,a.created,a.description,a.status,a.recv_id,a.recv_comment,a.processed_by,a.ParcelID,a.payment,a.trans_id,a.trans_comment,a.reason,recv.username receiveremail,recv.mobile receivermobile,recv.name receivername,send.username senderemail,send.mobile sendermobile,send.name sendername ,trans.username transporteremail,trans.mobile transportermobile,trans.name transportername,trans.id Transporterid,trans.UserID as MCBtransporterid,send.UserID as MCBSenderID,trip.flight_no,trip.arrival_time,trip.dep_time,trip.pnr,trip.TripID,book.id as BookingID,prstatus.status as statusdescription,IFNULL(channel.id,0) as channelid  from cms_parcels a  left join (select * from cms_chatchannel where isactive=1) channel on a.id=channel.parcelid   inner join cms_users recv on a.recv_id=recv.id  inner join cms_users send on a.usr_id=send.id  inner join cms_trips trip on a.trans_id=trip.id   inner join cms_users trans on trip.t_id=trans.id  inner join (SELECT * FROM cms_bookings WHERE id IN ( SELECT id FROM cms_bookings WHERE STATUS !=4 UNION SELECT id FROM cms_bookings WHERE STATUS =4 AND p_id NOT  IN ( SELECT p_id FROM cms_bookings WHERE STATUS !=4 ))) book on a.id=book.p_id left join cms_parcelstatus prstatus on a.status=prstatus.id where a.recv_id=".$userID." and a.status in(2,3,4,5,6)"); 
		$data=new stdclass();
		$data->status="success";
		$data->response=$query->result();		
		$json_response = json_encode($data); 
		print_r($json_response); 
	}
	function parcellist($userID)
	{
		$query = $this->db->query("SELECT a.*,IFNULL(b.username,'') as receiveremail,IFNULL(b.UserID,'') as MCBreceiverID,IFNULL(c.username,'') as transemail,IFNULL(c.UserID,'') as MCBTransporterID,IFNULL(c.id,0) as transporterID,prstatus.status as statusdescription,IFNULL(channel.id,0) as channelid FROM cms_parcels a left join cms_users b on a.recv_id=b.id left join cms_trips trip on a.trans_id=trip.id left join cms_users c on trip.t_id=c.id left join cms_parcelstatus prstatus on a.status=prstatus.id  left join (select * from cms_chatchannel where isactive=1) channel on a.id=channel.parcelid  where a.status not in(6,8) AND a.till_date >= CURDATE() and  a.usr_id=".$userID." "); 
		$data=new stdclass();
		$data->status="success";
		$data->response=$query->result();		
		$json_response = json_encode($data); 
		print_r($json_response); 
	}
	function triplistall(){
		$data=new stdclass();
		$query = $this->db->query("SELECT a . * ,user.UserID, (a.capacity - c.totalweight) AS awailableweight,trstatus.status as statusdescription,al.link airlinelink FROM cms_trips a LEFT JOIN (SELECT SUM( weight ) AS totalweight, trans_id as t_id FROM  `cms_parcels` WHERE STATUS not in(6,0) GROUP BY trans_id )c ON a.id = c.t_id left join cms_tripstatus trstatus on a.status=trstatus.id left join cms_airlineinfo al on SUBSTR(a.flight_no,1,2) =al.code left join cms_users user on a.t_id =user.id order by a.status"); 
		$data->status="success";
		$data->response=$query->result();		
		$json_response = json_encode($data); 
		print_r($json_response);   
	}
	function parcellistall($datapost)
	{   
	    $data=new stdclass(); 
		$data->total=$this->db->count_all('parcels');
		$limit = explode('-', $datapost["limit"]); 
		$query = $this->db->query("SELECT a.*,prstatus.status as statusdescription,ct.TripID,ct.id as tripprimaryid from cms_parcels a left join cms_parcelstatus prstatus on a.status=prstatus.id left join cms_bookings cb on a.id=cb.p_id and cb.status<>4 left join cms_trips ct on cb.t_id=ct.id  where (CAST(a.id as CHAR) LIKE '%". $datapost["id"]."%' or '".$datapost["id"]."'='' ) and (a.status='". $datapost["status"]."' or '".$datapost["status"]."'='' )and (a.till_date='". $datapost["till_date"]."' or '".$datapost["till_date"]."'='' ) order by a.id desc Limit ".$limit[0].",".$limit[1]); 
		$data->status="success";
		$data->response=$query->result();		
		$json_response = json_encode($data); 
		print_r($json_response); 
	}
	function allbookinglist($datapost)
	{    	
			$data=new stdclass();
			$data->total=$this->db->count_all('bookings');
			$limit = explode('-', $datapost["limit"]); 
			$query = $this->db->query("select a.*,b.payment,ps.id parcelstatusid,ps.status BookingStatus,trip.t_id as transporterID,b.usr_id,parceluser.UserID as SenderID,tripuser.UserID TransporteruserID,b.ParcelID,trip.TripID  from cms_bookings a  inner join cms_trips trip on a.t_id=trip.id  left join cms_users tripuser on trip.t_id=tripuser.id  inner join cms_parcels  b on a.p_id =b.id left join cms_users parceluser on b.usr_id=parceluser.id inner join cms_tripstatus ps on a.status=ps.id where (DATEDIFF(CURDATE(),a.created)<=".$datapost["period"]." or ".$datapost["period"]."=0 ) order by a.id desc Limit ".$limit[0].",".$limit[1]); 
			$payment=$this->db->query("select sum(price) totalamount, sum(price)-sum(transportershare) as commission,sum(transportershare) as topay  from cms_zonepricelist a  inner join cms_weightrange b on a.weightrangeid=b.id  inner join cms_airports sou on a.fromzoneid=sou.zonelistid  inner join cms_airports dest on a.tozoneid=dest.zonelistid left join cms_parcels p on p.weight>b.minweight and  p.weight<=b.maxweight and sou.location=p.source and dest.location=p.destination where p.id in(select p_id from cms_bookings where status<>4)");
			$data->status="success";
			$data->response=$query->result();		
			$data->paymentdetails=$payment->result();		
			$json_response = json_encode($data); 
			print_r($json_response); 
	}
	function alldeliveryreportslist($datapost)
	{    	$data=new stdclass();
			$data->total=$this->db->count_all('bookings');
			$limit = explode('-', $datapost["limit"]); 
			$query = $this->db->query("select a.*,b.payment,ps.status BookingStatus,trip.t_id as transporterID,b.usr_id,parceluser.UserID as SenderID,tripuser.UserID TransporteruserID,a.status as BookingStatusdesc,recv.id ReceiverID,recv.UserID ReceiverMCBID  from cms_bookings a  inner join cms_trips trip on a.t_id=trip.id  left join cms_users tripuser on trip.t_id=tripuser.id  inner join cms_parcels  b on a.p_id =b.id left join cms_users recv on b.recv_id= recv.id left join cms_users parceluser on b.usr_id=parceluser.id inner join cms_parcelstatus ps on b.status=ps.id where (DATEDIFF(CURDATE(),a.created)<=".$datapost["period"]." or ".$datapost["period"]."=0 ) and ((".$datapost["status"]."=0 and a.status in(3,6)) or a.status=".$datapost["status"].")  order by a.id desc Limit ".$limit[0].",".$limit[1]); 
			$data->status="success";
			$data->response=$query->result();		
			$json_response = json_encode($data); 
			print_r($json_response); 
	}
	function canceltripslist($userID){ 
		$data=new stdclass();
		$query = $this->db->query("SELECT a . * , (a.capacity - c.totalweight) AS awailableweight,trstatus.status as statusdescription FROM cms_trips a LEFT JOIN (SELECT SUM( weight ) AS totalweight, trans_id as t_id FROM  `cms_parcels` WHERE STATUS not in(6,0) GROUP BY trans_id)c ON a.id = c.t_id left join cms_tripstatus trstatus on a.status=trstatus.id WHERE (a.status IN (4) or a.dep_time < CURDATE())  AND a.t_id =".$userID.""); 
		$data->status="success";
		$data->response=$query->result();		
		$json_response = json_encode($data); 
		print_r($json_response);  
	}
	function requestticketfromtransporter($tripid)
	{
	    	$this->db->where("id",$tripid); 
			$query1=$this->db->get("trips");
			$tripdetails=$query1->result()[0];
			$this->db->where("id",$tripdetails->t_id);  
			$query2=$this->db->get("users");
			$tripuser=$query2->result()[0]; 
			$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
			$this->email->to($tripuser->username.',admin@mycourierbuddy.com'); 
			$this->email->subject('MCB: Trip No. '.$tripdetails->TripID.' Is “On Hold”'); 
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
				<div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
					<img src="http://mycourierbuddy.in/images/logo.png" />
				</div><img src="http://mycourierbuddy.in/images/plane.jpg" />
				<div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
					<div>
						<div style="text-align:left">Dear '.$tripuser->name.'</div>
						<p style="text-align:left;">We like to inform you that, <Trip No.> is put “On Hold” by MCB Team, due to insufficient details about the below trip. </p>
						<div style="text-align:left; color:#2c4882;">
							<table>
								<tr>
									<td>Trip No</td><td>&nbsp;-&nbsp;</td>
									<td>'.$tripdetails->TripID.'</td>
								</tr>
								<tr>
									<td>Flight No	</td><td>&nbsp;-&nbsp;</td>
									<td>'.$tripdetails->flight_no.'</td>
								</tr>
								<tr>
									<td>PNR No 	</td><td>&nbsp;-&nbsp;</td>
									<td>'.$tripdetails->pnr.'</td>
								</tr>  
							</table>
						</div>
						<p style="text-align:left;">
						We request you to upload the ticket for the verification purpose along with your Trip. This shall help us, to verify the trip and Approve.   
						</p>
						<p style="text-align:left;">Please click on the below link to upload the ticket online -</p>
						<center>
							<a href="http://dev9856.mycourierbuddy.in/viewtrip/'.$res->id.'">Upload Ticket To Trip Link</a>
						</center>
						<br> 
						<div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
					</div>
					<p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content.</b></p>
				</div>
				<div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
					<table style="width:100%;padding:0 25px;">
						<tr>
							<td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
							<td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
						</tr>
					</table>
				</div>
			</div>'; 
			$this->email->message($message);
			$this->email->send(); 			
		    $data=new stdclass();
		    $data->status="success";
			$data->response="Email Sent Successfully";		
			$json_response = json_encode($data); 
			print_r($json_response); 
	}
	function cancelParcellist($userID){
		$query = $this->db->query("SELECT a.*,IFNULL(b.username,'') as receiveremail,IFNULL(b.UserID,'') as MCBreceiverID,IFNULL(c.username,'') as transemail,IFNULL(c.UserID,'') as MCBTransporterID,IFNULL(c.id,0) as transporterID,prstatus.status as statusdescription,IFNULL(channel.id,0) as channelid,(a.till_date >= CURDATE())as Isactive FROM cms_parcels a left join cms_users b on a.recv_id=b.id left join cms_trips trip on a.trans_id=trip.id left join cms_users c on trip.t_id=c.id left join cms_parcelstatus prstatus on a.status=prstatus.id  left join (select * from cms_chatchannel where isactive=1) channel on a.id=channel.parcelid  where  a.usr_id=".$userID." "); 
		$data=new stdclass();
		$data->status="success";
		$data->response=$query->result();		
		$json_response = json_encode($data); 
		print_r($json_response); 
	}
	function refundedparcellist($userID)
	{
		$query = $this->db->query("SELECT a.*,IFNULL(b.username,'') as receiveremail,IFNULL(c.username,'') as transemail FROM cms_parcels a left join cms_users b on a.recv_id=b.id left join cms_users c on a.trans_id=c.id where a.status in(8) and  a.usr_id=".$userID." "); 
		 $data=new stdclass();
		 $data->status="success";
			$data->response=$query->result();		
			$json_response = json_encode($data); 
			print_r($json_response); 
	}
	function senderbookingrequest($senderid,$tripid)
	{ 
			$this->db->where("id",$tripid); 
			$query1=$this->db->get("trips");
			$tripdetails=$query1->result()[0]; 
		     $sql = "update `cms_parcels` set  status=1,processed_by=".$tripdetails->t_id.",trans_id=".$tripid." where id=".$senderid.";";
		     $this->db->query($sql);
			 $sql = "update cms_trips a set status=2,processed_by=".$tripdetails->t_id." where id=".$tripid; 
			 $this->db->query($sql);   
			$this->db->where("id",$senderid); 
			$query=$this->db->get("parcels");	
			$parceldetails=$query->result()[0]; 
			$this->db->where("id",$tripdetails->t_id);  
			$query2=$this->db->get("users");
			$tripuser=$query2->result()[0]; 
			$this->db->where("id",$parceldetails->usr_id);  
			$query3=$this->db->get("users");
			$parceluser=$query3->result()[0];  
			$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
			$this->email->to($parceluser->username.',admin@mycourierbuddy.com'); 
			$this->email->subject('MCB: Transporter Matched For Parcel No '.$parceldetails->ParcelID.'');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$parceluser->name.'</div>
            <p style="text-align:left;">Congratulations! Your parcel is accepted by a MCB Transporter. Find the details below - </p>
            <div style="text-align:left; color:#2c4882;">
                <table>
                    <tr>
                        <td>Parcel No </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parceldetails->ParcelID.'</td>
                    </tr>
                    <tr>
                        <td>
                            Trip ID </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$tripdetails->TripID.'</td>
                    </tr>
                    <tr>
                        <td>
                            Transporter ID	</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$tripuser->UserID.'</td>
                    </tr>
                    <tr>
                        <td>
                            Flight No</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$tripdetails->flight_no.'</td>
                    </tr>
                    <tr>
                        <td>
                            Departure </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$tripdetails->dep_time.'</td>
                    </tr>
                </table>
            </div>
            <p style="text-align:left;">
                Make immediate payment to confirm your booking with the transporter. Click on the link below to make payment.
            </p>
            <center>
                <a href="http://dev9856.mycourierbuddy.in/viewparcel/'.$parceldetails->id.'">Make Payment Link</a>
            </center>
            <br>As soon as payment is made, Automatic chat will be activated with Transporter and Receiver.
            <br />
            <div style="text-align:left; font-size:13px; margin-top:50px;">
                <b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span>
            </div>
        </div>
        <p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you disclose the content of envelope or parcel to transporter at the collection. This is make sure the safety of transporter and parcel. Transporters have the authority to reject the parcel in case they do not feel safe to collect and deliver the parcel content. </b></p>
    </div>
    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
        <table style="width:100%;padding:0 25px;">
            <tr>
                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
            </tr>
        </table>
    </div>
</div> ';
			$this->email->message($message);
			$this->email->send(); 
			 $data=new stdclass();
			$data->status="success";
			$data->response="Parcel Request Sent successfully.";		
			$json_response = json_encode($data); 
			print_r($json_response);
	}
	function addtrip($trip){ 		
		if(!empty($trip['source']) && !empty($trip['destination']) && !empty($trip['d_date']) && !empty($trip['a_date']) && !empty($trip['flight_no']) && !empty($trip['pnr']) && !empty($trip['capacity'])) 
		{
			$data["source"]=$trip['source'];
			$data["destination"]=$trip['destination'];
			if(isset($trip['ticket']))
			{
				$data["image"]=$trip['ticket'];
			}
			$data["dep_time"]=$trip['d_date'];
			$data["arrival_time"]=$trip['a_date'];
			$data["flight_no"]=$trip['flight_no'];
			$data["pnr"]=$trip['pnr'];
			$data["capacity"]=$trip['capacity']; 
			if(isset($trip['comment'])){
				$data["comment"]=$trip['comment'];
			}else{$data["comment"]="";}
			if(isset($trip['duration'])){
				$data["duration"]=$trip['duration'];
			}
			$data["created"]=date("Y-m-d H:i:s");
			$data["status"]=0; 
			$data["t_id"]=$trip['t_id']; 
			$data["processed_by"]=$trip['t_id']; 
			$this->db->insert('trips', $data);  
			$sql = "update cms_trips set TripID=concat('T',id) ORDER BY `id` DESC LIMIT 10 ;"; 
			$this->db->query($sql);
			$this->db->where("id",$trip['t_id']);  
			$query2=$this->db->get("users");
			$res1=$query2->result()[0]; 
			$emailid=$res1->username;
			$createdquery = $this->db->query("select * from cms_trips ORDER BY `id` DESC LIMIT 1;"); 
		    $tripcreated=$createdquery->result()[0]; 
			$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
			$this->email->to($emailid.',admin@mycourierbuddy.com'); 
			$this->email->subject('Trip No '.$tripcreated->TripID.' Added Successfully');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$res1->name.'</div>
            <p style="text-align:left;">Congratulations! You have successfully added your trip.</p>
            <div style="text-align:left; color:#2c4882;">
                <table>
                    <tr>
                        <td>Trip ID 		</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$tripcreated->TripID.'</td>
                    </tr>
                    <tr>
                        <td>
                            From </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip['source'].'</td>
                    </tr>
                    <tr>
                        <td>
                            To</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip['destination'].'</td>
                    </tr>
                    <tr>
                        <td>
                            Departure Date</td><td>&nbsp;-&nbsp;</td>
                        <td> '.$trip['d_date'].'</td>
                    </tr>
                    <tr>
                        <td>
                            Flight No </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip['flight_no'].'</td>
                    </tr>
                    <tr>
                        <td>
                            PNR No</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip['pnr'].'</td>
                    </tr>
                    <tr>
                        <td>
                            Capacity</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip['capacity'].' Kg</td>
                    </tr>
                    <tr>
                        <td>
                            Comments </td><td>&nbsp;-&nbsp;</td>
                        <td>
                           '.$trip['destination'].'
                        </td>
                    </tr>
                </table>
            </div>
            <p style="text-align:left;">
                Your trip is saved and send to MCB Admin for approval.
            </p><p style="text-align:left;">
                Once your trip is approved by admin, trip will be visible to senders for booking parcels with you and or you shall also be able to look for matching parcels.
            </p>
            <center>
                <a href="http://dev9856.mycourierbuddy.in/viewtrip/'.$tripcreated->id.'">Check Trip Status Link</a>
            </center>
            <p style="text-align:left;"><b>Note - Please present your Photo ID to sender while collecting and handing over the parcel.</b></p>
            <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
        </div>
       <p style="text-align:left;"> <br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case they do not feel safe to collect and deliver the parcel content.</b></p>
    </div>
    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
        <table style="width:100%;padding:0 25px;">
            <tr>
                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
            </tr>
        </table>
    </div>
</div>';
			$this->email->message($message);
			$this->email->send(); 
			$query = $this->db->query("SELECT * FROM `cms_trips`  order by id desc limit 1"); 
			$data=new stdclass();
			$data->status="success";
			$data->response=$query->result()[0];		
			$json_response = json_encode($data); 
			print_r($json_response);
		} else {
			$data1=new stdclass();
			$data1->status="Error";
			$data1->errorMessage="Mandatory fields cannot be blank.";
			$json_response = json_encode($data1); 
			print_r( $json_response);
		}
    }
	function generateordernumber($order)
	{ 	if(isset($order["ParcelID"])&&isset($order["ordernumber"])&&isset($order["Amount"]))
		{  
			if($order["usewalletamount"])
			{
		      if($order["walletamount"]>=$order["Amount"])
			  {
					$sql = "update cms_users a set a.wallet=wallet-".$order["Amount"]." where id=".$order["loginuserid"].";"; 
					$this->db->query($sql); 
				    $transaction= array("orderdate"=>date("Y-m-d H:i:s"),"PaymentTransaction"=>"Pay from Wallet","Paymentvia"=>"Payu Money Gateway","ParcelID"=>$order["ParcelID"] ,"TransID"=>$order["TransID"],"ordernumber"=>$order["ordernumber"],"Amount"=>$order["Amount"]); 
					$this->db->insert('transactions', $transaction); 
					$this->db->order_by('TransactionID', 'DESC'); 
					$this->db->limit(1);
					$query = $this->db->get('transactions'); 
					$this->db->where("ordernumber",$order["ordernumber"]);  
					$query2=$this->db->get("transactions");
					$res1=$query2->result()[0]; 
					$TripID=$res1->TransID;
					$ParcelID=$res1->ParcelID;
					$this->db->where("id",$ParcelID); 
					$query=$this->db->get("parcels");   
					$parcel=$query->result()[0];
					$sql = "update `cms_parcels` set  trans_id=".$TripID.",processed_by=".$parcel->usr_id.",status=2 where id=".$ParcelID.";";
					$this->db->query($sql);
					$sql = "update `cms_trips` set status=3,processed_by=".$parcel->usr_id." where id=".$TripID.";";
					$this->db->query($sql);
					
					$walletstatement=array("comment"=>"Used in Parcel Boking","parcelid"=>$order['ParcelID'],"tripid"=>$order["TransID"],"weight"=>$parcel->weight,"insertdate"=>date("Y-m-d H:i:s"),"amount"=>-($order["Amount"]),"debit"=>$order["Amount"],"credit"=>0,"userid"=>$order["loginuserid"]);
					$this->db->insert('walletstatement', $walletstatement);
					$this->db->where("id",$TripID); 
					$tripquery=$this->db->get("trips");
					$trip=$tripquery->result()[0]; 
					$sql = "update cms_bookings a set a.status=4 where p_id=".$ParcelID.";"; 
					$this->db->query($sql);
					$data["t_id"]=$TripID;
					$data["p_id"]=$ParcelID;
					$data["weight"]=$parcel->weight;
					$data["status"]=3;
					$data["created"]=date("Y-m-d H:i:s");
					$data["process_by"]=$parcel->usr_id;
					$data["by_trans"]="n";
					$data["by_send_rec"]="n";
					$data["trans_payment"]=$order["ordernumber"];  
					$this->db->insert('bookings', $data);  
					$this->db->where("id",$parcel->usr_id);  
					$query2=$this->db->get("users");
					$parceluser=$query2->result()[0]; 
					$this->db->where("id",$parcel->recv_id);  
					$receiverquery=$this->db->get("users");
					$receiveruser=$receiverquery->result()[0]; 
					$this->db->where("id",$trip->t_id);  
					$transquery=$this->db->get("users");
					$transuser=$transquery->result()[0];  
					$emailid=$parceluser->username;
					$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
					$this->email->to($emailid.',admin@mycourierbuddy.com'); 
					$this->email->subject('MCB: Parcel No '.$parcel->ParcelID.' Create and Booked with Transporter Trip '.$trip->TripID.'');    
					$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$parceluser->name.'</div>
            <p style="text-align:left;">Congratulations! You have successfully booked your parcel with Transporter.</p>
            <div style="text-align:left; color:#2c4882;">
                <table>
                    <tr>
                        <td>Parcel No </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcel->ParcelID.'</td>
                    </tr>
                    <tr>
                        <td> Trip ID </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip->TripID.'</td>
                    </tr>
                    <tr>
                        <td>
                            Transporter ID</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$transuser->UserID.'</td>
                    </tr>
                    <tr>
                        <td>
                            Flight No</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip->flight_no.'</td>
                    </tr>
                    <tr>
                        <td>
                            Departure</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip->dep_time.'</td>
                    </tr>
                </table>
            </div>
            <p style="text-align:left;">
                You can find the more details about transporter on the MCB portal.
            </p>
            <br>
            <p style="text-align:left;">Automatic chat is activated with Transporter and Receiver. You can now chat and coordinate with transporter to handover your parcel on time. Click on below link </p>
            <center>
                <a href="http://dev9856.mycourierbuddy.in/viewparcel/'.$parcel->id.'">Chat Link</a>
            </center>
            <br>
            <p style="text-align:left;"><b>Note - Please check the ID of transporter while handing over the parcel. You can also take selfie or Photo at the time of handover of parcel.</b></p>
            <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
        </div>
        <p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you disclose the content of envelope or parcel to transporter at the collection. This is make sure the safety of transporter and parcel. Transporters have the authority to reject the parcel in case they do not feel safe to collect and deliver the parcel content. </b></p>
    </div>
    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
        <table style="width:100%;padding:0 25px;">
            <tr>
                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
            </tr>
        </table>
    </div>
</div>';
					$this->email->message($message);
					$this->email->send();  
					$emailid=$receiveruser->username;
					$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
					$this->email->to($emailid.',admin@mycourierbuddy.com'); 
					$this->email->subject('MCB: Parcel No '.$parcel->ParcelID.' Create and Booked with Transporter Trip '.$trip->TripID.'');   
					$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$receiveruser->name.'</div>
            <p style="text-align:left;">Congratulations! You have successfully booked your parcel with Transporter.</p>
            <div style="text-align:left; color:#2c4882;">
                <table>
                    <tr>
                        <td>Parcel No </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcel->ParcelID.'</td>
                    </tr>
                    <tr>
                        <td> Trip ID </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip->TripID.'</td>
                    </tr>
                    <tr>
                        <td>
                            Transporter ID</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$transuser->UserID.'</td>
                    </tr>
                    <tr>
                        <td>
                            Flight No</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip->flight_no.'</td>
                    </tr>
                    <tr>
                        <td>
                            Departure</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip->dep_time.'</td>
                    </tr>
                </table>
            </div>
            <p style="text-align:left;">
                You can find the more details about transporter on the MCB portal.
            </p>
            <br>
            <p style="text-align:left;">Automatic chat is activated with Transporter and Receiver. You can now chat and coordinate with transporter to handover your parcel on time. Click on below link </p>
            <center>
                <a href="http://dev9856.mycourierbuddy.in/receiver">Chat Link</a>
            </center>
            <br>
            <p style="text-align:left;"><b>Note - Please check the ID of transporter while handing over the parcel. You can also take selfie or Photo at the time of handover of parcel.</b></p>
            <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
        </div>
        <p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you disclose the content of envelope or parcel to transporter at the collection. This is make sure the safety of transporter and parcel. Transporters have the authority to reject the parcel in case they do not feel safe to collect and deliver the parcel content. </b></p>
    </div>
    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
        <table style="width:100%;padding:0 25px;">
            <tr>
                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
            </tr>
        </table>
    </div>
</div>';		
					$this->email->message($message);
					$this->email->send(); 
					
					$emailid=$transuser->username;
					$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
					$this->email->to($emailid.',admin@mycourierbuddy.com'); 
					$this->email->subject('MCB: Parcel No '.$parcel->ParcelID.' Create and Booked with Transporter Trip '.$trip->TripID.'');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$transuser->name.'</div>
            <p style="text-align:left;">Congratulations! Below parcel is booked with your trip -  </p>
            <div style="text-align:left; color:#2c4882;">
                <table>
                    <tr>
                        <td>Parcel ID	</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcel->ParcelID.'</td>
                    </tr>
                    <tr>
                        <td>Sender </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parceluser->UserID.'</td>
                    </tr>
                    <tr>
                        <td>Sender Name </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parceluser->name.'</td>
                    </tr>
                    <tr>
                        <td>Receiver </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$receiveruser->name.'</td>
                    </tr>
                    <tr>
                        <td>Trip ID	</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip->TripID.'</td>
                    </tr>
                    <tr>
                        <td>PNR No </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip->pnr.'</td>
                    </tr>
                    <tr>
                        <td>Departure Date	</td><td>&nbsp;-&nbsp;</td>
                        <td>'. date("d-m-Y H:i:s", strtotime($trip->dep_time)).'</td>
                    </tr>
                    <tr>
                        <td>Flight No </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip->flight_no.'</td>
                    </tr>
                </table>
            </div>
            <p style="text-align:left;">
                You can find the more details about sender on the MCB portal.
            </p>
            <p style="text-align:left;">Automatic chat is activated with Sender and Receiver. You can now chat and coordinate with sender to collect the parcel on time. Click on below link  </p>
            <center>
                <a href="http://dev9856.mycourierbuddy.in/viewtrip/'.$trip->id.'">View Trip Link</a>
            </center>
            <p style="text-align:left;">
                <b>
                    Note - Please present your Photo ID to sender while collecting and handing over the parcel.
                </b>
            </p>
            <br />
            <div style="text-align:left; font-size:13px; margin-top:50px;">
                <b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b> 
            </div>
        </div>
        <p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content.</b></p>
    </div>
    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
        <table style="width:100%;padding:0 25px;">
            <tr>
                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
            </tr>
        </table>
    </div>
</div>';	$this->email->message($message);
					$this->email->send();  
					$sql = "update cms_chatchannel a set a.isactive=0 where parcelid=".$order['ParcelID'].";"; 
					$this->db->query($sql);
					$chatchannelcreate=array("receiverid"=>$receiveruser->id,"transporterid"=>$transuser->id,"senderid"=>$parceluser->id,"parcelid"=>$order['ParcelID'],"tripid"=>$order["TransID"]);
					$this->db->insert('chatchannel', $chatchannelcreate);
					$data=new stdclass();
					$data->status="successpayment";
					$data->response=$query->result();		
					$json_response = json_encode($data); 
					print_r($json_response);
			  }
			  else  if($order["walletamount"]<$order["Amount"])
			  {
				    $sql = "update cms_users a set a.wallet=wallet-".$order["walletamount"]." where id=".$order["loginuserid"].";"; 
					$this->db->query($sql);
					$this->db->where("id",$order['ParcelID']); 
					$query=$this->db->get("parcels");   
					$parcel=$query->result()[0];
					$walletstatement=array("comment"=>"Used in Parcel Booking","parcelid"=>$order['ParcelID'],"tripid"=>$order["TransID"],"weight"=>$parcel->weight,"insertdate"=>date("Y-m-d H:i:s"),"amount"=>-($order["walletamount"]),"debit"=>$order["walletamount"],"credit"=>0,"userid"=>$order["loginuserid"]);
					$this->db->insert('walletstatement', $walletstatement);
				    $transaction=array("orderdate"=>date("Y-m-d H:i:s"),"PaymentTransaction"=>"Pay from Wallet","Paymentvia"=>"Payu Money Gateway","ParcelID"=>$order["ParcelID"] ,"TransID"=>$order["TransID"],"ordernumber"=>$order["ordernumber"],"Amount"=>($order["Amount"]-$order["walletamount"])); 
					$this->db->insert('transactions', $transaction); 
					$this->db->order_by('TransactionID', 'DESC'); 
					$this->db->limit(1);
					$query = $this->db->get('transactions'); 
					$data=new stdclass();
					$data->status="success";
					$data->response=$query->result();		
					$json_response = json_encode($data); 
					print_r($json_response);
			  } 
			}else{ 
		       	$transaction=array("orderdate"=>date("Y-m-d H:i:s"),"PaymentTransaction"=>"Pay from Wallet","Paymentvia"=>"Payu Money Gateway","ParcelID"=>$order["ParcelID"] ,"TransID"=>$order["TransID"],"ordernumber"=>$order["ordernumber"],"Amount"=>$order["Amount"]); 
				$this->db->insert('transactions', $transaction); 
				$this->db->order_by('TransactionID', 'DESC'); 
				$this->db->limit(1);
				$query = $this->db->get('transactions');
				$data=new stdclass();
				$data->status="success";
				$data->response=$query->result();		
				$json_response = json_encode($data); 
				print_r($json_response);
			} 
			 	
		}
		else
		{
			$data1=new stdclass();
			$data1->status="Error";
			$data1->errorMessage="Mandatory fields cannot be blank.";
			$json_response = json_encode($data1); 
			print_r( $json_response);
		} 			
	}
	function payordernumber($order)
	{   
		if(!empty($order['txnid']))
		{
			$sql = "update `cms_transactions` set  PaymentTransaction='".$order["payuMoneyId"]."' where ordernumber='".$order["txnid"]."';";
			$this->db->query($sql); 
			$this->db->where("ordernumber",$order['txnid']);  
			$query2=$this->db->get("transactions");
			$res1=$query2->result()[0]; 
			$TripID=$res1->TransID;
			$ParcelID=$res1->ParcelID;
			$this->db->where("id",$ParcelID); 
			$query=$this->db->get("parcels");   
			$parcel=$query->result()[0];
			$sql = "update `cms_parcels` set  trans_id=".$TripID.",processed_by=".$parcel->usr_id.",status=2 where id=".$ParcelID.";";
			$this->db->query($sql);
			$sql = "update `cms_trips` set status=3,processed_by=".$parcel->usr_id." where id=".$TripID.";";
			$this->db->query($sql); 
			$this->db->where("id",$TripID); 
			$tripquery=$this->db->get("trips");
			$trip=$tripquery->result()[0]; 
			$sql = "update cms_bookings a set a.status=4 where p_id=".$ParcelID.";"; 
			$this->db->query($sql);
			$data["t_id"]=$TripID;
			$data["p_id"]=$ParcelID;
			$data["weight"]=$parcel->weight;
			$data["status"]=3;
			$data["created"]=date("Y-m-d H:i:s");
			$data["process_by"]=$parcel->usr_id;
			$data["by_trans"]="n";
			$data["by_send_rec"]="n";
			$data["trans_payment"]=$order['txnid'];  
			$this->db->insert('bookings', $data);   
			$this->db->where("id",$parcel->usr_id);  
			$query2=$this->db->get("users");
			$parceluser=$query2->result()[0]; 
			$this->db->where("id",$parcel->recv_id);  
			$receiverquery=$this->db->get("users");
			$receiveruser=$receiverquery->result()[0]; 
			$this->db->where("id",$trip->t_id);  
			$transquery=$this->db->get("users");
			$transuser=$transquery->result()[0]; 
			
			$emailid=$parceluser->username;
			$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
			$this->email->to($emailid.',admin@mycourierbuddy.com'); 
			$this->email->subject('MCB: Parcel No '.$parcel->ParcelID.' Create and Booked with Transporter Trip '.$trip->TripID.'');   
		   $message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$parceluser->name.'</div>
            <p style="text-align:left;">Congratulations! You have successfully booked your parcel with Transporter.</p>
            <div style="text-align:left; color:#2c4882;">
                <table>
                    <tr>
                        <td>Parcel No </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcel->ParcelID.'</td>
                    </tr>
                    <tr>
                        <td> Trip ID </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip->TripID.'</td>
                    </tr>
                    <tr>
                        <td>
                            Transporter ID	</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$transuser->UserID.'</td>
                    </tr>
                    <tr>
                        <td>
                            Flight No</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip->flight_no.'</td>
                    </tr>
                    <tr>
                        <td>
                            Departure</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip->dep_time.'</td>
                    </tr>
                </table>
            </div>
            <p style="text-align:left;">
                You can find the more details about transporter on the MCB portal.
            </p>
            <br>
            <p style="text-align:left;">Automatic chat is activated with Transporter and Receiver. You can now chat and coordinate with transporter to handover your parcel on time. Click on below link </p>
            <center>
                <a href="http://dev9856.mycourierbuddy.in/viewparcel/'.$parcel->id.'">Chat Link</a>
            </center>
            <br>
            <p style="text-align:left;"><b>Note - Please check the ID of transporter while handing over the parcel. You can also take selfie or Photo at the time of handover of parcel.</b></p>
            <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
        </div>
        <p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you disclose the content of envelope or parcel to transporter at the collection. This is make sure the safety of transporter and parcel. Transporters have the authority to reject the parcel in case they do not feel safe to collect and deliver the parcel content. </b></p>
    </div>
    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
        <table style="width:100%;padding:0 25px;">
            <tr>
                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
            </tr>
        </table>
    </div>
</div>';
			
			 $this->email->message($message);
			$this->email->send(); 
			
			$emailid=$receiveruser->username;
			$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
			$this->email->to($emailid.',admin@mycourierbuddy.com'); 
			$this->email->subject('MCB: Parcel No '.$parcel->ParcelID.' Create and Booked with Transporter Trip '.$trip->TripID.'');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$receiveruser->name.'</div>
            <p style="text-align:left;">Congratulations! You have successfully booked your parcel with Transporter.</p>
            <div style="text-align:left; color:#2c4882;">
                <table>
                    <tr>
                        <td>Parcel No </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcel->ParcelID.'</td>
                    </tr>
                    <tr>
                        <td> Trip ID </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip->TripID.'</td>
                    </tr>
                    <tr>
                        <td>
                            Transporter ID</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$transuser->UserID.'</td>
                    </tr>
                    <tr>
                        <td>
                            Flight No</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip->flight_no.'</td>
                    </tr>
                    <tr>
                        <td>
                            Departure</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip->dep_time.'</td>
                    </tr>
                </table>
            </div>
            <p style="text-align:left;">
                You can find the more details about transporter on the MCB portal.
            </p>
            <br>
            <p style="text-align:left;">Automatic chat is activated with Transporter and Receiver. You can now chat and coordinate with transporter to handover your parcel on time. Click on below link </p>
            <center>
                <a href="http://dev9856.mycourierbuddy.in/receiver">Chat Link</a>
            </center>
            <br>
            <p style="text-align:left;"><b>Note - Please check the ID of transporter while handing over the parcel. You can also take selfie or Photo at the time of handover of parcel.</b></p>
            <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
        </div>
        <p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you disclose the content of envelope or parcel to transporter at the collection. This is make sure the safety of transporter and parcel. Transporters have the authority to reject the parcel in case they do not feel safe to collect and deliver the parcel content. </b></p>
    </div>
    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
        <table style="width:100%;padding:0 25px;">
            <tr>
                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
            </tr>
        </table>
    </div>
</div>';		
			$this->email->message($message);
			$this->email->send(); 
			
			$emailid=$transuser->username;
			$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
			$this->email->to($emailid.',admin@mycourierbuddy.com'); 
			$this->email->subject('MCB: Parcel No '.$parcel->ParcelID.' Create and Booked with Transporter Trip '.$trip->TripID.'');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$transuser->name.'</div>
            <p style="text-align:left;">Congratulations! Below parcel is booked with your trip -  </p>
            <div style="text-align:left; color:#2c4882;">
                <table>
                    <tr>
                        <td>Parcel ID	</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcel->ParcelID.'</td>
                    </tr>
                    <tr>
                        <td>Sender </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parceluser->UserID.'</td>
                    </tr>
                    <tr>
                        <td>Sender Name </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parceluser->name.'</td>
                    </tr>
                    <tr>
                        <td>Receiver </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$receiveruser->name.'</td>
                    </tr>
                    <tr>
                        <td>Trip ID	</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip->TripID.'</td>
                    </tr>
                    <tr>
                        <td>PNR No </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip->pnr.'</td>
                    </tr>
                    <tr>
                        <td>Departure Date	</td><td>&nbsp;-&nbsp;</td>
                        <td>'. date("d-m-Y H:i:s", strtotime($trip->dep_time)).'</td>
                    </tr>
                    <tr>
                        <td>Flight No </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip->flight_no.'</td>
                    </tr>
                </table>
            </div>
            <p style="text-align:left;">
                You can find the more details about sender on the MCB portal.
            </p>
            <p style="text-align:left;">Automatic chat is activated with Sender and Receiver. You can now chat and coordinate with sender to collect the parcel on time. Click on below link  </p>
            <center>
                <a href="http://dev9856.mycourierbuddy.in/viewtrip/'.$trip->id.'">View Trip Link</a>
            </center>
            <p style="text-align:left;">
                <b>
                    Note - Please present your Photo ID to sender while collecting and handing over the parcel.
                </b>
            </p>
            <br />
            <div style="text-align:left; font-size:13px; margin-top:50px;">
                <b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b> 
            </div>
        </div>
    <p style="text-align:left;">    <br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content.</b></p>
    </div>
    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
        <table style="width:100%;padding:0 25px;">
            <tr>
                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
            </tr>
        </table>
    </div>
</div>';	
			$this->email->message($message);
			$this->email->send();  
			$sql = "update cms_chatchannel a set a.isactive=0 where parcelid=".$ParcelID.";"; 
			$this->db->query($sql);
			$chatchannelcreate=array("receiverid"=>$receiveruser->id,"transporterid"=>$transuser->id,"senderid"=>$parceluser->id,"parcelid"=>$ParcelID,"tripid"=>$TripID);
			$this->db->insert('chatchannel', $chatchannelcreate);
			$data=new stdclass();
			$data->status="success";
			$data->response=$ParcelID;		
			$json_response = json_encode($data); 
			print_r($json_response);
			
		}else{
			$data1=new stdclass();
			$data1->status="Error";
			$data1->errorMessage="Mandatory fields cannot be blank.";
			$json_response = json_encode($data1); 
			print_r( $json_response);
		} 
	}
	function createpaymentrequest($payment)
	{ 	
		if(!isset($payment["id"]))
		{
		    $this->db->insert('payment_requests', $payment); 
		    $sql = "UPDATE cms_payment_requests SET withdrawID =CONCAT('WIT', CAST(id as CHAR CHARACTER SET utf8))"; 
			$this->db->query($sql);
			$sql = "insert into cms_walletstatement(insertdate,amount,userid,withdrawID) values('".date("Y-m-d H:i:s")."',-".$payment["amount"].",".$payment["trans_id"].",(select  `withdrawID` from cms_payment_requests order by id desc limit 0,1));";
			$this->db->query($sql);
			$sql ="update cms_users a set a.wallet=wallet-".$payment["amount"]." where id=".$payment["trans_id"].";"; 
			$this->db->query($sql);
		    $query = $this->db->query("SELECT * FROM `cms_payment_requests`  order by id desc limit 1"); 
		    $data=new stdclass();
			$data->status="success";
			$data->response=$query->result(); 		
			$json_response = json_encode($data); 
			print_r($json_response);
		}
		else
		{    $this->db->where('id', $payment["id"]);
			$this->db->update('payment_requests', $payment);
			$data=new stdclass();
			 $query = $this->db->query("SELECT * FROM `cms_payment_requests` where id=".$payment["id"].";"); 
			$data->status="success";
			$data->response=$query->result(); 		
			$json_response = json_encode($data); 
			print_r($json_response);			
		}  
	}
	function getwalletstatement($userid)
	{
		    $query = $this->db->query("SELECT a . * , IFNULL( b.status, c.status ) as status, IFNULL(c.amount,0.00) AS withdrawamount,IFNULL(prstatus.status,c.status) as statusdescription,b.ParcelID MParcelID,trp.TripID MTripID FROM  `cms_walletstatement` a LEFT JOIN cms_parcels b ON a.parcelid = b.id  LEFT JOIN cms_trips trp ON a.tripid = trp.id LEFT JOIN cms_payment_requests c ON a.withdrawID = c.withdrawID left join cms_parcelstatus prstatus on b.status=prstatus.id where a.userid=".$userid."  order by a.id desc ");
 		    $data=new stdclass();
			$data->status="success";
			$data->response=$query->result(); 		
			$json_response = json_encode($data); 
			print_r($json_response); 
	}
	function paymentrequestlist($userid)
	{
		if($userid>0)
		{
		    $query = $this->db->query("SELECT * FROM `cms_payment_requests` where trans_id=".$userid."  order by id desc "); 
		    $data=new stdclass();
			$data->status="success";
			$data->response=$query->result(); 		
			$json_response = json_encode($data); 
			print_r($json_response);
		}
		else
		{ 
			$query = $this->db->query("SELECT a.*,b.username,b.mobile,b.name,b.UserID FROM `cms_payment_requests` a  inner join cms_users b on  a.trans_id=b.id order by id desc"); 
		    $data=new stdclass();
			$data->status="success";
			$data->response=$query->result(); 		
			$json_response = json_encode($data); 
			print_r($json_response);
		} 
	}
		function addcontacts($contacts)
		{ 
		if(isset( $contacts["id"]))
		{
			 $this->db->where('id', $contacts["id"]);
			$this->db->update('contacts', $contacts); 
			$data=new stdclass();
			$data->status="success";
			$data->response="Updated Successfully"; 		
			$json_response = json_encode($data); 
			print_r($json_response);
		}
		else
		{
			$this->db->insert('contacts', $contacts); 
			$data=new stdclass();
			$data->status="success";
			$data->response="You Request sent Successfully"; 		
			$json_response = json_encode($data); 
		print_r($json_response);}
		}
		function addstatics($statics)
		{ 
		if(isset( $statics["id"]))
		{
			 $this->db->where('id', $statics["id"]);
			$this->db->update('statics', $statics); 
			$data=new stdclass();
			$data->status="success";
			$data->response="Updated Successfully"; 		
			$json_response = json_encode($data); 
			print_r($json_response);
		}
		else
		{
			$this->db->insert('statics', $statics); 
			$data=new stdclass();
			$data->status="success";
			$data->response="You Request sent Successfully"; 		
			$json_response = json_encode($data); 
		print_r($json_response);}
		}
		function addnewsletter($letters)
		{ 
			if(isset( $letters["id"]))
			{
				 $this->db->where('id', $letters["id"]);
				$this->db->update('letters', $letters); 
				$data=new stdclass();
				$data->status="success";
				$data->response="Updated Successfully"; 		
				$json_response = json_encode($data); 
				print_r($json_response);
			}
			else
			{
				$this->db->insert('letters', $letters); 
				$data=new stdclass();
				$data->status="success";
				$data->response="You letters Added Successfully"; 		
				$json_response = json_encode($data); 
				print_r($json_response);
			}
		}
		function contactslist()
		{   $query = $this->db->query("SELECT * FROM `cms_contacts` order by id"); 
			$data=new stdclass();
			$data->status="success";
			$data->response=$query->result();
			$json_response = json_encode($data);  
			echo $json_response;   
		}
		function deletesliderimage($sliders)
		{  if(isset( $sliders["id"]))
			{   $this->db->where('id', $sliders["id"]);
				$this->db->delete('sliders'); 
				$data=new stdclass();
				$data->status="success";
				$data->response="Updated Successfully"; 		
				$json_response = json_encode($data); 
				print_r($json_response);
			}
		}
		function addsliderimage($sliders)
		{ 
		if(isset( $sliders["id"]))
		{
			 $this->db->where('id', $sliders["id"]);
			$this->db->update('sliders', $sliders); 
			$data=new stdclass();
			$data->status="success";
			$data->response="Updated Successfully"; 		
			$json_response = json_encode($data); 
			print_r($json_response);
		}
		else
		{
			$this->db->insert('sliders', $sliders); 
			$data=new stdclass();
			$data->status="success";
			$data->response="Created Successfully"; 		
			$json_response = json_encode($data); 
			print_r($json_response);
			}
		}
		function sliderimagelist()
		{   $query = $this->db->query("SELECT * FROM `cms_sliders` order by id"); 
			$data=new stdclass();
			$data->status="success";
			$data->response=$query->result();
			$json_response = json_encode($data);  
			echo $json_response;   
		}
		function calculateamount($parcel)
		{
			$query = $this->db->query("select price from cms_zonepricelist a  inner join cms_weightrange b on a.weightrangeid=b.id  inner join cms_airports sou on a.fromzoneid=sou.zonelistid  inner join cms_airports dest on a.tozoneid=dest.zonelistid  where ".$parcel['weight'].">b.minweight  and ".$parcel['weight']."<=b.maxweight and sou.location='".$parcel['source']."' and dest.location='".$parcel['destination']."'"); 
		    $pricedata=$query->result(); 
			$parcel['payment']=$pricedata[0]; 
			$json_response = json_encode($parcel['payment']);  
			echo $json_response;   
		}
	function addparcel($parcel){ 		
		if(!empty($parcel['source']) && !empty($parcel['destination']) && !empty($parcel['till_date']) && !empty($parcel['type']) && !empty($parcel['recv_id']) && !empty($parcel['description'])  ) 
		{
			$query = $this->db->query("select price from cms_zonepricelist a  inner join cms_weightrange b on a.weightrangeid=b.id  inner join cms_airports sou on a.fromzoneid=sou.zonelistid  inner join cms_airports dest on a.tozoneid=dest.zonelistid  
			where ".$parcel['weight'].">b.minweight  and ".$parcel['weight']."<=b.maxweight and 
 sou.location='".$parcel['source']."' and dest.location='".$parcel['destination']."'"); 
		    $pricedata=$query->result(); 
			$parcel['payment']=$pricedata[0]->price; 
			$parcel['processed_by']=$parcel['usr_id']; 
			$this->db->insert('parcels', $parcel); 
			if(isset($parcel["trans_id"]))
			{
				$sql = "update cms_trips a set status=2,processed_by=".$parcel['usr_id']." where id=".$parcel["trans_id"]; 
				$this->db->query($sql); 	
			}	
			$sql = "update cms_parcels set ParcelID=concat('P',id) ORDER BY `id` DESC LIMIT 10 ;"; 
			$this->db->query($sql);			
			$this->db->where("id",$parcel['usr_id']);  
			$query2=$this->db->get("users");
			$res1=$query2->result()[0]; 
			$createdquery = $this->db->query("select * from cms_parcels ORDER BY `id` DESC LIMIT 1;"); 
		    $parcelcreated=$createdquery->result()[0]; 
			$emailid=$res1->username;
			$this->db->where("id",$parcel['recv_id']);  
			$query3=$this->db->get("users");
			$res2=$query3->result()[0];  
			$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
			$this->email->to($emailid.',admin@mycourierbuddy.com'); 
			$this->email->subject('MCB: Parcel No '.$parcelcreated->ParcelID.' Created');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$res1->name.'</div>
            <p style="text-align:left;">Congratulations! You have successfully added a new parcel request.</p>
            <div style="text-align:left; color:#2c4882;">
                <table>
                    <tr>
                        <td> Parcel No </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcelcreated->ParcelID.'</td>
                    </tr>
                    <tr>
                        <td>From </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcel['source'].'</td>
                    </tr>
                    <tr>
                        <td>To </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcel['destination'].'</td>
                    </tr>
                    <tr>
                        <td> Deliver Till </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcel['till_date'].'</td>
                    </tr>
                    <tr>
                        <td> Weight </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcel['weight'].' Kg</td>
                    </tr>
                    <tr>
                        <td> Details </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcel['description'].'</td>
                    </tr>
                    <tr>
                        <td>Amount to Pay </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcel['payment'].'</td>
                    </tr>
                    <tr>
                        <td>Receiver </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$res2->name.'</td>
                    </tr>
                </table>
            </div>
            <p style="text-align:left;">
                Now you can find the matching transporter online with your parcel. Click for find matching Transporters.
            </p>
            <center>
                <a href="http://dev9856.mycourierbuddy.in/viewparcel/'.$parcelcreated->id.'">Find Matching Trips</a>
            </center>
           <p style="text-align:left;"> <br>Please ensure to make a payment as soon as transporter is matched for your parcel. <br /> </p>
		   <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
        </div>
       <p style="text-align:left;"> <br><b style="font-family:Calibri;">Note -  Please make sure you disclose the content of envelope or parcel to transporter at the collection. This is make sure the safety of transporter and parcel. Transporters have the authority to reject the parcel in case they do not feel safe to collect and deliver the parcel content. </b></p>
    </div>
    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
        <table style="width:100%;padding:0 25px;">
            <tr>
                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
            </tr>
        </table>
    </div>
</div>';
			$this->email->message($message);
			$this->email->send(); 
			$query = $this->db->query("SELECT * FROM `cms_parcels`  order by id desc limit 1"); 
			//receiver email 
			$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
			$emailid=$res2->username;
			$this->email->to($emailid.',admin@mycourierbuddy.com'); 
			$this->email->subject('MCB: Parcel No '.$parcelcreated->ParcelID.' Created ');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$res2->name.'</div>
            <p style="text-align:left;">Congratulations! You have successfully added a new parcel request.</p>
            <div style="text-align:left; color:#2c4882;">
                <table>
                    <tr>
                        <td> Parcel No </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcelcreated->ParcelID.'</td>
                    </tr>
                    <tr>
                        <td>From </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcel['source'].'</td>
                    </tr>
                    <tr>
                        <td>To </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcel['destination'].'</td>
                    </tr>
                    <tr>
                        <td> Deliver Till </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcel['till_date'].'</td>
                    </tr>
                    <tr>
                        <td> Weight </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcel['weight'].' Kg</td>
                    </tr>
                    <tr>
                        <td> Details </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcel['description'].'</td>
                    </tr>
                    <tr>
                        <td>Amount to Pay </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcel['payment'].'</td>
                    </tr>
                    <tr>
                        <td>Receiver </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$res2->name.'</td>
                    </tr>
                </table>
            </div> 
           <p style="text-align:left;"> <br>Please ensure to make a payment as soon as transporter is matched for your parcel.</p> <br />
		   <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
        </div>
        <br><p style="text-align:left;"><b style="font-family:Calibri;">Note -  Please make sure you disclose the content of envelope or parcel to transporter at the collection. This is make sure the safety of transporter and parcel. Transporters have the authority to reject the parcel in case they do not feel safe to collect and deliver the parcel content. </b></p>
    </div>
    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
        <table style="width:100%;padding:0 25px;">
            <tr>
                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
            </tr>
        </table>
    </div>
</div>';
			$this->email->message($message);
			$this->email->send();  
			$data=new stdclass();
			$data->status="success";
			$data->response=$query->result()[0]; 		
			$json_response = json_encode($data); 
			print_r($json_response);
		} else {
			$data1=new stdclass();
			$data1->status="Error";
			$data1->errorMessage="Mandatory fields cannot be blank.";
			$json_response = json_encode($data1); 
			print_r( $json_response);
		}
    }
	function updateparcelweight($parcel){ 
	      $this->db->where("id",$parcel["id"]); 
			$query=$this->db->get("parcels");	
			$parceldata=$query->result()[0];			
	       $this->db->where('id', $parcel["id"]);
		   $parcel["processed_by"]=$parceldata->usr_id;
			$this->db->update('parcels', $parcel);   
	}
	function updateparcel($parcel){  
		if(!empty($parcel['source']) && !empty($parcel['destination']) && !empty($parcel['till_date']) && !empty($parcel['type']) && !empty($parcel['recv_id']) && !empty($parcel['description'])  ) {
			 $sql = "update `cms_bookings` set  status=4,process_by=".$parcel["usr_id"]." where p_id=".$parcel["id"].";";
			 $this->db->query($sql);
			 $sql = "update cms_trips a set status=1,processed_by=".$parcel["usr_id"]."  where exists(select t_id from cms_bookings b where b.t_id=a.id and b.p_id=".$parcel["id"]." and status !=3) "; 
			 $this->db->query($sql); 
			  $sql = "update cms_trips a set status=1,processed_by=".$parcel["usr_id"]."  where exists(select trans_id from cms_parcels b where b.trans_id=a.id and b.id=".$parcel["id"]." and b.status =1)"; 
			 $this->db->query($sql); 
			 $query = $this->db->query("select price from cms_zonepricelist a  inner join cms_weightrange b on a.weightrangeid=b.id  inner join cms_airports sou on a.fromzoneid=sou.zonelistid  inner join cms_airports dest on a.tozoneid=dest.zonelistid  
			where ".$parcel['weight'].">b.minweight  and ".$parcel['weight']."<=b.maxweight and 
 sou.location='".$parcel['source']."' and dest.location='".$parcel['destination']."'"); 
		    $pricedata=$query->result(); 
			$parcel['payment']=$pricedata[0]->price; 
			$parcel['processed_by']=$parcel["usr_id"];
			if($parcel['status']==1)
			{   $parcel['status']=0;
				$parcel['trans_id']=0;
			}
			if($parcel['status']==2)
			{
				$this->db->where("id",$parcel["usr_id"]);  
				$query2=$this->db->get("users");
				$parceluser=$query2->result()[0]; 
				$this->db->where("id",$parcel["recv_id"]);  
				$receiverquery=$this->db->get("users");
				$receiveruser=$receiverquery->result()[0];  
				$emailid=$parceluser->username;
			 	$this->db->where("id",$parcel["id"]); 
			    $query=$this->db->get("parcels");	
			    $parceldata=$query->result()[0];
				$this->db->where("id", $parcel["trans_id"]); 
				$tripquery=$this->db->get("trips");
				$tripdata=$tripquery->result()[0]; 
				$this->db->where("id",$tripdata->t_id);  
				$transquery=$this->db->get("users");
				$transuser=$transquery->result()[0];
				$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
				$this->email->to($emailid.',admin@mycourierbuddy.com'); 
				$this->email->subject('Parcel No.'.$parceldata->ParcelID.' Is Cancelled By '.$parceluser->name.' Parcel .');   
				$message=' <div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$parceluser->name.'</div>
            <p style="text-align:left;">'.$parceldata->ParcelID.' is successfully cancelled by '.$parceluser->name.'.</p>
            <div style="text-align:left; color:#2c4882;">
                <table>
                    <tr>
                        <td>Parcel No</td>
                        <td>'.$parceldata->ParcelID.'</td>
                    </tr>
                    <tr>
                        <td>Sender Name	</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parceluser->name.'</td>
                    </tr>
                    <tr>
                        <td>Transporter ID	</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$transuser->UserID.'</td>
                    </tr> <tr>
                        <td>Receiver	</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$receiveruser->name.'</td>
                    </tr> <tr>
                        <td>Delivery Date 	</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$tripdata->arrival_time.'</td>
                    </tr>  
                </table>
            </div>
            <p style="text-align:left;">
        The amount paid by you for this parcel is credit back in your Wallet. You can use it in your next parcel requests.
            </p> 
            <center>
                <a href="http://dev9856.mycourierbuddy.in/mywallet">Wallet Detail Link</a>
            </center>
            <br> 
			<p style="text-align:left;">Looking forward to serve you again.</p>
            <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
        </div>
        <p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from transporter at the time of receiving the parcel. This is to make sure transporter have delivered the parcel safely. </b></p>
    </div>
    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
        <table style="width:100%;padding:0 25px;">
            <tr>
                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
            </tr>
        </table>
    </div>
</div> ';
				$this->email->message($message);
				$this->email->send();  
				
				$emailid=$transuser->username;
				$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
				$this->email->to($emailid.',admin@mycourierbuddy.com'); 
				$this->email->subject('Parcel No.'.$parceldata->ParcelID.' Is Cancelled By '.$parceluser->name.'');   
				$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$transuser->name.'</div>
            <p style="text-align:left;">We regret to inform you that, '.$parceldata->ParcelID.' is cancelled by '.$parceluser->name.' due to some reason.  </p>
            <div style="text-align:left; color:#2c4882;">
                <table>
                    <tr>
                        <td>Parcel No</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parceldata->ParcelID.'</td>
                    </tr>
                    <tr>
                        <td>Sender Name	</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parceluser->name.'</td>
                    </tr>
                    <tr>
                        <td>Transporter ID	</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$transuser->UserID.'</td>
                    </tr> <tr>
                        <td>Receiver	</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$receiveruser->name.'</td>
                    </tr> <tr>
                        <td>Delivery Date 	</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$tripdata->arrival_time.'</td>
                    </tr>  
                </table>
            </div>
            <p style="text-align:left;">
         Your capacity booked with this parcel is available again. You can look for other parcels with your matching trip. 
            </p> 
            <center>
                <a href="http://dev9856.mycourierbuddy.in/viewtrip/'.$tripdata->id.'">Find Matching Parcel Link</a>
            </center>
            <br> 
            <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
        </div>
        <p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content.</b></p>
    </div>
    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
        <table style="width:100%;padding:0 25px;">
            <tr>
                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
            </tr>
        </table>
    </div>
</div>';	
				$this->email->message($message);
				$this->email->send();  
			    $emailid=$receiveruser->username;
				$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
				$this->email->to($emailid.',admin@mycourierbuddy.com'); 
			$this->email->subject('Parcel No.'.$parceldata->ParcelID.' Is Cancelled By '.$parceluser->name.' Parcel .');   
				$message=' <div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
					<div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
						<img src="http://mycourierbuddy.in/images/logo.png" />
					</div><img src="http://mycourierbuddy.in/images/plane.jpg" />
					<div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
						<div>
							<div style="text-align:left">Dear '.$parceluser->name.'</div>
							<p style="text-align:left;">'.$parceldata->ParcelID.' is successfully cancelled by '.$parceluser->name.'.</p>
							<div style="text-align:left; color:#2c4882;">
								<table>
									<tr>
										<td>Parcel No</td><td>&nbsp;-&nbsp;</td>
										<td>'.$parceldata->ParcelID.'</td>
									</tr>
									<tr>
										<td>Sender Name	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$parceluser->name.'</td>
									</tr>
									<tr>
										<td>Transporter ID	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$transuser->UserID.'</td>
									</tr> <tr>
										<td>Receiver	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$receiveruser->name.'</td>
									</tr> <tr>
										<td>Delivery Date 	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$tripdata->arrival_time.'</td>
									</tr>  
								</table>
							</div>
							<p style="text-align:left;">
						The amount paid by you for this parcel is credit back in Sender Wallet.
							</p>  
							<br> 
							<p style="text-align:left;">Looking forward to serve you again.</p>
							<div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
						</div>
						<p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from transporter at the time of receiving the parcel. This is to make sure transporter have delivered the parcel safely. </b></p>
					</div>
					<div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
						<table style="width:100%;padding:0 25px;">
							<tr>
								<td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
								<td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
							</tr>
						</table>
					</div>
				</div> ';
				$this->email->message($message);
				$this->email->send();  
				$sql = "update cms_users a set a.wallet=wallet+".$parcel['payment']." where id=".$parceluser->id.";"; 
			    $this->db->query($sql);
				  $sql = "update cms_chatchannel a set a.isactive=0 where parcelid=".$parcel["id"].";"; 
			   $this->db->query($sql);	
				$walletstatement=array("comment"=>"Refund from cancellation","parcelid"=> $parcel["id"],"tripid"=>$parcel["trans_id"],"weight"=>$parcel['weight'],"insertdate"=>date("Y-m-d H:i:s"),"amount"=>$parcel['payment'],"credit"=>$parcel['payment'],"debit"=>0,"userid"=>$parceluser->id);
				$this->db->insert('walletstatement', $walletstatement);
				$parcel['status']=0;
				$parcel['trans_id']=0;				
			}
			$this->db->where('id', $parcel["id"]);
			$this->db->update('parcels', $parcel);   
			$this->db->where("id",$parcel["id"]); 
			$query=$this->db->get("parcels");			
			$data=new stdclass();
			$data->status="success";
			$data->response=$query->result()[0];		
			$json_response = json_encode($data); 
			print_r($json_response);
		} else {
			$data1=new stdclass();
			$data1->status="Error";
			$data1->errorMessage="Mandatory fields cannot be blank.";
			$json_response = json_encode($data1); 
			print_r( $json_response);
		}
    }
	function updatetripticket($trip)
	{  
			if(isset($trip['ticket']))
			{
				$data["image"]=$trip['ticket']; 
			} 
			$data["processed_by"]=$trip["t_id"];			
			$this->db->where('id', $trip["id"]);
			$this->db->update('trips', $data);   
			$data=new stdclass();
			$data->status="success";
			$data->response="Trip added successfully.";		
			$json_response = json_encode($data); 
			print_r($json_response); 
    }
	function updatetrip($trip){ 
		if(!empty($trip['source']) && !empty($trip['destination']) && !empty($trip['d_date']) && !empty($trip['a_date']) && !empty($trip['flight_no']) && !empty($trip['pnr']) && !empty($trip['capacity'])) 
		{	$data["source"]=$trip['source'];
			$data["destination"]=$trip['destination']; 
			$data["dep_time"]=$trip['d_date'];
			$data["arrival_time"]=$trip['a_date'];
			$data["flight_no"]=$trip['flight_no'];
		   $data["processed_by"]=$trip["t_id"];	
			$data["pnr"]=$trip['pnr'];
			if($trip['status']==3)
			{ 
			    $this->db->where("id", $trip["id"]); 
				$tripquery=$this->db->get("trips");
				$tripdata=$tripquery->result()[0]; 
				$this->db->where("id",$tripdata->t_id);  
				$transquery=$this->db->get("users");
				$transuser=$transquery->result()[0]; 
				$this->db->where("trans_id",$trip["id"]); 
				$query=$this->db->get("parcels"); 
				$parcelqueryresult=$query->result();
				foreach($parcelqueryresult as $parcel)
				{   $this->db->where("id",$parcel->usr_id);  
					$query2=$this->db->get("users");
					$parceluser=$query2->result()[0]; 
					$this->db->where("id",$parcel->recv_id);  
					$receiverquery=$this->db->get("users");
					$receiveruser=$receiverquery->result()[0];  
				
				$sql = "update cms_users a set a.wallet=wallet+".$parcel->payment." where id=".$parceluser->id.";"; 
			 	 $this->db->query($sql);
				  $sql = "update cms_chatchannel a set a.isactive=0 where tripid=".$trip["id"].";"; 
			   $this->db->query($sql);	
				 $walletstatement=array("comment"=>"Earned from successfully delivery","parcelid"=> $parcel->id,"tripid"=>$trip["id"],"weight"=>$parcel->weight,"insertdate"=>date("Y-m-d H:i:s"),"amount"=>$parcel->payment,"credit"=>$parcel->payment,"debit"=>0,"userid"=>$parceluser->id);
				$this->db->insert('walletstatement', $walletstatement);
				
					$emailid=$parceluser->username;
					$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
					$this->email->to($emailid.',admin@mycourierbuddy.com'); 
					$this->email->subject('Trip No. '.$tripdata->TripID.' Is Cancelled By '.$transuser->name.'');   
					$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
					<div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
						<img src="http://mycourierbuddy.in/images/logo.png" />
					</div><img src="http://mycourierbuddy.in/images/plane.jpg" />
					<div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
						<div>
							<div style="text-align:left">Dear '.$parceluser->name.'</div>
							<p style="text-align:left;">We regret to inform you that, '.$tripdata->TripID.' is cancelled by '.$transuser->name.' due to below mentioned reason.</p>
							<div style="text-align:left; color:#2c4882;">
								<table>
									<tr>
										<td>Parcel No</td><td>&nbsp;-&nbsp;</td>
										<td>'.$tripdata->TripID.'</td>
									</tr>
									<tr>
										<td>Sender Name	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$parceluser->name.'</td>
									</tr>
									<tr>
										<td>Transporter ID	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$transuser->UserID.'</td>
									</tr> 
									<tr>
										<td>Receiver </td><td>&nbsp;-&nbsp;</td>
										<td>'.$receiveruser->name.'</td>
									</tr> <tr>
										<td>Delivery Date 	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$tripdata->arrival_time.'</td>
									</tr>  
								</table>
							</div>
							<p style="text-align:left;">
					Your parcel are set to created status again. You can look for other transporter trips with your matching Parcel. Information for the cancellation of Trip is also send to MCB Team, they shall be looking for the other matching transporters at the earliest.  
							</p> 
							<p style="text-align:left;">In Case we are not able to find the transporter for your parcel, your money shall be credited to your Wallet.</p>
							<center>
								<a href="http://dev9856.mycourierbuddy.in/viewparcel/'.$parcel->id.'">Find Matching Trip Link</a>
							</center>
							<br>  
							<div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
						</div>
						<p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content.</b></p>
					</div>
					<div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
						<table style="width:100%;padding:0 25px;">
							<tr>
								<td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
								<td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
							</tr>
						</table>
					</div>
				</div>';
					$this->email->message($message);
					$this->email->send(); 
			
					$emailid=$receiveruser->username;
					$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
					$this->email->to($emailid.',admin@mycourierbuddy.com'); 
					$this->email->subject('Trip No. '.$tripdata->TripID.' Is Cancelled By '.$transuser->name.'');   
					$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
					<div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
						<img src="http://mycourierbuddy.in/images/logo.png" />
					</div><img src="http://mycourierbuddy.in/images/plane.jpg" />
					<div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
						<div>
							<div style="text-align:left">Dear '.$receiveruser->name.'</div>
							<p style="text-align:left;">We regret to inform you that, '.$tripdata->TripID.' is cancelled by '.$transuser->name.' due to below mentioned reason.</p>
							<div style="text-align:left; color:#2c4882;">
								<table>
									<tr>
										<td>Parcel No</td><td>&nbsp;-&nbsp;</td>
										<td>'.$tripdata->TripID.'</td>
									</tr>
									<tr>
										<td>Sender Name	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$parceluser->name.'</td>
									</tr>
									<tr>
										<td>Transporter ID	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$transuser->UserID.'</td>
									</tr> 
									<tr>
										<td>Receiver </td><td>&nbsp;-&nbsp;</td>
										<td>'.$receiveruser->name.'</td>
									</tr> <tr>
										<td>Delivery Date 	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$tripdata->arrival_time.'</td>
									</tr>  
								</table>
							</div>
							<p style="text-align:left;">
					Your parcel are set to created status again. You can look for other transporter trips with your matching Parcel. Information for the cancellation of Trip is also send to MCB Team, they shall be looking for the other matching transporters at the earliest.  
							</p>  
							<br>  
							<div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
						</div>
						<p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content.</b></p>
					</div>
					<div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
						<table style="width:100%;padding:0 25px;">
							<tr>
								<td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
								<td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
							</tr>
						</table>
					</div>
				</div>';
				$this->email->message($message);
					$this->email->send(); 
					
					
					$emailid=$transuser->username;
				$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
				$this->email->to($emailid.',admin@mycourierbuddy.com'); 
				$this->email->subject('Trip No. '.$tripdata->TripID.' Is Cancelled By '.$transuser->name.'');   
				$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
					<div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
						<img src="http://mycourierbuddy.in/images/logo.png" />
					</div><img src="http://mycourierbuddy.in/images/plane.jpg" />
					<div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
						<div>
							<div style="text-align:left">Dear '.$transuser->name.'</div>
							<p style="text-align:left;">'.$tripdata->TripID.' is successfully cancelled by you.   </p>
							<div style="text-align:left; color:#2c4882;">
								<table>
									<tr>
										<td>Parcel No</td><td>&nbsp;-&nbsp;</td>
										<td>'.$tripdata->TripID.'</td>
									</tr>
									<tr>
										<td>Sender Name	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$parceluser->name.'</td>
									</tr>
									<tr>
										<td>Transporter ID	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$transuser->UserID.'</td>
									</tr> 
									<tr>
										<td>Receiver </td><td>&nbsp;-&nbsp;</td>
										<td>'.$receiveruser->name.'</td>
									</tr> <tr>
										<td>Delivery Date 	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$tripdata->arrival_time.'</td>
									</tr>  
								</table>
							</div>
							<p style="text-align:left;">
					  As you have cancelled the above mentioned Trip. All the parcels matched with this trip are removed from the Trip and any changes to the trip are locked.  
							</p> 
							<center>
								<a href="http://dev9856.mycourierbuddy.in/viewtrip/'.$tripdata->id.'">Trip Detail Link</a>
							</center>
							<br>  
							<div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
						</div>
						<p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content.</b></p>
					</div>
					<div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
						<table style="width:100%;padding:0 25px;">
							<tr>
								<td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
								<td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
							</tr>
						</table>
					</div>
				</div>';	
				$this->email->message($message);
				$this->email->send();  
			  } 
			}
			$data["capacity"]=$trip['capacity']; 
			if(isset($trip['comment'])){
			$data["comment"]=$trip['comment'];
			} 
		   if(isset($trip['duration'])){
			$data["duration"]=$trip['duration'];
			} 
			$sql = "update cms_parcels a set status=0,trans_id=0,processed_by=".$trip["t_id"]." where exists(select p_id from cms_bookings b where b.p_id=a.id and status=3 and b.t_id=".$trip["id"].") "; 
			 $this->db->query($sql);
			$sql = "update `cms_bookings` set  status=4,process_by=".$trip["t_id"]." where t_id=".$trip["id"]." and status=3;";
			$this->db->query($sql); 
			$data["status"]=0;  
			$this->db->where('id', $trip["id"]);
			$this->db->update('trips', $data);   
			$this->db->where("id",$trip["id"]); 
			$query=$this->db->get("trips");			
			$data=new stdclass();
			$data->status="success";
			$data->response="Trip added successfully.";		
			$json_response = json_encode($data); 
			print_r($json_response);
		} else {
			$data1=new stdclass();
			$data1->status="Error";
			$data1->errorMessage="Mandatory fields cannot be blank.";
			$json_response = json_encode($data1); 
			print_r( $json_response);
		}
    } 
	function update_trips_status($request)
    {   $this->db->where("id",$request["id"]); 
		$query=$this->db->get("trips");
		$data1=new stdclass();
		if($query->num_rows()>0)
        {   
			$data=array('status'=>$request["status"]);
			if(isset($request["reason"])){
					$data["requirement"]=$request["reason"];
			}
			$this->db->where('id', $request["id"]);
			$this->db->update('trips', $data); 
			if($request["status"]=="1")
			{ 
				$this->db->where('id', $request["id"]);
				$query1=$this->db->get("trips");
				$res=$query1->result()[0]; 
				$this->db->where("id",$res->t_id);  
				$query2=$this->db->get("users");
				$res1=$query2->result()[0]; 
				$emailid=$res1->username;
				$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
				$this->email->to($emailid.',admin@mycourierbuddy.com'); 
				$this->email->subject('Trip No '.$res->TripID.' Is Approved by Admin Successfully');   
				$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$res1->name.'</div>
            <p style="text-align:left;">Congratulations! Your trip is approved by Admin </p>
            <div style="text-align:left; color:#2c4882;">
                <table>
                    <tr>
                        <td>Trip ID </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$res->TripID.' </td>
                    </tr>
                    <tr>
                        <td> From </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$res->source.' </td>
                    </tr>
                    <tr>
                        <td> To </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$res->destination.'</td>
                    </tr>
                    <tr>
                        <td>
                            Departure Date</td><td>&nbsp;-&nbsp;</td>
                        <td>'. date("d-m-Y H:i:s", strtotime($res->dep_time)).'</td>
                    </tr>
                    <tr>
                        <td>
                            Flight No</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$res->flight_no.'</td>
                    </tr>
                    <tr>
                        <td>
                            PNR No</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$res->pnr.'</td>
                    </tr>
                    <tr>
                        <td>
                            Capacity</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$res->capacity.' Kg</td>
                    </tr>
                    <tr>
                        <td>Comments </td><td>&nbsp;-&nbsp;</td>
                        <td>
                           '.$res->comment.'
                        </td>
                    </tr>
                </table>
            </div>
            <p style="text-align:left;">
                Your trip is now visible to senders for booking parcels with you. You shall also be able to look for matching parcels now.
            </p>
            <center>
                <a href="http://dev9856.mycourierbuddy.in/viewtrip/'.$res->id.'">View Trip Link</a>
            </center>
            <p style="text-align:left;">
                <b>
                    Note - Please present your Photo ID to sender while collecting and handing over the parcel.
                </b>
            </p>
            <br />
            <div style="text-align:left; font-size:13px; margin-top:50px;">
                <b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span>
            </div>
        </div>
        <p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content.  </b></p>
    </div>
    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
        <table style="width:100%;padding:0 25px;">
            <tr>
                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
            </tr>
        </table>
    </div>
</div>'; 
				$this->email->message($message);
				$this->email->send(); 
			}	
			if($request["status"]=="8")
			{ 
				$this->db->where('id', $request["id"]);
				$query1=$this->db->get("trips");
				$res=$query1->result()[0]; 
				$this->db->where("id",$res->t_id);  
				$query2=$this->db->get("users");
				$res1=$query2->result()[0]; 
				$emailid=$res1->username;
				$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
				$this->email->to($emailid.',admin@mycourierbuddy.com'); 
				$this->email->subject('MCB: Trip No. '.$res->TripID.' Is “On Hold”');   
				$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$res1->name.'</div>
            <p style="text-align:left;">We like to inform you that, <Trip No.> is put “On Hold” by MCB Team, due to insufficient details about the below trip. </p>
            <div style="text-align:left; color:#2c4882;">
                <table>
                    <tr>
                        <td>Trip No</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$res->TripID.'</td>
                    </tr>
                    <tr>
                        <td>Flight No	</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$res->flight_no.'</td>
                    </tr>
                    <tr>
                        <td>PNR No 	</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$res->pnr.'</td>
                    </tr> <tr>
                        <td>reason</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$request["reason"].'</td>
                    </tr>  
                </table>
            </div>
            <p style="text-align:left;">
            We request you to upload the ticket for the verification purpose along with your Trip. This shall help us, to verify the trip and Approve.   
            </p>
			<p style="text-align:left;">Please click on the below link to upload the ticket online -</p>
            <center>
                <a href="http://dev9856.mycourierbuddy.in/viewtrip/'.$res->id.'">Upload Ticket To Trip Link</a>
            </center>
            <br> 
            <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
        </div>
        <p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content.</b></p>
    </div>
    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
        <table style="width:100%;padding:0 25px;">
            <tr>
                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
            </tr>
        </table>
    </div>
</div>';
				$this->email->message($message);
				$this->email->send(); 
			}	
			if($request["status"]=="5")
			{ 
					$this->db->where('id', $request["id"]);
				$query1=$this->db->get("trips");
				$res=$query1->result()[0]; 
				$this->db->where("id",$res->t_id);  
				$query2=$this->db->get("users");
				$res1=$query2->result()[0]; 
				$emailid=$res1->username;
				$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
				$this->email->to($emailid.',admin@mycourierbuddy.com'); 
				$this->email->subject('MCB: Trip No. '.$res->TripID.' Is “Rejected”');   
				$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$res1->name.'</div>
            <p style="text-align:left;">We regret to inform you as MCB team is not able to verify the air travel ticket, hence the Trip is “Rejected”.</p>
            <div style="text-align:left; color:#2c4882;">
                <table>
                    <tr>
                        <td>Trip No </td><td>&nbsp;-&nbsp;</td>
                        <td> '.$res->TripID.'</td>
                    </tr>
                    <tr>
                        <td>Flight No	</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$res->flight_no.'</td>
                    </tr>
                    <tr>
                        <td>PNR No 	</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$res->pnr.'</td>
                    </tr> <tr>
                        <td>reason </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$request["reason"].'</td>
                    </tr> 
                </table>
            </div>
            <p style="text-align:left;">
          Please get in touch with MCB Team for any further clarifications needed at admin@mycourierbuddy.com 
            </p> 
            <br> 
            <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
        </div>
       <p style="text-align:left;"> <br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content.</b></p>
    </div>
    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
        <table style="width:100%;padding:0 25px;">
            <tr>
                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
            </tr>
        </table>
    </div>
</div>';
				$this->email->message($message);
				$this->email->send(); 
			}	
		    $query=$this->db->get("trips");
		    $data1->status="success";
			$data1->response=$query->result();		
			$json_response = json_encode($data1); 
			return($json_response);             
		}
		else{
			$data1->status="Error";
			$data1->errorMessage="Error in Update Trip";
			$json_response = json_encode($data1); 
			return $json_response;
		}  
    } 
	function usrupdate_trips_status($request)
    {   $this->db->where("id",$request["id"]); 
		$query=$this->db->get("trips");
		$data1=new stdclass(); 
		if($query->num_rows()>0)
        {   if($request["status"]==6)
			{   $sql = "update cms_parcels a set status=4,processed_by=".$request["process_by"]." where id=".$request["parcelid"]; 
			 	$this->db->query($sql);	
				$sql = "update cms_trips a set status=6,processed_by=".$request["process_by"]." where (SELECT COUNT( * ) FROM cms_parcels WHERE trans_id =".$request["id"]." AND STATUS in(2,3))=0 and id=".$request["id"]; 
				$this->db->query($sql); 
			}
			else
			{
				$data=array('status'=>$request["status"]);
				$data["processed_by"]=$request["process_by"];
				$data["requirement"]=$request["reason"];
				$this->db->where('id', $request["id"]);
				$this->db->update('trips', $data);
			}
			if($request["status"]==4)
			{  
				 $sql = "update cms_parcels a set status=0,trans_id=0,processed_by=".$request["process_by"]." where exists(select p_id from cms_bookings b where b.p_id=a.id and b.t_id=".$request["id"]." and b.status=3) "; 
			 	 $this->db->query($sql);
				 $sql = "update `cms_bookings` set  status=4,process_by=".$request["process_by"]." where t_id=".$request["id"].";"; 
			 	 $this->db->query($sql);	
				$sql = "update cms_chatchannel a set a.isactive=0 where tripid=".$request["id"].";"; 
			   $this->db->query($sql);				 
				 $this->db->where("id", $request["id"]); 
				 $tripquery=$this->db->get("trips");
				 $trip=$tripquery->result()[0]; 
				 $this->db->where("id",$trip->t_id);  
				 $transquery=$this->db->get("users");
				 $transuser=$transquery->result()[0]; 
				 $arraywhere = array('trans_id' => $request["id"],'status !=' => 6); 
				$this->db->where($arraywhere);  
				$query=$this->db->get("parcels"); 
				$parcelqueryresult=$query->result();
				foreach($parcelqueryresult as $parcel)
				{ 
				  $chatchannelcreate=array("isactive"=>"0");
			      $this->db->where('parcelid', $parcel->id);
			      $this->db->update('chatchannel', $chatchannelcreate);
					$this->db->where("id",$parcel->usr_id);  
					$query2=$this->db->get("users");
					$parceluser=$query2->result()[0]; 
					$this->db->where("id",$parcel->recv_id);  
					$receiverquery=$this->db->get("users");
					$receiveruser=$receiverquery->result()[0];   
					
					$sql = "update cms_users a set a.wallet=wallet+".$parcel->payment." where id=".$parceluser->id.";"; 
			 	   $this->db->query($sql);
				   $walletstatement=array("comment"=>"Parcel #P".$parcel->id." Booking Cancelled by Transporter .","parcelid"=> $parcel->id,"tripid"=>$request["id"],"weight"=>$parcel->weight,"insertdate"=>date("Y-m-d H:i:s"),"amount"=>$parcel->payment,"credit"=>$parcel->payment,"debit"=>0,"userid"=>$parceluser->id);
				   $this->db->insert('walletstatement', $walletstatement);
				
					$emailid=$parceluser->username;
					$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
					$this->email->to($emailid.',admin@mycourierbuddy.com'); 
					$this->email->subject('Trip No. '.$trip->TripID.' Is Cancelled By '.$transuser->name.'');   
					$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
					<div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
						<img src="http://mycourierbuddy.in/images/logo.png" />
					</div><img src="http://mycourierbuddy.in/images/plane.jpg" />
					<div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
						<div>
							<div style="text-align:left">Dear '.$parceluser->name.'</div>
							<p style="text-align:left;">We regret to inform you that, '.$trip->TripID.' is cancelled by '.$transuser->name.' due to below mentioned reason.</p>
							<div style="text-align:left; color:#2c4882;">
								<table>
									<tr>
										<td>Parcel No</td><td>&nbsp;-&nbsp;</td>
										<td>'.$trip->TripID.'</td>
									</tr>
									<tr>
										<td>Sender Name	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$trip->name.'</td>
									</tr>
									<tr>
										<td>Transporter ID	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$transuser->UserID.'</td>
									</tr> 
									<tr>
										<td>Receiver </td><td>&nbsp;-&nbsp;</td>
										<td>'.$receiveruser->name.'</td>
									</tr> <tr>
										<td>Delivery Date 	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$trip->arrival_time.'</td>
									</tr>  
								</table>
							</div>
							<p style="text-align:left;">
					Your parcel are set to created status again. You can look for other transporter trips with your matching Parcel. Information for the cancellation of Trip is also send to MCB Team, they shall be looking for the other matching transporters at the earliest.  
							</p> 
							<p style="text-align:left;">In Case we are not able to find the transporter for your parcel, your money shall be credited to your Wallet.</p>
							<center>
								<a href="http://dev9856.mycourierbuddy.in/viewparcel/'.$parcel->id.'">Find Matching Trip Link</a>
							</center>
							<br>  
							<div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
						</div>
						<p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content.</b></p>
					</div>
					<div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
						<table style="width:100%;padding:0 25px;">
							<tr>
								<td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
								<td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
							</tr>
						</table>
					</div>
				</div> ';
					$this->email->message($message);
					$this->email->send(); 
			
					$emailid=$receiveruser->username;
					$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
					$this->email->to($emailid.',admin@mycourierbuddy.com'); 
					$this->email->subject('Trip No. '.$trip->TripID.' Is Cancelled By '.$transuser->name.'');   
					$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
					<div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
						<img src="http://mycourierbuddy.in/images/logo.png" />
					</div><img src="http://mycourierbuddy.in/images/plane.jpg" />
					<div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
						<div>
							<div style="text-align:left">Dear '.$receiveruser->name.'</div>
							<p style="text-align:left;">We regret to inform you that, '.$trip->TripID.' is cancelled by '.$transuser->name.' due to below mentioned reason.</p>
							<div style="text-align:left; color:#2c4882;">
								<table>
									<tr>
										<td>Parcel No</td><td>&nbsp;-&nbsp;</td>
										<td>'.$trip->TripID.'</td>
									</tr>
									<tr>
										<td>Sender Name	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$parceluser->name.'</td>
									</tr>
									<tr>
										<td>Transporter ID	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$transuser->UserID.'</td>
									</tr> 
									<tr>
										<td>Receiver </td><td>&nbsp;-&nbsp;</td>
										<td>'.$receiveruser->name.'</td>
									</tr> <tr>
										<td>Delivery Date 	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$trip->arrival_time.'</td>
									</tr>  
								</table>
							</div>
							<p style="text-align:left;">
					Your parcel are set to created status again. You can look for other transporter trips with your matching Parcel. Information for the cancellation of Trip is also send to MCB Team, they shall be looking for the other matching transporters at the earliest.  
							</p>  
							<br>  
							<div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
						</div>
						<p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content.</b></p>
					</div>
					<div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
						<table style="width:100%;padding:0 25px;">
							<tr>
								<td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
								<td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
							</tr>
						</table>
					</div>
				</div> ';		
					$this->email->message($message);
					$this->email->send();
					
					$emailid=$transuser->username; 
			     $this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
			     $this->email->to($emailid.',admin@mycourierbuddy.com'); 
			  	$this->email->subject('Trip No. '.$trip->TripID.' Is Cancelled By '.$transuser->name.'');   
			     $message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
					<div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
						<img src="http://mycourierbuddy.in/images/logo.png" />
					</div><img src="http://mycourierbuddy.in/images/plane.jpg" />
					<div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
						<div>
							<div style="text-align:left">Dear '.$transuser->name.'</div>
							<p style="text-align:left;">'.$trip->TripID.' is successfully cancelled by you.   </p>
							<div style="text-align:left; color:#2c4882;">
								<table>
									<tr>
										<td>Parcel No</td><td>&nbsp;-&nbsp;</td>
										<td>'.$trip->TripID.'</td>
									</tr>
									<tr>
										<td>Sender Name	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$parceluser->name.'</td>
									</tr>
									<tr>
										<td>Transporter ID	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$transuser->UserID.'</td>
									</tr> 
									<tr>
										<td>Receiver </td><td>&nbsp;-&nbsp;</td>
										<td>'.$receiveruser->name.'</td>
									</tr> <tr>
										<td>Delivery Date 	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$trip->arrival_time.'</td>
									</tr>  
								</table>
							</div>
							<p style="text-align:left;">
					  As you have cancelled the above mentioned Trip. All the parcels matched with this trip are removed from the Trip and any changes to the trip are locked.  
							</p> 
							<center>
								<a href="http://dev9856.mycourierbuddy.in/viewtrip/'.$trip->id.'">Trip Detail Link</a>
							</center>
							<br>  
							<div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
						</div>
						<p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content.</b></p>
					</div>
					<div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
						<table style="width:100%;padding:0 25px;">
							<tr>
								<td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
								<td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
							</tr>
						</table>
					</div>
				</div>';	
			     $this->email->message($message);
			     $this->email->send();   
				} 
			} 
			//parcel collected
			if($request["status"]==3 && $request["reason"]=="Parcel Collected")
			{ 
				$sql = "update cms_parcels a set status=3,processed_by=".$request["process_by"]." where id=".$request["parcelid"]." "; 
			 	$this->db->query($sql);
				$this->db->where("id",$request["parcelid"]); 
				$query=$this->db->get("parcels");   
				$parcel=$query->result()[0];
				$this->db->where("id", $request["id"]); 
				$tripquery=$this->db->get("trips");
				$trip=$tripquery->result()[0]; 
				$this->db->where("id",$parcel->usr_id);  
				$query2=$this->db->get("users");
				$parceluser=$query2->result()[0]; 
				$this->db->where("id",$parcel->recv_id);  
				$receiverquery=$this->db->get("users");
				$receiveruser=$receiverquery->result()[0]; 
				$this->db->where("id",$trip->t_id);  
				$transquery=$this->db->get("users");
				$transuser=$transquery->result()[0]; 
				
			$emailid=$parceluser->username;
			$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
			$this->email->to($emailid.',admin@mycourierbuddy.com'); 
			$this->email->subject('Parcel No '.$parcel->ParcelID.' Collected By Transporter '.$transuser->name.'');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$parceluser->name.'</div>
            <p style="text-align:left;">Congratulations! Transporter has confirmed, your parcel is collected by Transporter.</p>
            <div style="text-align:left; color:#2c4882;">
                <table>
                    <tr>
                        <td>Parcel No 	</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcel->ParcelID.'</td>
                    </tr>
                    <tr>
                        <td>
                            Transporter ID</td><td>&nbsp;-&nbsp;</td>
                        <td> '.$transuser->UserID.' & '.$transuser->name.'</td>
                    </tr>
                    <tr>
                        <td>
                            Flight No</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip->flight_no.'</td>
                    </tr>
                    <tr>
                        <td>
                            Arrival Time</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip->arrival_time.'at Destination.
                        </td>
                    </tr>
                </table>
            </div>
            <p style="text-align:left;">
                Do not forget to remind Receiver to receive the parcel as per the landing time at Destination or as per the agreement with Transporter.
            </p>
            <p style="text-align:left;">
                <b> Note - Please check the ID of transporter while handing over the parcel.</b>
            </p>
            <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
        </div>
        <p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you disclose the content of envelope or parcel to transporter at the collection. This is make sure the safety of transporter and parcel. Transporters have the authority to reject the parcel in case they do not feel safe to collect and deliver the parcel content.</b></p>
    </div>
    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
        <table style="width:100%;padding:0 25px;">
            <tr>
                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
            </tr>
        </table>
    </div>
</div>';
			$this->email->message($message);
			$this->email->send(); 
			
			$emailid=$receiveruser->username;
			$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
			$this->email->to($emailid.',admin@mycourierbuddy.com'); 
			$this->email->subject('Parcel No '.$parcel->ParcelID.' Collected By Transporter '.$transuser->name.'');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$receiveruser->name.'</div>
            <p style="text-align:left;">Congratulations! Transporter has confirmed, your parcel is collected by Transporter.</p>
            <div style="text-align:left; color:#2c4882;">
                <table>
                    <tr>
                        <td>Parcel No 	</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcel->ParcelID.'</td>
                    </tr>
                    <tr>
                        <td>
                            Transporter ID	</td><td>&nbsp;-&nbsp;</td>
                        <td> '.$transuser->UserID.' & '.$transuser->name.'</td>
                    </tr>
                    <tr>
                        <td>
                            Flight No</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip->flight_no.'</td>
                    </tr>
                    <tr>
                        <td>
                            Arrival Time</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip->arrival_time.'at Destination.
                        </td>
                    </tr>
                </table>
            </div>
            <p style="text-align:left;">
                Do not forget to remind Receiver to receive the parcel as per the landing time at Destination or as per the agreement with Transporter.
            </p>
            <p style="text-align:left;">
                <b> Note - Please check the ID of transporter while handing over the parcel.</b>
            </p>
            <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
        </div>
       <p style="text-align:left;"> <br><b style="font-family:Calibri;">Note - Please make sure you disclose the content of envelope or parcel to transporter at the collection. This is make sure the safety of transporter and parcel. Transporters have the authority to reject the parcel in case they do not feel safe to collect and deliver the parcel content.</b></p>
    </div>
    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
        <table style="width:100%;padding:0 25px;">
            <tr>
                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
            </tr>
        </table>
    </div>
</div>';		
			$this->email->message($message);
			$this->email->send(); 
			
			$emailid=$transuser->username;
			$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
			$this->email->to($emailid.',admin@mycourierbuddy.com'); 
			$this->email->subject('Parcel No '.$parcel->ParcelID.' Collected By Transporter '.$transuser->name.'');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$transuser->name.'</div>
            <p style="text-align:left;">Congratulations! You have successfully collected parcel matched with your trip  </p>
            <div style="text-align:left; color:#2c4882;">
                <table>
                    <tr>
                        <td>Parcel ID	</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcel->ParcelID.'</td>
                    </tr>
                    <tr>
                        <td>
                            Sender </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parceluser->UserID.'</td>
                    </tr>
                    <tr>
                        <td>Sender Name </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parceluser->name.'</td>
                    </tr>
                    <tr>
                        <td>Receiver </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$receiveruser->name.'</td>
                    </tr>
                    <tr>
                        <td>Trip ID	</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip->TripID.'</td>
                    </tr>
                    <tr>
                        <td>Departure Date	</td><td>&nbsp;-&nbsp;</td>
                        <td>'. date("d-m-Y H:i:s", strtotime($trip->dep_time)).'</td>
                    </tr>
                    <tr>
                        <td>Flight No </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip->flight_no.'</td>
                    </tr>
                </table>
            </div>
            <p style="text-align:left;">
                We appreciate your help for collecting the parcel and handing over to Receiver. Handle the parcel carefully and please get in touch with Receiver to deliver the parcel.
            </p>
            <center>
                <a href="http://dev9856.mycourierbuddy.in/viewparcel/'.$trip->id.'">View Trip Link</a>
            </center>
            <p style="text-align:left;">
                <b>
                    Note - Please present your Photo ID to sender while collecting and handing over the parcel.
                </b>
            </p>
            <br />
            <div style="text-align:left; font-size:13px; margin-top:50px;">
                <b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span>
            </div>
        </div>
        <p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content. </b></p>
    </div>
    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
        <table style="width:100%;padding:0 25px;">
            <tr>
                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
            </tr>
        </table>
    </div>
</div>';	
			$this->email->message($message);
			$this->email->send();  
			
			}
			//parcel Delivered
			if($request["status"]==6)
			{   
				$this->db->where("id",$request["parcelid"]); 
				$query=$this->db->get("parcels");   
				$parcel=$query->result()[0];
				$this->db->where("id", $request["id"]); 
				$tripquery=$this->db->get("trips");
				$trip=$tripquery->result()[0]; 
				$this->db->where("id",$parcel->usr_id);  
				$query2=$this->db->get("users");
				$parceluser=$query2->result()[0]; 
				$this->db->where("id",$parcel->recv_id);  
				$receiverquery=$this->db->get("users");
				$receiveruser=$receiverquery->result()[0]; 
				$this->db->where("id",$trip->t_id);  
				$transquery=$this->db->get("users");
				$transuser=$transquery->result()[0]; 
				
			$emailid=$parceluser->username;
			$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
			$this->email->to($emailid.',admin@mycourierbuddy.com'); 
			$this->email->subject('Transporter '.$transuser->name.' Has Delivered the Parcel No. '.$parcel->ParcelID.'');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$parceluser->name.'</div>
            <p style="text-align:left;">Congratulations! Your parcel is successfully delivered to '.$receiveruser->name.' by Transporter <Transporter Name>. </p>
            <div style="text-align:left; color:#2c4882;">
                <table>
                    <tr>
                        <td>Parcel No </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcel->ParcelID.'</td>
                    </tr>
                    <tr>
                        <td>
                            Transporter ID</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip->TripID.'</td>
                    </tr>
                    <tr>
                        <td>
                            Receiver</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$receiveruser->name.'</td>
                    </tr>
                    <tr>
                        <td>
                            Delivery Date</td><td>&nbsp;-&nbsp;</td>
                        <td>
                          '.date("Y-m-d H:i:s").'
                        </td>
                    </tr>
                </table>
            </div>
            <p style="text-align:left;">
                Next Action - You can check with Receiver if he/she has received the parcel safely. And you can complete the status of parcel and rate the transporter by clicking the below link.
            </p>
            <center>
                <a href="http://dev9856.mycourierbuddy.in/viewparcel/'.$parcel->id.'">Complete Order Link</a>
            </center>
            <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
        </div>
       <p style="text-align:left;"> <br><b style="font-family:Calibri;">Note - Please make sure you disclose the content of envelope or parcel to transporter at the collection. This is make sure the safety of transporter and parcel. Transporters have the authority to reject the parcel in case they do not feel safe to collect and deliver the parcel content.</b></p>
    </div>
    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
        <table style="width:100%;padding:0 25px;">
            <tr>
                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
            </tr>
        </table>
    </div>
</div>';
			$this->email->message($message);
			$this->email->send(); 
			
			$emailid=$receiveruser->username;
			$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
			$this->email->to($emailid.',admin@mycourierbuddy.com'); 
			$this->email->subject('Transporter '.$transuser->name.' Has Delivered the Parcel No. '.$parcel->ParcelID.'');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$receiveruser->name.'</div>
            <p style="text-align:left;">Congratulations! Your parcel is successfully delivered to '.$receiveruser->name.' by Transporter '.$transuser->name.'.  </p>
            <div style="text-align:left; color:#2c4882;">
                <table>
                    <tr>
                        <td>
                            Sender Name	</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parceluser->name.'</td>
                    </tr>
                    <tr>
                        <td>
                            Transporter ID</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$transuser->name.'</td>
                    </tr>
                    <tr>
                        <td>
                            Receiver</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$receiveruser->name.'</td>
                    </tr>
                    <tr>
                        <td>
                            Delivery Date</td><td>&nbsp;-&nbsp;</td>
                        <td>
                           '.date("d-m-Y H:i:s").'
                        </td>
                    </tr>
                </table>
            </div>
            <p style="text-align:left;">
                Next Action – Please complete the status of parcel and rate the transporter by clicking the below link -
            </p>
            <center>
                <a href="http://dev9856.mycourierbuddy.in/receiver">Complete Order Link </a>
            </center>

            <br />
            <div style="text-align:left; font-size:13px; margin-top:50px;">
                <b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span>
            </div>
        </div>
        <p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from transporter at the time of receiving the parcel. This is to make sure transporter have delivered the parcel safely. </b></p>
    </div>
    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
        <table style="width:100%;padding:0 25px;">
            <tr>
                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
            </tr>
        </table>
    </div>
</div> ';		
			$this->email->message($message);
			$this->email->send(); 
			
			$emailid=$transuser->username;
			$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
			$this->email->to($emailid.',admin@mycourierbuddy.com'); 
			$this->email->subject('Transporter '.$transuser->name.' Has Delivered the Parcel No. '.$parcel->ParcelID.'');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$transuser->name.'</div>
            <p style="text-align:left;">Congratulations! You have successfully delivered the parcel   </p>
            <div style="text-align:left; color:#2c4882;">
                <table>
                    <tr>
                        <td>Trip ID 		</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$trip->TripID.'</td>
                    </tr>
                    <tr>
                        <td>
                            Parcel ID</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcel->ParcelID.'</td>
                    </tr>
                    <tr>
                        <td>
                            Sender</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parceluser->UserID.'</td>
                    </tr>
                    <tr>
                        <td>Sender Name </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parceluser->name.'</td>
                    </tr>
                    <tr>
                        <td>Receiver </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$receiveruser->name.'</td>
                    </tr>
                </table>
            </div>
            <p style="text-align:left;">
                We appreciate your help for delivering the parcel and handing over to Receiver. Receiver is going to confirm the receipt of parcel and share the feedback. On successful completion by Receiver/Sender your share of money will be credited in your Wallet.
            </p>
            <center>
                <a href="http://dev9856.mycourierbuddy.in/viewtrip/'.$trip->id.'">View Trip Link</a>
            </center>
            <p style="text-align:left;">
                <b>
                    Note - Please present your Photo ID to sender while collecting and handing over the parcel.
                </b>
            </p>
            <br />
            <div style="text-align:left; font-size:13px; margin-top:50px;">
                <b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b> 
            </div>
        </div>
       <p style="text-align:left;"> <br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content. </b></p>
    </div>
    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
        <table style="width:100%;padding:0 25px;">
            <tr>
                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
            </tr>
        </table>
    </div>
</div> ';	
			$this->email->message($message);
			$this->email->send();  
			}
			$this->db->where("id",$request["id"]); 
		    $query=$this->db->get("trips");
		    $data1->status="success";
			$data1->response=$query->result();		
			$json_response = json_encode($data1); 
			return($json_response);            
		}
		else
		{
			$data1->status="Error";
			$data1->errorMessage="Error in Update Trip";
			$json_response = json_encode($data1); 
			return $json_response;
		}  
    }
	function cancel_parcel_by_transporter($request)
	{   
		$this->db->where("id",$request["parcelid"]); 
		$query=$this->db->get("parcels");
		$parcel=$query->result()[0];
		$data1=new stdclass(); 
		if($query->num_rows()>0)
        {   	$this->db->where("id", $request["id"]); 
				$tripquery=$this->db->get("trips");
				$trip=$tripquery->result()[0]; 
				$this->db->where("id",$parcel->usr_id);  
				$query2=$this->db->get("users");
				$parceluser=$query2->result()[0]; 
				$this->db->where("id",$parcel->recv_id);  
				$receiverquery=$this->db->get("users");
				$receiveruser=$receiverquery->result()[0]; 
				$this->db->where("id",$trip->t_id);  
				$transquery=$this->db->get("users");
				$transuser=$transquery->result()[0]; 
				$sql = "update cms_parcels a set a.status=9,trans_id=0,reason='".$request["reason"]."',processed_by=".$request["process_by"]." where id=".$request["parcelid"].";"; 
				$this->db->query($sql);	  
				$sql = "update `cms_bookings` set  status=4,process_by=".$request["process_by"]." where p_id=".$request["parcelid"].";"; 
				$this->db->query($sql);					 
			   $sql = "update cms_users a set a.wallet=wallet+".$parcel->payment." where id=".$parceluser->id.";"; 
			   $this->db->query($sql);
			    $sql = "update cms_chatchannel a set a.isactive=0 where parcelid=".$parcel->id.";"; 
			   $this->db->query($sql);
			  $booking = $this->db->query("SELECT a.*,IFNULL(b.username,'') as senderemail,IFNULL(b.name,'') as sendername,IFNULL(c.username,'') as receiveremail ,IFNULL(c.name,'') as receivername,d.id as BookingID,prstatus.status as statusdescription,IFNULL(channel.id,0) as channelid FROM cms_parcels a left join (select * from cms_chatchannel where isactive=1) channel on a.id=channel.parcelid left join cms_users b on a.usr_id=b.id left join cms_users c on a.recv_id=c.id inner join (select * from cms_bookings where status in(3,6)) d on a.id=d.p_id left join cms_parcelstatus prstatus on a.status=prstatus.id where `t_id`=".$request["id"]."")->num_rows(); 
			  if($booking ==0){
				  $sql = "update cms_trips a set a.status=1,requirement='".$request["reason"]."',processed_by=".$request["process_by"]." where id=".$request["id"].";"; 
				$this->db->query($sql);	  
			  }
			   $walletstatement=array("comment"=>"Parcel #P".$parcel->id." Booking Cancelled by Transporter .","parcelid"=> $parcel->id,"tripid"=>$request["id"],"weight"=>$parcel->weight,"insertdate"=>date("Y-m-d H:i:s"),"amount"=>$parcel->payment,"credit"=>$parcel->payment,"debit"=>0,"userid"=>$parceluser->id);
			   $this->db->insert('walletstatement', $walletstatement); 
			   
			        $emailid=$parceluser->username;
					$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
					$this->email->to($emailid.',admin@mycourierbuddy.com'); 
					$this->email->subject('Parcel No. '.$parcel->ParcelID.' Booking Is Cancelled By '.$transuser->name.'');   
					$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
					<div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
						<img src="http://mycourierbuddy.in/images/logo.png" />
					</div><img src="http://mycourierbuddy.in/images/plane.jpg" />
					<div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
						<div>
							<div style="text-align:left">Dear '.$parceluser->name.'</div>
							<p style="text-align:left;">We regret to inform you that, Parcel No. '.$parcel->ParcelID.' Booking Is Cancelled By '.$transuser->name.' due to below mentioned reason.</p>
							<div style="text-align:left; color:#2c4882;">
								<table>
									<tr>
										<td>Parcel No</td><td>&nbsp;-&nbsp;</td>
										<td>'.$trip->TripID.'</td>
									</tr>
									<tr>
										<td>Sender Name	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$parceluser->name.'</td>
									</tr>
									<tr>
										<td>Transporter ID	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$transuser->UserID.'</td>
									</tr> 
									<tr>
										<td>Receiver </td><td>&nbsp;-&nbsp;</td>
										<td>'.$receiveruser->name.'</td>
									</tr> <tr>
										<td>Delivery Date 	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$trip->arrival_time.'</td>
									</tr>  
								</table>
							</div>
							<p style="text-align:left;">
					Your parcel are set to created status again. You can look for other transporter trips with your matching Parcel. Information for the cancellation of Trip is also send to MCB Team, they shall be looking for the other matching transporters at the earliest.  
							</p> 
							<p style="text-align:left;">In Case we are not able to find the transporter for your parcel, your money shall be credited to your Wallet.</p>
							<center>
								<a href="http://dev9856.mycourierbuddy.in/viewparcel/'.$parcel->id.'">Find Matching Trip Link</a>
							</center>
							<br>  
							<div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
						</div>
						<p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content.</b></p>
					</div>
					<div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
						<table style="width:100%;padding:0 25px;">
							<tr>
								<td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
								<td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
							</tr>
						</table>
					</div>
				</div> ';
					$this->email->message($message);
					$this->email->send(); 
			
					$emailid=$receiveruser->username;
					$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
					$this->email->to($emailid.',admin@mycourierbuddy.com'); 
					$this->email->subject('Parcel No. '.$parcel->ParcelID.' Booking Is Cancelled By '.$transuser->name.'');   
					$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
					<div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
						<img src="http://mycourierbuddy.in/images/logo.png" />
					</div><img src="http://mycourierbuddy.in/images/plane.jpg" />
					<div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
						<div>
							<div style="text-align:left">Dear '.$receiveruser->name.'</div>
							<p style="text-align:left;">We regret to inform you that, Parcel No. '.$parcel->ParcelID.' Booking Is Cancelled By '.$transuser->name.' due to below mentioned reason.</p>
							<div style="text-align:left; color:#2c4882;">
								<table>
									<tr>
										<td>Parcel No</td><td>&nbsp;-&nbsp;</td>
										<td>'.$trip->TripID.'</td>
									</tr>
									<tr>
										<td>Sender Name	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$parceluser->name.'</td>
									</tr>
									<tr>
										<td>Transporter ID	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$transuser->UserID.'</td>
									</tr> 
									<tr>
										<td>Receiver </td><td>&nbsp;-&nbsp;</td>
										<td>'.$receiveruser->name.'</td>
									</tr> <tr>
										<td>Delivery Date 	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$trip->arrival_time.'</td>
									</tr>  
								</table>
							</div>
							<p style="text-align:left;">
					Your parcel are set to created status again. You can look for other transporter trips with your matching Parcel. Information for the cancellation of Trip is also send to MCB Team, they shall be looking for the other matching transporters at the earliest.  
							</p>   
							<div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
						</div>
						<p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content.</b></p>
					</div>
					<div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
						<table style="width:100%;padding:0 25px;">
							<tr>
								<td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
								<td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
							</tr>
						</table>
					</div>
				</div>';		
					$this->email->message($message);
					$this->email->send();
								
					$this->db->where("id",$request["parcelid"]); 
					$query=$this->db->get("parcels");
					$parcel=$query->result()[0];
					$data1->status="success";
					$data1->response=$parcel;		
					$json_response = json_encode($data1); 
					return($json_response);  
     	}
		else
		{
			$data1->status="Error";
			$data1->errorMessage="Error in Update Trip";
			$json_response = json_encode($data1); 
			return $json_response;
		}   
	}
	function cancel_parcel_by_admin($request)
	{   
		$this->db->where("id",$request["id"]); 
		$query=$this->db->get("parcels");
		$parcel=$query->result()[0];
		$data1=new stdclass(); 
		if($query->num_rows()>0)
        {   	$this->db->where("id", $parcel->trans_id); 
				$tripquery=$this->db->get("trips");
				$trip=$tripquery->result()[0]; 
				$this->db->where("id",$parcel->usr_id);  
				$query2=$this->db->get("users");
				$parceluser=$query2->result()[0]; 
				$this->db->where("id",$parcel->recv_id);  
				$receiverquery=$this->db->get("users");
				$receiveruser=$receiverquery->result()[0]; 
				$this->db->where("id",$trip->t_id);  
				$transquery=$this->db->get("users");
				$transuser=$transquery->result()[0]; 
				
					$this->db->where("id",$request["process_by"]);  
				$peocessbyquery=$this->db->get("users");
				$processby=$query2->result()[0]; 
				
				$sql = "update cms_parcels a set a.status=0,trans_id=0,reason='".$request["reason"]."',processed_by=".$request["process_by"]." where id=".$request["id"].";"; 
				$this->db->query($sql);	  
				$sql = "update `cms_bookings` set  status=4,process_by=".$request["process_by"]." where p_id=".$request["id"].";"; 
				$this->db->query($sql);					 
			   $sql = "update cms_users a set a.wallet=wallet+".$parcel->payment." where id=".$parceluser->id.";"; 
			   $this->db->query($sql);
			    $sql = "update cms_chatchannel a set a.isactive=0 where parcelid=".$parcel->id.";"; 
			   $this->db->query($sql);
			  $booking = $this->db->query("SELECT a.*,IFNULL(b.username,'') as senderemail,IFNULL(b.name,'') as sendername,IFNULL(c.username,'') as receiveremail ,IFNULL(c.name,'') as receivername,d.id as BookingID,prstatus.status as statusdescription,IFNULL(channel.id,0) as channelid FROM cms_parcels a left join (select * from cms_chatchannel where isactive=1) channel on a.id=channel.parcelid left join cms_users b on a.usr_id=b.id left join cms_users c on a.recv_id=c.id inner join (select * from cms_bookings where status in(3,6)) d on a.id=d.p_id left join cms_parcelstatus prstatus on a.status=prstatus.id where `t_id`=".$parcel->trans_id."")->num_rows(); 
			  if($booking ==0){
				  $sql = "update cms_trips a set a.status=1,requirement='".$request["reason"]."',processed_by=".$request["process_by"]." where id=".$request["id"].";"; 
				$this->db->query($sql);	  
			  }
			   $walletstatement=array("comment"=>"Parcel #P".$parcel->id." Booking Cancelled by Admin .","parcelid"=> $parcel->id,"tripid"=>$request["id"],"weight"=>$parcel->weight,"insertdate"=>date("Y-m-d H:i:s"),"amount"=>$parcel->payment,"credit"=>$parcel->payment,"debit"=>0,"userid"=>$parceluser->id);
			   $this->db->insert('walletstatement', $walletstatement); 
			   
			        $emailid=$parceluser->username;
					$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
					$this->email->to($emailid.',admin@mycourierbuddy.com'); 
					$this->email->subject('Parcel No. '.$parcel->ParcelID.' Booking Is Cancelled By '.$processby->name.'');   
					$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
					<div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
						<img src="http://mycourierbuddy.in/images/logo.png" />
					</div><img src="http://mycourierbuddy.in/images/plane.jpg" />
					<div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
						<div>
							<div style="text-align:left">Dear '.$parceluser->name.'</div>
							<p style="text-align:left;">We regret to inform you that, Parcel No. '.$parcel->ParcelID.' Booking Is Cancelled By '.$processby->name.' due to below mentioned reason.</p>
							<div style="text-align:left; color:#2c4882;">
								<table>
									<tr>
										<td>Parcel No</td><td>&nbsp;-&nbsp;</td>
										<td>'.$trip->TripID.'</td>
									</tr>
									<tr>
										<td>Sender Name	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$parceluser->name.'</td>
									</tr>
									<tr>
										<td>Transporter ID	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$transuser->UserID.'</td>
									</tr> 
									<tr>
										<td>Receiver </td><td>&nbsp;-&nbsp;</td>
										<td>'.$receiveruser->name.'</td>
									</tr> <tr>
										<td>Delivery Date 	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$trip->arrival_time.'</td>
									</tr>  
								</table>
							</div>
							<p style="text-align:left;">
					Your parcel are set to created status again. You can look for other transporter trips with your matching Parcel. Information for the cancellation of Trip is also send to MCB Team, they shall be looking for the other matching transporters at the earliest.  
							</p> 
							<p style="text-align:left;">In Case we are not able to find the transporter for your parcel, your money shall be credited to your Wallet.</p>
							<center>
								<a href="http://dev9856.mycourierbuddy.in/viewparcel/'.$parcel->id.'">Find Matching Trip Link</a>
							</center>
							<br>  
							<div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
						</div>
						<p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content.</b></p>
					</div>
					<div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
						<table style="width:100%;padding:0 25px;">
							<tr>
								<td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
								<td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
							</tr>
						</table>
					</div>
				</div>  ';
					$this->email->message($message);
					$this->email->send(); 
			
					$emailid=$receiveruser->username;
					$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
					$this->email->to($emailid.',admin@mycourierbuddy.com'); 
				$this->email->subject('Parcel No. '.$parcel->ParcelID.' Booking Is Cancelled By '.$processby->name.'');   
					$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
					<div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
						<img src="http://mycourierbuddy.in/images/logo.png" />
					</div><img src="http://mycourierbuddy.in/images/plane.jpg" />
					<div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
						<div>
							<div style="text-align:left">Dear '.$receiveruser->name.'</div>
							<p style="text-align:left;">We regret to inform you that, Parcel No. '.$parcel->ParcelID.' Booking Is Cancelled By '.$processby->name.' due to below mentioned reason.</p>
							<div style="text-align:left; color:#2c4882;">
								<table>
									<tr>
										<td>Parcel No</td><td>&nbsp;-&nbsp;</td>
										<td>'.$trip->TripID.'</td>
									</tr>
									<tr>
										<td>Sender Name	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$parceluser->name.'</td>
									</tr>
									<tr>
										<td>Transporter ID	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$transuser->UserID.'</td>
									</tr> 
									<tr>
										<td>Receiver </td><td>&nbsp;-&nbsp;</td>
										<td>'.$receiveruser->name.'</td>
									</tr> <tr>
										<td>Delivery Date 	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$trip->arrival_time.'</td>
									</tr>  
								</table>
							</div>
							<p style="text-align:left;">
					Your parcel are set to created status again. You can look for other transporter trips with your matching Parcel. Information for the cancellation of Trip is also send to MCB Team, they shall be looking for the other matching transporters at the earliest.  
							</p>  
							<br>  
							<div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
						</div>
						<p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content.</b></p>
					</div>
					<div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
						<table style="width:100%;padding:0 25px;">
							<tr>
								<td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
								<td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
							</tr>
						</table>
					</div>
				</div>  ';
				$this->email->message($message);
					$this->email->send();
								
					$this->db->where("id",$request["id"]); 
					$query=$this->db->get("parcels");
					$parcel=$query->result()[0];
					$data1->status="success";
					$data1->response=$parcel;		
					$json_response = json_encode($data1); 
					return($json_response);  
     	}
		else
		{
			$data1->status="Error";
			$data1->errorMessage="Error in Update Trip";
			$json_response = json_encode($data1); 
			return $json_response;
		}   
	}
	function usrupdate_Parcel_status($request)
    {   $this->db->where("id",$request["id"]); 
		$query=$this->db->get("parcels");
		$parcel=$query->result()[0];
		$data1=new stdclass(); 
		if($query->num_rows()>0)
        {    if($parcel->status==2 && $request["status"]==6)
		    { 
				$sql = "update cms_users a set a.wallet=wallet+".$parcel->payment." where id=".$parcel->usr_id.";"; 
			    $this->db->query($sql);
				$walletstatement=array("comment"=>"Refund from cancellation","parcelid"=> $parcel->id,"tripid"=>$parcel->trans_id,"weight"=>$parcel->weight,"insertdate"=>date("Y-m-d H:i:s"),"amount"=>$parcel->payment,"credit"=>$parcel->payment,"debit"=>0,"userid"=>$parcel->usr_id);
				$this->db->insert('walletstatement', $walletstatement);
			   $data=array('status'=>6);
		       $data["processed_by"]=$request["process_by"];
		       $data["reason"]=$request["reason"];
			   $this->db->where('id', $request["id"]);
		       $this->db->update('parcels', $data); 
			   //email after cancel if booked with trip
			   $sql = "update cms_bookings set status=4 , process_by=".$request["process_by"]." where p_id=".$request["id"]; 
			 $this->db->query($sql); 
			 $sql = "update cms_chatchannel a set a.isactive=0 where parcelid=".$request["id"].";"; 
			   $this->db->query($sql);	
				  $sql = "update cms_trips a set status=1,processed_by=".$request["process_by"]." where exists(select t_id from cms_bookings b where b.p_id=".$request["id"]." and b.status!=3) and (select count(*) from cms_bookings where t_id in(select t_id from cms_bookings b where b.p_id=".$request["id"]." ) and status=3)=0	"; 
			 	 $this->db->query($sql);   
				$this->db->where("id",$parcel->usr_id);  
				$query2=$this->db->get("users");
				$parceluser=$query2->result()[0]; 
				$this->db->where("id",$parcel->recv_id);  
				$receiverquery=$this->db->get("users");
				$receiveruser=$receiverquery->result()[0];   
			if($parcel->trans_id>0)
			{   $this->db->where("id", $parcel->trans_id); 
				$tripquery=$this->db->get("trips");
				$trip=$tripquery->result()[0]; 
				$this->db->where("id",$trip->t_id);  
				$transquery=$this->db->get("users");
				$transuser=$transquery->result()[0]; 
				$emailid=$transuser->username;
			    $this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
			    $this->email->to($emailid.',admin@mycourierbuddy.com'); 
			    $this->email->subject('Parcel No. '.$parcel->ParcelID.' Is Cancelled By '.$parceluser->name.'');   
			    $message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
					<div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
						<img src="http://mycourierbuddy.in/images/logo.png" />
					</div><img src="http://mycourierbuddy.in/images/plane.jpg" />
					<div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
						<div>
							<div style="text-align:left">Dear '.$transuser->name.'</div>
							<p style="text-align:left;">'.$trip->TripID.' is successfully cancelled by '.$parceluser->name.'.   </p>
							<div style="text-align:left; color:#2c4882;">
								<table>
									<tr>
										<td>Parcel No</td><td>&nbsp;-&nbsp;</td>
										<td>'.$trip->TripID.'</td>
									</tr>
									<tr>
										<td>Sender Name	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$parceluser->name.'</td>
									</tr>
									<tr>
										<td>Transporter ID	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$transuser->UserID.'</td>
									</tr> 
									<tr>
										<td>Receiver </td><td>&nbsp;-&nbsp;</td>
										<td>'.$receiveruser->name.'</td>
									</tr> <tr>
										<td>Delivery Date 	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$trip->arrival_time.'</td>
									</tr>  
								</table>
							</div>
							<p style="text-align:left;">
					  As you have cancelled the above mentioned Trip. All the parcels matched with this trip are removed from the Trip and any changes to the trip are locked.  
							</p> 
							<center>
								<a href="http://dev9856.mycourierbuddy.in/viewtrip/'.$trip->id.'">Trip Detail Link</a>
							</center>
							<br>  
							<div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
						</div>
						<p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content.</b></p>
					</div>
					<div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
						<table style="width:100%;padding:0 25px;">
							<tr>
								<td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
								<td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
							</tr>
						</table>
					</div>
				</div>';	
		    	$this->email->message($message);
			    $this->email->send(); 
			   
				$emailid=$receiveruser->username;
				$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
				$this->email->to($emailid.',admin@mycourierbuddy.com'); 
				$this->email->subject('Parcel No. '.$parcel->ParcelID.' Is Cancelled By '.$parceluser->name.'');   
				$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
					<div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
						<img src="http://mycourierbuddy.in/images/logo.png" />
					</div><img src="http://mycourierbuddy.in/images/plane.jpg" />
					<div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
						<div>
							<div style="text-align:left">Dear '.$receiveruser->name.'</div>
							<p style="text-align:left;">We regret to inform you that, Parcel No. '.$parcel->ParcelID.' Is Cancelled By '.$parceluser->name.' due to below mentioned reason.</p>
							<div style="text-align:left; color:#2c4882;">
								<table>
									<tr>
										<td>Parcel No</td><td>&nbsp;-&nbsp;</td>
										<td>'.$trip->TripID.'</td>
									</tr>
									<tr>
										<td>Sender Name	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$parceluser->name.'</td>
									</tr>
									<tr>
										<td>Transporter ID	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$transuser->UserID.'</td>
									</tr> 
									<tr>
										<td>Receiver </td><td>&nbsp;-&nbsp;</td>
										<td>'.$receiveruser->name.'</td>
									</tr> <tr>
										<td>Delivery Date 	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$trip->arrival_time.'</td>
									</tr>  
								</table>
							</div>
							<p style="text-align:left;">
					Your parcel are set to created status again. You can look for other transporter trips with your matching Parcel. Information for the cancellation of Trip is also send to MCB Team, they shall be looking for the other matching transporters at the earliest.  
							</p>  
							<div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
						</div>
						<p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content.</b></p>
					</div>
					<div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
						<table style="width:100%;padding:0 25px;">
							<tr>
								<td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
								<td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
							</tr>
						</table>
					</div>
				</div>';		
				$this->email->message($message);
				$this->email->send();  
			
				$emailid=$parceluser->username;
				$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
				$this->email->to($emailid.',admin@mycourierbuddy.com'); 
				$this->email->subject('Parcel No. '.$parcel->ParcelID.' Is Cancelled By '.$parceluser->name.'');   
				$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
					<div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
						<img src="http://mycourierbuddy.in/images/logo.png" />
					</div><img src="http://mycourierbuddy.in/images/plane.jpg" />
					<div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
						<div>
							<div style="text-align:left">Dear '.$parceluser->name.'</div>
							<p style="text-align:left;">We regret to inform you that, Parcel No. '.$parcel->ParcelID.' Is Cancelled By '.$parceluser->name.' due to below mentioned reason.</p>
							<div style="text-align:left; color:#2c4882;">
								<table>
									<tr>
										<td>Parcel No</td><td>&nbsp;-&nbsp;</td>
										<td>'.$trip->TripID.'</td>
									</tr>
									<tr>
										<td>Sender Name	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$parceluser->name.'</td>
									</tr>
									<tr>
										<td>Transporter ID	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$transuser->UserID.'</td>
									</tr> 
									<tr>
										<td>Receiver </td><td>&nbsp;-&nbsp;</td>
										<td>'.$receiveruser->name.'</td>
									</tr> <tr>
										<td>Delivery Date 	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$trip->arrival_time.'</td>
									</tr>  
								</table>
							</div>
							<p style="text-align:left;">
					Your parcel are set to created status again. You can look for other transporter trips with your matching Parcel. Information for the cancellation of Trip is also send to MCB Team, they shall be looking for the other matching transporters at the earliest.  
							</p> 
							<p style="text-align:left;">In Case we are not able to find the transporter for your parcel, your money shall be credited to your Wallet.</p>
							<center>
								<a href="http://dev9856.mycourierbuddy.in/viewparcel/'.$parcel->id.'">Find Matching Trip Link</a>
							</center>
							<br>  
							<div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
						</div>
						<p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content.</b></p>
					</div>
					<div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
						<table style="width:100%;padding:0 25px;">
							<tr>
								<td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
								<td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
							</tr>
						</table>
					</div>
				</div>';
				$this->email->message($message);
				$this->email->send();
			}  
		 }
		else
		{
	        $data=array('status'=>$request["status"]);
			if($request["status"]==0)
			{    $sql = "update cms_trips a set status=1,processed_by=".$request["process_by"]." where id=".$parcel->trans_id; 
			 	 $this->db->query($sql);   
				 $data["trans_id"]="0";
			}
		    $data["processed_by"]=$request["process_by"];
		    $data["reason"]=$request["reason"];
			$this->db->where('id', $request["id"]);
			$this->db->update('parcels', $data);
		}
		if($request["status"]==6)
		{  
				$chatchannelcreate=array("isactive"=>"0");
				$this->db->where('parcelid', $request["id"]);
				$this->db->update('chatchannel', $chatchannelcreate);
				$sql = "update cms_bookings set status=4 , process_by=".$request["process_by"]." where p_id=".$request["id"]; 
				$this->db->query($sql); 
				$sql = "update cms_trips a set status=1,processed_by=".$request["process_by"]." where exists(select t_id from cms_bookings b where b.p_id=".$request["id"]." and b.status!=3) and (select count(*) from cms_bookings where t_id in(select t_id from cms_bookings b where b.p_id=".$request["id"]." ) and status=3)=0	"; 
				$this->db->query($sql);  
				$sql = "update cms_chatchannel a set a.isactive=0  where parcelid=".$request["id"].";"; 
				$this->db->query($sql);					 
				$this->db->where("id",$parcel->usr_id);  
				$query2=$this->db->get("users");
				$parceluser=$query2->result()[0];  
				$this->db->where("id",$parcel->recv_id);  
				$receiverquery=$this->db->get("users");
				$receiveruser=$receiverquery->result()[0];  
				if($parcel->trans_id>0)
				{   $this->db->where("id", $parcel->trans_id); 
					$tripquery=$this->db->get("trips");
					$trip=$tripquery->result()[0]; 
					$this->db->where("id",$trip->t_id);  
					$transquery=$this->db->get("users");
					$transuser=$transquery->result()[0]; 
					$emailid=$transuser->username;
					$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
					$this->email->to($emailid.',admin@mycourierbuddy.com'); 
					$this->email->subject('Parcel No. '.$parcel->ParcelID.' Is Cancelled By '.$parceluser->name.'');   
					$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
					<div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
						<img src="http://mycourierbuddy.in/images/logo.png" />
					</div><img src="http://mycourierbuddy.in/images/plane.jpg" />
					<div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
						<div>
							<div style="text-align:left">Dear '.$transuser->name.'</div>
							<p style="text-align:left;">'.$trip->TripID.' is successfully cancelled by '.$parceluser->name.'.   </p>
							<div style="text-align:left; color:#2c4882;">
								<table>
									<tr>
										<td>Parcel No</td><td>&nbsp;-&nbsp;</td>
										<td>'.$trip->TripID.'</td>
									</tr>
									<tr>
										<td>Sender Name	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$parceluser->name.'</td>
									</tr>
									<tr>
										<td>Transporter ID	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$transuser->UserID.'</td>
									</tr> 
									<tr>
										<td>Receiver </td><td>&nbsp;-&nbsp;</td>
										<td>'.$receiveruser->name.'</td>
									</tr> <tr>
										<td>Delivery Date 	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$trip->arrival_time.'</td>
									</tr>  
								</table>
							</div>
							<p style="text-align:left;">
					  As you have cancelled the above mentioned Trip. All the parcels matched with this trip are removed from the Trip and any changes to the trip are locked.  
							</p> 
							<center>
								<a href="http://dev9856.mycourierbuddy.in/viewtrip/'.$trip->id.'">Trip Detail Link</a>
							</center>
							<br>  
							<div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
						</div>
						<p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content.</b></p>
					</div>
					<div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
						<table style="width:100%;padding:0 25px;">
							<tr>
								<td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
								<td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
							</tr>
						</table>
					</div>
				</div> ';	
					$this->email->message($message);
				   $this->email->send(); 

					$emailid=$receiveruser->username;
					$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
					$this->email->to($emailid.',admin@mycourierbuddy.com'); 
					$this->email->subject('Parcel No. '.$parcel->ParcelID.' Is Cancelled By '.$parceluser->name.'');   
					$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
					<div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
						<img src="http://mycourierbuddy.in/images/logo.png" />
					</div><img src="http://mycourierbuddy.in/images/plane.jpg" />
					<div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
						<div>
							<div style="text-align:left">Dear '.$receiveruser->name.'</div>
							<p style="text-align:left;">We regret to inform you that, Parcel No. '.$parcel->ParcelID.' Is Cancelled By '.$parceluser->name.' due to below mentioned reason.</p>
							<div style="text-align:left; color:#2c4882;">
								<table>
									<tr>
										<td>Parcel No</td><td>&nbsp;-&nbsp;</td>
										<td>'.$trip->TripID.'</td>
									</tr>
									<tr>
										<td>Sender Name	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$parceluser->name.'</td>
									</tr>
									<tr>
										<td>Transporter ID	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$transuser->UserID.'</td>
									</tr> 
									<tr>
										<td>Receiver </td><td>&nbsp;-&nbsp;</td>
										<td>'.$receiveruser->name.'</td>
									</tr> <tr>
										<td>Delivery Date 	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$trip->arrival_time.'</td>
									</tr>  
								</table>
							</div>
							<p style="text-align:left;">
					Your parcel are set to created status again. You can look for other transporter trips with your matching Parcel. Information for the cancellation of Trip is also send to MCB Team, they shall be looking for the other matching transporters at the earliest.  
							</p>  
							<div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
						</div>
						<p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content.</b></p>
					</div>
					<div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
						<table style="width:100%;padding:0 25px;">
							<tr>
								<td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
								<td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
							</tr>
						</table>
					</div>
				</div> ';		
					$this->email->message($message);
					$this->email->send();  

					$emailid=$parceluser->username;
					$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
					$this->email->to($emailid.',admin@mycourierbuddy.com'); 
					$this->email->subject('Parcel No. '.$parcel->ParcelID.' Is Cancelled By '.$parceluser->name.'');   
					$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
					<div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
						<img src="http://mycourierbuddy.in/images/logo.png" />
					</div><img src="http://mycourierbuddy.in/images/plane.jpg" />
					<div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
						<div>
							<div style="text-align:left">Dear '.$parceluser->name.'</div>
							<p style="text-align:left;">We regret to inform you that, Parcel No. '.$parcel->ParcelID.' Is Cancelled By '.$parceluser->name.' due to below mentioned reason.</p>
							<div style="text-align:left; color:#2c4882;">
								<table>
									<tr>
										<td>Parcel No</td><td>&nbsp;-&nbsp;</td>
										<td>'.$trip->TripID.'</td>
									</tr>
									<tr>
										<td>Sender Name	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$parceluser->name.'</td>
									</tr>
									<tr>
										<td>Transporter ID	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$transuser->UserID.'</td>
									</tr> 
									<tr>
										<td>Receiver </td><td>&nbsp;-&nbsp;</td>
										<td>'.$receiveruser->name.'</td>
									</tr> <tr>
										<td>Delivery Date 	</td><td>&nbsp;-&nbsp;</td>
										<td>'.$trip->arrival_time.'</td>
									</tr>  
								</table>
							</div>
							<p style="text-align:left;">
					Your parcel are set to created status again. You can look for other transporter trips with your matching Parcel. Information for the cancellation of Trip is also send to MCB Team, they shall be looking for the other matching transporters at the earliest.  
							</p> 
							<p style="text-align:left;">In Case we are not able to find the transporter for your parcel, your money shall be credited to your Wallet.</p>
							<center>
								<a href="http://dev9856.mycourierbuddy.in/viewparcel/'.$parcel->id.'">Find Matching Trip Link</a>
							</center>
							<br>  
							<div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
						</div>
						<p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content.</b></p>
					</div>
					<div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
						<table style="width:100%;padding:0 25px;">
							<tr>
								<td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
								<td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
							</tr>
						</table>
					</div>
				</div> ';
					$this->email->message($message);
					$this->email->send();					
				} 
			}
			if($request["status"]==5)
			{   $sql = "update cms_bookings set status=6 , process_by=".$request["process_by"]." where p_id=".$request["id"]; 
			 	$this->db->query($sql); 
				$sql = "update cms_trips a set status=7,processed_by=".$request["process_by"]." where exists(select t_id from cms_bookings b where b.t_id=a.id and b.p_id=".$request["id"]." and b.status=6) and not exists(select t_id from cms_bookings b where b.t_id=a.id and b.p_id=".$request["id"]."  and b.status=3) "; 
			 	$this->db->query($sql); 
				//email after receiver 
				$this->db->where("id",$request["id"]); 
				$query=$this->db->get("parcels");   
				$parcel=$query->result()[0];
				$this->db->where("id", $parcel->trans_id); 
				$tripquery=$this->db->get("trips");
				$trip=$tripquery->result()[0]; 
				$this->db->where("id",$parcel->usr_id);  
				$query2=$this->db->get("users");
				$parceluser=$query2->result()[0]; 
				$this->db->where("id",$parcel->recv_id);  
				$receiverquery=$this->db->get("users");
				$receiveruser=$receiverquery->result()[0]; 
				$this->db->where("id",$trip->t_id);  
				$transquery=$this->db->get("users");
				$transuser=$transquery->result()[0];
				$query = $this->db->query("select price,transportershare from cms_zonepricelist a  inner join cms_weightrange b on a.weightrangeid=b.id  inner join cms_airports sou on a.fromzoneid=sou.zonelistid  inner join cms_airports dest on a.tozoneid=dest.zonelistid where ".$parcel->weight.">b.minweight  and ".$parcel->weight."<=b.maxweight and sou.location='".$parcel->source."' and dest.location='".$parcel->destination."'"); 
			$pricedata=$query->result(); 
			//$parcel['payment']=$pricedata[0]->price; 				
			$sql = "update cms_users a set a.wallet=wallet+".$pricedata[0]->transportershare." where id=".$transuser->id.";"; 
			$this->db->query($sql);
			$walletstatement=array("comment"=>"Earned from successfully delivery","parcelid"=> $parcel->id,"tripid"=>$parcel->trans_id,"weight"=>$parcel->weight,"insertdate"=>date("Y-m-d H:i:s"),"amount"=>$pricedata[0]->transportershare,"credit"=>$pricedata[0]->transportershare,"debit"=>0,"userid"=>$transuser->id);
			$this->db->insert('walletstatement', $walletstatement);
			$emailid=$parceluser->username;
			$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
			$this->email->to($emailid.',admin@mycourierbuddy.com'); 
			$this->email->subject('Parcel '.$parcel->ParcelID.' Delivery Completed Successfully');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$receiveruser->name.'</div>
            <p style="text-align:left;">Congratulations! '.$transuser->name.' have successfully delivered the parcel to '.$receiveruser->name.'. </p>
            <div style="text-align:left; color:#2c4882;">
                <table>
                    <tr>
                        <td>Parcel No 	</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcel->ParcelID.'</td>
                    </tr>
                    <tr>
                        <td>
                            Transporter ID</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$transuser->UserID.'</td>
                    </tr>
                    <tr>
                        <td>
                            Receiver</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$receiveruser->name.'</td>
                    </tr>
                    <tr>
                        <td>
                            Delivery Date</td><td>&nbsp;-&nbsp;</td>
                        <td>
                           '.date("d-m-Y H:i:s").'
                        </td>
                    </tr>
                </table>
            </div>  
            <p style="text-align:left;">
                <b>
                    Note - Please present your Photo ID to sender while collecting and handing over the parcel.
                </b>
            </p>
            <br />
            <div style="text-align:left; font-size:13px; margin-top:50px;">
                <b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span>
            </div>
        </div>
        <p style="text-align:left;"><br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content. </b></p>
    </div>
    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
        <table style="width:100%;padding:0 25px;">
            <tr>
                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
            </tr>
        </table>
    </div> ';
			$this->email->message($message);
			$this->email->send(); 
			
			$emailid=$receiveruser->username;
			$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
			$this->email->to($emailid.',admin@mycourierbuddy.com'); 
			$this->email->subject('Parcel '.$parcel->ParcelID.' Delivery Completed Successfully');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$receiveruser->name.'</div>
            <p style="text-align:left;">Congratulations! '.$transuser->name.' have successfully delivered the parcel to '.$receiveruser->name.'. </p>
            <div style="text-align:left; color:#2c4882;">
                <table>
                    <tr>
                        <td>Parcel No 	</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcel->ParcelID.'</td>
                    </tr>
                    <tr>
                        <td>
                            Transporter ID</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$transuser->UserID.'</td>
                    </tr>
                    <tr>
                        <td>
                            Receiver</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$receiveruser->name.'</td>
                    </tr>
                    <tr>
                        <td>
                            Delivery Date</td><td>&nbsp;-&nbsp;</td>
                        <td>
                           '.date("d-m-Y H:i:s").'
                        </td>
                    </tr>
                </table>
            </div>  
            <p style="text-align:left;">
                <b>
                    Note - Please present your Photo ID to sender while collecting and handing over the parcel.
                </b>
            </p>
            <br />
            <div style="text-align:left; font-size:13px; margin-top:50px;">
                <b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span>
            </div>
        </div>
      <p style="text-align:left;">  <br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content. </b></p>
    </div>
    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
        <table style="width:100%;padding:0 25px;">
            <tr>
                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
            </tr>
        </table>
    </div> ';		
			$this->email->message($message);
			$this->email->send(); 
			
			$emailid=$transuser->username;
			$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
			$this->email->to($emailid.',admin@mycourierbuddy.com'); 
			$this->email->subject('Parcel '.$parcel->ParcelID.' Delivery Completed Successfully');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$transuser->name.'</div>
            <p style="text-align:left;">Congratulations! You have successfully delivered the parcel to <receiver>. </p>
            <div style="text-align:left; color:#2c4882;">
                <table>
                    <tr>
                        <td>Parcel No 	</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$parcel->ParcelID.'</td>
                    </tr>
                    <tr>
                        <td>
                            Transporter ID</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$transuser->UserID.'</td>
                    </tr>
                    <tr>
                        <td>
                            Receiver</td><td>&nbsp;-&nbsp;</td>
                        <td>'.$receiveruser->name.'</td>
                    </tr>
                    <tr>
                        <td>
                            Delivery Date</td><td>&nbsp;-&nbsp;</td>
                        <td>
                           '.date("d-m-Y H:i:s").'
                        </td>
                    </tr>
                </table>
            </div>
            <p style="text-align:left;">
                Your wallet is credited with the amount rs '.$pricedata[0]->transportershare.'.
            </p>
            <center>
                <a href="http://dev9856.mycourierbuddy.in/mywallet">Check Wallet Link</a>
            </center>
            <p style="text-align:left;">
                <b>
                    Note - Please present your Photo ID to sender while collecting and handing over the parcel.
                </b>
            </p>
            <br />
            <div style="text-align:left; font-size:13px; margin-top:50px;">
                <b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span>
            </div>
        </div>
       <p style="text-align:left;"> <br><b style="font-family:Calibri;">Note - Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content. </b></p>
    </div>
    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
        <table style="width:100%;padding:0 25px;">
            <tr>
                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
            </tr>
        </table>
    </div>';	
			$this->email->message($message);
			$this->email->send();
			}
			if($request["status"]==8)
			{ 
				$this->db->where('id', $request["id"]);
				$query1=$this->db->get("parcels");
				$res=$query1->result()[0]; 
				$this->db->where("id",$res->user_id);  
				$query2=$this->db->get("users");
				$res1=$query2->result()[0]; 
				$emailid=$res1->username; 
				$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
				$this->email->to($email.',admin@mycourierbuddy.com'); 
				$this->email->subject('Parcel #'.$request["id"].' Refunded Successfully | mycourierbuddy.in');   
				$message=' <div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0"><img src="http://mycourierbuddy.in/images/logo.png" /></div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$res1->name.'</div><p style="text-align:left;">Congratulations! You Parcel #'.$request["id"].' Refunded Successfully.</p> </div><div> </div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div> </div> <div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div> </div> ';
				$this->email->message($message);
				$this->email->send(); 
			}			
			$this->db->where("id",$request["id"]); 
		    $query=$this->db->get("parcels");
		    $data1->status="success";
			$data1->response=$query->result();		
			$json_response = json_encode($data1); 
			return($json_response);  
           
		}
		else
		{
			$data1->status="Error";
			$data1->errorMessage="Error in Update Trip";
			$json_response = json_encode($data1); 
			return $json_response;
		}  
    }
	function delete_single_trip($request)
    {   $this->db->where("id",$request["id"]); 
		$query=$this->db->get("trips");
		$data1=new stdclass();
		if($query->num_rows()>0)
        {     
			$this->db->where('id', $request["id"]);
			$this->db->delete('trips');
			 $query=$this->db->get("trips");
		   $data1->status="success";
			$data1->response=$query->result();		
			$json_response = json_encode($data1); 
			return($json_response);  
           
		}else{
			$data1->status="Error";
			$data1->errorMessage="Error into deleting";
			$json_response = json_encode($data1); 
			return $json_response;
		}  
    }
	//trips ends here
	function getcountries()
	{  $query = $this->db->query("SELECT a.*,b.Zonename  FROM cms_airports a left join cms_zonelist b on a.zonelistid=b.id  WHERE status = 'Y' ORDER BY location"); 
		$data=new stdclass();
		$data->status="success";
		$data->response=$query->result();
		$json_response = json_encode($data);  
		return $json_response; 
	}
	function getweightrangelist()
	{   
		$query = $this->db->query("SELECT * FROM `cms_weightrange` order by minweight"); 
		$data=new stdclass();
		$data->status="success";
		$data->response=$query->result();
		$json_response = json_encode($data);  
		return $json_response; 
	} 
	function getzonepricelist()
	{   
		$query = $this->db->query("SELECT * FROM `cms_zonepricelist` order by weightrangeid,fromzoneid"); 
		$data=new stdclass();
		$data->status="success";
		$data->response=$query->result();
		$json_response = json_encode($data);  
		return $json_response; 
	}
	function savezonepricelist($post)
	{   
		foreach ($post as $row) {
		 if($row["id"]>0)
		 { 
			$data = array('fromzoneid' =>$row["fromzoneid"],'tozoneid' =>$row["tozoneid"],'weightrangeid' =>$row["weightrangeid"],'price' =>$row["price"],'transportershare' =>$row["transportershare"]);
		   $this->db->update('cms_zonepricelist', $data, "id =".$row["id"]);
		 }
		 else
		 {  $data = array('fromzoneid' =>$row["fromzoneid"],'tozoneid' =>$row["tozoneid"],'weightrangeid' =>$row["weightrangeid"],'price' =>$row["price"],'transportershare' =>$row["transportershare"]);
			$this->db->insert('cms_zonepricelist', $data); 
		  }	 
		} 
	}	
	function getzonelist()
	{  $query = $this->db->query("SELECT * FROM `cms_zonelist` order by id"); 
		$data=new stdclass();
		$data->status="success";
		$data->response=$query->result();
		$json_response = json_encode($data);  
		return $json_response; 
	} 
	function saveairportlist($post)
	{   
		if(isset($post["id"]))
		 { 
			$data = array('location' =>$post["location"],'status' =>$post["status"],'city' =>$post["city"],'type' =>$post["type"],'zonelistid' =>$post["zonelistid"]);
			  if(isset($post["code"])){
				$data["code"]=$post["code"];
			} 
		   $this->db->update('airports', $data, "id =".$post["id"]);
		 }
		 else
		 {
			$data = array('location' =>$post["location"],'status' =>$post["status"],'city' =>$post["city"],'type' =>$post["type"],'zonelistid' =>$post["zonelistid"]);
			 if(isset($post["code"])){
				$data["code"]=$post["code"];
			} 
			$this->db->insert('airports', $data); 
		  }	 
	}
	
	function getseolist()
	{  $query = $this->db->query("SELECT * FROM `cms_seos` order by id"); 
		$data=new stdclass();
		$data->status="success";
		$data->response=$query->result();
		$json_response = json_encode($data);  
		return $json_response; 
	} 
	function saveseolist($post)
	{   
		if(isset($post["id"]))
		 { 
			$data = array('page' =>$post["page"],'keyword' =>$post["keyword"],'description' =>$post["description"],'title' =>$post["title"],'status' =>$post["status"],'location' =>$post["location"],'created' =>$post["created"]);
		   $this->db->update('seos', $data, "id =".$post["id"]);
		 }
		 else
		 {
			$data = array('page' =>$post["page"],'keyword' =>$post["keyword"],'description' =>$post["description"],'title' =>$post["title"],'status' =>$post["status"],'location' =>$post["location"],'created' =>$post["created"]);
			$this->db->insert('seos', $data); 
		  }	 
	}
	function saveweightrangelist($post)
	{   
		if(isset($post["id"]) && $post["id"]>0)
		 { 
			$data = array('name' =>$post["name"],'minweight' =>$post["minweight"],'maxweight' =>$post["maxweight"]);
		   $this->db->update('weightrange', $data, "id =".$post["id"]);
		 }
		 else
		 {
			$data = array('name' =>$post["name"],'minweight' =>$post["minweight"],'maxweight' =>$post["maxweight"]);
			$this->db->insert('weightrange', $data); 
		  }	 
	}
	function deleteseolist($id)
	{   
		if($id>0)
		 {   
			$this->db->where('id', $id);
			$this->db->delete('seos'); 
		 } 
	}
	function deleteweightrangelist($id)
	{   
		if($id>0)
		 {   
			$this->db->where('id', $id);
			$this->db->delete('weightrange'); 
		 } 
	}
	function deleteairportlist($id)
	{   
		if($id>0)
		 {   
			$this->db->where('id', $id);
			$this->db->delete('airports'); 
		 } 
	}
	function gettopcountrytrips()
	{ 
		$query = $this->db->query("SELECT a.id,source,destination,dep_time,arrival_time,image,flight_no,pnr,comment,(a.capacity-COALESCE(c.totalweight,0)) capacity,a.t_id,a.created,a.status,art.city,a.processed_by,'update' FROM `cms_trips` a left join (SELECT SUM( weight ) AS totalweight, trans_id as t_id FROM  `cms_parcels` WHERE STATUS not in(6,0) GROUP BY trans_id)c on a.id=c.t_id left join cms_airports art on a.source=art.location where (a.status=1 or a.status=3 or a.status=2)  group by art.city ORDER BY count(art.city) limit 4");
		$response = $query->result(); 
		$data=new stdclass();
		$data->status="success";
		$data->response=$response;
		$json_response = json_encode($data);   
		print_r($json_response);  
	}	
    function searchhome($post)
	{ 
		$param=$post["params"]; 
		if($param["type"]=="Transporter")
		{
			//and (a.capacity-COALESCE(c.totalweight,0))>0 
		    $query = $this->db->query("SELECT id,source,destination,dep_time,arrival_time,image,flight_no,pnr,comment,(a.capacity-COALESCE(c.totalweight,0)) capacity,a.t_id,created,status,processed_by,'update' FROM `cms_trips` a left join (SELECT SUM( weight ) AS totalweight, trans_id as t_id FROM  `cms_parcels` WHERE STATUS not in(6,0) GROUP BY trans_id)c on a.id=c.t_id where (a.status=1 or a.status=3 or a.status=2) and (a.source like '%".$param["locationfrom"]."%' or '".$param["locationfrom"]."'='') and (a.destination like '%".$param["locationto"]."%' or '".$param["locationto"]."'='') and (a.dep_time >= '".$param["dateFrom"]."' or '".$param["dateFrom"]."'='') and (a.dep_time <= '".$param["dateTo"]." 23:59' or '".$param["dateTo"]."'='')and a.arrival_time >= CURDATE()  ");
			$response = $query->result();  
		}
		else
		{
		  $query = $this->db->query("SELECT * FROM `cms_parcels`  where  status =0 and (source like '%".$param["locationfrom"]."%' or '".$param["locationfrom"]."'='') and (destination like '%".$param["locationto"]."%' or '".$param["locationto"]."'='') and (till_date >= '".$param["dateFrom"]."' or '".$param["dateFrom"]."'='') and (till_date <= '".$param["dateTo"]."' or '".$param["dateTo"]."'='') and till_date >= CURDATE()");
			$response = $query->result();  
		}
		$data=new stdclass();
		$data->status="success";
		$data->response=$response;
		$json_response = json_encode($data);   
		print_r($json_response);  
	}   
	public function add_user()
	{  	$data=array('username'=>$this->input->post('user_name'),'email'=>$this->input->post('email_address'),'password'=>md5($this->input->post('password')));
		$this->db->insert('user',$data);
	} 
	function change_password($request)
    {   $this->db->where("id",$request["userID"]);        
		$this->db->where("password",md5("DYhG93b0xzczxyJfIxfs2guVoUubWwvniR2G0FgaC9mi".$request['password'])); 
		$query=$this->db->get("users");
		$data1=new stdclass();
		if($query->num_rows()>0)
        {   
			$data=array('password'=>md5("DYhG93b0xzczxyJfIxfs2guVoUubWwvniR2G0FgaC9mi".$request['newpassword']));
			$this->db->where('id', $request["userID"]);
			$this->db->update('users', $data);
			 $this->db->where("id",$request["userID"]);  
			 $query1=$this->db->get("users");
			 $user=$query1->result()[0];  
			   $this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
				$this->email->to($user->username.',admin@mycourierbuddy.com'); 
				$this->email->subject('MCB: Password Change Successfully');   
				$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">        <img src="http://mycourierbuddy.in/images/logo.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">        <div>            <div style="text-align:left">Dear '.$user->name.'</div>            <p style="text-align:left;">You recently requested a password reset.</p>
            <p style="text-align:left;">To change your MCB password, click here </p>             <center>              
			<a href="http://dev9856.mycourierbuddy.in/forgetpassword">Change Password Link</a>            </center>			
			<p style="text-align:left;">The link will expire in 24 hours, so be sure to use it right away.</p>			
			<p style="text-align:left;">Thanks for using MCB!</p>            <br>             
			<div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>   
			</div>            </div>    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;"> 
			<table style="width:100%;padding:0 25px;">
            <tr>                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td> 
			<td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>            </tr>        </table>    </div></div>';  $this->email->message($message);
			$this->email->send();
			$data1->status="success";
			$data1->response="Password changed successfully";
			$json_response = json_encode($data1); 
			return $json_response;
           
		}else{
			$data1->status="Error";
			$data1->errorMessage="Current password is not correct.";
			$json_response = json_encode($data1); 
			return $json_response;
		}  
    }  
	function sendinvite($request)
	{ 
		$this->db->where("id",$request['UserID']);  
		$query1=$this->db->get("users");
		$senduser=$query1->result()[0];  
		$this->db->where("username",$request['email']);          
        $query2=$this->db->get("users"); 
		if($query2->num_rows()==0 )
		 {
			$data["name"]=$request['name']; 
			$data["username"]=$request['email'];
			$email=$request['email']; 
			$data["role_id"]='2';
			$data["status"]='Y';
			$characters = '0123456789';
			$charactersLength = strlen($characters);
			$randomString = '';
			for ($i = 0; $i < 5; $i++) {
				$randomString .= $characters[rand(0, $charactersLength - 1)];
			}
			$data["verificationcode"]=$randomString; 
			if(isset($request['number']))
			{
				$data["mobile"]=$request['number']; 
			}
			$data["password"]=md5("DYhG93b0xzczxyJfIxfs2guVoUubWwvniR2G0FgaC9mi".$randomString);  
			$data["created"]= date("Y-m-d H:i:s");  
			$this->db->insert('users', $data);  
			$sql = "update cms_users set UserID=concat('MCB',id) ORDER BY `id` DESC LIMIT 10 ;"; 
			$this->db->query($sql);	
			$this->db->where("username",$email);
			$query=$this->db->get("users");  
				foreach ($query->result() as $row)
				{  		//email 
						$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
						$this->email->to($email.',admin@mycourierbuddy.com'); 
						$this->email->subject('MCB:User Invited You on mycourierbuddy.in');   
						$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$request['name'].'</div>
            <p style="text-align:left;">Congratulations! Your friend '.$senduser->name.' has booked a parcel for you. Hence you are getting this invitation
			to join MCB Family at https://mycourierbuddy.com. Please see the details of below parcel upon registering – </p>
            <div style="text-align:left; color:#2c4882;">
                <table>
                    <tr>
                        <td>Your Login ID </td><td>&nbsp;-&nbsp;</td>
                        <td><em>'.$request['email'].'</em></td>
                    </tr>
                    <tr>
                        <td>Your Password </td><td>&nbsp;-&nbsp;</td>
                        <td>'.$randomString.'</td>
                    </tr> 
                </table>
            </div>
            <p style="text-align:left;">
           MCB is a social peer to peer courier/parcel sending platform. We help in seamlessly connecting travelers (Transporter) with the senders to ship parcels faster. 
            </p>
			<p style="text-align:left;">Please click on the below link to Register with us -</p>
            <center>
                <a href="http://dev9856.mycourierbuddy.in/dashboard">Register With Us Link</a>
            </center>
			<p style="text-align:left;">Get in touch with MCB Team at admin@mycourierbuddy.com for more details.</p>
            <br> 
            <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
        </div>
      <p style="text-align:left;">  <br><b style="font-family:Calibri;">Note:  <br>
For Sender– Please make sure you disclose the content of envelope or parcel to transporter at the collection. This is make sure the safety of transporter and parcel. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content. 
<br>
For Transporter– Please make sure you check the content of envelope or parcel from sender at the time of collection. This is to make sure the safety of transporter as he/she is responsible to deliver the parcel safely to Receiver. Transporters have the authority to reject the parcel in case he/she does not feel safe to collect and deliver the parcel content.
</b></p>
    </div>
    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
        <table style="width:100%;padding:0 25px;">
            <tr>
                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
            </tr>
        </table>
    </div>
</div>';
						$this->email->message($message);
						$this->email->send(); 
						//end email 
						$data=new stdclass();
						$data->status="success";
						$data->response=$query->result();
						$json_response = json_encode($data); 
						echo $json_response;
				}   
			}
			else
			{   $this->db->where("username",$request['email']);  
				$query=$this->db->get("users");
				if($query->num_rows()>0)
				{
					$data=new stdclass();
					$data->status="success";
					$data->response=$query->result();
					$json_response = json_encode($data); 
					print_r($json_response);
				}
				else
				{
					$data1=new stdclass();
					$data1->status="Error";
					$data1->errorMessage="User Not Found";
					$json_response = json_encode($data1); 
					print_r($json_response);
				} 
			} 
	}
	function registeruser($request)
	{   
			$data["name"]=$request['firstName'];
			$data["l_name"]=$request['lastName'];
			//$data["passportno"]=$request['passportno'];
			$data["username"]=$request['email'];
			if(isset($request['photo'])){
				$data["photo"]=$request['photo'];
			}
			$email=$request['email'];
		//	$data["country_code"]=$request['countrycode'];
			$data["role_id"]='2';
			$data["status"]='N';
			$characters = '0123456789';
			$charactersLength = strlen($characters);
			$randomString = '';
			for ($i = 0; $i < 5; $i++) {
				$randomString .= $characters[rand(0, $charactersLength - 1)];
			}
			$data["verificationcode"]=$randomString; 
			//$data["mobile"]=$request['mobilenumber']; 
			$data["password"]=md5("DYhG93b0xzczxyJfIxfs2guVoUubWwvniR2G0FgaC9mi".$request['password']);  
			$data["created"]= date("Y-m-d H:i:s");  
			$this->db->insert('users', $data); 
			$sql = "update cms_users set UserID=concat('MCB',id) ORDER BY `id` DESC LIMIT 10 ;"; 
			$this->db->query($sql);					
			$this->db->where("username",$email);
			$query=$this->db->get("users"); 
			foreach ($query->result() as $row)
			{ 
			//email 
			$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
			$this->email->to($email.',admin@mycourierbuddy.com'); 
			$this->email->subject('MCB: Please Verify Your Email');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div>
    <img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$request['firstName'].'</div>
            <p style="text-align:left;">Thank you for signing in to your MCB account. Once you validate your account, you can enjoy the full benefits of MCB</p>
            <p style="text-align:left;">To confirm this is your email click the button below.</p>
            <center>
                <a href="http://dev9856.mycourierbuddy.in/verifyuser/'.$row->id.'/'.$randomString.'">Verify My Email</a>
            </center>            <br>
            <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
        </div>        <br>
    </div>    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;"> 
	<table style="width:100%;padding:0 25px;">            <tr>               
	<td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>  
	<td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>  
	</tr>        </table>    </div>
</div> ';
			$this->email->message($message);
			$this->email->send(); 
			//end email 
				$data=new stdclass();
				$data->status="success";
				$data->response=$query->result();
				$json_response = json_encode($data); 
				return $json_response;
			} 
	}
	function verifyuser($request)
	{    $this->db->where("id",$request["id"]);     
        $query=$this->db->get("users");
		if($query->num_rows()>0)
        {    foreach ($query->result() as $row)
			{  if($request["code"]==$row->verificationcode)
			{
				$datanew=array('status'=>'Y');
				$this->db->where('id',$row->id);
				$this->db->update('users', $datanew);
				$email=$row->username; 
				$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
				$this->email->to($email.',admin@mycourierbuddy.com'); 
				$this->email->subject('MCB: Email Successfully Verified');   
				$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$row->name.'</div>
            <p style="text-align:left;">Congratulations! You have successfully register on mycourierbuddy.</p>
             <p style="text-align:left;"> Get in touch with MCB Team at admin@mycourierbuddy.com for more details. </p> 
          
            <br> 
            <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
        </div>
        <br><b style="font-family:Calibri;"></b>
    </div>
    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
        <table style="width:100%;padding:0 25px;">
            <tr>
                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
            </tr>
        </table>
    </div>
</div> ';
			    $this->email->message($message);
				$this->email->send();  
				$this->db->where("id",$row->id);  
				$query=$this->db->get("users"); 
			    $data=new stdclass();
			   $data->status="success";
			  $data->response=$query->result();		
			    $json_response = json_encode($data); 
			  print_r($json_response);
			 }
			 else{  
					$data1=new stdclass();
			$data1->status="Error";
			$data1->errorMessage="Invalid Verification Code";
			$json_response = json_encode($data1); 
			print_r( $json_response);
				}
			} 
		     }
			 else{$data1=new stdclass();
			$data1->status="Error";
			$data1->errorMessage="Invalid Request";
			$json_response = json_encode($data1); 
			print_r( $json_response);
		} 	 
	}
	function getuserdetails($id)    {
		$this->db->where("id",$id);  
        $query=$this->db->get("users");
		if($query->num_rows()>0)
        {
		$data=new stdclass();
		$data->status="success";
		$data->response=$query->result();
		$json_response = json_encode($data); 
		print_r($json_response);
		}else{
		$data1=new stdclass();
			$data1->status="Error";
			$data1->errorMessage="User Not Found";
			$json_response = json_encode($data1); 
			print_r($json_response);
		} 
    } 
	function getuserslist($request)
    {   
		$days=0;
		if(isset($request["days"])){
			if($request["days"]!=""){
			$days=$request["days"];}
		}
		$status="";
		if(isset($request["status"])){
			$status=$request["status"];
		} 
	   $query = $this->db->query("SELECT * FROM cms_users where (status='".$status."' or '".$status."'='') and (".$days."=0 or DATEDIFF(CURDATE(),created)<=".$days.")");
	   $data=new stdclass();
		$data->status="success";
		$data->response=$query->result();
		$json_response = json_encode($data); 
		return $json_response;
	}
	function getuserlogin($email,$password)
    {
		$this->db->where("username",$email);   
		$this->db->where("password",hash( "md5", "DYhG93b0xzczxyJfIxfs2guVoUubWwvniR2G0FgaC9mi".$password));        
        $query=$this->db->get("users");
		if($query->num_rows()>0)
        {
			foreach ($query->result_array() as $row)
			{
				if($row['status']=="Y" && $row['activation_code']!="N")
				{
					$data=new stdclass();
					$data->status="success";
					$data->response=$query->result();
					$json_response = json_encode($data); 
					return $json_response;
				}
				else if($row['activation_code']=="N")
				{  
					$data1=new stdclass();
					$data1->status="Error";
					$data1->errorMessage="Blocked by admin";
					$json_response = json_encode($data1); 
					return $json_response;
				}
				else
				{
					//email 
					$this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
					$this->email->to($email.',admin@mycourierbuddy.com'); 
					
					$this->email->subject('MCB: Please Verify Your Email');   
					$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">        <img src="http://mycourierbuddy.in/images/logo.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">        <div>          
					<div style="text-align:left">Dear '.$row['name'].'</div>          
					<p style="text-align:left;">Thank you for signing in to your MCB account. Once you validate your account, you can enjoy the full benefits of MCB</p> 
					<p style="text-align:left;">To confirm this is your email click the button below.</p>             <center>         
					<a href="http://dev9856.mycourierbuddy.in/verifyuser/'.$row['id'].'/'.$row['verificationcode'].'">Verify My Email</a>            </center>            <br>    
					<div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div> 
					</div>        <br>    </div>    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">        <table style="width:100%;padding:0 25px;">            <tr>                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>            </tr>        </table>    </div></div>';
					 $this->email->message($message);
					$this->email->send(); 
					//end email
					$data1=new stdclass();
					$data1->status="success";
					$data1->response=$query->result();
					$data1->errorMessage="Your Acoount is not verified.";
					$json_response = json_encode($data1); 
					return $json_response; 
				}  	 
		  }
			  
		}
		else
		{
			$data1=new stdclass();
			$data1->status="Error";
			$data1->errorMessage="The email and password you entered don't match";
			$json_response = json_encode($data1); 
			return $json_response;
		} 
    } 
	 function searchuser($post)
	{  $param=$post["params"];  
		$query = $this->db->query("select * from cms_users where (username='". $param["email"] ."' or '". $param["email"] ."'='') and (mobile='".$param["mobile"]."' or '".$param["mobile"]."'='') and id !=".$param["UserId"]."");
        $data=new stdclass();
		$data->status="success";
		$data->response=$query->result();
		$json_response = json_encode($data); 
		echo $json_response; 
	}
	function forgetpassword($email)    { 
		$this->db->where("username",$email);     
        $query=$this->db->get("users");
		if($query->num_rows()>0)
        {
			$alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
		    $pass = array();
		    $alphaLength = strlen($alphabet) - 1;
		    for ($i = 0; $i < 10; $i++) { $n = rand(0, $alphaLength); $pass[] = $alphabet[$n]; }  
			foreach ($query->result() as $row)
			{   $datanew=array('password'=>md5("DYhG93b0xzczxyJfIxfs2guVoUubWwvniR2G0FgaC9mi".implode($pass)));
			$this->db->where('id',$row->id);
			$this->db->update('users', $datanew);
			} 
			    $this->email->from("info@mycourierbuddy.com", 'mycourierbuddy');
				$this->email->to($email.',admin@mycourierbuddy.com'); 
				$this->email->subject('MCB: Password Change Successfully');  
				$user=$query->result()[0];
				$name=$user->name; 
				$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;">
    <div style="text-align:center;margin: auto; background:#233151; padding:5px 0">
        <img src="http://mycourierbuddy.in/images/logo.png" />
    </div><img src="http://mycourierbuddy.in/images/plane.jpg" />
    <div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000">
        <div>
            <div style="text-align:left">Dear '.$user->name.'</div>
            <p style="text-align:left;">You recently requested a password reset.</p>
            <p style="text-align:left;">To change your MCB password</p> 
            <center>
               <b>Email:</b>'.$email.'<br><br> <b>Password:</b>'.implode($pass).'<br>
            </center> 
			<p style="text-align:left;">Thanks for using MCB!</p>
            <br> 
            <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Thanks and Regards</b>,<br /><b style="color:#3b5998;">MCB Team</b></span></div>
        </div>        
    </div>
    <div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">
        <table style="width:100%;padding:0 25px;">
            <tr>
                <td align="left"><a href="http://dev9856.mycourierbuddy.in/contact" style="color:#fff;text-decoration: none;">Contact us</a></td>
                <td align="right"><a href="http://dev9856.mycourierbuddy.in/termsandcondition" style="color:#fff;text-decoration: none;">Terms and Condition</a></td>
            </tr>
        </table>
    </div>
</div>';  $this->email->message($message);
				$this->email->send();  
			  $data=new stdclass();
			   $data->status="success";
			  $data->response="Password Sent Successfully on Your Mail";		
			    $json_response = json_encode($data); 
			  print_r($json_response);
		     }  else{$data1=new stdclass();
			$data1->status="Error";
			$data1->errorMessage="Email Id not registered";
			$json_response = json_encode($data1); 
			print_r( $json_response);
		} 
    } 
	function updateuserdetails($data){  
			$datanew=array('password'=>$data);
			$this->db->where('id',$data['id']);
			$this->db->update('users', $data); 
			$this->db->where('id',$data['id']);
			$query=$this->db->get("users"); 
			$data=new stdclass();
			$data->status="success";
			$data->response=$query->result();
			$json_response = json_encode($data); 
			print_r($json_response);
	}
}
?>