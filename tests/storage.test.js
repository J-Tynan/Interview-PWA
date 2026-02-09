import assert from 'node:assert/strict';
import { deleteQuestionRecord, getQuestionRecord, saveQuestionRecord } from '../src/lib/storage.js';

class MemoryStorage {
  constructor() {
    this.store = new Map();
  }

  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  setItem(key, value) {
    this.store.set(key, String(value));
  }

  removeItem(key) {
    this.store.delete(key);
  }
}

globalThis.localStorage = new MemoryStorage();

async function run() {
  const record = {
    id: 'q1',
    notes: 'hello',
    notesMode: 'plain',
    state: 'draft',
    progress: { reviewCount: 0 },
    history: []
  };

  const saved = await saveQuestionRecord(record);
  assert.ok(saved.updatedAt, 'save should set updatedAt');

  const fetched = await getQuestionRecord('q1');
  assert.equal(fetched.notes, 'hello');

  await deleteQuestionRecord('q1');
  const missing = await getQuestionRecord('q1');
  assert.equal(missing, null);

  console.log('storage tests passed');
}

run();
