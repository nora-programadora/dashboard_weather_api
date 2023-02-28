//search input
const input = document.getElementById('city-search');

//weather sections
const weatherTodayCont = document.querySelector('.current-weather-container');
const forcastCont = document.querySelector('.forcast-container');

//variables for today's weather info
const selectedCity = document.querySelector('#city-name');
const dateToday = document.querySelector('#date-today');
const condToday = document.querySelector('#condition');
const tempToday = document.querySelector('#temp');
const windToday = document.querySelector('#wind');
const humidityToday = document.querySelector('#humidity');
const uvToday = document.querySelector('#uv');
const statusPic = document.querySelector('.weather-pic');

//variables for 5-day forcast
const forcast = document.querySelector('.forcast');

//variables for search and city buttons
const searchForm = document.querySelector('.search');
const searchBtn = document.querySelector('#search-btn');
const recentCities = document.querySelector('.recent-cities');

//weather chart variable -> holds chart object when created
let weatherChart = null;


//get weather from api and update page
async function getWeather (name, lat, lng) {
  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&units=metric&exclude=minutely&appid=cf0f236d99f05f78766736970398dfe2`;

  try {
      const response = await fetch(url);
      const data = await response.json();
      populatePage(name, data);
      createChart(data.hourly);
      input.value = "";

  } catch (error) {
    apiFetchErrHandler();
  }
};

//prepare data for longitude and latitude api call when city is entered
const citySearch = (name, country = null) => {
  let url;
  if(country) {
      console.log('using country');
      url= `https://api.openweathermap.org/data/2.5/weather?q=${name},${country}&appid=cf0f236d99f05f78766736970398dfe2`
  } else {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${name}&appid=cf0f236d99f05f78766736970398dfe2`;
  }

  return fetch(url).then(response => {
      if(response.ok) {
          //remove any error statuses that may be present
          input.classList.remove('input-error');
          input.placeholder = 'Enter a city!';
          
          //get data
          return response.json();
      }
  }).then(info => {
      //save name, longitude, and latitude from response
      name = info.name;
      console.log(name);
      const lat = info.coord.lat;
      const lng = info.coord.lon;

      return [name, lat, lng];
  }).then(info => {
      //search using longitude and latitude to get the full response from openWeatherMap API
      getWeather(info[0], info[1], info[2]);
  }).catch(() => {
      apiFetchErrHandler();
  })
}

const apiFetchErrHandler = () => {
  //show user that city can not be found
  input.placeholder = 'could not find';
  input.value = "";
  input.classList.add('input-error'); 
};

// 


//create chart : dataInputArr is hourly array from weather api
const createChart = dataInputArr => {
  //create all necessary components for chart
  const labels = createChartLabels(dataInputArr);
  const dataset = createChartDataSet(dataInputArr);
  const data = {
      labels: labels,
      datasets: [dataset],
  };
  const config = createChartConfig(data);

  //if a chart already exists, destroy it
  if(weatherChart) { weatherChart.destroy(); }

  //create new chart
  weatherChart = new Chart(
      document.getElementById('weather-chart'),
      config
  );
}

//create config file for chart
const createChartConfig = data => {

  //change text color based on current theme
  const status = localStorage.getItem('theme');
  let color = 'black';
  if(status && status == 'dark') {
      color = 'white';
  }

  //create config object
  let config = {
      type: 'line',
      data: data,
      options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
              title: {
                  display: true,
                  text: "Temp for Next 2 days",
                  align: 'center',
                  padding: {
                      top: 5,
                      bottom: 15
                  },
                  color: color,
                  font: {
                      size: '20',
                  }
              },
              legend: {
                  display: false,
              },
              
          },
          scales: {
              x: {
                  ticks: {
                      color: color,
                  font: {
                      family: "'Rubik', 'sans-serif'",
                      size: 14,
                      weight: 'bold'
                  }
                }
              },
              y: {
                  title: {
                      display: true,
                      text: '°C',
                      color: color,
                      font: {
                          family: "'Rubik', 'sans-serif'",
                          size: 16,
                          weight: 'bold'
                      }
                  },
                  ticks: {
                      color: color,
                  }
              }
          },
      },
  };

  return config;
}
