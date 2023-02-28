console.log('si carga')

async function getWeatherData() {
    const API_KEY = '616629f9acdc3b22b8b09553e632e5da';
    const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=Barcelona&appid=${API_KEY}`;
    
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error(error);
    }
  }
  

  getWeatherData().then(data => {
    const temp = data.main.temp;
    const temp_max = data.main.temp_max;
    const temp_min = data.main.temp_min;
    const allDays = data.dt;
    const weahterDays = [];

    allDays.forEach(result => {
      let jsDate = new Date(result * 1000);
      let options = {
        weekday: "long",
        month: "short",
        day: "numeric"
      };
    
        weahterDays.push(jsDate.toLocaleTimeString("es", options));
    
        const ctx = document.getElementById('myChart').getContext('2d');


        new Chart(ctx, {
            type: "bar",
            data: {
            labels: weahterDays,
            datasets: [
                {
                label: "Maxima",
                data: temp_max,
                backgroundColor: [
                    "red",
                    "red",
                    "red",
                    "red",
                    "red",
                    "red",
                    "red"
                ],
                fill: false
                },
                {
                label: "Minima",
                data: temp_min,
                backgroundColor: [
                    "#00ffff",
                    "#00ffff",
                    "#00ffff",
                    "#00ffff",
                    "#00ffff",
                    "#00ffff",
                    "#00ffff"
                ],
                fill: false
                }
            ]
            },
            options: {
            legend: {
                dispaly: false
            },
            scales: {
                xAxes: [
                {
                    display: true
                }
                ],
                yAxes: [
                {
                    display: true
                }
                ]
            }
            }
        });
    });

    
  });
  
  