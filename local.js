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
        const image = locationData.image;
  
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




