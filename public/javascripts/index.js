const sentence = "Get weather and nearby attractions";
const delay = 100; // 각 글자 출력 간격 (밀리초)

let index = 0;
const visualText = document.querySelector('.visualText');

function printLetter() {
  if (index < sentence.length) {
    visualText.textContent += sentence[index];
    index++;
    setTimeout(printLetter, delay);
  }
}

printLetter();

// Check if Geolocation is supported
if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(async function(position) {
        try {
            // Get latitude and longitude
            let latitude = position.coords.latitude;
            let longitude = position.coords.longitude;
            // Call the server to fetch tourist attractions and weather
            const response = await fetch('/info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ lat: latitude, lon: longitude })
            });

            if (response.ok) {
                const data = await response.json();
                // Hide the loading indicator
                document.getElementById('loader').style.display = 'none';
                // Show the location information
                let section = document.querySelectorAll('section');
                for(let i = 0; i < section.length; i++){
                    section[i].style.display = 'block';
                }
                
                // Display current Address
                document.getElementById('locationInfo').textContent = data.currentAddress;

                const ulContainer = document.getElementById('touristAttractions');
                data.touristAttractions.forEach(attraction => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <a href="https://www.google.com/search?q=${encodeURIComponent(attraction.name)}" target="_blank" class="attractionName">${attraction.name}
                            <span class="attractionInfo">Address: ${attraction.vicinity}</span>
                            <span class="attractionInfo">Rating: <span class="rating">${attraction.rating}</span></span>
                        </a>
                    `;
                    ulContainer.appendChild(li);
                });

                let temp = (data.weather.main.temp - 273.15).toFixed(2);
                document.getElementById('temperature').textContent = temp;

                let description = data.weather.weather[0].description
                document.getElementById('weatherDescription').textContent = description;
            } else {
                throw new Error('Failed to fetch data');
            }
        } catch (error) {
            console.error(error);
            // Hide the loading indicator
            document.getElementById('loader').style.display = 'none';
            // Show error message
            alert('Failed to fetch data');
        }
    });
} else {
    // Hide the loading indicator
    document.getElementById('loader').style.display = 'none';
    // Show the location information
    document.getElementById('locationInfo').style.display = 'block';
    // Display a warning if geolocation is not supported
    alert('Geolocation is not supported by your browser.');
}