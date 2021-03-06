<?php
// Merchant key here as provided by Payu
$MERCHANT_KEY = "1SKAsxey";
// Merchant Salt as provided by Payu
$SALT = "lj0ofR1er9";
// End point - change to https://test.payu.in  for LIVE mode
//$PAYU_BASE_URL = "https://secure.payu.in";
$PAYU_BASE_URL = "https://secure.payu.in";
$action = '';
$posted = array();
if(!empty($_POST)) {
    //print_r($_POST);
  foreach($_POST as $key => $value) {    
    $posted[$key] = $value; 
	
  }
}
$formError = 0;
if(empty($posted['txnid'])) {
  // Generate random transaction id
  $txnid = substr(hash('sha256', mt_rand() . microtime()), 0, 20);
} else {
  $txnid = $posted['txnid'];
}
$hash = '';
// Hash Sequence
$hashSequence = "key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10";
if(empty($posted['hash']) && sizeof($posted) > 0) {
  if(
          empty($posted['key'])
          || empty($posted['txnid'])
          || empty($posted['amount'])
          || empty($posted['firstname'])
          || empty($posted['email'])
          || empty($posted['phone'])
          || empty($posted['productinfo'])
          || empty($posted['surl'])
          || empty($posted['furl'])
		  || empty($posted['service_provider'])
  ) {
    $formError = 1;
  } else {
    //$posted['productinfo'] = json_encode(json_decode('[{"name":"tutionfee","description":"","value":"500","isRequired":"false"},{"name":"developmentfee","description":"monthly tution fee","value":"1500","isRequired":"false"}]'));
	$hashVarsSeq = explode('|', $hashSequence);
    $hash_string = '';	
	foreach($hashVarsSeq as $hash_var) {
      $hash_string .= isset($posted[$hash_var]) ? $posted[$hash_var] : '';
      $hash_string .= '|';
    }
    $hash_string .= $SALT;
    $hash = strtolower(hash('sha512', $hash_string));
    $action = $PAYU_BASE_URL . '/_payment';
  }
} elseif(!empty($posted['hash'])) {
  $hash = $posted['hash'];
  $action = $PAYU_BASE_URL . '/_payment';
}
?>
<html>
  <head>
     <title>Processing ...</title>
	    <script src="/libs/jquery/dist/jquery.min.js" type="text/javascript"></script>
  <script>
    var hash = '<?php echo $hash ?>';
    function submitPayuForm() {
      if(hash == '') {
        return;
      }
      var payuForm = document.forms.payuForm;
      payuForm.submit();
    }
  </script>
  </head>
  <body  oncontextmenu="return false" onselectstart="return false" ondragstart="return false" onLoad="submitPayuForm()">
     <?php if($formError) { ?>
	 
      <br/>
      <br/>
    <?php } ?>
    <form action="<?php echo $action; ?>" method="post"  id="payment"  name="payuForm">
      <input type="hidden" name="key" value="<?php echo $MERCHANT_KEY ?>" />
      <input type="hidden" name="hash" value="<?php echo $hash ?>"/>
      <input type="hidden" name="txnid" value="<?php echo $txnid ?>" /> 
     <input type="hidden"  name="amount" value="<?php echo (empty($posted['amount'])) ? '' : $posted['amount'] ?>" />
     <input type="hidden"  name="firstname" id="firstname" value="<?php echo (empty($posted['firstname'])) ? '' : $posted['firstname']; ?>" />
	 <input type="hidden"  name="email" id="email" value="<?php echo (empty($posted['email'])) ? '' : $posted['email']; ?>" />
	 <input type="hidden"  name="phone" value="<?php echo (empty($posted['phone'])) ? '' : $posted['phone']; ?>" />
	 <textarea style="display:none;" name="productinfo"><?php echo (empty($posted['productinfo'])) ? '' : $posted['productinfo'] ?></textarea>
	 <input type="hidden"  name="surl" value="<?php echo (empty($posted['surl'])) ? '' : $posted['surl'] ?>" size="64" />
	 <input type="hidden"  name="furl" value="<?php echo (empty($posted['furl'])) ? '' : $posted['furl'] ?>" size="64" /> 
	 <input type="hidden" name="service_provider" value="payu_paisa" size="64" /> 
          <?php if(!$hash) { ?>
            <td colspan="4"><input style="display:none;" type="submit" value="Submit" /></td>
          <?php } ?>
         
    </form>
	<script language="JavaScript" type="text/javascript">
        $('#payment').submit();
    </script>
  </body>
</html>
