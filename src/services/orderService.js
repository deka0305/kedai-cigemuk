import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function simpanOrder(dataOrder) {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...dataOrder, status: 'pending', createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}