import firebase from "firebase";

let app: firebase.app.App;
try {
  app = firebase.app();
} catch {
  app = firebase.initializeApp({
    apiKey: "AIzaSyCsMTAxjQ15ylh3ORj8SF_k658fqDO0q3g",
    authDomain: "focus-champion-231019.firebaseapp.com",
    databaseURL: "https://<DATABASE_NAME>.firebaseio.com",
    storageBucket: "<BUCKET>.appspot.com"
  });
}

export default app;
