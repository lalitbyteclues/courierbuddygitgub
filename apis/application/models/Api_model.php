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
		   $tripquery = $this->db->query("SELECT a.*, (a.capacity - awailableweight.totalweight) AS awailableweight,trstatus.status as statusdescription,al.link airlinelink FROM cms_trips a LEFT JOIN (SELECT SUM( weight ) AS totalweight, t_id FROM  `cms_bookings` WHERE STATUS =3 GROUP BY t_id )awailableweight ON a.id = awailableweight.t_id left join cms_tripstatus trstatus on a.status=trstatus.id  left join cms_airlineinfo al on SUBSTR(a.flight_no,1,2)=al.code where a.id=".$transporterid); 
		   $trip=$tripquery->result();
		   $tp=$trip[0];
			if( $tp->status==3 || $tp->status==6)
			{ 
			  $booking = $this->db->query("SELECT a.*,IFNULL(b.username,'') as senderemail,IFNULL(b.name,'') as sendername,IFNULL(c.username,'') as receiveremail ,IFNULL(c.name,'') as receivername,d.id as BookingID,prstatus.status as statusdescription,IFNULL(channel.id,0) as channelid FROM cms_parcels a left join (select * from cms_chatchannel where isactive=1) channel on a.id=channel.parcelid left join cms_users b on a.usr_id=b.id left join cms_users c on a.recv_id=c.id inner join (select * from cms_bookings where status in(3,6)) d on a.id=d.p_id left join cms_parcelstatus prstatus on a.status=prstatus.id where `t_id`=".$tp->id.""); 
			  $data->parcel=$booking->result();
			}
			if($tp->status==1 || $tp->status==3){ 
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
				$booking = $this->db->query("SELECT id,a.TripID,source,destination,dep_time,arrival_time,image,flight_no,pnr,comment,(a.capacity-COALESCE(c.totalweight,0)) capacity,a.t_id,created,status,processed_by,'update' FROM `cms_trips` a left join (SELECT f.t_id,sum(weight) as totalweight FROM cms_bookings f where f.status in(3)  group by f.t_id)c on a.id=c.t_id where (a.status=1 or a.status=3 and (a.capacity-COALESCE(c.totalweight,0))>0 and a.capacity>0) and destination='".$tp->destination."' and source='".$tp->source."' and arrival_time<='".$tp->till_date." 23:59' and arrival_time >= CURDATE()  "); 
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
			$query = $this->db->query("SELECT a . * , (a.capacity - c.totalweight) AS awailableweight,trstatus.status as statusdescription,al.link airlinelink  FROM cms_trips a LEFT JOIN (SELECT SUM( weight ) AS totalweight, t_id FROM  `cms_bookings` WHERE STATUS =3 GROUP BY t_id )c ON a.id = c.t_id left join cms_tripstatus trstatus on a.status=trstatus.id  left join cms_airlineinfo al on SUBSTR(a.flight_no,1,2) =al.code WHERE a.status not IN (4) AND a.dep_time >= CURDATE() AND a.t_id =".$userID.""); 
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
				$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
				$this->email->to($aa["username"].',info@mycourierbuddy.in'); 
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
		$query = $this->db->query("SELECT a . * ,user.UserID, (a.capacity - c.totalweight) AS awailableweight,trstatus.status as statusdescription,al.link airlinelink FROM cms_trips a LEFT JOIN (SELECT SUM( weight ) AS totalweight, t_id FROM  `cms_bookings` WHERE STATUS =3 GROUP BY t_id )c ON a.id = c.t_id left join cms_tripstatus trstatus on a.status=trstatus.id left join cms_airlineinfo al on SUBSTR(a.flight_no,1,2) =al.code left join cms_users user on a.t_id =user.id order by a.status"); 
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
		$query = $this->db->query("SELECT a.*,prstatus.status as statusdescription from cms_parcels a left join cms_parcelstatus prstatus on a.status=prstatus.id  where (CAST(a.id as CHAR) LIKE '%". $datapost["id"]."%' or '".$datapost["id"]."'='' ) and (a.status='". $datapost["status"]."' or '".$datapost["status"]."'='' )and (a.till_date='". $datapost["till_date"]."' or '".$datapost["till_date"]."'='' ) order by a.id desc Limit ".$limit[0].",".$limit[1]); 
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
			$query = $this->db->query("select a.*,b.payment,ps.id parcelstatusid,ps.status BookingStatus,trip.t_id as transporterID,b.usr_id,parceluser.UserID as SenderID,tripuser.UserID TransporteruserID  from cms_bookings a  inner join cms_trips trip on a.t_id=trip.id  left join cms_users tripuser on trip.t_id=tripuser.id  inner join cms_parcels  b on a.p_id =b.id left join cms_users parceluser on b.usr_id=parceluser.id inner join cms_tripstatus ps on a.status=ps.id where (DATEDIFF(CURDATE(),a.created)<=".$datapost["period"]." or ".$datapost["period"]."=0 ) order by a.id desc Limit ".$limit[0].",".$limit[1]); 
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
		$query = $this->db->query("SELECT a . * , (a.capacity - c.totalweight) AS awailableweight,trstatus.status as statusdescription FROM cms_trips a LEFT JOIN (SELECT SUM( weight ) AS totalweight, t_id FROM  `cms_bookings` WHERE STATUS =3 GROUP BY t_id )c ON a.id = c.t_id left join cms_tripstatus trstatus on a.status=trstatus.id WHERE (a.status IN (4) or a.dep_time < CURDATE())  AND a.t_id =".$userID.""); 
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
			$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
			$this->email->to($tripuser->username.',info@mycourierbuddy.in'); 
			$this->email->subject('Ticket Requested by Admin | mycourierbuddy.in');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$tripuser->name.'</div><p style="text-align:left;">We have received your request for Trip #'.$tripdetails->TripID.' with the following details,</p><div style="text-align:left; color:#2c4882;">Destination - &nbsp;'.$tripdetails->destination.'<br />Departure on - &nbsp; '.$tripdetails->dep_time.'<br />Source - &nbsp; '.$tripdetails->source.'<br />Arrival at - &nbsp; '.$tripdetails->arrival_time.'<br />Flight No. - &nbsp; '.$tripdetails->flight_no.'<br />PNR /Booking Reference No. - &nbsp; '.$tripdetails->pnr.'<br />Capacity - &nbsp; '.$tripdetails->capacity.' Kg. <br />Comment - &nbsp; '.$tripdetails->comment.'<br /></div> In order to verify your trip, kindly upload your flight ticket using following link.<br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;"><a href="http://dev9856.mycourierbuddy.in/viewtrip/'.$tripdetails->id.'">Upload Ticket</a>. </div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';
			$this->email->message($message);
			$this->email->send(); 			
		    $data=new stdclass();
		    $data->status="success";
			$data->response="Email Sent Successfully";		
			$json_response = json_encode($data); 
			print_r($json_response); 
	}
	function cancelParcellist($userID){
		$query = $this->db->query("SELECT a.*,IFNULL(b.username,'') as receiveremail,IFNULL(c.username,'') as transemail,prstatus.status as statusdescription FROM cms_parcels a left join cms_users b on a.recv_id=b.id left join cms_users c on a.trans_id=c.id left join cms_parcelstatus prstatus on a.status=prstatus.id where (a.status in(6) or a.till_date < CURDATE())  and  a.usr_id=".$userID." "); 
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
			$this->db->where("id",$parceldetails->usr_id);  
			$query2=$this->db->get("users");
			$tripuser=$query2->result()[0]; 
			$this->db->where("id",$tripdetails->t_id);  
			$query3=$this->db->get("users");
			$parceluser=$query3->result()[0];  
			$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
			$this->email->to($parceluser->username.',info@mycourierbuddy.in'); 
			$this->email->subject('Trip Match Found | mycourierbuddy.in');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear user</div><p style="text-align:left;">Congratulations! You have found new trip on your parcel #'.$parceldetails->id.'.</p><div style="text-align:left; color:#2c4882;">Destination - &nbsp;'.$tripdetails->destination.'<br />Departure on - &nbsp; '.$tripdetails->dep_time.'<br />Source - &nbsp; '.$tripdetails->source.'<br />Arrival at - &nbsp; '.$tripdetails->arrival_time.'<br />Flight No. - &nbsp; '.$tripdetails->flight_no.'<br />PNR /Booking Reference No. - &nbsp; '.$tripdetails->pnr.'<br />Capacity - &nbsp; '.$tripdetails->capacity.' Kg. <br />Comment - &nbsp; '.$tripdetails->comment.'<br /></div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;">  You can create your courier request by clicking on this link <a href="http://dev9856.mycourierbuddy.in/viewparcel/'.$parceldetails->id.'">Link</a>. </div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';
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
			$data["image"]=$trip['ticket'];
			$data["dep_time"]=$trip['d_date'];
			$data["arrival_time"]=$trip['a_date'];
			$data["flight_no"]=$trip['flight_no'];
			$data["pnr"]=$trip['pnr'];
			$data["capacity"]=$trip['capacity']; 
			if(isset($trip['comment'])){
				$data["comment"]=$trip['comment'];
			}
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
			$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
			$this->email->to($emailid.',info@mycourierbuddy.in'); 
			$this->email->subject('New Trip Added | mycourierbuddy.in');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear user</div><p style="text-align:left;">Congratulations! You have successfully added new trip.</p><div style="text-align:left; color:#2c4882;">Destination - &nbsp;'.$trip['destination'].'<br />Departure on - &nbsp; '.$trip['d_date'].'<br />Source - &nbsp; '.$trip['source'].'<br />Arrival at - &nbsp; '.$trip['a_date'].'<br />Flight No. - &nbsp; '.$trip['flight_no'].'<br />PNR /Booking Reference No. - &nbsp; '.$trip['pnr'].'<br />Capacity - &nbsp; '.$trip['capacity'].' Kg. <br />Comment - &nbsp; '.$trip['comment'].'<br /></div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;">You have successfully added request for Trip. We have sent your request to admin for approval. </div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';
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
					$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
					$this->email->to($emailid.',info@mycourierbuddy.in'); 
					$this->email->subject('Parcel Successfully Created With Transporter | mycourierbuddy.in');   
					$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0"> <img src="http://mycourierbuddy.in/images/logo.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$parceluser->name.'</div><p style="text-align:left;">Congratulations! You Parcel #P'.$parcel->id.' successfully created with Tranporter '.$transuser->name.'.			</p><div style="text-align:left; color:#2c4882;">Destination - &nbsp;'.$parcel->destination.'<br />Delivery Till - &nbsp; '.$parcel->till_date.'<br />Source - &nbsp; '.$parcel->source.'<br /> Description - &nbsp; '.$parcel->description.'<br /> </div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;"></div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';
					$this->email->message($message);
					$this->email->send(); 
					
					$emailid=$receiveruser->username;
					$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
					$this->email->to($emailid.',info@mycourierbuddy.in'); 
					$this->email->subject('Parcel to Receive Created With Transporter | mycourierbuddy.in');   
					$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo-mail.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$receiveruser->name.'</div><p style="text-align:left;">Your friend '.$parceluser->name.' has been added a parcel #P'.$parcel->id.' from mycourierbuddy.in and want you to play role as receiver. He/She want you to help to receive the parcel as per the giving details.</p><b>and parcel linked Successfully to transporter.</b><div style="text-align:left; color:#2c4882;">Destination - &nbsp;			'.$parcel->destination.'<br />Source - &nbsp; '.$parcel->source.'<br />Delivered Till. - &nbsp; '.$parcel->till_date.'<br />Parcel type - &nbsp;'.(($parcel->type=='P') ? "Packet" : (($parcel->type=='B') ? "Box" : "Envelope")).'<br />Parcel Weight - &nbsp; '.$parcel->weight.' Kg<br />Description - &nbsp; '.$parcel->description.'<br /></div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;">Transporter details has been updated.<br />Name - &nbsp; '.$transuser->name.'<br />Email. - &nbsp; '.$transuser->username.'<br />Mobile. - &nbsp; '.$transuser->mobile.' 			As per any query regarding parcel receive, you can consult with your friend			'.$parceluser->name.'  he/she will assist you easily.</div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';		
					$this->email->message($message);
					$this->email->send(); 
					
					$emailid=$transuser->username;
					$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
					$this->email->to($emailid.',info@mycourierbuddy.in'); 
					$this->email->subject('Your Trip #T'.$trip->id.' Successfully Booked with Parcel | mycourierbuddy.in');   
					$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo-mail.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$transuser->name.'</div>			<p style="text-align:left;">Your Trip #T'.$trip->id.' Successfully Booked with Parcel. Parcel Details:</p><div style="text-align:left; color:#2c4882;">Destination - &nbsp;'.$parcel->destination.'<br />Source - &nbsp; '.$parcel->source.'<br />Delivered Till. - &nbsp; '.$parcel->till_date.'<br />Parcel type - &nbsp;'.(($parcel->type=='P') ? "Packet" : (($parcel->type=='B') ? "Box" : "Envelope")).'<br />Parcel Weight - &nbsp; '.$parcel->weight.' Kg<br />Description - &nbsp; '.$parcel->description.'<br /></div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;">			</div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';	
					$this->email->message($message);
					$this->email->send();  
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
			$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
			$this->email->to($emailid.',info@mycourierbuddy.in'); 
			$this->email->subject('Parcel Successfully Created With Transporter | mycourierbuddy.in');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0"> <img src="http://mycourierbuddy.in/images/logo.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$parceluser->name.'</div><p style="text-align:left;">Congratulations! You Parcel #P'.$parcel->id.' successfully created with Tranporter '.$transuser->name.'.			</p><div style="text-align:left; color:#2c4882;">Destination - &nbsp;'.$parcel->destination.'<br />Delivery Till - &nbsp; '.$parcel->till_date.'<br />Source - &nbsp; '.$parcel->source.'<br /> Description - &nbsp; '.$parcel->description.'<br /> </div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;"></div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';
			$this->email->message($message);
			$this->email->send(); 
			
			$emailid=$receiveruser->username;
			$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
			$this->email->to($emailid.',info@mycourierbuddy.in'); 
			$this->email->subject('Parcel to Receive Created With Transporter | mycourierbuddy.in');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo-mail.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$receiveruser->name.'</div><p style="text-align:left;">Your friend '.$parceluser->name.' has been added a parcel #P'.$parcel->id.' from mycourierbuddy.in and want you to play role as receiver. He/She want you to help to receive the parcel as per the giving details.</p><b>and parcel linked Successfully to transporter.</b><div style="text-align:left; color:#2c4882;">Destination - &nbsp;			'.$parcel->destination.'<br />Source - &nbsp; '.$parcel->source.'<br />Delivered Till. - &nbsp; '.$parcel->till_date.'<br />Parcel type - &nbsp;'.(($parcel->type=='P') ? "Packet" : (($parcel->type=='B') ? "Box" : "Envelope")).'<br />Parcel Weight - &nbsp; '.$parcel->weight.' Kg<br />Description - &nbsp; '.$parcel->description.'<br /></div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;">Transporter details has been updated.<br />Name - &nbsp; '.$transuser->name.'<br />Email. - &nbsp; '.$transuser->username.'<br />Mobile. - &nbsp; '.$transuser->mobile.' 			As per any query regarding parcel receive, you can consult with your friend			'.$parceluser->name.'  he/she will assist you easily.</div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';		
			$this->email->message($message);
			$this->email->send(); 
			
			$emailid=$transuser->username;
			$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
			$this->email->to($emailid.',info@mycourierbuddy.in'); 
			$this->email->subject('Your Trip #T'.$trip->id.' Successfully Booked with Parcel | mycourierbuddy.in');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo-mail.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$transuser->name.'</div>			<p style="text-align:left;">Your Trip #T'.$trip->id.' Successfully Booked with Parcel. Parcel Details:</p><div style="text-align:left; color:#2c4882;">Destination - &nbsp;'.$parcel->destination.'<br />Source - &nbsp; '.$parcel->source.'<br />Delivered Till. - &nbsp; '.$parcel->till_date.'<br />Parcel type - &nbsp;'.(($parcel->type=='P') ? "Packet" : (($parcel->type=='B') ? "Box" : "Envelope")).'<br />Parcel Weight - &nbsp; '.$parcel->weight.' Kg<br />Description - &nbsp; '.$parcel->description.'<br /></div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;">			</div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';	
			$this->email->message($message);
			$this->email->send();  
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
			$emailid=$res1->username;
			$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
			$this->email->to($emailid.',info@mycourierbuddy.in'); 
			$this->email->subject('New Parcel Added | mycourierbuddy.in');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0"> <img src="http://mycourierbuddy.in/images/logo.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear user</div><p style="text-align:left;">Congratulations! You have successfully added new Parcel.</p><div style="text-align:left; color:#2c4882;">Destination - &nbsp;'.$parcel['destination'].'<br />Source - &nbsp; '.$parcel['source'].'<br />Delivered Till. - &nbsp; '.$parcel['till_date'].'<br />Parcel type - &nbsp;'.(($parcel['type']=='P') ? "Packet" : (($parcel['type']=='B') ? "Box" : "Envelope")).'<br />Parcel Weight - &nbsp; '.$parcel['weight'].' Kg<br />Description - &nbsp; '.$parcel['description'].'<br /></div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;">You have successfully added request for parcel. your parcel is live for search. </div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';
			$this->email->message($message);
			$this->email->send(); 
			$query = $this->db->query("SELECT * FROM `cms_parcels`  order by id desc limit 1"); 
			//receiver email
			$this->db->where("id",$parcel['recv_id']);  
			$query3=$this->db->get("users");
			$res2=$query3->result()[0]; 
			$emailid=$res2->username;
			$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
			$this->email->to($emailid.',info@mycourierbuddy.in'); 
			$this->email->subject('Parcel to Receive | mycourierbuddy.in');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo-mail.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$res2->name.'</div><p style="text-align:left;">Your friend '.$res1->name.' has been added a parcel from mycourierbuddy.in and want you to play role as receiver. He/She want you to help to receive the parcel as per the giving details.</p><div style="text-align:left; color:#2c4882;">Destination - &nbsp;'.$parcel['destination'].'<br />Source - &nbsp; '.$parcel['source'].'<br />Delivered Till. - &nbsp; '.$parcel['till_date'].'<br />Parcel type - &nbsp;'.(($parcel['type']=='P') ? "Packet" : (($parcel['type']=='B') ? "Box" : "Envelope")).'<br />Parcel Weight - &nbsp; '.$parcel['weight'].' Kg<br />Description - &nbsp; '.$parcel['description'].'<br /></div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;">Transporter details has been updated you soon. As per any query regarding parcel receive, you can consult with your friend  '.$res1->name.'  he/she will assist you easily.</div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';
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
				$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
				$this->email->to($emailid.',info@mycourierbuddy.in'); 
				$this->email->subject('Parcel #P'.$parcel["id"].' Booking  Cancelled by You | mycourierbuddy.in');   
				$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0"> <img src="http://mycourierbuddy.in/images/logo.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$parceluser->name.'</div><p style="text-align:left;">Parcel #P'.$parcel["id"].' Booking  Cancelled by You <br /> </div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;"></div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';
				$this->email->message($message);
				$this->email->send();  
				$this->db->where("id", $parcel["trans_id"]); 
				$tripquery=$this->db->get("trips");
				$tripdata=$tripquery->result()[0]; 
				$this->db->where("id",$tripdata->t_id);  
				$transquery=$this->db->get("users");
				$transuser=$transquery->result()[0];
				$emailid=$transuser->username;
				$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
				$this->email->to($emailid.',info@mycourierbuddy.in'); 
				$this->email->subject('Parcel #P'.$parcel["id"].' Booking  Cancelled Sender | mycourierbuddy.in');   
				$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo-mail.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$transuser->name.'</div>			<p style="text-align:left;">Parcel #P'.$parcel["id"].' Booking  Cancelled Sender. </div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;">			</div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';	
				$this->email->message($message);
				$this->email->send();  
			    $emailid=$receiveruser->username;
				$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
				$this->email->to($emailid.',info@mycourierbuddy.in'); 
				$this->email->subject('Parcel #P'.$parcel["id"].' Booking  Cancelled Sender | mycourierbuddy.in');   
				$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo-mail.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$receiveruser->name.'</div><p style="text-align:left;">Parcel #P'.$parcel["id"].' Booking  Cancelled Sender</div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';		
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
			$data["image"]=$trip['ticket']; 
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
				$emailid=$transuser->username;
				$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
				$this->email->to($emailid.',info@mycourierbuddy.in'); 
				$this->email->subject('Trip #T'.$tripdata->id.' Booking  Updated Successfully by You | mycourierbuddy.in');   
				$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo-mail.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$transuser->name.'</div>			<p style="text-align:left;">Trip #T'.$tripdata->id.'  Updated Successfully by You Booking of this trip is cancelled. </div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;">			</div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';	
				$this->email->message($message);
				$this->email->send();  
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
					$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
					$this->email->to($emailid.',info@mycourierbuddy.in'); 
					$this->email->subject('Trip #T'.$tripdata->id.' Booking  Cancelled by Transporter | mycourierbuddy.in');   
					$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0"> <img src="http://mycourierbuddy.in/images/logo.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$parceluser->name.'</div><p style="text-align:left;">Trip #T'.$tripdata->id.' Booking Cancelled by Transporter <br /> </div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;"></div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';
					$this->email->message($message);
					$this->email->send(); 
			
					$emailid=$receiveruser->username;
					$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
					$this->email->to($emailid.',info@mycourierbuddy.in'); 
					$this->email->subject('Trip #T'.$tripdata->id.' Booking Cancelled by Transporter | mycourierbuddy.in');   
					$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo-mail.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$receiveruser->name.'</div><p style="text-align:left;">Trip #T'.$tripdata->id.' Booking Cancelled by Transporter</div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';		
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
				$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
				$this->email->to($emailid.',info@mycourierbuddy.in'); 
				$this->email->subject('Trip #T'.$request["id"].'  Approved Successfully | mycourierbuddy.in');   
				$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$res1->name.'</div><p style="text-align:left;">Congratulations! Trip '.$res->TripID.'  Approved Successfully </div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;">Your trip is now live for search. </div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';
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
				$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
				$this->email->to($emailid.',info@mycourierbuddy.in'); 
				$this->email->subject('Trip '.$res->TripID.' is on Hold | mycourierbuddy.in');   
				$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$res1->name.'</div><p style="text-align:left;">Trip '.$res->TripID.' is on Hold due to reason:'.$request["reason"].'</div><br /><div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';
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
				$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
				$this->email->to($emailid.',info@mycourierbuddy.in'); 
				$this->email->subject('Trip '.$res->TripID.' is Rejected | mycourierbuddy.in');   
				$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$res1->name.'</div><p style="text-align:left;">Trip '.$res->TripID.' is Rejected due to reason:'.$request["reason"].'</div><br /><div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';
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
			     $emailid=$transuser->username;
			     $this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
			     $this->email->to($emailid.',info@mycourierbuddy.in'); 
			     $this->email->subject('Trip #T'.$trip->id.'  Cancelled Successfully by You | mycourierbuddy.in');   
			     $message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo-mail.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$transuser->name.'</div>			<p style="text-align:left;">Trip #T'.$trip->id.'  Cancelled Successfully by You </div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;">			</div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';	
			     $this->email->message($message);
			     $this->email->send();   
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
					$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
					$this->email->to($emailid.',info@mycourierbuddy.in'); 
					$this->email->subject('Trip #T'.$trip->id.'  Cancelled by Transporter | mycourierbuddy.in');   
					$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0"> <img src="http://mycourierbuddy.in/images/logo.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$parceluser->name.'</div><p style="text-align:left;">Trip #T'.$trip->id.'  Cancelled by Transporter <br /> </div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;"></div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';
					$this->email->message($message);
					$this->email->send(); 
			
					$emailid=$receiveruser->username;
					$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
					$this->email->to($emailid.',info@mycourierbuddy.in'); 
					$this->email->subject('Trip #T'.$trip->id.'  Cancelled by Transporter | mycourierbuddy.in');   
					$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo-mail.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$receiveruser->name.'</div><p style="text-align:left;">Trip #T'.$trip->id.'  Cancelled by Transporter</div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';		
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
			$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
			$this->email->to($emailid.',info@mycourierbuddy.in'); 
			$this->email->subject('Parcel #P'.$parcel->id.'  Collected Successfully by Transporter | mycourierbuddy.in');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0"> <img src="http://mycourierbuddy.in/images/logo.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$parceluser->name.'</div><p style="text-align:left;">Congratulations! You Parcel #P'.$parcel->id.' successfully Collected with Tranporter '.$transuser->name.'.			</p><div style="text-align:left; color:#2c4882;">Destination - &nbsp;'.$parcel->destination.'<br />Delivery Till - &nbsp; '.$parcel->till_date.'<br />Source - &nbsp; '.$parcel->source.'<br /> Description - &nbsp; '.$parcel->description.'<br /> </div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;"></div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';
			$this->email->message($message);
			$this->email->send(); 
			
			$emailid=$receiveruser->username;
			$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
			$this->email->to($emailid.',info@mycourierbuddy.in'); 
			$this->email->subject('Parcel #P'.$parcel->id.'  Collected Successfully by Transporter | mycourierbuddy.in');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo-mail.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$receiveruser->name.'</div><p style="text-align:left;">Parcel #P'.$parcel->id.'  Collected Successfully by Transporter. Your friend '.$parceluser->name.' is sending parcel #P'.$parcel->id.' from mycourierbuddy.in and want you to play role as receiver. He/She want you to help to receive the parcel as per the giving details.</p><b>and parcel linked Successfully to transporter.</b><div style="text-align:left; color:#2c4882;">Destination - &nbsp;			'.$parcel->destination.'<br />Source - &nbsp; '.$parcel->source.'<br />Delivered Till. - &nbsp; '.$parcel->till_date.'<br />Parcel type - &nbsp;'.(($parcel->type=='P') ? "Packet" : (($parcel->type=='B') ? "Box" : "Envelope")).'<br />Parcel Weight - &nbsp; '.$parcel->weight.' Kg<br />Description - &nbsp; '.$parcel->description.'<br /></div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;">Transporter details are.<br />Name - &nbsp; '.$transuser->name.'<br />Email. - &nbsp; '.$transuser->username.'<br />Mobile. - &nbsp; '.$transuser->mobile.' 			As per any query regarding parcel receive, you can consult with your friend			'.$parceluser->name.'  he/she will assist you easily.</div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';		
			$this->email->message($message);
			$this->email->send(); 
			
			$emailid=$transuser->username;
			$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
			$this->email->to($emailid.',info@mycourierbuddy.in'); 
			$this->email->subject('Parcel #P'.$parcel->id.'  Collected Successfully by You | mycourierbuddy.in');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo-mail.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$transuser->name.'</div>			<p style="text-align:left;">Parcel #P'.$parcel->id.'  Collected Successfully by You regarding Trip #T'.$trip->id.'. Parcel Details:</p><div style="text-align:left; color:#2c4882;">Destination - &nbsp;'.$parcel->destination.'<br />Source - &nbsp; '.$parcel->source.'<br />Delivered Till. - &nbsp; '.$parcel->till_date.'<br />Parcel type - &nbsp;'.(($parcel->type=='P') ? "Packet" : (($parcel->type=='B') ? "Box" : "Envelope")).'<br />Parcel Weight - &nbsp; '.$parcel->weight.' Kg<br />Description - &nbsp; '.$parcel->description.'<br /></div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;">			</div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';	
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
			$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
			$this->email->to($emailid.',info@mycourierbuddy.in'); 
			$this->email->subject('Parcel #P'.$parcel->id.'  Delivered Successfully by Transporter | mycourierbuddy.in');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0"> <img src="http://mycourierbuddy.in/images/logo.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$parceluser->name.'</div><p style="text-align:left;">Congratulations! You Parcel #P'.$parcel->id.' successfully Delivered with Tranporter '.$transuser->name.'.			</p><div style="text-align:left; color:#2c4882;">Destination - &nbsp;'.$parcel->destination.'<br />Delivery Till - &nbsp; '.$parcel->till_date.'<br />Source - &nbsp; '.$parcel->source.'<br /> Description - &nbsp; '.$parcel->description.'<br /> </div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;"></div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';
			$this->email->message($message);
			$this->email->send(); 
			
			$emailid=$receiveruser->username;
			$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
			$this->email->to($emailid.',info@mycourierbuddy.in'); 
			$this->email->subject('Parcel #P'.$parcel->id.'  Delivered Successfully by Transporter | mycourierbuddy.in');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo-mail.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$receiveruser->name.'</div><p style="text-align:left;">Parcel #P'.$parcel->id.'  Delivered Successfully by Transporter. Your friend '.$parceluser->name.' is sending parcel #P'.$parcel->id.' from mycourierbuddy.in and want you to play role as receiver. He/She want you to help to receive the parcel as per the giving details.</p><b>and parcel linked Successfully to transporter.</b><div style="text-align:left; color:#2c4882;">Destination - &nbsp;			'.$parcel->destination.'<br />Source - &nbsp; '.$parcel->source.'<br />Delivered Till. - &nbsp; '.$parcel->till_date.'<br />Parcel type - &nbsp;'.(($parcel->type=='P') ? "Packet" : (($parcel->type=='B') ? "Box" : "Envelope")).'<br />Parcel Weight - &nbsp; '.$parcel->weight.' Kg<br />Description - &nbsp; '.$parcel->description.'<br /></div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;">Transporter details are.<br />Name - &nbsp; '.$transuser->name.'<br />Email. - &nbsp; '.$transuser->username.'<br />Mobile. - &nbsp; '.$transuser->mobile.' 			As per any query regarding parcel receive, you can consult with your friend			'.$parceluser->name.'  he/she will assist you easily.</div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';		
			$this->email->message($message);
			$this->email->send(); 
			
			$emailid=$transuser->username;
			$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
			$this->email->to($emailid.',info@mycourierbuddy.in'); 
			$this->email->subject('Parcel #P'.$parcel->id.'  Delivered Successfully by You | mycourierbuddy.in');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo-mail.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$transuser->name.'</div>			<p style="text-align:left;">Parcel #P'.$parcel->id.'  Delivered Successfully by You regarding Trip #T'.$trip->id.'. Parcel Details:</p><div style="text-align:left; color:#2c4882;">Destination - &nbsp;'.$parcel->destination.'<br />Source - &nbsp; '.$parcel->source.'<br />Delivered Till. - &nbsp; '.$parcel->till_date.'<br />Parcel type - &nbsp;'.(($parcel->type=='P') ? "Packet" : (($parcel->type=='B') ? "Box" : "Envelope")).'<br />Parcel Weight - &nbsp; '.$parcel->weight.' Kg<br />Description - &nbsp; '.$parcel->description.'<br /></div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;">			</div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';	
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
					$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
					$this->email->to($emailid.',info@mycourierbuddy.in'); 
					$this->email->subject('Parcel #'.$parcel->ParcelID.' Booking Cancelled by Transporter | mycourierbuddy.in');   
					$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0"> <img src="http://mycourierbuddy.in/images/logo.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$parceluser->name.'</div><p style="text-align:left;">Parcel #'.$parcel->ParcelID.' Booking Cancelled by Transporter  <br /> </div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;"></div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';
					$this->email->message($message);
					$this->email->send(); 
			
					$emailid=$receiveruser->username;
					$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
					$this->email->to($emailid.',info@mycourierbuddy.in'); 
					$this->email->subject('Parcel #'.$parcel->ParcelID.' Booking Cancelled by Transporter  | mycourierbuddy.in');   
					$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo-mail.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$receiveruser->name.'</div><p style="text-align:left;">Parcel #'.$parcel->ParcelID.' Booking Cancelled by Transporter</div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';		
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
					$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
					$this->email->to($emailid.',info@mycourierbuddy.in'); 
					$this->email->subject('Parcel #'.$parcel->ParcelID.' Booking Cancelled by Admin | mycourierbuddy.in');   
					$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0"> <img src="http://mycourierbuddy.in/images/logo.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$parceluser->name.'</div><p style="text-align:left;">Parcel #'.$parcel->ParcelID.' Booking Cancelled by Transporter  <br /> </div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;"></div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';
					$this->email->message($message);
					$this->email->send(); 
			
					$emailid=$receiveruser->username;
					$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
					$this->email->to($emailid.',info@mycourierbuddy.in'); 
					$this->email->subject('Parcel #'.$parcel->ParcelID.' Booking Cancelled by Admin  | mycourierbuddy.in');   
					$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo-mail.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$receiveruser->name.'</div><p style="text-align:left;">Parcel #'.$parcel->ParcelID.' Booking Cancelled by Transporter</div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';		
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
				$emailid=$parceluser->username;
			$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
			$this->email->to($emailid.',info@mycourierbuddy.in'); 
			$this->email->subject('Parcel #P'.$parcel->id.'  Cancel Successfully | mycourierbuddy.in');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0"> <img src="http://mycourierbuddy.in/images/logo.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$parceluser->name.'</div><p style="text-align:left;">Your Parcel #P'.$parcel->id.' Calcel Successfully you. </div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;"></div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';
			$this->email->message($message);
			$this->email->send();
			if($parcel->trans_id>0)
			{   $this->db->where("id", $parcel->trans_id); 
				$tripquery=$this->db->get("trips");
				$trip=$tripquery->result()[0]; 
				$this->db->where("id",$trip->t_id);  
				$transquery=$this->db->get("users");
				$transuser=$transquery->result()[0]; 
				$emailid=$transuser->username;
			    $this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
			    $this->email->to($emailid.',info@mycourierbuddy.in'); 
			    $this->email->subject('Parcel #P'.$parcel->id.' Cancel by Sender | mycourierbuddy.in');   
			    $message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo-mail.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$transuser->name.'</div>			<p style="text-align:left;">Parcel #P'.$parcel->id.' Cancel by Sender .your Trip #T'.$trip->id.' is now reopen for book.<br /></div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;">			</div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';	
		    	$this->email->message($message);
			   $this->email->send(); 
			} 
			$this->db->where("id",$parcel->recv_id);  
			$receiverquery=$this->db->get("users");
			$receiveruser=$receiverquery->result()[0];  
			$emailid=$receiveruser->username;
			$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
			$this->email->to($emailid.',info@mycourierbuddy.in'); 
			$this->email->subject('Parcel #P'.$parcel->id.'  Calcel  by Sender | mycourierbuddy.in');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo-mail.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$receiveruser->name.'</div><p style="text-align:left;">Parcel #P'.$parcel->id.'  Calcel  by Sender.</div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;"></div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';		
			$this->email->message($message);
			$this->email->send();  
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
				$sql = "update cms_chatchannel a set a.isactive=0,processed_by=".$request["process_by"]." where parcelid=".$request["id"].";"; 
			   $this->db->query($sql);					 
				$this->db->where("id",$parcel->usr_id);  
				$query2=$this->db->get("users");
				$parceluser=$query2->result()[0]; 
				$emailid=$parceluser->username;
			$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
			$this->email->to($emailid.',info@mycourierbuddy.in'); 
			$this->email->subject('Parcel #P'.$parcel->id.'  Cancel Successfully | mycourierbuddy.in');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0"> <img src="http://mycourierbuddy.in/images/logo.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$parceluser->name.'</div><p style="text-align:left;">Your Parcel #P'.$parcel->id.' Calcel Successfully you. </div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;"></div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';
			$this->email->message($message);
			$this->email->send();
			if($parcel->trans_id>0)
			{   $this->db->where("id", $parcel->trans_id); 
				$tripquery=$this->db->get("trips");
				$trip=$tripquery->result()[0]; 
				$this->db->where("id",$trip->t_id);  
				$transquery=$this->db->get("users");
				$transuser=$transquery->result()[0]; 
				$emailid=$transuser->username;
			    $this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
			    $this->email->to($emailid.',info@mycourierbuddy.in'); 
			    $this->email->subject('Parcel #P'.$parcel->id.' Cancel by Sender | mycourierbuddy.in');   
			    $message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo-mail.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$transuser->name.'</div>			<p style="text-align:left;">Parcel #P'.$parcel->id.' Cancel by Sender .your Trip #T'.$trip->id.' is now reopen for book.<br /></div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;">			</div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';	
		    	$this->email->message($message);
			   $this->email->send(); 
			} 
			$this->db->where("id",$parcel->recv_id);  
			$receiverquery=$this->db->get("users");
			$receiveruser=$receiverquery->result()[0];  
			$emailid=$receiveruser->username;
			$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
			$this->email->to($emailid.',info@mycourierbuddy.in'); 
			$this->email->subject('Parcel #P'.$parcel->id.'  Calcel  by Sender | mycourierbuddy.in');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo-mail.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$receiveruser->name.'</div><p style="text-align:left;">Parcel #P'.$parcel->id.'  Calcel  by Sender.</div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;"></div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';		
			$this->email->message($message);
			$this->email->send();  
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
			$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
			$this->email->to($emailid.',info@mycourierbuddy.in'); 
			$this->email->subject('Parcel #P'.$parcel->id.'  Received Successfully by Receiver | mycourierbuddy.in');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0"> <img src="http://mycourierbuddy.in/images/logo.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$parceluser->name.'</div><p style="text-align:left;">Congratulations! You Parcel #P'.$parcel->id.' Received Successfully by '.$receiveruser->name.' with Tranporter '.$transuser->name.'.			</p><div style="text-align:left; color:#2c4882;">Destination - &nbsp;'.$parcel->destination.'<br />Delivery Till - &nbsp; '.$parcel->till_date.'<br />Source - &nbsp; '.$parcel->source.'<br /> Description - &nbsp; '.$parcel->description.'<br /> </div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;"></div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';
			$this->email->message($message);
			$this->email->send(); 
			
			$emailid=$receiveruser->username;
			$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
			$this->email->to($emailid.',info@mycourierbuddy.in'); 
			$this->email->subject('Parcel #P'.$parcel->id.'  Received Successfully by You | mycourierbuddy.in');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo-mail.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$receiveruser->name.'</div><p style="text-align:left;">Parcel #P'.$parcel->id.'  received Successfully by you. we send update to your friend '.$parceluser->name.' from mycourierbuddy.in..</b><div style="text-align:left; color:#2c4882;">Destination - &nbsp;			'.$parcel->destination.'<br />Source - &nbsp; '.$parcel->source.'<br />Delivered Till. - &nbsp; '.$parcel->till_date.'<br />Parcel type - &nbsp;'.(($parcel->type=='P') ? "Packet" : (($parcel->type=='B') ? "Box" : "Envelope")).'<br />Parcel Weight - &nbsp; '.$parcel->weight.' Kg<br />Description - &nbsp; '.$parcel->description.'<br /></div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;">Transporter details are.<br />Name - &nbsp; '.$transuser->name.'<br />Email. - &nbsp; '.$transuser->username.'<br />Mobile. - &nbsp; '.$transuser->mobile.' 			As per any query regarding parcel receive, you can consult with your friend			'.$parceluser->name.'  he/she will assist you easily.</div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';		
			$this->email->message($message);
			$this->email->send(); 
			
			$emailid=$transuser->username;
			$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
			$this->email->to($emailid.',info@mycourierbuddy.in'); 
			$this->email->subject('Parcel #P'.$parcel->id.' Confirmed Successfully by Receiver | mycourierbuddy.in');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo-mail.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$transuser->name.'</div>			<p style="text-align:left;">Parcel #P'.$parcel->id.' Confirmed Successfully by Receiver regarding Trip #T'.$trip->id.'. Parcel Details:</p><div style="text-align:left; color:#2c4882;">Destination - &nbsp;'.$parcel->destination.'<br />Source - &nbsp; '.$parcel->source.'<br />Delivered Till. - &nbsp; '.$parcel->till_date.'<br />Parcel type - &nbsp;'.(($parcel->type=='P') ? "Packet" : (($parcel->type=='B') ? "Box" : "Envelope")).'<br />Parcel Weight - &nbsp; '.$parcel->weight.' Kg<br />Description - &nbsp; '.$parcel->description.'<br /></div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;">			</div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By  <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div>';	
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
				$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
				$this->email->to($email.',info@mycourierbuddy.in'); 
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
		$query = $this->db->query("SELECT * FROM `cms_weightrange` order by id"); 
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
			$data = array('location' =>$post["location"],'status' =>$post["status"],'type' =>$post["type"],'code' =>$post["code"],'zonelistid' =>$post["zonelistid"]);
		   $this->db->update('airports', $data, "id =".$post["id"]);
		 }
		 else
		 {
			$data = array('location' =>$post["location"],'status' =>$post["status"],'type' =>$post["type"],'code' =>$post["code"],'zonelistid' =>$post["zonelistid"]);
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
		if(isset($post["id"]))
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
    function searchhome($post)
	{ 
		$param=$post["params"]; 
		if($param["type"]=="Transporter")
		{
			//and (a.capacity-COALESCE(c.totalweight,0))>0 
		    $query = $this->db->query("SELECT id,source,destination,dep_time,arrival_time,image,flight_no,pnr,comment,(a.capacity-COALESCE(c.totalweight,0)) capacity,a.t_id,created,status,processed_by,'update' FROM `cms_trips` a left join (SELECT a.t_id,sum(weight) as totalweight FROM cms_bookings a where a.status=3 group by a.t_id)c on a.id=c.t_id where (a.status=1 or a.status=3) and (a.source like '%".$param["locationfrom"]."%' or '".$param["locationfrom"]."'='') and (a.destination like '%".$param["locationto"]."%' or '".$param["locationto"]."'='') and (a.dep_time >= '".$param["dateFrom"]."' or '".$param["dateFrom"]."'='') and (a.dep_time <= '".$param["dateTo"]." 23:59' or '".$param["dateTo"]."'='')and a.arrival_time >= CURDATE()  ");
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
						$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
						$this->email->to($email.',info@mycourierbuddy.in'); 
						$this->email->subject('User Invited You on mycourierbuddy.in');   
						$message=' <div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0"><img src="http://mycourierbuddy.in/images/logo.png" /></div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$request['name'].'</div><p style="text-align:left;">Congratulations! You have successfully register with mycourierbuddy.in by your friend '.$senduser->name.' </p><p>Please complete your profile by clicking this <a href="dev9856.mycourierbuddy.in/dashboard">Link</a>.</p><div style="text-align:left; color:#2c4882;">Your Login ID - <a style="margin-left:10px; color:#2c4882"href="#"><em>'.$request['email'].'</em></a><br />Your Password - &nbsp; '.$randomString.'</div> <br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;">If you forget your password in future, you can reset your password by click on <a style="color:#233151;" href="http://mycourierbuddy.in/users/forgotten">Reset Password </a>. The username can not be changed, hence we recommend you to store this email for your future reference.</div><div> </div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div> </div> <div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div> </div> ';
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
			$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
			$this->email->to($email.',info@mycourierbuddy.in'); 
			$this->email->subject('OTP Verification | mycourierbuddy.in');   
			$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0"><img src="http://mycourierbuddy.in/images/logo-mail.png" /></div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$request['firstName'].'</div><p style="text-align:left;">Congratulations! You have successfully register with mycourierbuddy.Click this :<a href="http://dev9856.mycourierbuddy.in/verifyuser/'.$row->id.'/'.$randomString.'">link</a> to verify your email.</p><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;">If you forget your password in future, you can reset your password by click on <a style="color:#233151;" href="http://mycourierbuddy.in/users/forgotten">Reset Password </a>. The username can not be changed, hence we recommend you to store this email for your future reference.</div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div>  </div> <div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By <a href="http://byteclues.com/">byteclues.com</a></div> </div> ';
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
				$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
				$this->email->to($email.',info@mycourierbuddy.in'); 
				$this->email->subject('Email Successfully Verified | mycourierbuddy.in');   
				$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo-mail.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$row->name.'</div><p style="text-align:left;">Congratulations! You have successfully register with mycourierbuddy.</p><div style="text-align:left; color:#2c4882;">Your Login ID - <a style="margin-left:10px; color:#2c4882"href="#"><em>'.$row->username.'</em></a></div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;">If you forget your password in future, you can reset your password by click on <a style="color:#233151;" href="http://mycourierbuddy.in/users/forgotten">Reset Password </a>. The username can not be changed, hence we recommend you to store this email for your future reference.</div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By <a href="http://mycourierbuddy.in/">mycourierbuddy.in</a></div></div> ';
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
					$this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
					$this->email->to($email.',info@mycourierbuddy.in'); 
					$this->email->subject('OTP Verification | mycourierbuddy.in');   
					$message='<div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0"><img src="http://mycourierbuddy.in/images/logo-mail.png" /></div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$row['name'].'</div><p style="text-align:left;">Click this :<a href="http://dev9856.mycourierbuddy.in/verifyuser/'.$row['id'].'/'.$row['verificationcode'].'">link</a> to verify your email. </p><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;">If you forget your password in future, you can reset your password by click on <a style="color:#233151;" href="http://mycourierbuddy.in/users/forgotten">Reset Password </a>. The username can not be changed, hence we recommend you to store this email for your future reference.</div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div>  </div> <div style=" color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; Design By <a href="http://byteclues.com/">byteclues.com</a></div> </div> ';
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
			    $this->email->from("info@mycourierbuddy.in", 'mycourierbuddy');
				$this->email->to($email.',info@mycourierbuddy.in'); 
				$this->email->subject('Password Change Successfully | mycourierbuddy.in');  
				$name=$query->result()[0]->name; 
				$message='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title>Reset Password</title></head><body style="margin:0px; padding:0px; "><div style="text-align:center; width:600px;font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#fff;  margin:auto; position:relative;"><div style="text-align:center;margin: auto; background:#233151; padding:5px 0">    <img src="http://mycourierbuddy.in/images/logo.png" />    </div><img src="http://mycourierbuddy.in/images/plane.jpg" /><div style="clear:both; padding:35px; border:1px solid #ccc; border-top:0; border-bottom:0; font-size:15px; color:#000"><div><div style="text-align:left">Dear '.$name.'</div><p style="text-align:left;">You received this email because you had requested on www.mycourierbuddy.in indicating that you had forgotten your password. </p><br><p><strong>Password Change Successfully</strong></p><p> ,</p><br/>  <b>Email:</b>'.$email.'<br><br> <b>Password:</b>'.implode($pass).'<br><br> <br/><br/>  </p> <p style="text-align:left;"> </p><div style="text-align:left; color:#2c4882;"> </div><br /><div style="text-align:justify;line-height: 18px; margin-top:10px; margin-bottom:20px;">Please ignore this email if it wasn t you who requested help with your password - your current password will remain unchanged..</div><div></div> <div style="text-align:left; font-size:13px; margin-top:50px;"><b>Warm Regards</b>,<br/>Team <b style="color:#3b5998;">MCB</b></span></div></div></div><div style="color:#fff; font-size:11px; text-align:center; font-family:Arial, Helvetica, sans-serif; background:#3b5998; padding:15px 0;">Terms and Condition Privacy Policy.<br/>  All Rights Reserved. 2016 &nbsp; &nbsp; </div></body></html>';
			    $this->email->message($message);
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