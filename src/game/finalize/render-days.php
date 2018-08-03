<?php

error_reporting(E_ALL | E_NOTICE);

function zf($n){
	return strlen($n) > 1 ? $n : '0'.$n;
}


$home = '../../GIT/threegoldenhairs/src/game/server/';
$days = [$home.'level 1 - explore the lands/story level 1.txt',
	$home.'level 2 - climb the mountain/story level 2.txt',
	$home.'level 3 - revive the dead/story level 3.txt',
	$home.'level 4 - day of days/the end.txt'];
	
$names = ['Explore the Lands', 'Climb the Mountain', 'Revive the Dead', 'Day of Days'];
$d = 1;
$txt = '';
foreach($days as $day){
	$hours = explode('###', trim(file_get_contents($day)));
	array_shift($hours);
	$h = 1;
	$txt .= sprintf("<h1>Day %s - %s</h1>", $d, $names[$d-1]);
	foreach($hours as $hour){
		$txt .= "<p>";
		$minutes = explode('#', trim($hour));
		
		$head = array_shift($minutes);
		$txt .= sprintf("<b>Day %s, %s:00 %s</b><br/>", $d, zf($h), $head);
		$m = 0;
		foreach($minutes as $minute){
			$minute = trim($minute);
			$m ++;
			$txt .= sprintf("%s-%s:%s %s<br/>", $d, zf($h), zf($m), $minute);
		}
		$h ++;
		$txt .= '</p>';
	}
	$d++;
}
echo $txt;
// echo is_dir($level1) ? 1 : 0;

exit();
phpinfo();
