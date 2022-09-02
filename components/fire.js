import firebase from 'firebase';
// DO NOT TOUCH THIS IMPORT STATEMENT

// ONLY TOUCH THIS VVVVVVVVV

// MODIFY ONLY THIS OBJECT TO CONNECT YOUR APP TO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBCN4opwV9IXKQmzjuwGMVKsv9DoFv2e4Y",
  authDomain: "weight-exchange-app-9580c.firebaseapp.com",
  projectId: "weight-exchange-app-9580c",
  storageBucket: "weight-exchange-app-9580c.appspot.com",
  messagingSenderId: "314575511912",
  appId: "1:314575511912:web:114bcbba1f4d67b1eb76dd"
};
// ONLY TOUCH THIS ^^^^^^^^^


// DO NOT TOUCH ANYTHING BELOW
  
  const fire = firebase.initializeApp(firebaseConfig)

  export default fire;