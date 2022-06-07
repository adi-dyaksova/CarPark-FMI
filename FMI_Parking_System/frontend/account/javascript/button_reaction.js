/* When the user clicks on one of the options besides "Изход" and "Запази паркомясто" a different tab should show on the right hand side of the navbar.
   So we define which section should be displayed when an option is pressed */

(function () {
    const options = document.querySelectorAll("div.option"); // returns "Изход" option so we need to be careful not to add another event listener to it
    const sections = document.querySelectorAll("#account-tab > section");

    for (let option of options) {
        // we shall add another event listener for "Запази паркомясто" option; skip the "Изход" option because we have another event listener fori t
        if (option.id == "reserve-spot" || option.id == "log-out") {
            continue;
        }

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

    const saveSpot = document.getElementById("reserve-spot");
    saveSpot.addEventListener("click", () => {
        // redirect user to zones.html with an option for back through the browser
        window.location.href = "../map/zones.html"; 
    });
})();