import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyB-GrnVXJdixeou0PWiKJaTtDHRBAkbT-E",
  authDomain: "binbuddies-53f16.firebaseapp.com",
  projectId: "binbuddies-53f16",
  storageBucket: "binbuddies-53f16.appspot.com",
  messagingSenderId: "779714745756",
  appId: "1:779714745756:web:90b3ec82d05039d84ca459"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

document.addEventListener("DOMContentLoaded", () => {
  const locationNameElement = document.getElementById('locationName');
  const locationDescriptionElement = document.getElementById('locationDescription');
  const saveButton = document.getElementById("submitOpinionButton");
  const feedbacksContainer = document.getElementById("feedbacksContainer");
  const editDescriptionButton = document.getElementById("editDescriptionButton");
  const editImageButton = document.getElementById("editImageButton");

  const urlParams = new URLSearchParams(window.location.search);
  const locationName = urlParams.get('location');

  function fetchLocationData(locationName) {
    const placesRef = collection(db, 'locations');
    const queryRef = query(placesRef, where('name', '==', locationName));
  
    return getDocs(queryRef)
      .then((querySnapshot) => {
        const locationData = querySnapshot.docs[0].data();
        const name = locationData.name;
        const description = locationData.description;
        const image = locationData.image; // Assuming the location data has an 'image' field
  
        locationNameElement.textContent = name;
        locationDescriptionElement.textContent = description;
  
        // Show/hide edit buttons based on admin status
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.isAdmin) {
          if (editDescriptionButton) {
            editDescriptionButton.style.display = 'block';
          }
          if (editImageButton) {
            editImageButton.style.display = 'block';
          }
        } else {
          if (editDescriptionButton) {
            editDescriptionButton.style.display = 'none';
          }
          if (editImageButton) {
            editImageButton.style.display = 'none';
          }
        }
  
        const locationImageElement = document.getElementById('locationImage');
        locationImageElement.src = image; // Assuming the 'locationImage' is the ID of the location image element
      })
      .catch((error) => {
        console.log('Error fetching location data:', error);
      });
  }
  




  editImageButton.addEventListener('click', () => {
    const locationImageInput = document.getElementById('locationImageInput');
    locationImageInput.click(); // Trigger the click event of the file input element
  });
  
  // Add event listener to the file input
  
  // ...

// Function to handle location image upload
const handleLocationImageUpload = async (event) => {
  const file = event.target.files[0];

  if (file) {
    // Update the location image in the database
    const locationRef = query(collection(db, 'locations'), where('name', '==', locationName));

    getDocs(locationRef)
      .then((querySnapshot) => {
        const locationDoc = querySnapshot.docs[0];
        if (locationDoc.exists()) {
          const locationId = locationDoc.id;

          // Create a storage reference for the location image
          const locationImageRef = ref(storage, `locationImages/${locationName}`);

          // Upload the file to the storage reference
          uploadBytes(locationImageRef, file)
            .then(() => getDownloadURL(locationImageRef))
            .then((url) => {
              // Update the location document with the new image URL
              updateDoc(doc(db, 'locations', locationId), { image: url })
                .then(() => {
                  const locationImageElement = document.getElementById('locationImage');
                  locationImageElement.src = url;
                  console.log('Location image updated successfully');
                })
                .catch((error) => {
                  console.error('Error updating location image:', error);
                });
            })
            .catch((error) => {
              console.error('Error uploading location image:', error);
            });
        }
      })
      .catch((error) => {
        console.error('Error fetching location data:', error);
      });
  }
};

// Add event listener to the file input
const locationImageInput = document.getElementById('locationImageInput');
locationImageInput.addEventListener('change', handleLocationImageUpload);

// ...




  fetchLocationData(locationName);

  editDescriptionButton.addEventListener("click", () => {
    const newDescription = prompt("Enter the new description:");

    if (newDescription) {
      // Update the location description in the database
      const locationRef = query(collection(db, "locations"), where("name", "==", locationName));

      getDocs(locationRef)
        .then((querySnapshot) => {
          const locationDoc = querySnapshot.docs[0];
          if (locationDoc.exists()) {
            const locationId = locationDoc.id;
            updateDoc(doc(db, "locations", locationId), { description: newDescription })
              .then(() => {
                locationDescriptionElement.textContent = newDescription;
                console.log("Location description updated successfully");
              })
              .catch((error) => {
                console.error("Error updating location description:", error);
              });
          }
        })
        .catch((error) => {
          console.error("Error fetching location data:", error);
        });
    }
  });

  saveButton.addEventListener("click", () => {
    const opinionInput = document.getElementById('opinionInput');
    const opinion = opinionInput.value.trim();

    if (opinion !== "") {
      addDoc(collection(db, "feedbacks"), {
        location: locationName,
        feedback: opinion,
        timestamp: new Date()
      })
        .then(() => {
          opinionInput.value = "";
          displayFeedbacksForLocation();
        })
        .catch((error) => {
          console.error("Error saving feedback:", error);
        });
    }
  });

  function displayFeedbacksForLocation() {
    feedbacksContainer.innerHTML = '';

    const feedbacksRef = collection(db, "feedbacks");
    const queryRef = query(feedbacksRef, where("location", "==", locationName), orderBy("timestamp", "desc"));

    getDocs(queryRef)
      .then((querySnapshot) => {
        let feedbacksHtml = "";
        querySnapshot.forEach((doc) => {
          const feedbackId = doc.id;
          const feedback = doc.data().feedback;
          const isAdmin = JSON.parse(localStorage.getItem('currentUser')).isAdmin;

          feedbacksHtml += `
            <div class="feedback">
              <p>${feedback}</p>
              ${
                isAdmin
                  ? `<button class="delete-button" data-feedback-id="${feedbackId}">Delete</button>`
                  : ''
              }
            </div>
          `;
        });

        feedbacksContainer.innerHTML = feedbacksHtml;

        const deleteButtons = document.getElementsByClassName('delete-button');
        for (const button of deleteButtons) {
          button.addEventListener('click', (event) => {
            const feedbackId = event.target.getAttribute('data-feedback-id');
            deleteFeedback(feedbackId);
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching feedbacks:", error);
      });
  }

  function deleteFeedback(feedbackId) {
    deleteDoc(doc(db, "feedbacks", feedbackId))
      .then(() => {
        console.log("Feedback deleted successfully");
        displayFeedbacksForLocation();
      })
      .catch((error) => {
        console.error("Error deleting feedback:", error);
      });
  }

  displayFeedbacksForLocation();
});



document.addEventListener('DOMContentLoaded', () => {
  // Retrieve the latitude and longitude from the URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const latitude = parseFloat(urlParams.get('latitude'));
  const longitude = parseFloat(urlParams.get('longitude'));

  // Create an object with the retrieved coordinates
  const locationCoordinates = { latitude, longitude };

  // Use the locationCoordinates object for saving and displaying the locations

  const saveButton = document.getElementById('saveButton');

  saveButton.addEventListener('click', () => {
    // Retrieve the necessary location data
    const locationName = document.getElementById('locationName').textContent;

    // Create an array to store the saved locations (if not already present)
    const savedLocations = JSON.parse(localStorage.getItem('savedLocations')) || [];

    // Add the current location to the saved locations array
    savedLocations.push({ name: locationName, coordinates: locationCoordinates });

    // Store the updated saved locations array in local storage
    localStorage.setItem('savedLocations', JSON.stringify(savedLocations));

    // Optionally, you can provide feedback to the user that the location was saved
  });

  // Retrieve the saved locations from local storage
  const savedLocations = JSON.parse(localStorage.getItem('savedLocations')) || [];

  // Generate HTML elements for each saved location
  const savedLocationsContainer = document.getElementById('savedLocationsContainer'); // Replace with the ID of the container element on the page

  savedLocations.forEach((location) => {
    const locationElement = document.createElement('div');
    locationElement.textContent = location.name;

    savedLocationsContainer.appendChild(locationElement);
  });

  // Initialize the map and display the trajectory to the selected location
  mapboxgl.accessToken = 'pk.eyJ1IjoicGVkcm9nb21lczI4IiwiYSI6ImNsaXNvOXhmaTAwbGMzZG04YmtlcHhpbjQifQ.ImOMkN8ZGCJXQo9H6TmOYQ';

const map = new mapboxgl.Map({
  container: 'map', 
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: 'mapbox://styles/mapbox/outdoors-v12', // style URL
  center: [-8.575753, 41.256237], // starting position [lng, lat]
  zoom: 8 // starting zoom
});

  // Add a marker at the selected location
  const marker = new mapboxgl.Marker().setLngLat([longitude, latitude]).addTo(map);

  // If you want to display a trajectory, you can add a line between the user's current location and the selected location
  // Replace `userLongitude` and `userLatitude` with the actual coordinates of the user's current location
  const userLongitude = 0.0; // Replace with the user's longitude
  const userLatitude = 0.0; // Replace with the user's latitude

  const trajectoryCoordinates = [
    [userLongitude, userLatitude], // Start point (user's current location)
    [longitude, latitude] // End point (selected location)
  ];

  const trajectoryGeoJSON = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: trajectoryCoordinates
    }
  };

  // Add the trajectory line to the map
  map.on('load', () => {
    map.addSource('trajectory', {
      type: 'geojson',
      data: trajectoryGeoJSON
    });

    map.addLayer({
      id: 'trajectory',
      type: 'line',
      source: 'trajectory',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': 'blue',
        'line-width': 3
      }
    });
  });
});

