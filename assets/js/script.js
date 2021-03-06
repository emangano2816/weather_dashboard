$(document).ready(function(){

    var APIKey = "2ff07a7d809c904ff7863737c17f0961";
    var cityInput = $('#city-input');
    var fetchBtn = $('#fetch-btn');
    var resetCityList = $('#reset-cities-btn');
    var searchedCitiesUL = $('#searched-cities');
    var city;
    var cityLi;
    var citySearched;
    var latitude;
    var longitude;
    var currentForecast = $('#todays-weather');
    var futureForecast = $('#futurecast-parent');
    var displayReset = false;
    var searchedLi = [];

   
    //Function searches API using city supplied by user and returns cityies latitude and longitude
    function getLatandLong(citySearch) {
        var requestUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + citySearch +  "&appid=" + APIKey;

         fetch(requestUrl)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                console.log(data);
                
                latitude=data.coord.lat;
                longitude=data.coord.lon;

                getWeather(latitude,longitude);

            })
    }

    //Function searches API using latitude and longitude - returns current and forecasted  weather
    function getWeather(lat, lon) {
        var requestWeatherUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&exclude=minutely,hourly,alerts&appid=" + APIKey;

        fetch(requestWeatherUrl)
            .then(function(response) {
                return response.json();
            })
            .then(function(data){
                console.log(data);
                                               
                populateCurrentWeather(data);
                populate5DayForecast(data);

            })
    }

    //Function populates current weather elements using data included in API response
    function populateCurrentWeather(data) {
        var dateToday = moment.unix(data.current.dt).format("MM/DD/YYYY");
        var cityName = $('<h2>').text(city + " (" + dateToday + ")");
        var currentDescription = $('<p>').text("Description: " + data.current.weather[0].description);
        var currentIcon = data.current.weather[0].icon;
        var currentIconDisplay = $('<img>').attr('src',"http://openweathermap.org/img/w/" + currentIcon + ".png");
        var currentTemp = $('<p>').text("Temp: " + data.current.temp + "\u00B0C");
        var currentHumidity = $('<p>').text("Humidity: " + data.current.humidity + "%");
        var currentWind = $('<p>').text("Wind Speed: " + data.current.wind_speed + " MPH");
        var currentUvColor = $('<span>').text(data.current.uvi);

            if (data.current.uvi <= 2) {
                currentUvColor.addClass('favorable uvIndex');
            } else if (data.current.uvi > 8) {
                currentUvColor.addClass('severe uvIndex');
            } else {
                currentUvColor.addClass('moderate uvIndex');
            };

        var currentUvi = $('<p>').text("UV Index: ").append(currentUvColor);
        currentForecast.append(cityName);
        cityName.append(currentIconDisplay)
        currentForecast.append(currentDescription);
        currentForecast.append(currentTemp);
        currentForecast.append(currentHumidity);
        currentForecast.append(currentWind);
        currentForecast.append(currentUvi);
        currentForecast.append(currentUvi);

        displayReset=true;
        console.log(displayReset);
    }
    
    //Function populates elements for 5-day forecast using data from API response
    function populate5DayForecast(data) {
        for (var i=1; i<6; i++) {
            var dateFuture = moment.unix(data.daily[i].dt).format("MM/DD/YYYY");
            var futureDateDisplay = $('<h4>').text(dateFuture);
            var futureIcon = data.daily[i].weather[0].icon;
            var futureIconDisplay = $('<img>').attr('src',"http://openweathermap.org/img/w/" + futureIcon + ".png");
            futureIconDisplay.attr('width', '60px');
            var futureTemp = $('<p>').text("Temp: " + data.daily[i].temp.day + "\u00B0C");
            var futureHumidity = $('<p>').text("Humidity: " + data.daily[i].humidity + "%");
            var futureWind = $('<p>').text("Wind Speed: " + data.daily[i].wind_speed + " MPH");
            var futureContainer = $('<div>');
            futureContainer.addClass("futurecast");
            futureForecast.append(futureContainer);
            futureContainer.append(futureDateDisplay);
            futureContainer.append(futureIconDisplay)
            futureContainer.append(futureTemp);
            futureContainer.append(futureHumidity);
            futureContainer.append(futureWind);
        }
    }

    //Resets the current and 5-day forecast 
    function resetWeatherDisplay() {
        currentForecast.empty();
        futureForecast.empty();
    }

    //Click event for initial city search
    fetchBtn.on('click', function(event){
        event.preventDefault();
        
        city = cityInput.val();
        console.log(city);

        if (displayReset===true) {
            resetWeatherDisplay();
        }

        if (city !== '') {
            getLatandLong(city);
            searchedLi.push(city);
            console.log(searchedLi)
            storeSearchedCity();
            addSearchedCity();     

            cityInput.val('');   
        } else {
            alert ('City is required for search. Please try again.')
        }
    })

    //Function to add the searched city as a button on the page
    function addSearchedCity() {
        searchedCitiesUL.empty();

        for (var i=0; i<searchedLi.length; i++){
            cityLi = $('<li>').text(searchedLi[i]);
            cityLi.addClass('btn mb-1 btn-city-custom');
            searchedCitiesUL.append(cityLi);
        }
    }

    //Grabs information from local Storage and displays it upon page refresh or page reopening
    function initSearchedCityList() {
        var storeSearchedCities = JSON.parse(localStorage.getItem("searchedCity"));

        if (storeSearchedCities !== null){
            searchedLi = storeSearchedCities;
            resetCityList.attr('display', 'block');
            console.log(resetCityList.attr('display'));
        } else {
            searchedLi = [];
        }

        addSearchedCity();
    }

    initSearchedCityList();

    //Saves searched city to localStorage
    function storeSearchedCity() {
        localStorage.setItem("searchedCity",JSON.stringify(searchedLi));
    }

    //Click event for each saved searched city
    searchedCitiesUL.on('click', '.btn', displaySearchedCity) 

    function displaySearchedCity (event){
        event.preventDefault();
        event.stopPropagation();

        citySearched = $(event.target).text();
        console.log(citySearched);

        if (citySearched===city) {
            return alert('City weather already displayed.')
        } else {
            city = citySearched;
            resetWeatherDisplay();
            getLatandLong(citySearched);
        }
    }

    //Clears localStorage when clear button is clicked
    resetCityList.on('click', function(event){
        event.preventDefault();
        event.stopPropagation();

        localStorage.clear();
        initSearchedCityList();
        resetWeatherDisplay();
    })


})