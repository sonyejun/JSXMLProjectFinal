var express = require('express');
var router = express.Router();
let fetch;

(async () => {
  const { default: fetchModule } = await import('node-fetch');
  fetch = fetchModule;
  // 이어지는 코드...
})();

const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'openstreetmap'
};
const geocoder = NodeGeocoder(options);

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// Route to handle form submission and display information
router.post('/info', async (req, res) => {
  try {
    const { lat, lon } = req.body; // Assuming client sends latitude and longitude
    const googlePlacesAPIKey = 'AIzaSyDUKMoIRffFCq8SWq4kiNIR9bHBYMl3jmY';
    const openWeatherMapAPIKey = 'f41359f739df7b2bba2c55ee0e65a17e';

    // Call geocoder to get current address
    geocoder.reverse({ lat: lat, lon: lon }, (err, geoRes) => {
      if (err) {
        console.log('에러:', err);
        return res.status(500).send('Geocoder Error');
      }
      const currentAddress = geoRes[0].formattedAddress;

      // Call Google Places API to get nearby tourist attractions
      fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=1000&type=tourist_attraction&key=${googlePlacesAPIKey}`)
        .then(response => response.json())
        .then(placesData => {
          // Call OpenWeatherMap API to get current weather
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherMapAPIKey}`)
            .then(response => response.json())
            .then(weatherData => {
              // Render the results using the ejs template
              res.json({currentAddress, touristAttractions: placesData.results, weather: weatherData });
            })
            .catch(error => {
              console.error(error);
              res.status(500).send('Weather API Error');
            });
        })
        .catch(error => {
          console.error(error);
          res.status(500).send('Google Places API Error');
        });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;