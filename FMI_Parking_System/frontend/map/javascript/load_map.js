let slideIndex = 1; // keeps track of the current slide number
// const maxSlots = 10; // maximum slots per zone
const maxOptions = 14, startTime = 7; // maximum options per select field and start time of the 

const startSelect = document.getElementById("start-time"); // select for start time of the time interval
const endSelect = document.getElementById("end-time"); // select for end time of the time interval

for (let i = 0; i < maxOptions; i++) {
  // dynamically create each option and add it to the corresponding option
  let opt = document.createElement("option");
  opt.value = startTime + i; // go from 7 to 20
  opt.textContent = startTime + i;
  startSelect.appendChild(opt);

  opt = document.createElement("option");
  opt.value = startTime + i + 1; // go from 8 to 21
  opt.textContent = startTime + i + 1;
  endSelect.appendChild(opt);
}

const backBtn = document.getElementById("back-btn"); // get the back button
backBtn.addEventListener('click', () => { // whenever back button is pressed

  //redirect to profile page
  window.location.href = "../account/account_view.html";
})

// when the page is loaded, show the first slide
showSlides(slideIndex);

// when the user has clicked one of the arrows on the slideshow (for previous or next slide), then change the current slide
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// when the user has clicked on one of the zone buttons, change the current slide to the corresponding one
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides"); // gets all the slides
  let dots = document.getElementsByClassName("btn"); // gets the buttons for the zones

  if (n > slides.length) { // if the user was on the 3rd slide and wants to go to the next one, head over to the first one
    slideIndex = 1;
  }

  if (n < 1) { // if the user was on the 1st slide and wants to go to the previous one, head over to the last one
    slideIndex = slides.length;
  }

  // hide all the slides and make only the current one visible
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slides[slideIndex - 1].style.display = "block"; // display the current slide

  // make all zone buttons inactive and only the  button active
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace("active", "");
  }
  dots[slideIndex - 1].className += " active";
}