$(document).ready(function () {


    $('#getWeatherBtn').on('click', () => {
        var city = $('#cityInput').val();
        var data = {
            city: city
        }
        $.ajax({
            type: 'GET',
            url: '/api/weather',
            data: data,
            success: function (response) {
                displayWeather(response);
            },
            error: function (xhr, status, error) {
                console.error('Error occurred while getting weather');
                console.error(xhr.responseText);
                const response = JSON.parse(xhr.responseText);
            }
        });
    });

    function displayWeather(response) {
        var weatherInfo = document.getElementById('weatherInfo');
        var cardHtml = `
          <div class="col-md-4">
            <div class="card weather-card">
              <div class="card-body">
                <h5 class="card-title">${response.name}</h5>
                <p class="card-text">Temperature: ${response.main.temp}</p>
                <p class="card-text">Condition: ${response.weather[0].description}</p>
              </div>
            </div>
          </div>
        `;
        weatherInfo.innerHTML = cardHtml;
        displayHistory();
    }

    function displayHistory() {
        $.ajax({
            type: 'GET',
            url: '/api/weather/history',
            success: function (response) {
                var weatherHistory = document.getElementById('weatherHistory');
                var cardHtml = '';
    
                response.forEach(function(entry) {
                    // Format createdAt field
                    var createdAt = new Date(entry.createdAt);
                    var formattedCreatedAt = createdAt.toLocaleString();
    
                    cardHtml += `
                        <div class="col-md-4">
                          <div class="card weather-card">
                            <div class="card-body">
                              <h5 class="card-title">${entry.city}</h5>
                              <p class="card-text">Temperature: ${entry.temp}</p>
                              <p class="card-text">Condition: ${entry.condition}</p>
                              <p class="card-text">Created at: ${formattedCreatedAt}</p>
                            </div>
                          </div>
                        </div>
                    `;
                });
    
                weatherHistory.innerHTML = cardHtml;
            },
            error: function (xhr, status, error) {
                console.error('Error occurred while getting weather history');
                console.error(xhr.responseText);
            }
        });
    }
    
    displayHistory();
    
})