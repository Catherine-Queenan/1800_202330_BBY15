
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZ_-Plt7pkDtrd-OBWLDMX5PUKG4lTMbs",
  authDomain: "neighbourhood-bark.firebaseapp.com",
  projectId: "neighbourhood-bark",
  storageBucket: "neighbourhood-bark.appspot.com",
  messagingSenderId: "212739038196",
  appId: "1:212739038196:web:a8f9d52cd00fa041e677a1"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
var storageRef = storage.ref();