//API
const api = {
  key: config.API_KEY,
  base: 'https://api.openweathermap.org/data/2.5/',
};

//GLOBAL INITS

//Pages
const landingPage = document.querySelector('.landing-page-container');
const presentResult = document.querySelector('.present-search-result');
const errPage = document.querySelector('.error-page');
let message = document.querySelector('.message');

//Other
let getStartedBtn = document.querySelector('.get-started-button');
let inputField = document.querySelector('.input-field');
let searchInput = document.querySelector('.search-input');
let searchArrow = document.querySelector('.arrow-icon-wrapper');
let loader = document.querySelector('.loader-container');
let emptyError = document.querySelector('.empty-input-error-msg');
let header = document.querySelector('.header');
let appInfo = document.querySelector('.app-desc-CTA-wrapper');
let closePrevSearch = document.querySelector('.cancel');
let goHome = document.querySelector('.go-home');
let previousSearch = document.getElementById('previousSearch');
let previousSearchResult = document.querySelector(
  '.previous-search-results-container'
);
let currentTemp = document.querySelector('.temp'); //for special use

//EVENT LISTENERS
getStartedBtn.addEventListener('click', () => {
  inputField.classList.toggle('invisible');
});

searchInput.addEventListener('input', () => {
  searchArrow.classList.remove('invisible');
});

searchArrow.addEventListener('click', () => {
  if (searchInput.value == '') {
    emptyError.classList.remove('hidden');
    !emptyError.classList.contains('hidden')
      ? setTimeout(() => {
          emptyError.classList.add('hidden');
        }, 3000)
      : null;
  } else if (searchInput.value !== '') {
    handleSubmit();
  }
});

searchInput.addEventListener('keypress', (event) => {
  if (event.keyCode == 13 && searchInput.value == '') {
    emptyError.classList.remove('hidden');
    !emptyError.classList.contains('hidden')
      ? setTimeout(() => {
          emptyError.classList.add('hidden');
        }, 3000)
      : null;
  } else if (event.keyCode == 13 && searchInput.value !== '') {
    handleSubmit();
  }
});

goHome.addEventListener('click', () => {
  if (weatherArray.length > 1) {
    previousSearch.classList.remove('invisible');
  }
  if (weatherArray.length >= 1) {
    presentResult.classList.remove('invisible');
    header.classList.remove('invisible');
    appInfo.classList.add('invisible');
    const latestSearch = weatherArray[0];
    displayResult(latestSearch);
    getPreviousSearch(weatherArray);
  }
  if (weatherArray.length < 1) {
    presentResult.classList.add('invisible');
    previousSearch.classList.add('invisible');
    appInfo.classList.remove('invisible');
  }
  landingPage.classList.remove('invisible');
  errPage.classList.add('invisible');
});

closePrevSearch.addEventListener('click', () => {
  weatherArray = weatherArray.splice(0, 1);
  localStorage.clear();
  localStorage.setItem('weatherData', JSON.stringify(weatherArray));
  previousSearch.classList.add('invisible');
});

let weatherArray = JSON.parse(localStorage.getItem('weatherData')) || [];

// FETCH QUERY FROM API
function handleSubmit() {
  getResult(searchInput.value);
  searchInput.value = '';
  emptyError.classList.add('hidden');
}

function getResult(query) {
  loader.classList.remove('hidden');
  fetch(`${api.base}weather?q=${query}&units=metric&appid=${api.key}`)
    .then((weather) => {
      return weather.json();
    })
    .then((data) => {
      loader.classList.add('hidden');
      displayResult(data);
      appInfo.classList.add('invisible');
      presentResult.classList.remove('invisible');
      header.classList.remove('invisible');
      if (weatherArray.length >= 1) {
        previousSearch.classList.remove('invisible');
      }

      //checks if query already exist in the weatherArray
      let index = weatherArray.findIndex((item) => {
        return item.name.toUpperCase() === query.toUpperCase();
      });
      if (index >= 0) {
        weatherArray.splice(index, 1);
        weatherArray.unshift(data);
        localStorage.setItem('weatherData', JSON.stringify(weatherArray));
        getPreviousSearch(weatherArray);
      } else {
        weatherArray.unshift(data);
        localStorage.setItem('weatherData', JSON.stringify(weatherArray));
        getPreviousSearch(weatherArray);
      }
    })
    .catch((error) => {
      landingPage.classList.add('invisible');
      errPage.classList.remove('invisible');
      presentResult.classList.add('invisible');
      header.classList.add('invisible');
      previousSearch.classList.add('invisible');
    });
}

// DISPLAY RESULT
function displayResult(weather) {
  //display weather icon
  let base = 'https://openweathermap.org/img/w/';
  let iconId = weather.weather[0].icon;
  let weatherIcon = document.querySelector('.weather-icon');
  weatherIcon.setAttribute('src', `${base}${iconId}.png`);
  //display city and symbol
  let city = document.querySelector('.city-date .city');
  city.innerText = `${weather.name}, ${weather.sys.country}`;

  //generate date and time
  generateDateAndTime(new Date());

  //temperature
  let tempReturn = weather.main.temp;
  currentTemp.innerText = Math.floor(tempReturn) + '°c';

  //weather description
  let desc = document.querySelector('.weather-desc');
  desc.innerText = weather.weather[0].description;
}

function generateDateAndTime(d) {
  let currentDate = document.querySelector('.city-date .date');
  let currentTime = document.querySelector('.time');
  let months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let day = days[d.getDay()];
  let date = d.getDate();
  let month = months[d.getMonth()];
  let year = d.getFullYear();
  let rawTime = new Intl.DateTimeFormat('en', {
    timeStyle: 'short',
  });
  let time = rawTime.format(Date.now());

  currentDate.innerText = `${day} ${date}, ${month}, ${year}`;
  currentTime.innerText = time;
}

function getPreviousSearch(arr) {
  let arrNew = arr.slice(1, 11);
  let newData = arrNew.map((data) => {
    if (arrNew.length == 0) {
      return;
    } else {
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
  newData = newData.join('');
  previousSearchResult.innerHTML = newData;
}

// made with love by creativogee
