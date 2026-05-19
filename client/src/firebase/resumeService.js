import {
  collection, doc,
  addDoc, updateDoc, deleteDoc, getDoc,
  query, where, onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

const COL = 'resumes';

/** Real-time listener for all of a user's resumes (sorted newest first). */
export function subscribeToUserResumes(userId, callback) {
  const q = query(
    collection(db, COL),
    where('userId', '==', userId),
    // No orderBy here — avoids needing a composite index.
    // We sort client-side after receiving the data.
  );
  return onSnapshot(q, (snap) => {
    const resumes = snap.docs
      .map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() ?? null,
        updatedAt: d.data().updatedAt?.toDate?.() ?? null,
      }))
      // Sort newest-first by updatedAt
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
    callback(resumes);
  });
}

/** Fetch a single resume by ID. */
export async function getResume(resumeId) {
  const snap = await getDoc(doc(db, COL, resumeId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Save (create or update) a resume.
 * Returns the Firestore document ID.
 */
export async function saveResume(userId, resumeData, title, resumeId = null) {
  const payload = {
    userId,
    title: (title || resumeData?.personalInfo?.name || 'Untitled Resume').trim(),
    resumeData,
    updatedAt: serverTimestamp(),
  };

  if (resumeId) {
    await updateDoc(doc(db, COL, resumeId), payload);
    return resumeId;
  }

  payload.createdAt = serverTimestamp();
  const ref = await addDoc(collection(db, COL), payload);
  return ref.id;
}

/** Permanently delete a resume. */
export async function deleteResume(resumeId) {
  await deleteDoc(doc(db, COL, resumeId));
}