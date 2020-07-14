<?php

$fields = array('name','set:about');

print_r($_POST);

if(fullSet($fields)){

	$data = array();
	$grouper = array();

	foreach ($fields as $f){
		if (preg_match('set:(\w+)', $f, $grouper, 'g')){
			$data[ $grouper[1] ] = array();
		}
		$data[ $f ] = pv($f);
	}

	$encoded = json_encode($data);

	$out = json_decode(file_get_contents('members.json'));

	foreach ($data as $d) {
		in_array($d, $out) ? array_rep
	}

}

function fullSet($vars){
	foreach ($vars as $v) {
		if(!isset($_POST[ $v ])){
			return false;
		}
	}

	return true;
}

function pv($v){
	return (isset($_POST[ $v ])) ? $_POST[ $v ] : -1;
}

?>