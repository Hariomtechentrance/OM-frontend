import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const isFirebaseConfigured = () =>
  Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  );

const getFirebaseAuth = () => {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase auth is not configured. Please set up Firebase OAuth credentials:\n\n' +
      '1. Create a Firebase project at https://console.firebase.google.com\n' +
      '2. Enable Google and Facebook authentication\n' +
      '3. Add Firebase credentials to .env.development.local\n' +
      '4. Restart the development server'
    );
  }

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return getAuth(app);
};

export const signInWithGooglePopup = async () => {
  try {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

export const signInWithFacebookPopup = async () => {
  try {
    const auth = getFirebaseAuth();
    const provider = new FacebookAuthProvider();
    provider.setCustomParameters({ display: 'popup' });
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Facebook sign-in error:', error);
    throw error;
  }
};

export const isSocialAuthAvailable = isFirebaseConfigured;

