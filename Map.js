mapboxgl.accessToken = 'pk.eyJ1IjoicGVkcm9nb21lczI4IiwiYSI6ImNsaXNvOXhmaTAwbGMzZG04YmtlcHhpbjQifQ.ImOMkN8ZGCJXQo9H6TmOYQ';

const map = new mapboxgl.Map({
  container: 'map', 
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: 'mapbox://styles/mapbox/outdoors-v12', // style URL
  center: [-8.575753, 41.256237], // starting position [lng, lat]
  zoom: 8 // starting zoom
});

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB-GrnVXJdixeou0PWiKJaTtDHRBAkbT-E",
  authDomain: "binbuddies-53f16.firebaseapp.com",
  projectId: "binbuddies-53f16",
  storageBucket: "binbuddies-53f16.appspot.com",
  messagingSenderId: "779714745756",
  appId: "1:779714745756:web:90b3ec82d05039d84ca459"
};

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, query, where, limit, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function fetchLocations() {
  const placesRef = collection(db, 'locations');

  return getDocs(placesRef)
    .then((querySnapshot) => {
      const locations = [];
      querySnapshot.forEach((doc) => {
        const locationData = doc.data();
        locations.push(locationData);
      });
      return locations;
    })
    .catch((error) => {
      console.log('Error fetching locations:', error);
      return [];
    });
}

function displayLocations(locations) {
  const markers = [];

  locations.forEach((location) => {
    const { latitude, longitude, name } = location;

    const marker = new mapboxgl.Marker()
      .setLngLat([longitude, latitude])
      .addTo(map);

    marker.getElement().addEventListener('click', () => {
      const encodedLocationName = encodeURIComponent(name);
      window.location.href = `Local.html?location=${encodedLocationName}`;
    });

    markers.push(marker);
  });
}

fetchLocations()
  .then((locations) => {
    displayLocations(locations);
  })
  .catch((error) => {
    console.log('Error fetching locations:', error);
  });

map.on('click', (e) => {
  const features = map.queryRenderedFeatures(e.point, { layers: ['markers'] });

  if (features.length > 0) {
    const locationName = features[0].properties.name;
    const encodedLocationName = encodeURIComponent(locationName);
    window.location.href = `Local.html?location=${encodedLocationName}`;
  }
});


const urlParams = new URLSearchParams(window.location.search);
    const latitude = parseFloat(urlParams.get('lat'));
    const longitude = parseFloat(urlParams.get('lng'));


    document.getElementById('search-button').addEventListener('click', searchPlace);


    function searchPlace() {
      const searchInput = document.getElementById('search-input');
      const searchTerm = searchInput.value.trim();
    
      // Perform the search using the Mapbox Geocoding API
      const geocodingApiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchTerm)}.json?access_token=${mapboxgl.accessToken}`;
      
      fetch(geocodingApiUrl)
        .then(response => response.json())
        .then(data => {
          // Extract the coordinates from the API response
          const [longitude, latitude] = data.features[0].center;
          
          // Update the map with the searched location
          map.jumpTo({ center: [longitude, latitude], zoom: 12 });
        })
        .catch(error => {
          console.log('Error geocoding place:', error);
        });
    }
    


// Get the user current location
let userMarker = null;

if (navigator.geolocation) {
  // Watch for location updates
  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      map.setCenter([longitude, latitude]);

      if (userMarker) {
        userMarker.remove();
      }

      // Add a new marker at the user's updated location
      userMarker = new mapboxgl.Marker({ color: 'red' }).setLngLat([longitude, latitude]).addTo(map);
    },
    (error) => {
      console.log('Error getting user location:', error);
    }
  );


} else {
  console.log('Geolocation is not supported by this browser');
}



    
    