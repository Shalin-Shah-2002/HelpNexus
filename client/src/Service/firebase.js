import { initializeApp, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: "helpnexus-7d704.firebaseapp.com",
    projectId: "helpnexus-7d704",
    storageBucket: "helpnexus-7d704.appspot.com",
    messagingSenderId: "850293505765",
    appId: "1:850293505765:web:2d53a7e55af342e2e85e0c",
    measurementId: "G-R7R4HL5Y69"
};

let app;
try {
    app = initializeApp(firebaseConfig);
} catch (error) {
    // If an app is already initialized, use that instead
    if (error.code === 'app/duplicate-app') {
        app = getApp();
    } else {
        throw error;
    }
}

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };






