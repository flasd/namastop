import firebase from 'firebase/app';
import 'firebase/firestore';

firebase.initializeApp({
  apiKey: 'AIzaSyAsi9G-Kiv9fkoXNTQIZzBxAtO4crC1vPI',
  authDomain: 'namastop-app.firebaseapp.com',
  databaseURL: 'https://namastop-app.firebaseio.com',
  projectId: 'namastop-app',
  storageBucket: 'namastop-app.appspot.com',
  messagingSenderId: '736299359858',
});

firebase.firestore().settings({ timestampsInSnapshots: true });

export default firebase;
