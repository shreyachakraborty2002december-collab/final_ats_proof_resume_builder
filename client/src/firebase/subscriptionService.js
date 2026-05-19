import {
  doc, getDoc, setDoc, updateDoc,
  onSnapshot, serverTimestamp, increment,
} from 'firebase/firestore';
import { db } from './config';

const COL = 'subscriptions';

/** Real-time listener for a user's subscription document. */
export function subscribeToSubscription(uid, callback) {
  return onSnapshot(doc(db, COL, uid), (snap) => {
    if (!snap.exists()) { callback(null); return; }
    const data = snap.data();
    callback({
      ...data,
      subscriptionStart: data.subscriptionStart?.toDate?.() ?? null,
      periodStart:       data.periodStart?.toDate?.()       ?? null,
      periodEnd:         data.periodEnd?.toDate?.()         ?? null,
      updatedAt:         data.updatedAt?.toDate?.()         ?? null,
    });
  });
}

/** One-time fetch of subscription doc. */
export async function getSubscription(uid) {
  const snap = await getDoc(doc(db, COL, uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    subscriptionStart: data.subscriptionStart?.toDate?.() ?? null,
    periodStart:       data.periodStart?.toDate?.()       ?? null,
    periodEnd:         data.periodEnd?.toDate?.()         ?? null,
  };
}

/**
 * Write subscription doc after Stripe payment verification.
 * Called from client after backend confirms the session.
 */
export async function activateSubscription(uid, sessionData) {
  const now     = new Date();
  const pStart  = new Date(sessionData.periodStart);
  const pEnd    = new Date(sessionData.periodEnd);

  await setDoc(doc(db, COL, uid), {
    isPro:                       true,
    status:                      'active',
    planName:                    'Pro',
    subscriptionStart:           serverTimestamp(),
    periodStart:                 pStart,
    periodEnd:                   pEnd,
    downloadsUsed:               0,
    downloadsLimit:              10,
    coverLetterDownloadsUsed:    0,
    coverLetterDownloadsLimit:   5,
    stripeSessionId:             sessionData.stripeSessionId || '',
    stripeCustomerId:            sessionData.stripeCustomerId || '',
    templateUsage:               {},
    createdAt:                   serverTimestamp(),
    updatedAt:                   serverTimestamp(),
  });
}

/**
 * Increment download count. Auto-resets if current 30-day period has expired.
 * Returns { success, downloadsUsed, downloadsLimit, periodEnd }
 */
export async function incrementDownloadCount(uid) {
  const ref  = doc(db, COL, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('No subscription found');

  const data      = snap.data();
  const now       = new Date();
  const periodEnd = data.periodEnd?.toDate?.() ?? new Date(0);

  // Reset if 30-day window has elapsed
  if (now > periodEnd) {
    const newPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    await updateDoc(ref, {
      downloadsUsed: 1,
      periodStart:   now,
      periodEnd:     newPeriodEnd,
      updatedAt:     serverTimestamp(),
    });
    return { success: true, downloadsUsed: 1, downloadsLimit: data.downloadsLimit, periodEnd: newPeriodEnd };
  }

  const used = (data.downloadsUsed || 0) + 1;
  await updateDoc(ref, { downloadsUsed: increment(1), updatedAt: serverTimestamp() });
  return { success: true, downloadsUsed: used, downloadsLimit: data.downloadsLimit, periodEnd };
}

/**
 * Record which template was used (for favourites tracking).
 * Increments templateUsage[templateId] counter.
 */
export async function trackTemplateUsage(uid, templateId) {
  const ref = doc(db, COL, uid);
  const key = `templateUsage.${templateId}`;
  await updateDoc(ref, { [key]: increment(1), updatedAt: serverTimestamp() });
}

/**
 * Increment cover letter download count.
 * Uses the same 30-day reset pattern as incrementDownloadCount.
 */
export async function incrementCoverLetterDownloadCount(uid) {
  const ref  = doc(db, COL, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('No subscription found');

  const data      = snap.data();
  const now       = new Date();
  const periodEnd = data.periodEnd?.toDate?.() ?? new Date(0);

  if (now > periodEnd) {
    // Period elapsed — reset both counters
    const newPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    await updateDoc(ref, {
      coverLetterDownloadsUsed: 1,
      downloadsUsed:   0,
      periodStart:     now,
      periodEnd:       newPeriodEnd,
      updatedAt:       serverTimestamp(),
    });
    return { success: true, used: 1, limit: data.coverLetterDownloadsLimit ?? 5 };
  }

  const used = (data.coverLetterDownloadsUsed || 0) + 1;
  await updateDoc(ref, {
    coverLetterDownloadsUsed: increment(1),
    updatedAt: serverTimestamp(),
  });
  return { success: true, used, limit: data.coverLetterDownloadsLimit ?? 5 };
}
