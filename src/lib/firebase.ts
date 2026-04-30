/**
 * @file firebase.ts
 * @description Initialization of Firebase services with offline persistence.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Firestore with the specific database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);

/**
 * Ensures the user is signed in anonymously.
 * This satisfies the "fastest for demo" and "seamless onboarding" requirements.
 */
export async function ensureSignedIn() {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
      console.log('Signed in anonymously:', auth.currentUser?.uid);
    } catch (error: any) {
      if (error.code === 'auth/admin-restricted-operation') {
        console.warn('Anonymous sign-in is disabled in Firebase Console. App will continue in guest mode (data won\'t persist across devices).');
      } else {
        console.error('Anonymous sign-in failed:', error);
      }
    }
  }
  return auth.currentUser;
}

/**
 * Enables offline persistence for Firestore.
 * This is a critical differentiator for rural farming apps.
 */
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a time.
    console.warn('Persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    // The current browser does not support all of the features required to enable persistence
    console.warn('Persistence failed: Browser not supported');
  }
});
