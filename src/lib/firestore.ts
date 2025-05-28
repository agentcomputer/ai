// src/lib/firestore.ts

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  DocumentData,
  QuerySnapshot,
} from "firebase/firestore";

// Your Firebase config (replace with yours)
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  // etc.
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface UserProfile {
  id: string;
  displayName: string;
  photoURL?: string;
  // add other fields as needed
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

// ——— User profile functions ———

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(profile: UserProfile): Promise<void> {
  const ref = doc(db, "users", profile.id);
  await setDoc(ref, profile, { merge: true });
}

// ——— Notes functions ———

const notesCol = (userId: string) => collection(db, "users", userId, "notes");

export async function createNote(userId: string, note: Omit<Note, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const now = Date.now();
  const ref = doc(notesCol(userId));
  const newNote: Note = {
    id: ref.id,
    userId,
    title: note.title,
    content: note.content,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(ref, newNote);
  return ref.id;
}

export async function getNote(userId: string, noteId: string): Promise<Note | null> {
  const ref = doc(notesCol(userId), noteId);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as Note) : null;
}

export async function updateNote(userId: string, note: Note): Promise<void> {
  note.updatedAt = Date.now();
  const ref = doc(notesCol(userId), note.id);
  await updateDoc(ref, {
    title: note.title,
    content: note.content,
    updatedAt: note.updatedAt,
  });
}

export async function deleteNote(userId: string, noteId: string): Promise<void> {
  const ref = doc(notesCol(userId), noteId);
  await deleteDoc(ref);
}

export async function getAllNotes(userId: string): Promise<Note[]> {
  const snaps = await getDocs(query(notesCol(userId)));
  return snaps.docs.map((d) => d.data() as Note);
}

// Optional: real-time subscription
export function subscribeToNotes(
  userId: string,
  onUpdate: (notes: Note[]) => void
): () => void {
  return onSnapshot(query(notesCol(userId)), (q: QuerySnapshot<DocumentData>) => {
    const notes = q.docs.map((d) => d.data() as Note);
    onUpdate(notes);
  });
}
