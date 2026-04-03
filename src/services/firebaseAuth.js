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
      'Firebase auth is not configured. Add REACT_APP_FIREBASE_* keys in .env.development.local'
    );
  }

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return getAuth(app);
};

export const signInWithGooglePopup = async () => {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const signInWithFacebookPopup = async () => {
  const auth = getFirebaseAuth();
  const provider = new FacebookAuthProvider();
  provider.setCustomParameters({ display: 'popup' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

