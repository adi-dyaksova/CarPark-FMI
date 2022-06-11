function login() {
  const inputs = document.querySelectorAll("input"); // all input fields from login form
  const form = document.getElementById("login-form"); // the login form
  const responseDiv = document.getElementById("response-message"); // div which will contain response message

  form.addEventListener('submit', (event) => {
    event.preventDefault(); // prevent the form from resetting

    // hide the previous message because we may create another one in it's place
    responseDiv.classList.add("no-show");

    // gather the inputted data
    let data = {};
    inputs.forEach((input) => {
      data[input.name] = input.value;
    });

    // clear the contents from the previous message
    responseDiv.innerHTML = null;

    // send the login data to the server
    checkLoginData(data)
      .then((responseMessage) => {
        if (responseMessage["status"] === "ERROR") {
          throw new Error(responseMessage["message"]);
        }
        else {
          window.location.replace("../account/account_view.html"); // if the login resulted in success, then redirect the user over to his account page
        }
      })
      .catch((errorMessage) => {
        createErrorDivContent(responseDiv, errorMessage); // if the login resulted in an error, then display an error messages
      })
  })
};

/* sends the inputted data over to the backend to authenticate the user */
function checkLoginData(data) {
  return fetch("../../backend/api/login/login_user.php", {
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


function createErrorDivContent(div, response) {
  // create the image and append it's attributes src and alt
  let errorImage = document.createElement("img");
  errorImage.src = "./images/error_response.png";
  errorImage.alt = "white exclamation mark on red background"

  // create the text of the response
  let messageContainer = document.createElement("span");
  let message = document.createElement("p");
  message.textContent = response;
  messageContainer.append(message);

  // append the img and span to the div
  div.appendChild(errorImage);
  div.appendChild(messageContainer);

  // show it to the user
  div.classList.remove("no-show");
}

function register() {

  const form = document.getElementById("registration-form"); // the registration form
  const inputs = document.querySelectorAll("input, select"); // the input fields and the select one
  const responseDiv = document.getElementById("response-message"); // the div that will contain the error message if the backend returned an error

  form.addEventListener('submit', (event) => {
    event.preventDefault(); // prevent the form from resetting

    // remove styles from last error message
    responseDiv.classList.remove("error");

    // remove last error message
    responseDiv.innerHTML = null;

    // gather all the input information
    let data = {};
    inputs.forEach(input => {
      data[input.name] = input.value;
    })

    sendFormData(data)
      .then((responseMessage) => {
        if (responseMessage["status"] === "ERROR") {
          throw new Error(responseMessage["message"]);
        }
        else {
          window.location.replace("../account/account_view.html"); // redirect user to his newly created account
        }
      })
      .catch((errorMsg) => {
        showDiv(responseDiv, errorMsg); // create an error message if the server returned an error
      })
  })
};

/* send the inputted data over to the backend and based on the server's response, display an error message or redirect user to his newly created account */
function sendFormData(data) {
  return fetch("../../backend/api/registration/register_user.php", {
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

function showDiv(div, message) {
  // create the image of the error (a white exclamation mark)
  let statusImage = document.createElement("img");

  // attach image attributes src and alt
  statusImage.src = "./images/error_response.png";
  statusImage.alt = "white exclamation mark on red background";

  // toggle classes
  div.classList.add("error");
  div.classList.remove("no-show");

  // create error text and append to span element
  let messageContainer = document.createElement("span");
  let responseMessage = document.createElement("p");
  responseMessage.textContent = message;
  messageContainer.appendChild(responseMessage);

  // append all created elements to the response div
  div.appendChild(statusImage);
  div.appendChild(messageContainer);
}

// slider movement
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
  container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
  container.classList.remove("right-panel-active");
});