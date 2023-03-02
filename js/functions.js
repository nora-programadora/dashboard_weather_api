//-------------------------------------------- Global Variables -------------------------------------//
//import createChartConfig from ('./chartConfig');
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

//Initialize page based on what user had searched last
const pageInitialize = () => {
    //if user has saved data - populate page with most recent city
    //else show message on page for user to search for one
    const cities = localStorageGet();
    if(cities.length) {
        getWeather(cities[0].name, cities[0].lat, cities[0].lng);
    } else {
       recentCities.innerHTML = '<p class="new-user-msg">Please Select A City!</p>';
       weatherTodayCont.classList.add('hidden');
       forcastCont.classList.add('hidden');
    }
};

//populate page with all information gained from the api call
const populatePage = (name, info) => {
    
    populateToday(name, info.current);
    populateDaily(info.daily);
    weatherTodayCont.classList.remove('hidden');
    forcastCont.classList.remove('hidden');
}

//populate todays weather div
const populateToday = (name, info) => {

    selectedCity.innerText = name;
    dateToday.innerText = dayjs.unix(info.dt).format('MMMM DD');
    condToday.innerHTML = `<span>Condition</span><span>${info.weather[0].description}</span>`;
    tempToday.innerHTML = `<span>Temp</span><span>${info.temp} &#8451;</span>`;
    windToday.innerHTML = `<span>Wind</span><span>${info.wind_speed} m/s</span>`;
    humidityToday.innerHTML = `<span>Humidity</span><span>${info.humidity} %</span>`;
    uvToday.innerHTML = `<span>UV</span><span id="uvi">${info.uvi}</span>`;
    //set danger color for uv index
    const uvStatus = document.querySelector('#uvi');
    info.uvi < 2 ? uvStatus.className = "safe" :
    info.uvi < 5 ? uvStatus.className = "moderate" :
    info.uvi < 7 ? uvStatus.className = "high" :
    uvStatus.className = "danger";

    statusPic.setAttribute('src', `http://openweathermap.org/img/wn/${info.weather[0].icon}@2x.png`);
    statusPic.setAttribute('alt', `${info.weather[0].description}`);

    document.querySelector('.today-card').classList.remove('hidden');
}


const populateDaily = info => {
    let temp_min, temp_max, desc, wind_speed, humid, date, icon;
    const fragment = new DocumentFragment();
    
    for(let i = 1; i < 6; i++) {
        //get info
        temp_min = info[i].temp.min;
        temp_max = info[i].temp.max;
        desc = info[i].weather[0].description;
        wind_speed = info[i].wind_speed;
        humid = info[i].humidity;
        date = info[i].dt;
        icon = info[i].weather[0].icon;

        //create card
        const card = document.createElement('article');
        card.className = 'day-card card';

        //create header container
        const titleContainer = document.createElement('section');
        titleContainer.className = 'day-card-title-container';

        //create header -> day of the week
        const title = document.createElement('h3');
        title.className = 'day';
        title.innerText = dayjs.unix(date).format('dddd');

        //create subtitle
        const subTitle = document.createElement('p');
        subTitle.className = 'date';
        subTitle.innerText = dayjs.unix(date).format('MMM DD');

        //create section to hold weather info icon
        const picContainer = document.createElement('section');
        picContainer.className = "day-pic-container";

        //create weather info icon
        const pic = document.createElement('img');
        pic.setAttribute('src', `http://openweathermap.org/img/wn/${icon}@4x.png`)
        pic.setAttribute('alt', desc);
        pic.className = "weather-pic";
        

        //create info container and elements
        const infoCont = document.createElement('section');
        const weatherDesc = document.createElement('p');
        const tempMax = document.createElement('p');
        const tempMin = document.createElement('p');
        const wind = document.createElement('p');
        const humidity = document.createElement('p');
        infoCont.className = "day-card-info";
        weatherDesc.className = 'weather-desc';
        tempMax.className = 'temp-max';
        tempMin.className = 'temp-min';
        wind.className = 'wind-speed';
        humidity.className = 'humidity';
        weatherDesc.innerHTML = `<span>Cond:</span><span>${desc}</span>`;
        tempMax.innerHTML = `<span>High:</span><span>${temp_max} &#8451;</span>`;
        tempMin.innerHTML = `<span>Low:</span><span>${temp_min} &#8451;</span>`;
        wind.innerHTML = `<span>Wind:</span><span>${wind_speed} m/s</span>`;
        humidity.innerHTML = `<span>Humidity:</span><span>${humid}%</span>`;

        //append together and assemble card
        picContainer.append(pic);
        infoCont.append(weatherDesc, tempMax, tempMin, wind, humidity);
        titleContainer.append(title, subTitle);
        card.append(titleContainer, picContainer, infoCont);

        //append entire card to parent div
        fragment.append(card);
    }
    forcast.innerHTML = "";
    forcast.append(fragment);
}


//updates current place object with google api when user presses search -> gets weather
const searchHandler = event => {
    event.preventDefault();
    const inputs = input.value.split(',');
    if(inputs.length === 1) {
        citySearch(input.value);
    } else {
        citySearch(inputs[0], inputs[1]);
    }
    
    
}


//fetching recent cities from local storage
const localStorageGet = () => {
    const data = localStorage.getItem('cities');

    return data ? JSON.parse(data) : [];
}


//------------------------------------- chart code : chart.js -------------------------------------------------------//

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

//create labels array -> y axis : dataInputArr is hourly array from weather api
const createChartLabels = dataInputArr => {
    let labels = [];
    dataInputArr.forEach(hour => {
        labels.push(dayjs.unix(hour.dt).format('ddd h a'));
    });

    return labels;
};

//create data array -> x axis : dataInputArr is hourly array from weather api
const createChartDataSet = dataInputArr => {
    let data = [];
    dataInputArr.forEach(hour => {
        data.push(hour.temp);
    });

    const dataset = {
        label: 'Degrees',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        fill: true,
        data: data,
    };

    return dataset;
};

//handler function for resizing of page, will redraw chart to fit parent div
function beforePrintHandler () {
    for (var id in Chart.instances) {
      Chart.instances[id].resize();
    }
}



//-------------------------------------- Initialize ------------------------------------------ //

//Initialization Function
const init = () => {
    pageInitialize();
    searchForm.addEventListener('submit', searchHandler);
}

//Wait for window to load to initialize
window.addEventListener('load', init);