import { useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { GoogleAuthService } from '@/lib/googleAuth';
import { getAuthErrorMessage, AuthError } from '@/lib/authErrors';

// Use the standard Firebase User type and add any custom properties as needed.
export type AppUser = User & {
  uid: string;
  
};

// Function to create or update a user document in Firestore
async function createOrUpdateUserDocument(user: User) {
  if (!user || !user.uid) return;

  const userDocRef = doc(db, 'users', user.uid);

  // Check if the document already exists to avoid overwriting
  const docSnap = await getDoc(userDocRef);
  if (docSnap.exists()) {
    console.log('🔴 User document already exists, skipping creation.');
    // You could update fields here if needed
    return;
  }

  try {
    // Create the new user document
    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      full_name: user.displayName || user.email?.split('@')[0],
      journey_start_date: new Date().toISOString(),
      // Add any other default user data you need
    });
    console.log('🔴 User document created successfully!');
  } catch (error) {
    console.error('🔴 Error creating user document:', error);
  }
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  // Real-time listener for Firebase Auth state changes
  useEffect(() => {
  const subscriber = onAuthStateChanged(auth, async (currentUser) => {
      console.log('🔴 Auth state changed:', currentUser ? 'User signed in' : 'User signed out');
      
      if (currentUser) {
        const appUser: AppUser = {
          ...currentUser,
          uid: currentUser.uid,
        };
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return subscriber; // unsubscribe on unmount
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log('🔴 Attempting to sign in with email:', email);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('🔴 Firebase sign in successful for user:', userCredential.user.uid);

      // Create or update user document
      await createOrUpdateUserDocument(userCredential.user);

      const appUser: AppUser = {
        ...userCredential.user,
        uid: userCredential.user.uid,
      };

      return { data: { user: appUser }, error: null };
    } catch (error: any) {
      console.error('🔴 Error during sign in:', error);
      const authError = getAuthErrorMessage(error);

      return {
        data: null,
        error: authError,
      };
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: fullName,
        });
      }

      // Create user document
      await createOrUpdateUserDocument(userCredential.user);

      const appUser: AppUser = {
        ...userCredential.user,
        uid: userCredential.user.uid,
      };

      return { data: { user: appUser }, error: null };
    } catch (error: any) {
      console.error('🔴 Error during sign up:', error);
      const authError = getAuthErrorMessage(error);

      return {
        data: null,
        error: authError,
      };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      console.log('🔴 Firebase sign out successful');
      return { error: null };
    } catch (error: any) {
      console.error('🔴 Error during sign out:', error);
      const authError = getAuthErrorMessage(error);

      // Even if Firebase sign out fails, clear the local user state
      setUser(null);

      return {
        error: authError,
      };
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('🔴 Starting Google Sign-In...');

      const result = await GoogleAuthService.signInWithGoogleFirebase();

      if (result.error) {
        console.error('🔴 Google Sign-In error:', result.error);
        return { data: null, error: result.error };
      }

      if (result.user) {
        console.log('🔴 Google Sign-In completed successfully in useAuth');

        // Create or update user document
        await createOrUpdateUserDocument(result.user);

        const appUser: AppUser = {
          ...result.user,
          uid: result.user.uid,
        };

        console.log('🔴 Google Sign-In successful:', appUser.uid);
        return { data: { user: appUser }, error: null };
      }

      return {
        data: null,
        error: {
          message: 'No user returned from Google Sign-In',
          code: 'no-user',
        },
      };
    } catch (error: any) {
      console.error('🔴 Error during Google sign in:', error);
      const authError = getAuthErrorMessage(error);

      return {
        data: null,
        error: authError,
      };
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    signInWithGoogle,
  };
}