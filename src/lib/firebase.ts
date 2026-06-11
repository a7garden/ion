import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { User as FirebaseUser } from 'firebase/auth';

const firebaseConfig = {
  projectId: 'ion-hapapa-3507',
  appId: '1:273839479187:web:51a3ad8e1b942ad13b3066',
  storageBucket: 'ion-hapapa-3507.firebasestorage.app',
  apiKey: 'AIzaSyCE0GN-dYPyw1QzJae4LYgQYDWMU6H1Wo0',
  authDomain: 'ion-hapapa-3507.firebaseapp.com',
  messagingSenderId: '273839479187',
  projectNumber: '273839479187',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const logOut = () => signOut(auth);

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export const getUserProfile = (user: FirebaseUser): UserProfile => ({
  uid: user.uid,
  displayName: user.displayName,
  email: user.email,
  photoURL: user.photoURL,
});

export async function uploadPostMedia(file: File, uid: string): Promise<string> {
  const extension = file.name.split('.').pop() || 'jpg';
  const path = `posts/${uid}/${Date.now()}.${extension}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
