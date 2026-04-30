/**
 * @file firebase.ts
 * @description Initialization of Firebase services with offline persistence.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Firestore with modern persistent cache settings
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
}, firebaseConfig.firestoreDatabaseId);

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
        console.warn(`Anonymous sign-in is disabled. To enable history saving, go to: https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers and enable "Anonymous" provider.`);
      } else {
        console.error('Anonymous sign-in failed:', error);
      }
    }
  }
  return auth.currentUser;
}
