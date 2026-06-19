import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

let firebaseConfig;

if (process.env.FIREBASE_WEBAPP_CONFIG) {
  try {
    firebaseConfig = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
  } catch (error) {
    console.error("Error parsing FIREBASE_WEBAPP_CONFIG:", error);
  }
}

if (!firebaseConfig) {
  firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

// Inicializamos Firebase solo si no se ha inicializado antes
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { auth };
