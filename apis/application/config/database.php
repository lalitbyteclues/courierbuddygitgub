<?php
defined('BASEPATH') OR exit('No direct script access allowed');
$active_group = 'default';
$query_builder = TRUE;

$db['default'] = array('dsn'	=> ''
,'hostname' => 'localhost'
,'username' => 'mycourie_buddy','password' => 'Interior@123'
,'database' => 'mycourie_prod'
,'dbdriver' => 'mysqli'
,'dbprefix' => 'cms_'
,'pconnect' => FALSE,
'db_debug' => (ENVIRONMENT !== 'production')
,'cache_on' => FALSE,'cachedir' => ''
,'char_set' => 'utf8'
,'dbcollat' => 'utf8_general_ci'
,'swap_pre' => ''
	,'encrypt' => FALSE
	,'compress' => FALSE
	,'stricton' => FALSE
	,	'failover' => array()
	,'save_queries' => TRUE
);
