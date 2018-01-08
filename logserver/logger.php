<?php

if(isset($_POST['filename'])){
	$filename = $_POST['filename'];
	echo 'Filename: ' . $filename."\n";
	$myfile = fopen($filename . ".txt", "a") or die("Unable to open file!");
	 // $myfile = file_put_contents($filename . ".txt", $txt.PHP_EOL , FILE_APPEND | LOCK_EX);

	
	if(isset($_POST['log'])){
		$log = "LOG - ".date("Y-m-d H:i:s")." - ".$_POST['log'].event . "- content data: ".$_POST['log'].content ;
		fwrite($myfile, $log."\n");
	}else if(isset($_POST['error'])){
		$log = "ERROR - ".date("Y-m-d H:i:s")." - ".$_POST['error'];
		fwrite($myfile, $log."\n");
	}
	fclose($myfile);	
}

?>
