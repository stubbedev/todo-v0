<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
$client_forward = $_SERVER['HTTP_X_FORWARDED_FOR'];
$user_agent = $_SERVER['HTTP_USER_AGENT'];
$user_id = $_GET['user_id'];
function getOS() { 

    global $user_agent;

    $os_platform  = "Unknown OS Platform";

    $os_array     = array(
                          '/windows nt 10/i'      =>  'Windows 10',
                          '/windows nt 6.3/i'     =>  'Windows 8.1',
                          '/windows nt 6.2/i'     =>  'Windows 8',
                          '/windows nt 6.1/i'     =>  'Windows 7',
                          '/windows nt 6.0/i'     =>  'Windows Vista',
                          '/windows nt 5.2/i'     =>  'Windows Server 2003/XP x64',
                          '/windows nt 5.1/i'     =>  'Windows XP',
                          '/windows xp/i'         =>  'Windows XP',
                          '/windows nt 5.0/i'     =>  'Windows 2000',
                          '/windows me/i'         =>  'Windows ME',
                          '/win98/i'              =>  'Windows 98',
                          '/win95/i'              =>  'Windows 95',
                          '/win16/i'              =>  'Windows 3.11',
                          '/macintosh|mac os x/i' =>  'Mac OS X',
                          '/mac_powerpc/i'        =>  'Mac OS 9',
                          '/linux/i'              =>  'Linux',
                          '/ubuntu/i'             =>  'Ubuntu',
                          '/iphone/i'             =>  'iPhone',
                          '/ipod/i'               =>  'iPod',
                          '/ipad/i'               =>  'iPad',
                          '/android/i'            =>  'Android',
                          '/blackberry/i'         =>  'BlackBerry',
                          '/webos/i'              =>  'Mobile'
                    );

    foreach ($os_array as $regex => $value)
        if (preg_match($regex, $user_agent))
            $os_platform = $value;

    return $os_platform;
}

function getBrowser() {

    global $user_agent;

    $browser        = "Unknown Browser";

    $browser_array = array(
                            '/msie/i'      => 'Internet Explorer',
                            '/firefox/i'   => 'Firefox',
                            '/safari/i'    => 'Safari',
                            '/chrome/i'    => 'Chrome',
                            '/edge/i'      => 'Edge',
                            '/opera/i'     => 'Opera',
                            '/netscape/i'  => 'Netscape',
                            '/maxthon/i'   => 'Maxthon',
                            '/konqueror/i' => 'Konqueror',
                            '/mobile/i'    => 'Handheld Browser'
                     );

    foreach ($browser_array as $regex => $value)
        if (preg_match($regex, $user_agent))
            $browser = $value;

    return $browser;
}

/*
$client_os        = getOS();
$client_browser   = getBrowser();
$client_info = $client_os . " " .$client_browser . " " . (string)$client_forward;
*/
$client_forward = hash('sha256', $client_forward);
$client_hash = $user_id.(string)$client_forward;

function get_request_data(){
    $client_request_body = json_decode(file_get_contents('php://input'), true);
    return $client_request_body;
}

function get_client_data($client_hash){
    $client_data = (file_exists('./users/' . $client_hash . '.json')) ? file_get_contents('./users/' . $client_hash . '.json') : '{}';
    return $client_data;
}

function update_client_data($client_hash, $client_data){
    $f=fopen('./users/' . $client_hash . '.json','w');
    fwrite($f,  $client_data);
    fclose($f);
}

function delete_client_data($client_hash){
    unlink('./users/' . $client_hash . '.json');
}

function verify_client_info($client_hash){
    $client_info = file_exists('./users/' . $client_hash . '.json') ? true : false;
    return $client_info;
}

function userListApi($client_hash){
    $request_method = $_SERVER['REQUEST_METHOD'];
    switch($request_method){
        case 'POST':
            $client_data = json_encode(get_request_data());
            update_client_data($client_hash, $client_data);
            echo $client_data;
            break;
        case 'GET':
            if(verify_client_info($client_hash)){
                $client_data = get_client_data($client_hash);
                $client_data = json_decode($client_data, true);
                echo json_encode($client_data);
            } else {
                echo '{"items":false}';
            }
            break;
        case 'DELETE':
            delete_client_data($client_hash);
            echo '{"message": "User deleted"}';
            break;
    }
}
userListApi($client_hash);
?>