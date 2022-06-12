<?php

require_once("../../db/db_connection/connect_to_db.php");
require_once("../functions/check_JSON_validity.php");
require_once("../functions/login.php");

// php://input is a readonly stream which allows us to read raw data from the request body - it returnes all the raw data after the HTTP headers of the request no matter the content type
// file_get_contents() reads file into a string, but in this case it parses the raw data from the stream into the string
$data = file_get_contents("php://input");
$user_data; // this will be used for the decoded data (JSON decoded)

// check if the input JSON is correct
if (strlen($data) > 0 && check_json($data)) {
    $user_data = json_decode($data, true);
}
else {
    http_response_code(400);
    exit(json_encode(["status" => "ERROR", "message" => "Невалиден JSON формат!"]));
}

session_start(); // we need to use $_SESSION variable
// if there is no session set but there are cookies set
if (!isset($_SESSION["user"]) && isset($_COOKIE["email"]) && isset($_COOKIE["password"])) {
    $user = ["email" => $_COOKIE["email"], "password" => $_COOKIE["password"]]; // create an associative array which contains the user email and password, saved on the cookies (we shall use this array to create a session)
    $response = login($user); // create the session for the user

    if ($response["status"] == "ERROR") { // if there was an error creating the session
        http_response_code($response["code"]);
        exit(json_encode(["status" => $response["status"], "message" => $response["message"]]));
    }
}
// if there is no session and at least one cookie is missing return an error
else if (!isset($_SESSION["user"]) && (!isset($_COOKIE["email"]) || !isset($_COOKIE["password"]))) {
    http_response_code(401);
    exit(json_encode(["status" => "ERROR", "message" => "Потребителят не е автентикиран!"]));
}

$user_type = $_SESSION["user"]["user_type"]; // get the user's type

$date = $user_data["date"]; // get the provided date

if (strlen($date) == 0) { // check whether any date was provided
    http_response_code(400);
    exit(json_encode(["status" => "ERROR", "message" => "Не е въведена дата!"]));
}

$date = date("Y-m-d", strtotime($date)); // converts the date from input to YYYY-MM-DD

// check if the interval is correct (that one case)
if ($user_data["start-time"] >= $user_data["end-time"]) {
    http_response_code(400);
    exit(json_encode(["status" => "ERROR", "message" => "Невалиден времеви интервал!"]));
}

$start_time = $user_data["start-time"];

$format = 'H'; // defines the format from the input
$formatted_date = DateTime::createFromFormat($format, $start_time); // creates Date Time object from the input start time which is needed for date_format()
$formatted_start_time = date_format($formatted_date,"H:i:s"); // converts the input start time to HH:MM:SS

$end_time = $user_data["end-time"];

$formatted_date = DateTime::createFromFormat($format, $end_time);
$formatted_end_time = date_format($formatted_date,"H:i:s");

// establish a connection to the database
try {
    $db = new DB();
    $connection = $db->getConnection();
}
catch (PDOException $e) {
    http_response_code(500);
    exit(json_encode(["status" => "ERROR", "message" => "Неуспешна връзка към базата данни!"]));
}
    
try {
    $sql = "SELECT s.code, s.zone, s.lecturer_only
    FROM reservations r JOIN slots s ON r.slot_id = s.id
    WHERE r.date LIKE :date AND
    (
    (r.start_time < :start_time AND r.end_time > :start_time) OR
    (r.start_time >= :start_time AND r.end_time <= :end_time) OR
    (r.start_time < :end_time AND r.end_time > :end_time) OR
    (r.start_time < :start_time AND r.end_time > :end_time)
    );";

    $stmt = $connection->prepare($sql);
    $stmt->execute(["date" => $date, "start_time" => $formatted_start_time, "end_time" => $formatted_end_time]);

    $slots_taken = array(); // creates an empty array for taken slots (code,zone,lecturer_only)
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        if ($user_type == "Хоноруван преподавател" && $row["lecturer_only"] == 1) { // continue because we are gathering taken slots only (not unavailable)
            continue;
        }
        array_push($slots_taken, $row); // array of associative arrays 
    }
} catch(PDOException $e) {
    http_response_code(500);
    exit(json_encode(["status" => "ERROR", "message" => "Неочаквана грешка настъпи в сървъра!"]));
}

$unavailable_slots = array(); // creates an empty array

if ($user_type == "Хоноруван преподавател") { // if the user is "Хоноруван преподавател" his unavailable slots are only A0-A6
    try {
        $sql = "SELECT code, zone
                FROM slots
                WHERE lecturer_only = TRUE;";

        $stmt = $connection->prepare($sql);
        $stmt->execute();

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($unavailable_slots, $row); // push every unavaliable slot in the array
        }
    }
    catch (PDOException $e) {
        http_response_code(500);
        exit(json_encode(["status" => "ERROR", "message" => "Неочаквана грешка настъпи в сървъра!"]));
    }
}

http_response_code(200);
exit(json_encode(["status" => "SUCCESS", "taken_slots" => $slots_taken, "unavailable_slots" => $unavailable_slots]));

?>