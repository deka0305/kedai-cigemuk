import { db } from '../firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { utils, writeFileXLSX } from 'xlsx';

const MENU_COLLECTION = 'menu';
const DEFAULT_EMOJI = '🥟';

function sortMenus(items) {
  return [...items].sort((left, right) => {
    if (Boolean(left.isSpecial) !== Boolean(right.isSpecial)) {
      return left.isSpecial ? -1 : 1;
    }

    const leftOrder = Number.isFinite(Number(left.sortOrder)) ? Number(left.sortOrder) : 9999;
    const rightOrder = Number.isFinite(Number(right.sortOrder)) ? Number(right.sortOrder) : 9999;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return String(left.name || '').localeCompare(String(right.name || ''), 'id');
  });
}

function normalizeMenu(menu) {
  return {
    id: menu.id,
    name: String(menu.name || menu.nama || '').trim(),
    desc: String(menu.desc || menu.deskripsi || '').trim(),
    price: Number(menu.price ?? menu.harga ?? 0),
    emoji: String(menu.emoji || '').trim() || DEFAULT_EMOJI,
    photoUrl: String(menu.photoUrl || menu.foto || '').trim(),
    isSpecial: Boolean(menu.isSpecial ?? menu.unggulan),
    isActive: (menu.isActive ?? menu.aktif) !== false,
    sortOrder: Number(menu.sortOrder ?? menu.urutan ?? 0)
  };
}

function prepareMenuPayload(menu) {
  const normalized = normalizeMenu(menu);

  return {
    name: normalized.name,
    desc: normalized.desc,
    price: normalized.price,
    emoji: normalized.emoji,
    photoUrl: normalized.photoUrl,
    isSpecial: normalized.isSpecial,
    isActive: normalized.isActive,
    sortOrder: normalized.sortOrder
  };
}

export function getDefaultMenuEmoji() {
  return DEFAULT_EMOJI;
}

export function subscribeMenuItems(callback) {
  return onSnapshot(collection(db, MENU_COLLECTION), (snapshot) => {
    const menus = snapshot.docs
      .map((menuDoc) =>
        normalizeMenu({
          id: menuDoc.id,
          ...menuDoc.data()
        })
      )
      .filter((menu) => menu.name);

    callback(sortMenus(menus));
  });
}

export async function createMenu(menu) {
  const payload = prepareMenuPayload(menu);

  if (!payload.name) {
    throw new Error('Nama menu wajib diisi.');
  }

  await addDoc(collection(db, MENU_COLLECTION), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function seedMenus(menus) {
  await Promise.all(
    menus.map((menu) => {
      const payload = prepareMenuPayload(menu);

      return addDoc(collection(db, MENU_COLLECTION), {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    })
  );
}

export async function updateMenuById(menuId, menu) {
  const payload = prepareMenuPayload(menu);

  if (!payload.name) {
    throw new Error('Nama menu wajib diisi.');
  }

  await updateDoc(doc(db, MENU_COLLECTION, menuId), {
    ...payload,
    updatedAt: serverTimestamp()
  });
}

export async function deleteMenuById(menuId) {
  await deleteDoc(doc(db, MENU_COLLECTION, menuId));
}

export function exportMenusToExcel(menus) {
  const rows = menus.map((menu) => ({
    ID: menu.id,
    Nama: menu.name,
    Deskripsi: menu.desc,
    Harga: Number(menu.price || 0),
    Emoji: menu.emoji || DEFAULT_EMOJI,
    Foto: menu.photoUrl || '-',
    Unggulan: menu.isSpecial ? 'Ya' : 'Tidak',
    Aktif: menu.isActive === false ? 'Tidak' : 'Ya',
    Urutan: Number(menu.sortOrder || 0)
  }));

  const worksheet = utils.json_to_sheet(rows);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Menu');
  writeFileXLSX(workbook, `menu-kedai-cigemuk-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
