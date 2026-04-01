import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase';

async function getAdminProfile(uid) {
  const adminRef = doc(db, 'admins', uid);
  const adminSnapshot = await getDoc(adminRef);

  if (!adminSnapshot.exists()) {
    return null;
  }

  const adminData = adminSnapshot.data();

  if (adminData.isActive === false) {
    return null;
  }

  return {
    uid,
    ...adminData
  };
}

export async function hasAdminAccount() {
  const adminQuery = query(collection(db, 'admins'), limit(1));
  const snapshot = await getDocs(adminQuery);
  return !snapshot.empty;
}

export async function loginAdmin(email, password) {
  await setPersistence(auth, browserLocalPersistence);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const adminProfile = await getAdminProfile(credential.user.uid);

  if (!adminProfile) {
    await signOut(auth);
    throw new Error('Akun ini berhasil login ke Firebase Auth, tapi belum terdaftar sebagai admin.');
  }

  return {
    user: credential.user,
    adminProfile
  };
}

export async function logoutAdmin() {
  await signOut(auth);
}

export function subscribeAdminSession(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback({ user: null, adminProfile: null, isAdmin: false });
      return;
    }

    try {
      const adminProfile = await getAdminProfile(user.uid);

      if (!adminProfile) {
        await signOut(auth);
        callback({ user: null, adminProfile: null, isAdmin: false });
        return;
      }

      callback({ user, adminProfile, isAdmin: true });
    } catch {
      callback({ user: null, adminProfile: null, isAdmin: false });
    }
  });
}

export async function createInitialAdmin({ nama, email, password }) {
  const adminExists = await hasAdminAccount();

  if (adminExists) {
    throw new Error('Admin pertama sudah dibuat. Gunakan halaman login admin.');
  }

  await setPersistence(auth, browserLocalPersistence);
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, 'admins', credential.user.uid), {
    nama,
    email,
    role: 'super-admin',
    isActive: true,
    createdAt: serverTimestamp()
  });

  return {
    user: credential.user,
    adminProfile: {
      uid: credential.user.uid,
      nama,
      email,
      role: 'super-admin',
      isActive: true
    }
  };
}
