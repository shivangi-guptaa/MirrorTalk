import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyARY-56curStqQU3qyXTDwUZm0V5632oTs",
  authDomain: "mirrortalk-24d83.firebaseapp.com",
  projectId: "mirrortalk-24d83",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
