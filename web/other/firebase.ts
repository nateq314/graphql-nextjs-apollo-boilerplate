import firebase from "firebase/app";
import "firebase/auth";

let app: firebase.app.App;
try {
  app = firebase.app();
} catch (error) {
  try {
    app = firebase.initializeApp({
      apiKey: "AIzaSyCsMTAxjQ15ylh3ORj8SF_k658fqDO0q3g",
      authDomain: "focus-champion-231019.firebaseapp.com"
    });
  } catch (error2) {
    console.error("error:", error2);
    throw error2;
  }
}

export default app;
