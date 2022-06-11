/* When the user clicks on one of the options besides "Изход" and "Запази паркомясто" a different tab should show on the 
   right hand side of the navbar. So we define which section should be displayed when an option is pressed */

(function () {
  const options = document.querySelectorAll("div.option"); // returns "Изход" option so we need to be careful not to add another event listener to it
  const sections = document.querySelectorAll("#account-tab > section");

  for (let option of options) {

    if (option.id == "reserve-spot") {

      option.addEventListener("click", () => {
        // redirect user to zones.html with an option for back through the browser
        window.location.href = "../map/zones - Copy.html";
      });

    } else if (option.id == "log-out") {

      option.addEventListener("click", () => {
        logOut()
          .then((response) => {
            if (response["status"] === "SUCCESS") {
              window.location.replace("../login/login_form.html");
            }
            else {
              throw new Error(response["message"]);
            }
          })
          .catch((error) => {
            console.log(error);
          })
      });

    } else {

      option.addEventListener("click", () => {
        for (let section of sections) {
          // display only the corresponding section
          if (option.id + "-section" === section.id) {
            section.classList.remove("no-display");
          }
          // hide the rest
          else {
            section.classList.add("no-display");
          }
        }
      });
    }
  }
})();

function logOut() {
  return fetch("../../backend/api/logout_user/delete_user_session.php")
    .then((response) => { return response.json() })
    .then((data) => { return data })
}