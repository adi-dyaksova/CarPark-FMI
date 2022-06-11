(function () {

  const uploadButton = document.getElementById("first-button"); // get the "Качване на график" button of tab "Моят график"
  const scheduleButton = document.getElementById("second-button"); // get the "График" button of tab "Моят график"
  const slotsButton = document.getElementById("third-button"); // get the "Запазени паркоместа" button of tab "Моят график"

  const uploadSection = document.getElementById("upload-file-section"); // get the section which will be displayed when button "Качване на график" is pressed
  const scheduleSection = document.getElementById("schedule-section"); // get the section which will be displayed when button "График" is pressed
  const slotsSection = document.getElementById("slots-section"); // get the section which will be displayed when button "Запазени паркоместа" is pressed

  getScheduleData()
  getTakenSlots()

  // Add event listeners for buttons ("Качване на график", "График", "Запазени паркоместа")
  uploadButton.addEventListener("click", () => { // if "Качване на график" button is pressed, make that button active and display the respective section
    uploadSection.classList.remove("no-display");
    scheduleSection.classList.add("no-display");
    slotsSection.classList.add("no-display");

    uploadButton.classList.add("active");
    scheduleButton.classList.remove("active");
    slotsButton.classList.remove("active");
  });

  scheduleButton.addEventListener("click", () => { // if "График" button is pressed, make that button active, display the respective section and load the section content from a query to the backend
    uploadSection.classList.add("no-display");
    scheduleSection.classList.remove("no-display");
    slotsSection.classList.add("no-display");

    uploadButton.classList.remove("active");
    scheduleButton.classList.add("active");
    slotsButton.classList.remove("active");

    // get the upcoming schedule of the user by querying the backend
    getScheduleData()
  });

  slotsButton.addEventListener("click", () => { // if "Запазени паркоместа" button is pressed, then make that button active, display the respective section and load the section content from q query to the backend
    uploadSection.classList.add("no-display");
    scheduleSection.classList.add("no-display");
    slotsSection.classList.remove("no-display");

    uploadButton.classList.remove("active");
    scheduleButton.classList.remove("active");
    slotsButton.classList.add("active");

    // get the taken slots from the user by querying the backend
    getTakenSlots()
  });
})()

/* create a rectangular box containing the given schedule information and attach it to the container div
   here we use two spans as wrappers in order to use the css flexbox to center the texts vertically and horizontally*/
function createSchedule(schedule, container) {
  const div = document.createElement("div"); // create the rectangular box
  div.classList.add("schedule");
  div.classList.add("schedule-item");

  const firstSpanWrapper = document.createElement("span"); // first span contains the header (the type of the schedule)
  const h4 = document.createElement("h4");
  h4.textContent = schedule["discipline_type"] + ": " + schedule["discipline_name"]; // for example: "Лекция: WEB"
  firstSpanWrapper.appendChild(h4);

  const secondSpanWrapper = document.createElement("span"); // second span contains a paragraph (the info of the schedule)
  const p = document.createElement("p");
  p.textContent = schedule["date"] + ", " + schedule["start_time"] + "—" + schedule["end_time"] + ", " + schedule["faculty"]; // for example: "2021-06-24, 15:00-17:00, ФЗФ"
  secondSpanWrapper.appendChild(p);

  // append both spans to the div element (the rectangular box)
  div.appendChild(firstSpanWrapper);
  div.appendChild(secondSpanWrapper);

  // append the rectangular box (which contains information about the given schedule) to the container element
  container.appendChild(div);
}

/* create a rectangular box containing the given reserved slot information and attach it to the container div
   here we use two spans as wrappers in order to use the css flexbox to center the texts vertically and horizontally */
function createSlotSchedule(slot, container) {
  const div = document.createElement("div"); // create the rectangular box
  div.classList.add("schedule");
  div.classList.add("schedule-item");

  const firstSpanWrapper = document.createElement("span"); // first span contains the header (which slot is taken)
  const h4 = document.createElement("h4");
  h4.textContent = "Паркомясто: " + slot["zone"] + slot["code"]; // for example: "Паркомясто: B7"
  firstSpanWrapper.appendChild(h4);

  const secondSpanWrapper = document.createElement("span"); // second span contains information about the taken slot (when and for what interval)
  const p = document.createElement("p");
  p.textContent = slot["date"] + ", " + slot["start_time"] + "—" + slot["end_time"]; // for example: "2021-06-24, 15:00-17:00"
  secondSpanWrapper.appendChild(p);

  // append both spans to the div element (the rectangular box)
  div.appendChild(firstSpanWrapper);
  div.appendChild(secondSpanWrapper);

  // append the rectangular box (which contains information about the given reserved slot) to the container element
  container.appendChild(div);
}

// send a GET request to the backend in order to recieve the upcoming schedule of the user
function getScheduleData() {
  return fetch("../../backend/api/load_user_schedule_data/load_user_schedule.php")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .then((schedules) => {
      if (schedules["status"] == "SUCCESS") {
        const allSchedules = schedules["data"]; // get the returned schedules of the user
        const container = document.getElementById("upcoming-schedule"); // get the div element where each schedule will be attacheds
        container.innerHTML = null; // clear the container from the previous button click

        for (let schedule of allSchedules) {
          createSchedule(schedule, container); // attach each schedule to the div element (the container)
        }
      }
      else {
        throw new Error(schedule["message"]);
      }
    })
    .catch((error) => {
      console.log(error); // log the error for now
    })
}

// send a GET request to the backend in order to recieve the reserved slots for the upcoming days by the user
function getTakenSlots() {
  return fetch("../../backend/api/load_user_schedule_data/load_user_taken_slots.php")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .then((takenSlots) => {
      if (takenSlots["status"] == "SUCCESS") {
        const slots = takenSlots["data"]; // get the returned reserved slots
        const container = document.getElementById("taken-slots"); // get the div element where the slots will reside
        container.innerHTML = null; // clear the div's content from previous button clicks

        for (let slot of slots) {
          createSlotSchedule(slot, container); // attach each reserved slot to the container (the div element)
        }
      }
      else {
        throw new Error(schedule["message"]);
      }
    })
    .catch((error) => {
      console.log(error); // log the error for now
    })
}