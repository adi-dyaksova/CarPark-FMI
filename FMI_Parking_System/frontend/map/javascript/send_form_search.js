/* when the user submits the form for the searched interval, send q query to the backend to receive the non-taken, taken and unavailable slots */

(function () {

  const searchBtn = document.getElementById("to-search"); // "Търси" button
  searchBtn.addEventListener('click', () => { 


    //green background to all slots
    let slots = document.querySelectorAll(".space");
    makeAllAvailable(slots);

    const data = document.querySelectorAll("input#date, select#start-time, select#end-time"); // get the date input and the selects for the start and end time of the searched interval

    // search-data object contains date, start and end time
    let search_data = {};
    data.forEach((field) => {
      search_data[field.name] = field.value;
    })

    // clear the form first
    // remove all attached attributes to the options of the select for the end time of the interval
    const endSelectOptions = document.querySelectorAll("select#end-time option");
    const form = document.getElementById("search-form");

    endSelectOptions.forEach((option) => {
      option.removeAttribute("hidden");
      option.removeAttribute("selected");
      option.removeAttribute("disabled");
    });

    // reset the form
    form.reset();

    sendSearchData(search_data)
      .then((data) => { // receives buttons to be colored in red
        if (data["status"] == "SUCCESS") {
          let slots = document.querySelectorAll(".space");
          //make all with green bacckground in case the page was not reloaded
          makeAllAvailable(slots);
          colorSlots(data["taken_slots"], "taken");
          colorSlots(data["unavailable_slots"], "unavailable");

          createSearchParams(search_data["date"], search_data["start-time"], search_data["end-time"])
        }
        else {
          throw new Error(data["message"]);
        }
      })
      .catch((errorMsg) => {
        for (let i = 0; i < slots.length; i++) {
          slots[i].classList.remove("available");
          slots[i].classList.remove("taken");
          slots[i].classList.add("unavailable");
          slots[i].setAttribute("disabled",true);
        }
        document.getElementById("search-params").remove();
        document.querySelector(".space.active").classList.remove("active");
        displayError(errorMsg);
      })
  })
})();

function makeAllAvailable(slots){    
  for (let i = 0; i < slots.length; i++) {
    if(!slots[i].classList.contains("available")){
      slots[i].classList.add("available");
    }
    if(slots[i].classList.contains("unavailable")){
      slots[i].classList.remove("unavailable");
    }
  slots[i].removeAttribute("disabled");
}
}

// send a POST request over to the backend in order to send the searched interval and recieve the information about the taken and unavailable slots
function sendSearchData(data) {
  return fetch("../../backend/api/check_slots/check_slots.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data)
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return data;
    })
}


function colorSlots(slots_list, class_to_add) {
  let slot = "";
  let id = "";
  for (let i = 0; i < slots_list.length; i++) {
    id = slots_list[i]["zone"] + slots_list[i]["code"];
    slot = document.getElementById(id);
    slot.classList.remove("available");
    slot.classList.add(class_to_add);
    slot.setAttribute("disabled", true);
  }
}

function displayError(message) {
  // display a message for the user saying whether his file was successfully registered or not
  const responseDiv = document.getElementById("response");
  responseDiv.classList.add("error");
  responseDiv.innerHTML = message;

  // add animation
  responseDiv.classList.add("show-popup");

  // wait for show-popup's animation
  waitForAnimation(responseDiv)
    .then(() => {
      // remove the classes we just added to the response div to prepare it for the next time it is used again
      responseDiv.classList.remove("show-popup");
      responseDiv.classList.remove("error");
    })
}

// create a Promise - waits for the show-popup's animation to finish
function waitForAnimation(div) {
  return div.getAnimations()[0].finished;
}

// create a rectangular box which will contain the information of the last searched interval
function createSearchParams(date, startTime, endTime) {
  const formInputs = document.getElementById("form-inputs");

  if (formInputs.lastElementChild.id == "search-params") {
    formInputs.removeChild(formInputs.lastElementChild); // remove the last searched interval box because we will add a new one now
  }

  const div = document.createElement("div"); // the box itself
  div.id = "search-params";

  const h2 = document.createElement("h2");
  h2.classList.add("text");
  h2.textContent = "Избран времеви интервал";
  div.appendChild(h2);

  const p = document.createElement("p");

  const dateSpan = document.createElement("span");
  dateSpan.id = "date-value";
  dateSpan.textContent = date;

  const startSpan = document.createElement("span");
  startSpan.id = "start-time-value";
  startSpan.textContent = startTime;

  const endSpan = document.createElement("span");
  endSpan.id = "end-time-value";
  endSpan.textContent = endTime;

  const text1 = document.createTextNode("Дата: ");
  const text2 = document.createTextNode("; Интервал: ");
  const text3 = document.createTextNode("—");

  p.appendChild(text1);
  p.appendChild(dateSpan);
  p.appendChild(text2);
  p.appendChild(startSpan);
  p.appendChild(text3);
  p.appendChild(endSpan);

  div.appendChild(p);

  formInputs.appendChild(div);
}