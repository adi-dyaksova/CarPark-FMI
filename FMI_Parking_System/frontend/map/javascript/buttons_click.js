/* define how the slots react when they are pressed by the user */

(function() {

    let slots = document.querySelectorAll(".space");

        // Set an event handler on the document so that when any element is clicked, the event will bubble up to it
        document.addEventListener("click", function (evt) {
            // Make the clicked button have the active class and remove active class from others
            if (evt.target.classList.contains("space")) {
                slots.forEach(function (button) {
                    button.classList.remove("active");
                });
                evt.target.classList.add("active");
            }
        });


    for (let slot of slots){

        slot.addEventListener('click', () =>{

            //user cannot click disabled slots
            if (slot.hasAttribute("disabled")){
                return;
            }

            const selectedSlot = document.getElementById("selected-button");
            selectedSlot.textContent = slot.getAttribute("id");
            
            // wait until the user has either pressed "Да" or "Не"
            waitForUserInput().then((response) => {
                document.getElementById("confirm-message-container").classList.add("non-visible"); // hide the confirmation box when the user has clicked one of the two options
                document.querySelector("div.dimmer").classList.add("non-visible"); // hide the dimmer, so that it does not dim the page

                if (response == false) { // if the user has pressed "Не", do nothing
                    return;
                }

                // if "Да" was pressed, then reserve that slot
                sendReservationData(slot.getAttribute("id"));
            })

        })
    }

})();

function sendReservationData(slot) {
    const selectedDate = document.getElementById("date-value"); // get the searched date
        
    if (selectedDate == null) { // if the section with the searched time interval doesn't exist yet
        return;
    }

    const selectedStart = document.getElementById("start-time-value"); // get the start time of the searched interval
    const selectedEnd = document.getElementById("end-time-value"); // get the end time of the searched interval

    /* Object reservationInfo will contain the information about the pressed slot and the searched interval */

    let reservationInfo = {};
    reservationInfo["slot"] = slot;
    reservationInfo["date"] = selectedDate.textContent;
    reservationInfo["start-time"] = selectedStart.textContent;
    reservationInfo["end-time"] = selectedEnd.textContent;

    // make the reservation of the slot for the given interval
    makeReservation(reservationInfo)
    .then((response) => {
        displayResponse(response["status"], response["message"]);
    })
    .catch((error) => {
        console.log(error); // log the error for now
    })
}

// reserve the slot which the user has pressed for the given interval
function makeReservation(reservationInfo) {
    return fetch("../../backend/api/reserve_slots/reserve_slot.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationInfo)
    })
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        return data;
    })
}

function displayResponse(responseStatus, responseMessage) {
    const responseDiv = document.getElementById("reservation-response");

    // remove the pop-up classes in case the user has pressed another button while the message was still being displayed
    removePopupClasses(responseDiv);

    if (responseStatus == "SUCCESS" ) {
        responseDiv.classList.add("success");
    }
    else {
        responseDiv.classList.add("error");
    }
    responseDiv.textContent = responseMessage;

    // add animation
    responseDiv.classList.add("show-popup");

    // wait for show-popup's animation
    waitForAnimation(responseDiv)
    .then(() => {
        // remove the classes we just added to the response div to prepare it for the next time it is used again
        removePopupClasses(responseDiv);
    })
}

function waitForAnimation(div) {
    return div.getAnimations()[0].finished; // return a Promise which will resolve once the animation is finished
}

function removePopupClasses(responseDiv) {
    responseDiv.classList.remove("show-popup");
    responseDiv.classList.remove("error");
    responseDiv.classList.remove("success");
}

function waitForUserInput() {
    return new Promise((resolve, reject) => {
        let isUserSure = false;
        document.getElementById("confirm-message-container").classList.remove("non-visible"); // display the confirmation box
        document.querySelector("div.dimmer").classList.remove("non-visible"); // dim the background

        const confirmButton = document.getElementById("yes-button"); // get the "Да" button
        const denyButton = document.getElementById("no-button"); // get the "Не" button

        // invoke only once
        confirmButton.addEventListener('click', () => {
            isUserSure = true; // user is sure
            resolve(isUserSure);
        }, {once: true});
        
        // invoke only once
        denyButton.addEventListener('click', () => {
            resolve(isUserSure);
        }, {once: true});
    })
}