// src/lib/firebase.ts

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { config } from './config';

// Firebase configuration from centralized config
const firebaseConfig = config.firebase;

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
console.log('🔴 Firebase app initialized:', app.name);

// Initialize Firebase services
const auth = Platform.OS === 'web'
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: AsyncStorage,
    });

const db = getFirestore(app);
console.log('🔴 Firebase services initialized - Auth:', !!auth, 'DB:', !!db);

// Add auth state change listener for debugging
auth.onAuthStateChanged((user) => {
  console.log('🔴 Firebase auth state changed:', user ? 'User signed in' : 'User signed out');
  if (user) {
    console.log('🔴 Current user:', user.email, user.uid);
  }
});

// Export services for use throughout your app
export { app, auth, db, firebaseConfig };