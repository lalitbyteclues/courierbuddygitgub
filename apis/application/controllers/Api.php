<?php
 if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class Api extends CI_Controller{
	public function __construct()
	{
		header('Access-Control-Allow-Origin: *');
		header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method");
		header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
		$method = $_SERVER['REQUEST_METHOD'];
		if($method == "OPTIONS") {
			die();
		} 
		parent::__construct();
		$this->load->model('api_model');
		$this->load->database();
		$this->load->helper('url');
		$this->load->library('grocery_CRUD');  
		$this->load->library('session'); 
	}
	public function index()
	{ 
		if(($this->session->userdata('user_name')!=""))
		{  $this->welcome();
		}
		else
		{
			$data['title']= 'Home'; 
		}
	}
	public function gettransporterdetail($transporterid)
	{
		 $transporter = $this->api_model->gettransporterdetail($transporterid);		 
		 echo $transporter;
	} 
	public function getparceldetail($parcelid)
	{
		 $transporter = $this->api_model->getparceldetail($parcelid);		 
		 echo $transporter;
	}
	public function searchuser()
	{
		$input_data = json_decode(trim(file_get_contents('php://input')), true);
		$this->api_model->searchuser($input_data);  
	} 
	public function deliverytypecountrydoctype()
	{
		 $providers = $this->api_model->deliverytypecountrydoctype();		 
		 echo $providers;
	}
	public function getcountries()
	{
		 $providers = $this->api_model->getcountries();		 
		 echo $providers;
	}
	public function getzonelist()
	{
		 $providers = $this->api_model->getzonelist();		 
		 echo $providers;
	}
	public function getseolist()
	{
		 $providers = $this->api_model->getseolist();		 
		 echo $providers;
	}
	public function getweightrangelist()
	{
		 $providers = $this->api_model->getweightrangelist();		 
		 echo $providers;
	}
	public function getzonepricelist()
	{
		 $providers = $this->api_model->getzonepricelist();		 
		 echo $providers;
	}
	public function savezonepricelist()
	{  try
		{
			$input_data = json_decode(trim(file_get_contents('php://input')), true);
			$this->api_model->savezonepricelist($input_data);
			$providers = $this->api_model->getzonepricelist();		 
			echo $providers;
		} 
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
					$errormessage->status="Error";
					$errormessage->errorMessage="No zone price added";
					$json_response = json_encode($errormessage); 
					echo $json_response;  
		} 
	 } 
	 public function saveseolist()
	{  try
		{
			$input_data = json_decode(trim(file_get_contents('php://input')), true);
			$this->api_model->saveseolist($input_data);
			$providers = $this->api_model->getseolist();		 
			echo $providers;
		} 
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
					$errormessage->status="Error";
					$errormessage->errorMessage="No Trip added";
					$json_response = json_encode($errormessage); 
					echo $json_response;  
	}}
	public function saveairportlist()
	{  try
		{
			$input_data = json_decode(trim(file_get_contents('php://input')), true);
			$this->api_model->saveairportlist($input_data);
			$providers = $this->api_model->getcountries();		 
			echo $providers;
		} 
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
					$errormessage->status="Error";
					$errormessage->errorMessage="No Trip added";
					$json_response = json_encode($errormessage); 
					echo $json_response;  
		} 
	 } 
	 public function deleteairportlist($id)
	{  try
		{  
			$this->api_model->deleteairportlist($id);
			$providers = $this->api_model->getcountries();		 
			echo $providers;
		} 
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
					$errormessage->status="Error";
					$errormessage->errorMessage="No airport deleted";
					$json_response = json_encode($errormessage); 
					echo $json_response;  
		} 
	 }
	public function deleteseolist($id)
	{  try
		{  
			$this->api_model->deleteseolist($id);
			$providers = $this->api_model->getseolist();		 
			echo $providers;
		} 
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
					$errormessage->status="Error";
					$errormessage->errorMessage="No seo deleted";
					$json_response = json_encode($errormessage); 
					echo $json_response;  
		} 
	}
	public function searchhome()
	{    try
	     {
			$input_data = json_decode(trim(file_get_contents('php://input')), true);
			$this->api_model->searchhome($input_data); 
		 } 
		 catch (Exception $e)
		 { 
			echo 'Caught exception: ',  $e->getMessage(), "\n";
		 } 
	} 
     public function addtrip(){
	    try 
			{ 
				$input_data = json_decode(trim(file_get_contents('php://input')), true);  
				if(isset($input_data))
				{
					if($input_data["ticket"]==""){$input_data["ticket"]="";}else{
					$imageData = base64_decode($input_data["ticket"]);
					$source = imagecreatefromstring($imageData);
					$rotate = imagerotate($source,0, 0); 
					$new_name = rand(0,10000);
					$imageSave = imagejpeg($rotate,'./uploads/'.$new_name.'.jpg',100);
					imagedestroy($source);
					$input_data["ticket"]='/uploads/'.$new_name.'.jpg';  }
					$rand = rand(0,9999);  
					$today = date("Ymd"); 
					$input_data["processed_by"] =  $today.$rand; 
					$this->api_model->addtrip($input_data); 
				}
				else
				{
					$errormessage=new stdclass();
					$errormessage->status="Error";
					$errormessage->errorMessage="No Trip added";
					$json_response = json_encode($errormessage); 
					echo $json_response;  
			}  
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="No Trip added";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		}
	}
	function generateordernumber()
	{
		try 
			{ 
			$input_data = json_decode(trim(file_get_contents('php://input')), true);  
			if(isset($input_data)){ 
				$this->api_model->generateordernumber($input_data); 
			}
			else
			{
				$errormessage=new stdclass();
				$errormessage->status="Error";
				$errormessage->errorMessage="No Order Number Generated";
				$json_response = json_encode($errormessage); 
				echo $json_response;  
			}  
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="No Order Number Generated";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		}
	}
	function payordernumber(){
		try 
			{ 
			$input_data = json_decode(trim(file_get_contents('php://input')), true);  
			if(isset($input_data))
			{ 
				$this->api_model->payordernumber($input_data); 
			}
			else
			{
				$errormessage=new stdclass();
				$errormessage->status="Error";
				$errormessage->errorMessage="No Order Number Updated";
				$json_response = json_encode($errormessage); 
				echo $json_response;  
			}  
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="No Order Number Updated";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		}
	}
	public function getwalletstatement($userid=0)
	{ 
	   $this->api_model->getwalletstatement($userid); 
	}
	public function paymentrequestlist($userid=0)
	{ 
	   $this->api_model->paymentrequestlist($userid); 
	}
	public function createpaymentrequest()
	{    
		try 
		{ 
			$input_data = json_decode(trim(file_get_contents('php://input')), true);  
			if(isset($input_data))
			{ 
				$this->api_model->createpaymentrequest($input_data); 
			}else
			{
				$errormessage=new stdclass();
				$errormessage->status="Error";
				$errormessage->errorMessage="No Request added";
				$json_response = json_encode($errormessage); 
				echo $json_response;  
			}  
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="No Request added";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		}
	}
	public function addcontacts()
	{    try 
			{ 
			$input_data = json_decode(trim(file_get_contents('php://input')), true);  
			if(isset($input_data))
			{ 
				$this->api_model->addcontacts($input_data); 
			}else
			{
				$errormessage=new stdclass();
				$errormessage->status="Error";
				$errormessage->errorMessage="No contact added";
				$json_response = json_encode($errormessage); 
				echo $json_response;  
			}  
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="No contact added";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		}
	}
	public function contactslist()
	{    try 
		{ 
			 
				$this->api_model->contactslist();  
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="No Result Found";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		}
	}
	public function addparcel()
	{    try 
			{ 
			$input_data = json_decode(trim(file_get_contents('php://input')), true);  
			if(isset($input_data))
			{ 
				$this->api_model->addparcel($input_data); 
			}else
			{
				$errormessage=new stdclass();
				$errormessage->status="Error";
				$errormessage->errorMessage="No Trip added";
				$json_response = json_encode($errormessage); 
				echo $json_response;  
			}  
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="No Trip added";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		}
	}
	 public function updatetripticket()
	 {
		try 
		{ 
			$input_data = json_decode(trim(file_get_contents('php://input')), true);  
			if(isset($input_data)){
				if($input_data["ticket"]==""){$input_data["ticket"]="";}else{
				$imageData = base64_decode($input_data["ticket"]);
				$source = imagecreatefromstring($imageData);
				$rotate = imagerotate($source,0, 0); 
				$new_name = rand(0,10000);
				$imageSave = imagejpeg($rotate,'./uploads/'.$new_name.'.jpg',100);
				imagedestroy($source);
				$input_data["ticket"]='/uploads/'.$new_name.'.jpg';  } 
				$this->api_model->updatetripticket($input_data); 
			}else{
				$errormessage=new stdclass();
				$errormessage->status="Error";
				$errormessage->errorMessage="No Trip added";
				$json_response = json_encode($errormessage); 
				echo $json_response;  
			}  
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="No Trip added";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		}
	}
	public function updatetrip(){
		try 
			{ 
			$input_data = json_decode(trim(file_get_contents('php://input')), true);  
			if(isset($input_data))
			{ 
				$this->api_model->updatetrip($input_data); 
			}
			else
			{
				$errormessage=new stdclass();
				$errormessage->status="Error";
				$errormessage->errorMessage="No Trip added";
				$json_response = json_encode($errormessage); 
				echo $json_response;  
			}  
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="No Trip added";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		}
	}
	public function updateparcelweight(){
		try
		{ 
			$input_data = json_decode(trim(file_get_contents('php://input')), true);  
			if(isset($input_data))
			{ 
				$this->api_model->updateparcelweight($input_data); 
			}
			else
			{
				$errormessage=new stdclass();
				$errormessage->status="Error";
				$errormessage->errorMessage="No Parcel Updated";
				$json_response = json_encode($errormessage); 
				echo $json_response;  
			}  
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="No Parcel Updated";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		}
   }
	public function updateparcel(){
		try
		{ 
			$input_data = json_decode(trim(file_get_contents('php://input')), true);  
			if(isset($input_data))
			{ 
				$this->api_model->updateparcel($input_data); 
			}
			else
			{
				$errormessage=new stdclass();
				$errormessage->status="Error";
				$errormessage->errorMessage="No Parcel Updated";
				$json_response = json_encode($errormessage); 
				echo $json_response;  
			}  
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="No Parcel Updated";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		}
   }
   public function triplist($userID)
   { try 
		{ 
				$this->api_model->triplist($userID);  
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="NO record Found";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		}
	}
	public function allbookinglist()
    {   try 
		{ 
			$input_data = json_decode(trim(file_get_contents('php://input')), true);  
			if(isset($input_data))
			{ 
			$this->api_model->allbookinglist($input_data);  
			} 
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="NO record Found";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		}
	}
	public function receiverlist($userID)
	{
		try
		{ 
			$this->api_model->receiverlist($userID);  
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="NO record Found";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		}
	}
    public function parcellist($userID)
   {
		try
		{ 
			$this->api_model->parcellist($userID);  
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="NO record Found";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		}
	}
   public function triplistall()
   {    try
		{  $this->api_model->triplistall();  
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="NO record Found";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		}
   }
   public function parcellistall()
   {    try
		{ 	
			$input_data = json_decode(trim(file_get_contents('php://input')), true);  
			if(isset($input_data))
			{ 
			$this->api_model->parcellistall($input_data);  
			}
		}
		catch (Exception $e)
		{  $errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="NO record Found";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		}
	}
	public function getuserdetails($userID)
	{
		try 
		{  $this->api_model->getuserdetails($userID);  
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="NO record Found";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		}
	}
	public function canceltripslist($userID)
	{
		try 
		{ 
			$this->api_model->canceltripslist($userID);  
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="NO record Found";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		}
	} 
	public function cancelparcellist($userID)
	{
		try 
		{ 
			$this->api_model->cancelparcellist($userID);  
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="NO record Found";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		}
	} 
	public function senderbookingrequest($senderid,$tripid)
	{
		try  
		{ 	$this->api_model->senderbookingrequest($senderid,$tripid);  
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="NO record Found";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		}
	}
	public function refundedparcellist($userID)
	{
		try
		{ 
			$this->api_model->refundedparcellist($userID);  
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="NO record Found";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		}
	} 
	public function updatetripstatus()
	{	$input_data = json_decode(trim(file_get_contents('php://input')), true);
		$message = $this->api_model->update_trips_status($input_data);		 
		 echo $message; 
	} 
	public function usrupdatetripstatus()
	{	$input_data = json_decode(trim(file_get_contents('php://input')), true);
		$message = $this->api_model->usrupdate_trips_status($input_data);		 
		 echo $message; 
	} 
	public function updateParceltatus()
	{	$input_data = json_decode(trim(file_get_contents('php://input')), true);
		$message = $this->api_model->update_Parcel_status($input_data);		 
		echo $message; 
	}
	public function usrupdateParceltatus()
	{	$input_data = json_decode(trim(file_get_contents('php://input')), true);
		$message = $this->api_model->usrupdate_Parcel_status($input_data);		 
		echo $message; 
	}	
	 public function deletesingletrip()
	{	$input_data = json_decode(trim(file_get_contents('php://input')), true);
		$message = $this->api_model->delete_single_trip($input_data);		 
		echo $message; 
	} 
	//trips  ends here 
    public function changepassword()
	{	$input_data = json_decode(trim(file_get_contents('php://input')), true);
		$message = $this->api_model->change_password($input_data);		 
		echo $message; 
	} 
	public function verifyuser()
	{	 try
		{
			$input_data = json_decode(trim(file_get_contents('php://input')), true); 
			if(isset($input_data['code']) && isset($input_data['id']))
			{ 
				echo $this->api_model->verifyuser($input_data); 
			}
			else
			{
				$errormessage=new stdclass();
				$errormessage->status="Error";
				$errormessage->errorMessage="Invalid Request";
				echo json_encode($errormessage); 
			}				   
		} 
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="Incorrect email or password";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		} 
	}	
	public function registeruser()
	{   try 
		{
			$input_data = json_decode(trim(file_get_contents('php://input')), true); 
			if(isset($input_data['email']))
			{
			if($this->api_model->checkregisteruser($input_data['email']))
			{
				//if($this->api_model->checkregistermobile($input_data['mobilenumber']))
				//{
					echo $this->api_model->registeruser($input_data);
				//}
				//else
				//{
				//	$errormessage=new stdclass();
				//	$errormessage->status="Error";
				//	$errormessage->errorMessage="Mobile Already Registered";
				//	echo json_encode($errormessage); 
				//}
			}
			else
			{
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="Email ID Already Registered";
			echo json_encode($errormessage); 
			}
		}
		else
		{
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="Invalid Request";
			echo json_encode($errormessage);
		}				   
	} 
	catch (Exception $e)
	{ 
		$errormessage=new stdclass();
		$errormessage->status="Error";
		$errormessage->errorMessage="Incorrect email or password";
		$json_response = json_encode($errormessage); 
		echo $json_response;  
	} 
	}
	public function sendinvite()
	{	$input_data = json_decode(trim(file_get_contents('php://input')), true); 
		if(isset($input_data['email']))
		{ 
			 $this->api_model->sendinvite($input_data);  
		}
	}
	public function getuserslist()
	{  try 
		{
			$input_data = json_decode(trim(file_get_contents('php://input')), true);  
		    echo $this->api_model->getuserslist($input_data);
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="Incorrect email or password";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		} 
	}
	public function getloginuser()
	 {  try 
		{
			$input_data = json_decode(trim(file_get_contents('php://input')), true); 
			if(isset($input_data['email'])and isset($input_data['password'])){
				 echo $this->api_model->getuserlogin($input_data['email'],$input_data['password']);
			}
			else
			{ 	
				$errormessage=new stdclass();
				$errormessage->status="Error";
				$errormessage->errorMessage="Incorrect email or password";
				$json_response = json_encode($errormessage); 
				echo $json_response;   
			}  
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="Incorrect email or password";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		} 
	 }	
	public function forgetpassword()
	 {
	    try
		{ 
			$input_data = json_decode(trim(file_get_contents('php://input')), true);    
			if(isset($input_data['userName']))
			{ 
				$this->api_model->forgetpassword($input_data['userName']);
			}
			else
			{
				$errormessage=new stdclass();
				$errormessage->status="Error";
				$errormessage->errorMessage="Incorrect email";
				$json_response = json_encode($errormessage); 
				echo $json_response;  
			}  
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="Incorrect email ";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
			} 
	 }
	
public function updateuserdetails()
{
	try 
	{ 
	    $input_data = json_decode(trim(file_get_contents('php://input')), true); 
	    $this->api_model->updateuserdetails($input_data); 
	}
	catch (Exception $e)
	{ 
		$errormessage=new stdclass();
		$errormessage->status="Error";
		$errormessage->errorMessage="Incorrect email ";
		$json_response = json_encode($errormessage); 
		echo $json_response;  
	 }  
 }
}
?>