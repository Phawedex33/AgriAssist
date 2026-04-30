/**
 * @file firebaseService.ts
 * @description Logic for interacting with Firestore with secure error handling.
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  serverTimestamp, 
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { DiagnosisResult } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function saveUserProfile(language: string, primaryCrop: string) {
  if (!auth.currentUser) return;
  const path = `users/${auth.currentUser.uid}`;
  try {
    await setDoc(doc(db, path), {
      uid: auth.currentUser.uid,
      language,
      primaryCrop,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveDiagnosis(result: DiagnosisResult, imageUrl: string) {
  if (!auth.currentUser) return;
  const path = `users/${auth.currentUser.uid}/diagnoses`;
  try {
    await addDoc(collection(db, path), {
      userId: auth.currentUser.uid,
      imageUrl,
      crop: result.cropType,
      disease: result.diseaseName,
      confidence: result.confidence,
      treatment: result.treatmentPlan,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveChatMessage(role: 'user' | 'assistant', content: string) {
  if (!auth.currentUser) return;
  const path = `users/${auth.currentUser.uid}/messages`;
  try {
    await addDoc(collection(db, path), {
      userId: auth.currentUser.uid,
      role,
      content,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getDiagnosesHistory() {
  if (!auth.currentUser) return [];
  const path = `users/${auth.currentUser.uid}/diagnoses`;
  try {
    const q = query(collection(db, path), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}
