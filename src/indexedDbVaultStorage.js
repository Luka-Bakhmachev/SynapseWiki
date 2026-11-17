const DB_NAME = "SynapseWikiDB";
const DB_VERSION = 1;
const STORE_NOTES = "notes";

export const createIndexedDbVaultStorage = () => {
  const initDB = () =>
    new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(
          new Error("IndexedDB is not supported in this browser environment."),
        );
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NOTES)) {
          db.createObjectStore(STORE_NOTES, { keyPath: "id" });
        }
      };
      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });

  return {
    getLocation: () => "Browser IndexedDB",
    getAllNotes: async () => {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const request = db
          .transaction(STORE_NOTES, "readonly")
          .objectStore(STORE_NOTES)
          .getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = (event) => reject(event.target.error);
      });
    },
    saveNote: async (note) => {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const request = db
          .transaction(STORE_NOTES, "readwrite")
          .objectStore(STORE_NOTES)
          .put(note);
        request.onsuccess = () => resolve(true);
        request.onerror = (event) => reject(event.target.error);
      });
    },
    deleteNote: async (id) => {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const request = db
          .transaction(STORE_NOTES, "readwrite")
          .objectStore(STORE_NOTES)
          .delete(id);
        request.onsuccess = () => resolve(true);
        request.onerror = (event) => reject(event.target.error);
      });
    },
    saveAllNotes: async (notes) => {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NOTES, "readwrite");
        const store = transaction.objectStore(STORE_NOTES);
        store.clear();
        notes.forEach((note) => store.put(note));
        transaction.oncomplete = () => resolve(true);
        transaction.onerror = (event) => reject(event.target.error);
      });
    },
  };
};
