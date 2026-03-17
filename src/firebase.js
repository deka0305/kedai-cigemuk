import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDsQUPiHcFR_vela7qWyQ1j8gIdVIQGmtQ",
  authDomain: "kedai-cigemuk.firebaseapp.com",
  projectId: "kedai-cigemuk",
  storageBucket: "kedai-cigemuk.firebasestorage.app",
  messagingSenderId: "384798504323",
  appId: "1:384798504323:web:0a1884500692d1a92272b6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);