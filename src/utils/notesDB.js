import { openDB } from "idb";

export const dbPromise = openDB("notes-db", 1, {
  upgrade(db) {
    db.createObjectStore("offlineNotes", {
      keyPath: "tempId",
    });
  },
});

export async function saveOfflineNote(note) {
  const db = await dbPromise;
  await db.put("offlineNotes", note);
}

export async function getOfflineNotes() {
  const db = await dbPromise;
  return db.getAll("offlineNotes");
}

export async function clearOfflineNote(tempId) {
  const db = await dbPromise;
  await db.delete("offlineNotes", tempId);
}
