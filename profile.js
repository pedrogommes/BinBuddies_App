import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyB-GrnVXJdixeou0PWiKJaTtDHRBAkbT-E",
  authDomain: "binbuddies-53f16.firebaseapp.com",
  databaseURL: "https://binbuddies-53f16-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "binbuddies-53f16",
  storageBucket: "binbuddies-53f16.appspot.com",
  messagingSenderId: "779714745756",
  appId: "1:779714745756:web:90b3ec82d05039d84ca459"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ...

const monitorAuthState = () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log(user);

      // Display user information
      const userInfoDiv = document.getElementById("user-info");
      userInfoDiv.innerHTML = ""; // Clear previous user information

      // Retrieve user profile picture and name from Firestore
      try {
        const userDocRef = doc(db, "users", user.email);
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();

          const profilePictureUrl = userData.profilePicture;
          if (profilePictureUrl) {
            const profilePictureElement = document.createElement("img");
            profilePictureElement.src = profilePictureUrl;
            profilePictureElement.alt = "Profile Picture";
            userInfoDiv.appendChild(profilePictureElement);
          } else {
            // Set default profile picture URL
            const defaultProfilePictureUrl = "images/DefaultProfilePic.jpg";

            const profilePictureElement = document.createElement("img");
            profilePictureElement.src = defaultProfilePictureUrl;
            profilePictureElement.alt = "Default Profile Picture";
            userInfoDiv.appendChild(profilePictureElement);
          }

          const nameElement = document.createElement("p");
          nameElement.textContent = `${userData.name || "Unknown"}`;
          userInfoDiv.appendChild(nameElement);

        }
      } catch (error) {
        console.log("Error retrieving user data from Firestore:", error);
      }
    } else {
      console.log("User logged out.");

      // Redirect to the login page
      window.location.href = "index.html";
    }
  });
};
const handleProfilePictureUpload = async (event) => {
  const profilePictureInput = event.target;
  const file = profilePictureInput.files[0];

  if (file) {
    const user = auth.currentUser;

    try {
      // Create a storage reference for the user's profile picture
      const email = user.email;
      const encodedEmail = email.replace("@", "_at_"); // Replace "@" with "_at_"
      const storageRef = ref(storage, `profilePictures/${encodedEmail}`);

      // Upload the file to the storage reference
      await uploadBytes(storageRef, file);

      // Get the download URL of the uploaded file
      const downloadURL = await getDownloadURL(storageRef);

      // Update the user's profile picture URL in Firestore
      const userDocRef = doc(db, "users", user.email);
      await updateDoc(userDocRef, { profilePicture: downloadURL });

      console.log("Profile picture uploaded successfully.");

      // Refresh the user information
      monitorAuthState();
    } catch (error) {
      console.log("Error uploading profile picture:", error);
    }
  }
};

// Add event listener to the file input
const profilePictureInput = document.getElementById("profile-picture-input");
profilePictureInput.addEventListener("change", handleProfilePictureUpload);

// ...


monitorAuthState();

const logoutButton = document.getElementById("logout-button");
logoutButton.style.display = "block";

// Add event listener to logout button
logoutButton.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      console.log("User logged out.");
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.log("Error signing out:", error);
    });
});