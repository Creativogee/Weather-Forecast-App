//API
const api = {
  key: API_KEY,
  base: "https://api.openweathermap.org/data/2.5/",
};

//GLOBAL INITS

//Pages
const landingPage = document.querySelector(".landing-page-container");
const presentResult = document.querySelector(".present-search-result");
const errPage = document.querySelector(".error-page");
let previousSearch = document.querySelector(".recent-search-results-container");

//Other
let getStartedBtn = document.querySelector(".get-started-button");
let inputField = document.querySelector(".input-field");
let searchInput = document.querySelector(".search-input");
let searchArrow = document.querySelector(".arrow-icon-wrapper");
let emptyError = document.querySelector(".empty-input-error-msg");
let header = document.querySelector(".header");
let appInfo = document.querySelector(".app-desc-CTA-wrapper");
let previousSearchVeil = document.querySelector(".recent-search-veil");
let closePrevSearch = document.querySelector(".cancel");
let goHome = document.querySelector(".go-home");
let hr = document.getElementById("hr");
let currentTemp = document.querySelector(".temp"); //for special use

//Display Events
getStartedBtn.addEventListener("click", () => {
  inputField.classList.toggle("invisible");
});

searchInput.addEventListener("input", () => {
  searchArrow.classList.remove("invisible");
});

//Generate time and & date
function generateDateAndTime(d) {
  let currentDate = document.querySelector(".city-date .date");
  let currentTime = document.querySelector(".time");
  let months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let day = days[d.getDay()];
  let date = d.getDate();
  let month = months[d.getMonth()];
  let year = d.getFullYear();
  let rawTime = new Intl.DateTimeFormat("en", {
    timeStyle: "short",
  });
  let time = rawTime.format(Date.now());

  currentDate.innerText = `${day} ${date}, ${month}, ${year}`;
  currentTime.innerText = time;
}

// DISPLAY RESULT
function displayResult(weather) {
  //display weather icon
  let base = "https://openweathermap.org/img/w/";
  let iconId = weather.weather[0].icon;
  let weatherIcon = document.querySelector(".weather-icon");
  weatherIcon.setAttribute("src", `${base}${iconId}.png`);
  //display city and symbol
  let city = document.querySelector(".city-date .city");
  city.innerText = `${weather.name}, ${weather.sys.country}`;

  //generate date and time
  generateDateAndTime(new Date());

  //temperature
  let tempReturn = weather.main.temp;
  currentTemp.innerText = Math.floor(tempReturn) + "°c";

  //weather description
  let desc = document.querySelector(".weather-desc");
  desc.innerText = weather.weather[0].description;

  previousSearchVeil.classList.remove("invisible");
  if (weatherArray.length <= 1) {
    return true;
  } else {
    hr.classList.remove("hidden");
  }
}

let weatherArray = JSON.parse(localStorage.getItem("weatherData")) || [];

// FETCH QUERY FROM API
function getResult(query) {
  fetch(`${api.base}weather?q=${query}&units=metric&appid=${api.key}`)
    .then((weather) => {
      return weather.json();
    })
    .then((data) => {
      displayResult(data);
      let check = checkAvailability(weatherArray, query);
      if (check[0] == true) {
        weatherArray.splice(check[1], 1);
        weatherArray.unshift(data);
        localStorage.setItem("weatherData", JSON.stringify(weatherArray));
        getPreviousSearch(weatherArray);
      } else {
        weatherArray.unshift(data);
        localStorage.setItem("weatherData", JSON.stringify(weatherArray));
        getPreviousSearch(weatherArray);
      }
    })
    .catch(() => {
      landingPage.classList.add("invisible");
      errPage.classList.remove("invisible");
      presentResult.classList.toggle("invisible");
      previousSearchVeil.classList.add("invisible");
      header.classList.add("invisible");
      hr.classList.add("hidden");
    });
}

function checkAvailability(arr, q) {
  let cityCom = arrOfCityNames(arr);
  let index = cityCom.indexOf(q.toUpperCase());
  let ans = cityCom.some((arrVal) => q.toUpperCase() == arrVal);
  return [ans, index];
}
function arrOfCityNames(arr) {
  let myCityArray = arr.map(grabCityNames);
  return myCityArray;
}
function grabCityNames(item) {
  return [item.name.toUpperCase()].join();
}

function getPreviousSearch(arr) {
  let arrNew = arr.slice(1);
  let newData = arrNew.map((data) => {
    if (arrNew.length == 0) {
      return;
    } else {
      hr.classList.remove("hidden");
      return `<div class="recent-search-result">
        <div class="prev-weather-card">
        <div class="city city-mini">${data.name}, ${data.sys.country}</div>
        <span class="temp temp-wrapper-mini">${Math.floor(
          data.main.temp
        )}°c</span>
          <figure>
            <img class="weather-icon-mini" src="https://openweathermap.org/img/w/${
              data.weather[0].icon
            }.png"/>
            <figcaption class="weather-desc-mini">${
              data.weather[0].description
            }</figcaption>
          </figure>
        </div>
        </div>`;
    }
  });
  newData = newData.join("");
  previousSearch.innerHTML = newData;
}

function handleSubmit() {
  appInfo.classList.add("invisible");
  presentResult.classList.remove("invisible");
  header.classList.remove("invisible");
  emptyError.classList.add("hidden");
  getResult(searchInput.value);
  searchInput.value = "";
}

// EVENT LISTENERS
searchArrow.addEventListener("click", () => {
  if (searchInput.value == "") {
    emptyError.classList.remove("hidden");
  } else if (searchInput.value !== "") {
    handleSubmit();
  }
});

searchInput.addEventListener("keypress", (event) => {
  if (event.keyCode == 13 && searchInput.value == "") {
    emptyError.classList.remove("hidden");
  } else if (event.keyCode == 13 && searchInput.value !== "") {
    handleSubmit();
  }
});

goHome.addEventListener("click", () => {
  if (currentTemp.innerText == "") {
    landingPage.classList.remove("invisible");
    appInfo.classList.remove("invisible");
    errPage.classList.add("invisible");
    presentResult.classList.add("invisible");
    previousSearchVeil.classList.add("invisible");
    hr.classList.add("hidden");
  } else if (weatherArray.length > 1) {
    header.classList.remove("invisible");
    landingPage.classList.toggle("invisible");
    errPage.classList.toggle("invisible");
    presentResult.classList.toggle("invisible");
    previousSearchVeil.classList.toggle("invisible");
    hr.classList.toggle("hidden");
  } else {
    landingPage.classList.toggle("invisible");
    errPage.classList.toggle("invisible");
    presentResult.classList.toggle("invisible");
  }
});

closePrevSearch.addEventListener("click", () => {
  weatherArray = weatherArray.splice(0, 1);
  localStorage.clear();
  previousSearchVeil.classList.add("invisible");
  hr.classList.add("hidden");
});

// made with love by creativogee
