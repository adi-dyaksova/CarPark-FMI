const qr_max_seconds = 3600;
var qrcode_el = document.getElementById("qrcode");
var expired_qr_msg = document.getElementById("expired-qr-msg");
var curr_time_seconds;
const display_qr_btn = document.getElementById('display-qr-btn');
const hide_qr_btn = document.getElementById('hide-qr-btn');
const new_qr_btn = document.getElementById("new-qr-btn");
var user_email;
var user_name;
var user_lastname;
var user_user_type;
var user_qr_generated_time;
var user_car_number;


function displayQR() {
    getUserData()
    .then((userData) => {
        if (userData["status"] === "SUCCESS") {

                user_user_type = userData["data"]["user_type"];
                const qr_generated_time_seconds = userData["data"]["qr_generated_time"];
                user_email = userData["data"]["email"];
                
                curr_time_seconds = Math.trunc(Date.now() / 1000);
                
                if(user_user_type == "Хоноруван преподавател" && curr_time_seconds - qr_generated_time_seconds > qr_max_seconds){
                    //Show message if QR code has expired
                    qrcode_el.innerHTML = null;
                    expired_qr_msg.classList.remove("no-display");
                    new_qr_btn.classList.remove("no-display");
                    display_qr_btn.classList.add("no-display");    
                }
                else{

                    //Display QR code if it is valid
                    if(!expired_qr_msg.classList.contains("no-display")){
                        expired_qr_msg.classList.add("no-display");
                    }
                    if(!new_qr_btn.classList.contains("no-display")){
                        new_qr_btn.classList.add("no-display");
                    }
                    display_qr_btn.classList.add("no-display");
                    hide_qr_btn.classList.remove("no-display");
                    
                    user_name = userData["data"]["firstname"];
                    user_lastname = userData["data"]["lastname"];
                    // user_type = userData["data"]["user_type"];
                    user_qr_generated_time = toDateTime(userData["data"]["qr_generated_time"]);
                    user_car_number = userData["data"]["car_number"];

                    generateQR();
                }
            
        }
        else if (userData["status"] == "UNAUTHENTICATED") { 
            // if there is no session or cookies, return the user to the login page
            window.location.replace("../login/login_form.html");
        }
        else {
            throw new Error(userData["message"]);
        }
    })
    .catch((error) => {
        console.log(error); // log the error for now
    })
}

// send a GET request to the backend in order to recieve the user's data
function getUserData() {
    return fetch("../../backend/api/load_account_page/get_user_data.php")
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        return data;
    })
}

function generateQR(){
    var qr_data = JSON.stringify({
        name: user_name,
        lastname: user_lastname,
        user_type: user_user_type,
        qr_generated_time: user_qr_generated_time,
        car_number: user_car_number
    });

    console.log(qr_data);

    qr_data = to_latin(qr_data);  
    qrcode_el.classList.remove("no-display");                  
    qrcode_el.innerText = null;

    const qrcode = new QRCode(qrcode_el, {
        text: qr_data,
        width: 128,
        height: 128,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
}

// translation of fields from cyrillic to latin because of qr generation
function to_latin (str){
    const lat_up = ["A", "B", "V", "G", "D", "E", "Zh", "Z", "I", "Y", "K", "L", "M", "N", "O", "P", "R", "S", "T", "U", "F", "Kh", "Ts", "Ch", "Sh", "Sht", "a", "I", "Yu", "Ya"];
    const lat_low = ["a", "b", "v", "g", "d", "e", "zh", "z", "i", "y", "k", "l", "m", "n", "o", "p", "r", "s", "t", "u", "f", "kh", "ts", "ch", "sh", "sht", "a", "i", "yu", "ya"];
    const bul_up = ["А", "Б", "В", "Г", "Д", "Е",  "Ж", "З", "И", "Й", "К", "Л", "М", "Н", "О", "П", "Р", "С", "Т", "У", "Ф", "Х", "Ц", "Ч", "Ш", "Щ", "Ъ", "Ь",  "Ю", "Я"];
    const bul_low = ["а", "б", "в", "г", "д", "е", "ж", "з", "и", "й", "к", "л", "м", "н", "о", "п", "р", "с", "т", "у", "ф", "х", "ц", "ч", "ш", "щ", "ъ", "ь", "ю", "я"];
        
    for (var i = 0; i < 30; i++) {
        str=str.replaceAll(bul_up[i],lat_up[i]);
        str=str.replaceAll(bul_low[i],lat_low[i]);
    }
    return str;
}

function toDateTime(secs) {
    var t = new Date(1970, 0, 1, 6); // Epoch
    t.setSeconds(secs);
    return t;
}

function get_new_qr() {
    
    update_qr()
    .then((responseMessage) => {
        if (responseMessage["status"] === "ERROR") {
            throw new Error(responseMessage["message"]);
        }
        else {
            expired_qr_msg.classList.add("no-display");
            new_qr_btn.classList.add("no-display");
            hide_qr_btn.classList.remove("no-display"); 
            qrcode_el.classList.remove("no-display");
            user_qr_generated_time = responseMessage["qr_generated_time"];
            // generateQR();
            displayQR();
        }
    })
    .catch((errorMsg) => {
        console.log(errorMsg);
        // showDiv(responseDiv, errorMsg); // create an error message if the server returned an error
    })
   
}

function update_qr(){

    return fetch("../../backend/api/update_qr/update_qr_datetime.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            qr_generated_time: curr_time_seconds + 3600,
            email: user_email
        })
    })
    .then((response) => response.json()
    )
    .then((data) => {

        return data;
    })
}

function hideQR(){
    qrcode_el.classList.add("no-display");
    display_qr_btn.classList.remove("no-display");
    hide_qr_btn.classList.add("no-display");
}