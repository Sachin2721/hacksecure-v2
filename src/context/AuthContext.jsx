import { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Load Firestore profile
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (snap.exists()) setProfile(snap.data());
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signup = async (name, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const profileData = {
      uid: cred.user.uid,
      name,
      email,
      avatar: name.slice(0, 2).toUpperCase(),
      joinedAt: serverTimestamp(),
      role: "user",
    };
    await setDoc(doc(db, "users", cred.user.uid), profileData);
    setProfile(profileData);
    return cred.user;
  };

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    if (snap.exists()) setProfile(snap.data());
    return cred.user;
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signup, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
