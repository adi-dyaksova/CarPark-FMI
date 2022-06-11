<?php 

require_once("../../db/db_connection/connect_to_db.php");
require_once("../functions/check_JSON_validity.php");

// php://input is a readonly stream which allows us to read raw data from the request body - it returnes all the raw data after the HTTP headers of the request no matter the content type
// file_get_contents() reads file into a string, but in this case it parses the raw data from the stream into the string

$data = file_get_contents("php://input");

$user_data; // used to store the decoded JSON string $data
// check if the JSON is correct
if (strlen($data) > 0 && check_json($data)) {
    $user_data = json_decode($data, true);
}
else {
    http_response_code(400);
    exit(json_encode(["status" => "ERROR", "message" => "Invalid JSON format!"]));
}

$firstname = $user_data["firstname"];
$lastname = $user_data["lastname"]; 
$sex = $user_data["sex"]; 
$car_number =  $user_data["car_number"];
$email = $user_data["email-register"]; 
$password = $user_data["password-register"]; 
$repeated_password = $user_data["repeat_password"]; 
$hashed_password = password_hash($password, PASSWORD_DEFAULT); // hash the input password
$user_type = $user_data["user_type"]; 

// check if the user has repeated the password correctly
if ($password != $repeated_password) {
    http_response_code(400);
    exit(json_encode(["status" => "ERROR", "message" => "Passwords do not match!"]));
}

try {
    $db = new DB();
    $connection = $db->getConnection();
    
    $search = "SELECT * 
               FROM users 
               WHERE email = :email";

    $stmt = $connection->prepare($search);
    $stmt->execute(["email" => $email]);

    // if a user with the inputted email already exist, then we can't create a new account
    if ($stmt->rowCount() != 0) {
        http_response_code(400);
        exit(json_encode(["status" => "ERROR", "message" => "There is already user with this email!"]));
    }
} catch (PDOException $e) {
    http_response_code(500);
    return json_encode(["status" => "ERROR", "message" => "Unexpected server error!"]);
}

try {
    $insert = "INSERT INTO users (firstname, lastname, sex, email, password, user_type, car_number)
                      VALUES (:firstname, :lastname, :sex, :email, :password, :user_type, :car_number)";

    $stmt = $connection->prepare($insert);
    
    // if the execution passed with no failure, then create the user session
    if ($stmt->execute(["firstname" => $firstname, "lastname" => $lastname, "sex" => $sex, "email" => $email, "password" => $hashed_password, "user_type" => $user_type, "car_number" => $car_number])) {
        
        $user_id = $connection->lastInsertId(); // get the newly created user's id

        session_start();
        $user = array("id" => $user_id, "firstname" => $firstname, "lastname" => $lastname, "sex" => $sex, "email" => $email, "password" => $hashed_password, "user_type" => $user_type, "car_number" => $car_number);
        $_SESSION["user"] = $user; // create his session

        // set cookies
        setcookie("email", $email, time() + 600);
        setcookie("password", $password, time() + 600);

        if ($user_type == "Щатен преподавател"){  // set qr code time
             $tz = 'Europe/Bucharest'; //php does not support Europe/Bulgaria
             $timestamp = time();
             $dt = new DateTime("now", new DateTimeZone($tz));
             $dt->setTimestamp($timestamp); //adjust the object to correct timestamp
             $datetime = $dt->format('Y-m-d H:i:s');
             try{
                 $update = "UPDATE users 
                             SET qr_generated_time = :qr_generated_time 
                             WHERE id = :user_id";
                 $stmt = $connection->prepare($update);
                 $stmt->execute(["qr_generated_time" => $datetime, "user_id" => $user_id]);

            } catch (PDOException $e){
                 http_response_code(500);
                 exit(json_encode(["status" => "ERROR", "message" => "Unexpected server error!"]));
             }
        }

        http_response_code(200);
        exit(json_encode(["status" => "SUCCESS", "message" => "Successful registration!"]));
    }
    else {
        http_response_code(500);
        exit(json_encode(["status" => "ERROR", "message" => "Unexpected server error!"]));
    }
} catch (PDOException $e) {
    http_response_code(500);
    exit(json_encode(["status" => "ERROR", "message" => "Unexpected server error!"]));
}

?>
