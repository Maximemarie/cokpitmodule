const WEATHER_API_KEY = "11c9e5c00a56f443154f3ea958ce6f9f";
const widgetEL = document.getElementById("widget");
const loaderEL = document.getElementById("loader");
const tempEL = document.getElementById("temp");
const cityEL = document.getElementById("city");
const toggleEL = document.getElementById("toggle");
const toggleInputEL = document.getElementById("temp-toggle");
const flagEL = document.getElementById("flag");

let tempC = -1;
let tempF = -1;
let city = "Montreal, QC";
let countryCode = '';

let temp = -1;
let time = 0;
const minTime = 1;
const maxTime = 900;

function easeInQuad(t, b, c, d){
  return c*(t/= d) * t + b;
}

function setData(newTemp, newCity){
  tempEL.innerHTML = `${newTemp}°`;
  cityEL.innerHTML = city;
  temp = newTemp;
  city = newCity;
}

function setTemp(newTemp) {
  tempEL.innerHTML = `${newTemp}°`;
  cityEL.innerHTML = city;
  temp = newTemp;
}

function hideLoading() {
  loaderEL.style.display = 'none';
  toggleEL.style.display = 'inline-block';
}

function changeTemp(nextTemp) {
  const lower = Math.min(temp, nextTemp);
  const higher = Math.max(temp, nextTemp);
  const diff = higher -lower;
  const increase = nextTemp > temp;
  let currTemp = increase ? lower : higher;

  toggleInputEL.setAttribute("disabled", "true");
  for(let i = 0; i <= diff; i++){
    (function(s){
      const timer = setTimeout(function(){
        setTemp(increase ? currTemp++ : currTemp--);
        if (currTemp === nextTemp){
          toggleInputEL.removeAttribute("disabled");
        }
      }, time);
    })(i);
    time = easeInQuad(i, minTime, maxTime, diff);

  }
  temp = currTemp;
}

async function getLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(async(pos) =>{
          const {latitude, longitude} =pos.coords;

          const url = `http://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}`;

          try{
            console.log('fetch = ${url}');
            const resp = await fetch(url);
            const data = await resp.json();
            if (data){
              const {address} = data;
              const {city, village, state_district, state, country, country_code} =address;
              let placeStr = "";
              if (city || village || state_district){
                placeStr = `$(city || village || state_district},${state || country}`;

              } else if (state && country){
                placeStr = `${state}, ${country}`;

              } else if (country) {
                placeStr = country;
              }
              countryCode = country_code;
              resolve(placeStr);
            }
          } catch (err){
            console.error(err);
            reject(err);
          }
        });
      } else {
        return;
        console.log('Geolocation is not supported by this browser');
      }
  });
}
async function getWeatherData(){
  try{
    if(navigator.userAgent.match(/chrome|chromium|crios/i)){
      city = await getLocation();
    }
  } catch(e){
    console.error(e);
  }
  const url = `http://api.weatherstack.com/current?access_key=${WEATHER_API_KEY}&query=${city}`;
  try{
      console.log(`fetch - ${url}`);
      const resp = await fetch(url);
      const data = await resp.json();
      console.log(data);
      tempC = Math.round(data.current.temperature);
      tempF = Math.round(data.current.temperature * 9/5 + 32);

      hideLoading();
      setData(tempC, city);
  } catch (err) {
    hideLoading();
    console.error(err);
  }
}

getWeatherData();

toggleInputEL.addEventListener('change', function(){

  if(this.checked) {
    changeTemp(tempC);
  } else {
    changeTemp(tempF);
  }
});
