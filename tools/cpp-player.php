<?php

header('Content-Type: application/json');
//$data = array('pos'=>1, 'quad'=>0, 'rot'=>0);

$cmd = 'C:\www\tork5\cpp\tork5\x64\Release\tork5.exe ' . $_GET['p1'] . ' ' . $_GET['p2'] . ' ' . $_GET['turn'];
exec($cmd, $output);
print_r ($output);



echo json_encode($data);