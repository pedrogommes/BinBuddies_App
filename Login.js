

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js"
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("Service worker registered:", registration);
      })
      .catch((error) => {
        console.log("Service worker registration failed:", error);
      });
  });
}


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
const db = getFirestore(app); // Add this line to initialize Firestore

const login = async () => {
  console.log("Login function called.");

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  console.log("Email:", email);
  console.log("Password:", password);

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log(userCredential.user);

    // Retrieve the user's document from the database
    const userDocRef = doc(db, 'users', userCredential.user.email);
    const userDocSnapshot = await getDoc(userDocRef);
    if (userDocSnapshot.exists()) {
      const userData = userDocSnapshot.data();
      const isAdmin = userData.role === 'admin';

      localStorage.setItem('currentUser', JSON.stringify({
        ...userCredential.user,
        isAdmin
      }));

      if (isAdmin) {
        // Redirect to the admin page
        window.location.href = "Home.html";
      } else {
        // Redirect to the normal user page
        window.location.href = "Home.html";
      }
    } else {
      // User document does not exist
      console.log('User document not found.');
    }
  } catch (error) {
    console.log("Error:", error);
    // Handle the error here
    console.log(error.message);
    // Show the login error message to the user
    showLoginError(error.message);
  }
};

const loginButton = document.getElementById("LoginButton");
loginButton.addEventListener('click', login);

const monitorAuthState = () => {
  onAuthStateChanged(auth, user => {
    if (user) {
      console.log(user);

      // Store user information in local storage
      const userObj = {
        name: user.displayName,
        email: user.email,
        uid: user.uid
      };
      localStorage.setItem('currentUser', JSON.stringify(userObj));
    } else {
      // Handle the case when the user is not logged in
      localStorage.removeItem('currentUser');
    }
  });
};

monitorAuthState();


