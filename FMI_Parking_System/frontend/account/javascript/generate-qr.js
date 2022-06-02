const btn = document.getElementById('generate-qr');

btn.addEventListener('click', ()=>{
    const qrcode_el = document.getElementById("qrcode");
    qrcode_el.innerText=null;
    generateQR();
});

function generateQR() {
    getUserData()
    .then((userData) => {
        if (userData["status"] === "SUCCESS") {
            if (userData["data"]["user_type"] == "Щатен преподавател"){
                console.log("yess");
            }

            var qr_data = JSON.stringify({
                name: userData["data"]["firstname"],
                lastname: userData["data"]["lastname"],
                email: userData["data"]["email"],
                user_type: userData["data"]["user_type"]
            });

            qr_data = to_latin(qr_data);
            console.log(qr_data);

            const qrcode = new QRCode(document.getElementById("qrcode"), {
                text: qr_data,
                width: 128,
                height: 128,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });


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

