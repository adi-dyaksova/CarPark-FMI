const qr_max_seconds = 3600;
var qrcode_el = document.getElementById("qrcode");
var expired_qr_msg = document.getElementById("expired-qr-msg");
const curr_time_seconds = Math.trunc(Date.now() / 1000);
const display_qr_btn = document.getElementById('display-qr-btn');

const new_qr_btn = document.getElementById("new-qr-btn");

var user_email;

function get_new_qr() {
    // console.log("update qr code");

    update_qr()
    .then((responseMessage) => {
        console.log(responseMessage);
        if (responseMessage["status"] === "ERROR") {
            throw new Error(responseMessage["message"]);
        }
        else {
            expired_qr_msg.classList.add("no-display");
            new_qr_btn.classList.add("no-display");
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
            qr_generated_time: curr_time_seconds,
            email: user_email
        })
    })
    .then((response) => response.json()
    )
    .then((data) => {

        return data;
    })
}


function generateQR() {
    getUserData()
    .then((userData) => {
        if (userData["status"] === "SUCCESS") {

            // generate static QR code
           // if (userData["data"]["user_type"] == "Щатен преподавател"){  //да се смени на Хоноруван

                const qr_generated_time_seconds = userData["data"]["qr_generated_time"];
                user_email = userData["data"]["email"];
                
                if(curr_time_seconds - qr_generated_time_seconds > qr_max_seconds){
                    // console.log("expired");
                    qrcode_el.innerHTML = null;
                    expired_qr_msg.classList.remove("no-display");
                    new_qr_btn.classList.remove("no-display");    
                }
                else{
                  
                    if(!expired_qr_msg.classList.contains("no-display")){
                        expired_qr_msg.classList.add("no-display");
                    }
                    if(!new_qr_btn.classList.contains("no-display")){
                        new_qr_btn.classList.add("no-display");
                    }
                    
                    // console.log("still valid");
                    //display QR code
                    var qr_data = JSON.stringify({
                        name: userData["data"]["firstname"],
                        lastname: userData["data"]["lastname"],
                        user_type: userData["data"]["user_type"],
                        qr_generated_time: toDateTime(userData["data"]["qr_generated_time"])
                    });

                    qr_data = to_latin(qr_data);                    
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
            
        }
        else if (userData["status"] == "UNAUTHENTICATED") { // if there is no session or cookies, return the user to the login page
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

// translation of fields from cyrillic to latin because of qr generation
const lat_up = ["A", "B", "V", "G", "D", "E", "Zh", "Z", "I", "Y", "K", "L", "M", "N", "O", "P", "R", "S", "T", "U", "F", "Kh", "Ts", "Ch", "Sh", "Sht", "a", "I", "Yu", "Ya"];
const lat_low = ["a", "b", "v", "g", "d", "e", "zh", "z", "i", "y", "k", "l", "m", "n", "o", "p", "r", "s", "t", "u", "f", "kh", "ts", "ch", "sh", "sht", "a", "i", "yu", "ya"];
const bul_up = ["А", "Б", "В", "Г", "Д", "Е",  "Ж", "З", "И", "Й", "К", "Л", "М", "Н", "О", "П", "Р", "С", "Т", "У", "Ф", "Х", "Ц", "Ч", "Ш", "Щ", "Ъ", "Ь",  "Ю", "Я"];
const bul_low = ["а", "б", "в", "г", "д", "е", "ж", "з", "и", "й", "к", "л", "м", "н", "о", "п", "р", "с", "т", "у", "ф", "х", "ц", "ч", "ш", "щ", "ъ", "ь", "ю", "я"];
        
function to_latin (str){
    for (var i = 0; i < 30; i++) {
        str=str.replaceAll(bul_up[i],lat_up[i]);
        str=str.replaceAll(bul_low[i],lat_low[i]);
    }
    return str;
}

function toDateTime(secs) {
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(secs);
    return t;
}

