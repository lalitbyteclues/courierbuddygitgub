<?php

function CallAPI($method, $url, $data = false)
{   $curl = curl_init(); 
    switch ($method)
    { case "POST":
            curl_setopt($curl, CURLOPT_POST, 1); 
            if ($data)
                curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
            break;
        case "PUT":
            curl_setopt($curl, CURLOPT_PUT, 1);
            break;
        default:
            if ($data)
                $url = sprintf("%s?%s", $url, http_build_query($data));
    }

    // Optional Authentication:
    curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
    curl_setopt($curl, CURLOPT_USERPWD, "username:password");

    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

    $result = curl_exec($curl);

    curl_close($curl); 
    return $result;
} 
$status=$_POST["status"];
$firstname=$_POST["firstname"];
$amount=$_POST["amount"];
$txnid=$_POST["txnid"];
$posted_hash=$_POST["hash"];
$key=$_POST["key"];
$productinfo=$_POST["productinfo"];
$email=$_POST["email"];
$salt="lj0ofR1er9";

If (isset($_POST["additionalCharges"])) {
       $additionalCharges=$_POST["additionalCharges"];
        $retHashSeq = $additionalCharges.'|'.$salt.'|'.$status.'|||||||||||'.$email.'|'.$firstname.'|'.$productinfo.'|'.$amount.'|'.$txnid.'|'.$key;
        
                  }
	else {	  

        $retHashSeq = $salt.'|'.$status.'|||||||||||'.$email.'|'.$firstname.'|'.$productinfo.'|'.$amount.'|'.$txnid.'|'.$key;

         }
		 $hash = hash("sha512", $retHashSeq);
		 
       if ($hash != $posted_hash) {
	       echo "Invalid Transaction. Please try again";
		   }
	   else {
           	   
         
		  //$_POST['payuMoneyId']
$data1=array("txnid"=> $_POST["txnid"],"payuMoneyId" => $_POST["payuMoneyId"],);
$post=json_encode($data1);
$response=CallAPI("POST","https://www.mycourierbuddy.com/apis/index.php/api/payordernumber",$post);
if(isset($response)){ 
header( "Location:https://www.mycourierbuddy.com/viewparcel/".json_decode($response)->response );
}
           
		   }         
?>	