<?php 

require_once("../../db/db_connection/connect_to_db.php");
require_once("../functions/check_JSON_validity.php");


// php://input is a readonly stream which allows us to read raw data from the request body - it returnes all the raw data after the HTTP headers of the request no matter the content type
// file_get_contents() reads file into a string, but in this case it parses the raw data from the stream into the string
$data = file_get_contents("php://input");

$user_data = null; // used to store the decoded JSON string $data

// check if the JSON is correct
if (strlen($data) > 0 && check_json($data)) {
    $user_data = json_decode($data, true);
}
else {
    http_response_code(400);
    exit(json_encode(["status" => "ERROR", "message" => "Невалиден JSON формат!"]));
}

$qr_generated_time = date("Y-m-d H:i:s", $user_data["qr_generated_time"]);

$email = $user_data["email"];

try {
    $db = new DB();
    $connection = $db->getConnection();
    
    $search = "SELECT * 
               FROM users 
               WHERE email = :email";

    $stmt = $connection->prepare($search);
    $stmt->execute(["email" => $email]);

    if ($stmt->rowCount() != 1) {
        http_response_code(400);
        exit(json_encode(["status" => "ERROR", "message" => "Несъответствие с базата данни!"]));
    }


} catch (PDOException $e) {
    http_response_code(500);
    return json_encode(["status" => "ERROR", "message" => "Неочаквана грешка настъпи в сървъра!"]);
}

try {
    $insert = "UPDATE users
                SET qr_generated_time = :qr_generated_time
                WHERE email = :email" ;
    

    $stmt = $connection->prepare($insert);
    
    // if the execution passed with no failure, then create the user session
    if ($stmt->execute(["qr_generated_time" => $qr_generated_time ,"email" => $email])) {
        
        http_response_code(200);
        exit(json_encode(["status" => "SUCCESS", "message" => "Успешно обновен QR код!", "qr_generated_time" => $qr_generated_time]));
    }
    else {
        http_response_code(500);
        exit(json_encode(["status" => "ERROR", "message" => "Неочаквана грешка настъпи в сървъра!"]));
    }
} catch (PDOException $e) {
    http_response_code(500);
    exit(json_encode(["status" => "ERROR", "message" => "Неочаквана грешка настъпи в сървъра!"]));
}


?>