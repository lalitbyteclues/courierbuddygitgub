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
	public function gettopcountrytrips()
	{
		 $transporter = $this->api_model->gettopcountrytrips();		 
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
	 public function saveweightrangelist()
	{  try
		{
			$input_data = json_decode(trim(file_get_contents('php://input')), true);
			$this->api_model->saveweightrangelist($input_data);
			$providers = $this->api_model->getweightrangelist();		 
			echo $providers;
		} 
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
					$errormessage->status="Error";
					$errormessage->errorMessage="No Weight range added";
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
	public function deleteweightrangelist($id)
	{  try
		{  
			$this->api_model->deleteweightrangelist($id);
			$providers = $this->api_model->getweightrangelist();		 
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
					if(isset($input_data["ticket"])){
					if($input_data["ticket"]=="" || $input_data["ticket"]==null){$input_data["ticket"]="";}else{
					$imageData = base64_decode($input_data["ticket"]);
					$source = imagecreatefromstring($imageData);
					$rotate = imagerotate($source,0, 0); 
					$new_name = uniqid();
					$imageSave = imagejpeg($rotate,'./uploads/'.$new_name.'.jpg',100);
					imagedestroy($source);
					$input_data["ticket"]='/uploads/'.$new_name.'.jpg';  }}else{$input_data["ticket"]="";}
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
	public function deleteidentitytype()
	{    try 
			{ 
			$input_data = json_decode(trim(file_get_contents('php://input')), true);  
			if(isset($input_data))
			{  $this->api_model->deleteidentitytype($input_data); 
			}   
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="No Slider added";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		}
	}
	public function deletesliderimage()
	{    try 
			{ 
			$input_data = json_decode(trim(file_get_contents('php://input')), true);  
			if(isset($input_data))
			{  $this->api_model->deletesliderimage($input_data); 
			}   
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="No Slider added";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		}
	}
	public function addidentitytype()
	{    try 
			{ 
			$input_data = json_decode(trim(file_get_contents('php://input')), true);  
			if(isset($input_data))
			{  $this->api_model->addidentitytype($input_data); 
			}else
			{
				$errormessage=new stdclass();
				$errormessage->status="Error";
				$errormessage->errorMessage="No identity added";
				$json_response = json_encode($errormessage); 
				echo $json_response;  
			}  
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="No identity added";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		}
	}
	public function addsliderimage()
	{    try 
			{ 
			$input_data = json_decode(trim(file_get_contents('php://input')), true);  
			if(isset($input_data))
			{ 
			if (in_array($input_data["name"], array(".png", ".jpg", ".gif")))
			{
	
			}else{
				 $imageData = base64_decode($input_data["name"]);
						$source = imagecreatefromstring($imageData);
						$rotate = imagerotate($source,0, 0); 
						$new_name =uniqid();
						$imageSave = imagejpeg($rotate,'./uploads/'.$new_name.'.jpg',100);
						imagedestroy($source);
						$input_data["name"]='/uploads/'.$new_name.'.jpg';  
			}  
					$this->api_model->addsliderimage($input_data); 
			}else
			{
				$errormessage=new stdclass();
				$errormessage->status="Error";
				$errormessage->errorMessage="No Slider added";
				$json_response = json_encode($errormessage); 
				echo $json_response;  
			}  
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="No Slider added";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		}
	}
	public function sliderimagelist()
	{    try 
		{ 
		$this->api_model->sliderimagelist();  
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
	public function identitytypelist()
	{    try 
		{ 
		$this->api_model->identitytypelist();  
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
	public function addstatics()
	{    try 
			{ 
			$input_data = json_decode(trim(file_get_contents('php://input')), true);  
			if(isset($input_data))
			{ 
				$this->api_model->addstatics($input_data); 
			}else
			{
				$errormessage=new stdclass();
				$errormessage->status="Error";
				$errormessage->errorMessage="No statics added";
				$json_response = json_encode($errormessage); 
				echo $json_response;  
			}  
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="No statics added";
			$json_response = json_encode($errormessage); 
			echo $json_response;  
		}
	}
	public function addnewsletter()
	{    try 
			{ 
			$input_data = json_decode(trim(file_get_contents('php://input')), true);  
			if(isset($input_data))
			{ 
				$this->api_model->addnewsletter($input_data); 
			}else
			{
				$errormessage=new stdclass();
				$errormessage->status="Error";
				$errormessage->errorMessage="No statics added";
				$json_response = json_encode($errormessage); 
				echo $json_response;  
			}  
		}
		catch (Exception $e)
		{ 
			$errormessage=new stdclass();
			$errormessage->status="Error";
			$errormessage->errorMessage="No statics added";
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
		if(isset($input_data["parcelimageupdate"])){
				if($input_data["parcelimageupdate"]=="" || $input_data["parcelimageupdate"]==null){$input_data["parcelimageupdate"]="";}else{
					$imageData = base64_decode($input_data["parcelimageupdate"]);
					$source = imagecreatefromstring($imageData);
					$rotate = imagerotate($source,0, 0); 
					$new_name = uniqid();
					$imageSave = imagejpeg($rotate,'./uploads/'.$new_name.'.jpg',100);
					imagedestroy($source);
					$input_data["parcelimage"]='/uploads/'.$new_name.'.jpg';
					unset($input_data['parcelimageupdate']);
		}}
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
	public function calculateamount()
	{    try 
			{ 
			$input_data = json_decode(trim(file_get_contents('php://input')), true);  
			if(isset($input_data))
			{ 
				$this->api_model->calculateamount($input_data); 
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
				if(isset($input_data["ticket"]) || $input_data["ticket"]==null){
				if($input_data["ticket"]==""){$input_data["ticket"]="";}else{
				$imageData = base64_decode($input_data["ticket"]);
				$source = imagecreatefromstring($imageData);
				$rotate = imagerotate($source,0, 0); 
				$new_name = uniqid();
				$imageSave = imagejpeg($rotate,'./uploads/'.$new_name.'.jpg',100);
				imagedestroy($source);
				$input_data["ticket"]='/uploads/'.$new_name.'.jpg';  } 
				}else{
					$input_data["ticket"]="";
				}
				$this->api_model->updatetripticket($input_data); 
			}else{
				$errormessage=new stdclass();
				$errormessage->status="Error";
				$errormessage->errorMessage="No Trip Updated";
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
		if(isset($input_data["parcelimageupdate"])){ 
				if($input_data["parcelimageupdate"]=="" || $input_data["parcelimageupdate"]==null){$input_data["parcelimageupdate"]="";}else{
					$imageData = base64_decode($input_data["parcelimageupdate"]);
					$source = imagecreatefromstring($imageData);
					$rotate = imagerotate($source,0, 0); 
					$new_name = uniqid();
					$imageSave = imagejpeg($rotate,'./uploads/'.$new_name.'.jpg',100);
					imagedestroy($source);
					$input_data["parcelimage"]='/uploads/'.$new_name.'.jpg';
					unset($input_data['parcelimageupdate']);
		}}
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
   public function staticpageslist($id)
   {  try 
		{ 	$this->api_model->staticpageslist($id);  
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
   public function sendnewsletters()
   {  try 
		{ 
			$input_data = json_decode(trim(file_get_contents('php://input')), true);  
			if(isset($input_data))
			{ 
				$this->api_model->sendnewsletters($input_data);  
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
   public function newsletterslist()
   {  try 
		{ 	$this->api_model->newsletterslist();  
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
	public function alldeliveryreportslist()
    {   try 
		{ 
			$input_data = json_decode(trim(file_get_contents('php://input')), true);  
			if(isset($input_data))
			{ 
			$this->api_model->alldeliveryreportslist($input_data);  
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
	public function requestticketfromtransporter($tripid)
	{
		try 
		{ 
			$this->api_model->requestticketfromtransporter($tripid);  
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
	public function cancelparcelbytransporter()
	{	$input_data = json_decode(trim(file_get_contents('php://input')), true);
		$message = $this->api_model->cancel_parcel_by_transporter($input_data);		 
		 echo $message; 
	}
	public function cancelparcelbyadmin()
	{	$input_data = json_decode(trim(file_get_contents('php://input')), true);
		$message = $this->api_model->cancel_parcel_by_admin($input_data);		 
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
			if(isset($input_data['facebookid']))
			{ 
				echo $this->api_model->getuserloginfacebook($input_data); 
			}else
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
		if(isset($input_data["identityimageupdate"])){ 
		if($input_data["identityimageupdate"]=="" || $input_data["identityimageupdate"]==null){$input_data["identityimageupdate"]="";}else{
					$imageData = base64_decode($input_data["identityimageupdate"]);
					$source = imagecreatefromstring($imageData);
					$rotate = imagerotate($source,0, 0); 
					$new_name = uniqid();
					$imageSave = imagejpeg($rotate,'./uploads/'.$new_name.'.jpg',100);
					imagedestroy($source);
					$input_data["identityimage"]='/uploads/'.$new_name.'.jpg';
					unset($input_data['identityimageupdate']);
					}}
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
 //Chat methods
 public function chatsubmit()
{
	$this->form_validation->set_rules('channelid', '<b>channelid</b>', 'trim|required|max_length[100]');
	$this->form_validation->set_rules('messageuserid', '<b>messageuserid</b>', 'trim|required|max_length[100]');  
	$arr['channelid'] = $this->input->post('channelid');
	$arr['messageuserid'] = $this->input->post('messageuserid'); 
	if(isset($this->input->post["chatimageupdate"])){
			if($this->input->post["parcelimageupdate"]=="" || $this->input->post["parcelimageupdate"]==null){ }else{
				$imageData = base64_decode($this->input->post["parcelimageupdate"]);
				$source = imagecreatefromstring($imageData);
				$rotate = imagerotate($source,0, 0); 
				$new_name = uniqid();
				$imageSave = imagejpeg($rotate,'./uploads/'.$new_name.'.jpg',100);
				imagedestroy($source);
				$arr["chatimage"]='/uploads/'.$new_name.'.jpg'; 
	}}
	$arr['message'] = $this->input->post('message');
	if ($this->form_validation->run() == FALSE) {
		$arr['success'] = false;
		$arr['notif'] = '<div class="mainbox col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 alert alert-danger alert-dismissable"><i class="fa fa-ban"></i><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' . validation_errors() . '</div>';
	} else {
		 $query=$this->db->query("	SELECT  a.`parcelid`,b.status FROM `cms_chatchannel` a inner join cms_parcels b on a.parcelid=b.id WHERE a.id=".$arr['channelid']." ");
	   $data=$query->result();
	if($data[0]->status==5){
		$arr['success'] = false;
		$arr['notif'] = '<div class="mainbox col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 alert alert-danger alert-dismissable"><i class="fa fa-ban"></i><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>Not Valid Parcel Delivered</div>';
	}
	else
	{
		$this->db->insert('chatmessages',$arr); 
 		 $detail =$this->db->query("select a.id,a.channelid,message,chatimage,a.created,a.readstatus,a.messageuserid,u.name as username,cchannel.parcelid,cchannel.senderid,cchannel.transporterid,cchannel.receiverid from cms_chatmessages a INNER JOIN cms_chatchannel cchannel on a.channelid=cchannel.id INNER JOIN cms_users u on a.messageuserid=u.id where a.id=".$this->db->insert_id()."")->result()[0];
		 $arr['channelid'] = $detail->channelid;
		 $arr['parcelid'] = $detail->parcelid;
		 $arr['senderid'] = $detail->senderid;
		 $arr['transporterid'] = $detail->transporterid;
		 $arr['receiverid'] = $detail->receiverid;
		$arr['username'] = $detail->username;
		$arr['message'] = $detail->message;
		$arr['message'] = $detail->chatimage;
		$arr['created'] = $detail->created;
		$arr['id'] = $detail->messageuserid;
		$arr['new_count_message'] = $this->db->where('readstatus',0)->count_all_results('chatmessages');
		$arr['success'] = true;
		$arr['notif'] = '<div class="mainbox col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 alert alert-success" role="alert"> <i class="fa fa-check"></i><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>Message sent ...</div>';
	}}
	echo json_encode($arr);
 }
 public function getchannelmessageslist($channelid)
 {   
	 $query=$this->db->query("select a.messageuserid as id,a.channelid,message,a.chatimage,a.created,a.readstatus,u.name as username,cchannel.parcelid from cms_chatmessages a INNER JOIN cms_chatchannel cchannel on a.channelid=cchannel.id INNER JOIN cms_users u on a.messageuserid=u.id where channelid=".$channelid." ");
	$data['message']=$query->result();
	$query=$this->db->query("SELECT  trans.name transportername,send.name sendername,recv.name receivername FROM  `cms_chatchannel` ch inner join cms_users trans on  ch.`transporterid`=trans.id inner join cms_users send on  ch.`senderid`=send.id inner join cms_users recv on  ch.`receiverid`=recv.id where ch.id=".$channelid."");
	$data['users']=$query->result();
	$sql = "update cms_chatmessages set readstatus=1 where channelid=".$channelid; 
	$this->db->query($sql);
	print_r(json_encode($data));
 }
 public function getunreadchannellist($userid)
 { 
    $data['message'] =$this->db->query("select cc.*,cm.messagecount,cp.Parcelid as Parcelmcbid from cms_chatchannel cc inner join (SELECT channelid,count(message)messagecount FROM `cms_chatmessages` WHERE `readstatus`=0 group by channelid)cm on cc.id=cm.channelid left join cms_parcels cp on cc.`parcelid`=cp.id where (cc.`receiverid`=".$userid."  or  cc.`transporterid`=".$userid."  or  cc.`senderid`=".$userid." )and cc.isactive=1");
	print_r(json_encode($data['message']->result()));
 }
}
?>