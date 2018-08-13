<?php 
error_reporting(E_ALL | E_NOTICE);
set_time_limit(0);
ignore_user_abort(true);

require(dirname(__FILE__) . '/html2pdf/vendor/autoload.php');
require(dirname(__FILE__) . '/html2pdf/src/Html2Pdf.php');

function convert($source, $dest){
	$html2pdf = new \Spipu\Html2Pdf\Html2Pdf('P', 'A4', 'en');
	$html2pdf->writeHTML($source);
	$f = fopen($dest, 'w');
	fwrite($f, $html2pdf->output(null, 'S'));
}

function zf($n){
	return strlen($n) > 1 ? $n : '0'.$n;
}

define('PAGE', '+++');
define('HOUR', '###');
define('MINUTE', '#');

$nl = "<br />\n";
$pages = array();
$page = '';

$home = '../../GIT/threegoldenhairs2/src/game/finalize/';
$days = [$home.'day-1.txt',
	$home.'day-2.txt',
	$home.'day-3.txt'];
	
$img = $home.'img/';

define('PO', '<page backtop="7mm" backbottom="7mm" backleft="10mm" backright="10mm"><page_header>%s</page_header><page_footer>%s</page_footer>%s</page> ');

function page($ckg){
	global $pages;
	if(strpos($ckg, PAGE) !== false){
		$ckg = str_replace(PAGE, '', $ckg);
		$pages[] = '';
	}
	$pages[count($pages)-1] .=  $ckg;
	
}

function day($day, $d){
	$hours = explode(HOUR, trim($day));
	array_shift($hours);
	hours($hours, $d);
}


function hours($hours, $d){
	global $nl;
	$h = 1;
	foreach($hours as $hour){
		$minutes = explode(MINUTE, $hour);
		$head = array_shift($minutes); 
		
		page( sprintf("<b>Day %s, %s:00 %s</b>$nl", $d, zf($h), trim($head)));
		minutes($minutes, $h);
		//$p .= $nl . $nl;
		//page($p);
		$h ++;
	}
	
	// $pages[count($pages)-1] .= $txt;
}

function minutes($minutes, $h){
	global $page;
	$m = 1;
	foreach($minutes as $minute){
		$minute = preg_replace(
			'/.*\{(.*)\[\[(.*)\]\]\}/mi',
			'<div><img style="width: 50%; height: auto;" src="img/$2" /><br/><i style="color: #a0a0a0; font-size: .8em;">$1</i></div>',
			$minute);
		$minute = preg_replace(
			'/.*\{(.*)\}/mi',
			'<i style="color: #a0a0a0; font-size: .8em;">$1</i>',
			$minute);
		$m ++;
		page( sprintf("%s:%s %s<br/>", zf($h), zf($m), trim($minute)));
	}
}
	


function processFile($day, $d){
	global $pages;
	$d ++;
	$names = ['Explore the Lands', 'Climb the Mountain', 'Revive the Dead', 'Day of Days'];
	$pages[] = "<h1>Day $d: " . $names[$d-1] . "</h1>\n";
	day(file_get_contents($day) , $d);
	//if($page != '') $pages[] = $page;

	foreach($pages as $i => $page){
		$pages[$i] = sprintf('<page backtop="10mm" backbottom="10mm" backleft="20mm" backright="10mm"><page_header>%s</page_header><page_footer>%s</page_footer>%s</page>',
	'', '', $page);
	}
	$txt = implode("\n\n", $pages);
	//echo $txt; exit();
	convert($txt, $names[$d - 1] . ".pdf");
}

$txt = '';
if(isset($_GET['d'])){
	$d = intval($_GET['d']);
	$d = max(min($d, 3), $d);
	$txt = processFile($days[$d-1], $d-1);
}else{
	foreach($days as $d => $day){
		$txt .= processFile($day, $d);
		break;
	}
}







