<?php 

    require_once("../../db/db_connection/connect_to_db.php");
    require_once("../functions/check_JSON_validity.php");
    require_once("../functions/login.php");

    // php://input is a readonly stream which allows us to read raw data from the request body - it returnes all the raw data after the HTTP headers of the request no matter the content type
    // file_get_contents() reads file into a string, but in this case it parses the raw data from the stream into the string
    $data = file_get_contents("php://input");
    $reserve_data; // this will be used for the decoded data (JSON decoded)

    // check if the input JSON is correct
    if (strlen($data) > 0 && check_json($data)) {
        $reserve_data = json_decode($data, true);
    }
    else {
        http_response_code(400);
        exit(json_encode(["status" => "ERROR", "message" => "Невалиден JSON формат!"]));
    }

    session_start();
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

    $user_type = $_SESSION["user"]["user_type"]; // get the user type
    $user_id = $_SESSION["user"]["id"]; // get the user id

    // get which slot was clicked
    $slot = $reserve_data["slot"];
    $zone_length = strcspn($slot, "0123456789"); // returns length of the non-digit prefix

    if ($zone_length == 0) { // if the pressed button we received from the frontend is missing a zone letter (A, B or C), then return an error
        http_response_code(400);
        exit(json_encode(["status" => "ERROR", "message" => "Несъответствие с базата данни!"]));
    }

    $zone = substr($slot, 0, $zone_length); // get the zone letter (A, B, C)
    $code = substr($slot, $zone_length, strlen($slot)); // get the digit of the slot (0 - 9)
    $date = $reserve_data["date"]; // get the date for which the reservation will be
    $start_time = $reserve_data["start-time"]; // get the start time of the time interval

    $format = 'H'; // defines the format from the input
    $formatted_date = DateTime::createFromFormat($format, $start_time); // creates Date Time object from the input start time which is needed for date_format()
    $formatted_start_time = date_format($formatted_date,"H:i:s"); // converts the input start time to HH:MM:SS

    $end_time = $reserve_data["end-time"]; // get the end time of the time interval

    $formatted_date = DateTime::createFromFormat($format, $end_time); // creates Date Time object from the input end time which is needed for date_format()
    $formatted_end_time = date_format($formatted_date,"H:i:s"); // converts the input end time to HH:MM:SS

    if ($start_time >= $end_time) { // if the start time is after the end time or exactly the same as the end time, then return an error
        http_response_code(400);
        exit(json_encode(["status" => "ERROR", "message" => "Невалиден времеви интервал!"]));
    }

    // establish a connection to the database
    try {
        $db = new DB();
        $connection = $db->getConnection();
    }
    catch(PDOException $e) {
        http_response_code(500);
        exit(json_encode(["status" => "ERROR", "message" => "Неочаквана грешка настъпи в сървъра!"]));
    }

    try {
        $sql = "SELECT id
        FROM reservations
        WHERE date LIKE :date AND user_id = :user_id AND
        (
        (start_time < :start_time AND end_time > :start_time) OR
        (start_time >= :start_time AND end_time <= :end_time) OR
        (start_time < :end_time AND end_time > :end_time) OR
        (start_time < :start_time AND end_time > :end_time)
        );";

        $stmt = $connection->prepare($sql);
        $stmt->execute(["date" => $date, "user_id" => $user_id, "start_time" => $formatted_start_time, "end_time" => $formatted_end_time]);

        // if the user has already reserved a slot in a time interval that intersects with the current one, then he can't reserve another one
        if ($stmt->rowCount() >= 1) {
            http_response_code(200);
            exit(json_encode(["status" => "ERROR", "message" => "Вече сте запазили паркомясто в този времеви интервал!"]));
        }
    }
    catch(PDOException $e) {
        http_response_code(500);
        exit(json_encode(["status" => "ERROR", "message" => "Неочаквана грешка настъпи в сървъра!"]));
    }

    try {
        $sql = "SELECT id
                FROM slots
                WHERE code = :code AND zone = :zone";
        
        $stmt = $connection->prepare($sql);
        $stmt->execute(["code" => $code, "zone" => $zone]);

        // check whether the provided slot actually exists (if it does not, the above query will not return any rows)
        if ($stmt->rowCount() == 0) {
            http_response_code(400);
            exit(json_encode(["status" => "ERROR", "message" => "Несъответствие с базата данни!"]));
        }

        $response = $stmt->fetch(PDO::FETCH_ASSOC);
    }
    catch(PDOException $e) {
        http_response_code(500);
        exit(json_encode(["status" => "ERROR", "message" => "Неочаквана грешка настъпи в сървъра!"]));
    }

    $slot_id = $response["id"]; // used later for creating a reservation

        try {
            $sql = "SELECT date, start_time, end_time
                    FROM schedules s JOIN user_schedules us ON us.schedule_id = s.id 
                    WHERE us.user_id = :user_id AND s.date = :date";
        
            $stmt = $connection->prepare($sql);
            $stmt->execute(["user_id" => $user_id, "date" => $date]);
        
            // if the user has no schedules in this day, then he can't reserve a slot for that day
            if ($stmt->rowCount() == 0) {
                http_response_code(401);
                exit(json_encode(["status" => "ERROR", "message" => "Не може да запазите паркомястото, защото нямате предвидени лекции/упражнения в този ден!"]));
            }
            else {
                $hours = array_fill(7, 16, false); // create an associative array from 7 to 16
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $corrected_start_time = substr($row["start_time"], 0, strpos($row["start_time"], ":")); // get the first part of the returned time, for example => returned: 18:00:00 => corrected: 18
        
                    if ($corrected_start_time[0] == "0") { // if corrected_start_time has a leading zero (07, 08, 09), remove it
                        $corrected_start_time = substr($corrected_start_time, 1, strlen($corrected_start_time));
                    }
        
                    $corrected_end_time = substr($row["end_time"], 0, strpos($row["end_time"], ":")); // get the first part of the returned time, for example => returned: 16:00:00, corrected => 16
        
                    if ($corrected_end_time[0] == "0") { // if corrected_end_time has a leading zero (08, 09), remove it
                        $corrected_end_time = substr($corrected_end_time, 1, strlen($corrected_end_time));
                    }
        
                    for ($start = $corrected_start_time - 1; $start < $corrected_end_time + 1; $start++) { // padding
                        $hours[$start] = true; // hours[10] == true means he can park from 10 to 11
                    }
                }
            }
        }
        catch (PDOException $e) {
            http_response_code(500);
            exit(json_encode(["status" => "ERROR", "message" => "Неочаквана грешка настъпи в сървъра!"]));
        }

        // check whether the user has any schedule that intersects with the time interval that he wants to reserve the slot for
        for ($start = $start_time; $start < $end_time; $start++) {
            if ($hours[$start] == false) { // if there is no schedule that exists in the specified time interval for the slot reservation, then the user can't reserve the slot
                http_response_code(401);
                exit(json_encode(["status" => "ERROR", "message" => "Не може да запазите паркомястото, защото нямате лекции/упражнения в търсения времеви интервал!"]));
            }
        }

    try {
        $sql = "SELECT r.slot_id
                FROM reservations r JOIN slots s ON r.slot_id = s.id
                WHERE r.date LIKE :date AND s.code = :code AND s.zone = :zone AND
                (
                (r.start_time < :start_time AND r.end_time > :start_time) OR
                (r.start_time >= :start_time AND r.end_time <= :end_time) OR
                (r.start_time < :end_time AND r.end_time > :end_time) OR
                (r.start_time < :start_time AND r.end_time > :end_time)
                );";

        $stmt = $connection->prepare($sql);
        $stmt->execute(["date" => $date, "code" => $code, "zone" => $zone, "start_time" => $formatted_start_time, "end_time" => $formatted_end_time]);

        // if any reservation exists in a time interval that intersects with the current one, then return error (the slot can't be taken since there are hours that it will be taken by another user)

        if ($stmt->rowCount() >= 1) {
            http_response_code(200);
            exit(json_encode(["status" => "TAKEN", "message" => "Мястото вече е заето! Моля направете нова заявка!"]));
        }
    }
    catch (PDOException $e) {
        http_response_code(500);
            exit(json_encode(["status" => "ERROR", "message" => "Неочаквана грешка настъпи в сървъра!"]));
    }

    // add reservation
    try {
        $sql = "INSERT INTO reservations (user_id, slot_id, start_time, end_time, date)
                            VALUES (:user_id, :slot_id, :start_time, :end_time, :date)";

        $stmt = $connection->prepare($sql);
        $stmt->execute(["user_id" => $user_id, "slot_id" => $slot_id, "start_time" => $formatted_start_time, "end_time" => $formatted_end_time, "date" => $date]);
    }
    catch (PDOException $e) {
        http_response_code(500);
        exit(json_encode(["status" => "ERROR", "message" => "Неочаквана грешка настъпи в сървъра!"]));
    }

    http_response_code(200);
    exit(json_encode(["status" => "SUCCESS", "message" => "Успешно запазено място!"]));
?>