import { db } from '../firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { utils, writeFileXLSX } from 'xlsx';

const LOCAL_COUNTER_KEY = 'kedai-cigemuk-order-counter';

function getLocalNextOrderNumber() {
  if (typeof window === 'undefined') {
    return 1;
  }

  const lastOrderNumber = Number(window.localStorage.getItem(LOCAL_COUNTER_KEY) || 0);
  return lastOrderNumber + 1;
}

function saveLocalOrderNumber(orderNumber) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(LOCAL_COUNTER_KEY, String(orderNumber));
}

async function getNextOrderNumber() {
  const ordersRef = collection(db, 'orders');
  const latestOrderQuery = query(ordersRef, orderBy('orderNumber', 'desc'), limit(1));
  const snapshot = await getDocs(latestOrderQuery);

  if (snapshot.empty) {
    return 1;
  }

  const latestOrder = snapshot.docs[0].data();
  return (latestOrder.orderNumber || 0) + 1;
}

export async function simpanOrder(dataOrder) {
  try {
    let orderNumber;

    try {
      orderNumber = await getNextOrderNumber();
    } catch {
      orderNumber = getLocalNextOrderNumber();
    }

    const docRef = await addDoc(collection(db, 'orders'), {
      ...dataOrder,
      status: dataOrder.status || 'baru',
      orderNumber,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    saveLocalOrderNumber(orderNumber);

    return { success: true, id: docRef.id, orderNumber };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function subscribeOrders(callback) {
  const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

  return onSnapshot(ordersQuery, (snapshot) => {
    const orders = snapshot.docs.map((orderDoc) => ({
      id: orderDoc.id,
      ...orderDoc.data()
    }));

    callback(orders);
  });
}

export async function updateOrderById(orderId, data) {
  await updateDoc(doc(db, 'orders', orderId), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function deleteOrderById(orderId) {
  await deleteDoc(doc(db, 'orders', orderId));
}

function formatExportDate(value) {
  if (!value) {
    return '-';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value.toDate === 'function') {
    return value.toDate().toLocaleString('id-ID');
  }

  return '-';
}

function formatExportItems(order) {
  if (Array.isArray(order.itemDetails) && order.itemDetails.length > 0) {
    return order.itemDetails
      .map((item) => `${item.name || item.id || 'Item'} x${item.qty || 0}`)
      .join(' | ');
  }

  if (order.items && typeof order.items === 'object') {
    const itemEntries = Object.entries(order.items).filter(([, qty]) => Number(qty) > 0);

    if (itemEntries.length > 0) {
      return itemEntries
        .map(([itemId, qty]) => `${itemId} x${qty}`)
        .join(' | ');
    }
  }

  return '-';
}

export function exportOrdersToExcel(orders) {
  const rows = orders.map((order) => ({
    ID: order.id,
    NomorOrder: order.orderNumber || '-',
    Nama: order.nama || '-',
    WhatsApp: order.wa || '-',
    Metode: order.metode || '-',
    TanggalPesanan: order.tanggal || '-',
    Waktu: order.waktu || '-',
    Pembayaran: order.bayar || '-',
    Status: order.status || 'pending',
    Alamat: order.alamat || '-',
    Catatan: order.catatan || '-',
    Total: Number(order.total || 0),
    DibuatPada: formatExportDate(order.createdAt),
    Item: formatExportItems(order)
  }));

  const worksheet = utils.json_to_sheet(rows);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Orders');
  writeFileXLSX(workbook, `orders-kedai-cigemuk-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
