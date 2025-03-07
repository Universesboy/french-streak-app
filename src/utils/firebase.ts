import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDl1BneVEKdcw5LkNqIkMSWD1qfQy_eMOQ",
  authDomain: "french-streak-app.firebaseapp.com",
  projectId: "french-streak-app",
  storageBucket: "french-streak-app.firebasestorage.app",
  messagingSenderId: "471250589028",
  appId: "1:471250589028:web:9d01c3061b18429c539671",
  measurementId: "G-0ELTY2Z9EM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Authentication functions
export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Create a user document in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email,
      createdAt: serverTimestamp(),
      streakData: {
        currentStreak: 0,
        lastCheckInDate: null,
        totalReward: 0,
        studyDays: [],
        longestStreak: 0,
        totalDaysStudied: 0,
        studySessions: [],
        ongoingSession: null
      }
    });
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error };
  }
};

// Firestore data functions
export const saveUserStreakData = async (userId: string, streakData: any) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      streakData,
      lastUpdated: serverTimestamp()
    });
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const getUserStreakData = async (userId: string) => {
  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    if (docSnap.exists()) {
      return { data: docSnap.data().streakData, error: null };
    } else {
      return { data: null, error: "No user data found" };
    }
  } catch (error) {
    return { data: null, error };
  }
};

export { auth, db, onAuthStateChanged };
export type { User }; 