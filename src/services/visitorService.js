import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';

const VISITED_KEY = 'kedai_visited';
const VISITOR_ID_KEY = 'kedai_visitor_id';

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|windows phone/i.test(ua)) return 'mobile';
  return 'desktop';
}

function getOrCreateVisitorId() {
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

export async function trackVisit() {
  try {
    const isUnique = !localStorage.getItem(VISITED_KEY);
    const visitorId = getOrCreateVisitorId();

    await addDoc(collection(db, 'visitors'), {
      timestamp: serverTimestamp(),
      isUnique,
      visitorId,
      device: getDeviceType(),
      referrer: document.referrer || 'langsung',
      path: window.location.pathname,
    });

    if (isUnique) {
      localStorage.setItem(VISITED_KEY, '1');
    }
  } catch (_err) {
    // tracking gagal tidak perlu crash app
  }
}

export function subscribeVisitors(callback) {
  const q = query(collection(db, 'visitors'), orderBy('timestamp', 'desc'), limit(1000));
  return onSnapshot(q, (snap) => {
    const visitors = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(visitors);
  });
}
