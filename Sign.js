import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore, collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

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

const signUp = async () => {

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  console.log("Email:", email);
  console.log("Password:", password);

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log(userCredential.user);

    const user = {
      name: name,
      email: email
    };

    const docRef = doc(db, 'users', email); // Use email as the document ID
    await setDoc(docRef, user);

    localStorage.setItem('currentUser', JSON.stringify(user));

    window.location.href = "Home.html";
  } catch (error) {
    console.log("Error:", error);
    console.log(error.message);
  }
};

const signUpButton = document.getElementById("SignUpButton");
signUpButton.addEventListener('click', signUp);

const monitorAuthState = () => {
    onAuthStateChanged(auth, user => {
      if (user) {
        console.log(user);
  
        // Store user information in local storage
        const userObj = {
          name: user.displayName,
          email: user.email,
        };
        localStorage.setItem('currentUser', JSON.stringify(userObj));
      } else {
        // Handle the case when the user is not logged in
        localStorage.removeItem('currentUser');
      }
    });
  };

monitorAuthState();

