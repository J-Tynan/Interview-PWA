const DB_NAME = 'interview-pwa';
const DB_VERSION = 2;
const STORE_NAME = 'questionRecords';
const LEGACY_STORE_NAME = 'notes';
const LEGACY_STORAGE_KEY = 'interview-pwa-notes';
const STORAGE_KEY = 'interview-pwa-question-records';
const HISTORY_LIMIT = 10;

function capHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }
  return history.slice(-HISTORY_LIMIT);
}

function cloneRecord(record) {
  return JSON.parse(JSON.stringify(record));
}

async function openDB() {
  if (!('indexedDB' in window)) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(LEGACY_STORE_NAME)) {
        db.createObjectStore(LEGACY_STORE_NAME, { keyPath: 'questionId' });
      }
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToLocalStorage(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export async function getAllQuestionRecords() {
  const db = await openDB().catch(() => null);
  if (!db) {
    return loadFromLocalStorage();
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const records = request.result || [];
      const map = {};
      records.forEach((record) => {
        map[record.id] = record;
      });
      resolve(map);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function getQuestionRecord(id) {
  const db = await openDB().catch(() => null);
  if (!db) {
    const records = loadFromLocalStorage();
    return records[id] || null;
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function saveQuestionRecord(record) {
  const nextRecord = {
    ...cloneRecord(record),
    history: capHistory(record.history)
  };
  const db = await openDB().catch(() => null);
  if (!db) {
    const records = loadFromLocalStorage();
    records[nextRecord.id] = nextRecord;
    saveToLocalStorage(records);
    return nextRecord;
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(nextRecord);
    tx.oncomplete = () => resolve(nextRecord);
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteQuestionRecord(id) {
  const db = await openDB().catch(() => null);
  if (!db) {
    const records = loadFromLocalStorage();
    delete records[id];
    saveToLocalStorage(records);
    return;
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getLegacyNotes() {
  const db = await openDB().catch(() => null);
  if (!db) {
    try {
      return JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(LEGACY_STORE_NAME, 'readonly');
    const store = tx.objectStore(LEGACY_STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const notes = {};
      (request.result || []).forEach((record) => {
        notes[record.questionId] = record.note;
      });
      resolve(notes);
    };

    request.onerror = () => reject(request.error);
  });
}
