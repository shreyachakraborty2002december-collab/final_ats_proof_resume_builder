import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToSubscription } from '../firebase/subscriptionService';

const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [subLoading,   setSubLoading]   = useState(true);

  useEffect(() => {
    if (!user) { setSubscription(null); setSubLoading(false); return; }
    setSubLoading(true);
    const unsub = subscribeToSubscription(user.uid, (data) => {
      setSubscription(data);
      setSubLoading(false);
    });
    return unsub;
  }, [user]);

  const now = new Date();

  // Pro if: isPro=true, status=active, and current period hasn't expired
  const isPro = !!(
    subscription?.isPro &&
    subscription?.status === 'active' &&
    subscription?.periodEnd &&
    subscription.periodEnd > now
  );

  // ── Resume downloads ───────────────────────────────────────────────────────
  const downloadsUsed  = subscription?.downloadsUsed  ?? 0;
  const downloadsLimit = subscription?.downloadsLimit ?? 10;
  const downloadsLeft  = Math.max(0, downloadsLimit - downloadsUsed);
  const canDownload    = isPro && downloadsLeft > 0;

  // ── Cover letter downloads ─────────────────────────────────────────────────
  const coverLetterDownloadsUsed  = subscription?.coverLetterDownloadsUsed  ?? 0;
  const coverLetterDownloadsLimit = subscription?.coverLetterDownloadsLimit ?? 5;
  const coverLetterDownloadsLeft  = Math.max(0, coverLetterDownloadsLimit - coverLetterDownloadsUsed);
  const canDownloadCoverLetter    = isPro && coverLetterDownloadsLeft > 0;

  // ── Favourite templates ────────────────────────────────────────────────────
  const templateUsage      = subscription?.templateUsage ?? {};
  const favouriteTemplates = Object.entries(templateUsage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id);

  // ── Days remaining ─────────────────────────────────────────────────────────
  const periodEnd     = subscription?.periodEnd ?? null;
  const daysRemaining = periodEnd
    ? Math.max(0, Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      subLoading,
      isPro,
      // Resume
      downloadsUsed,
      downloadsLimit,
      downloadsLeft,
      canDownload,
      // Cover letter
      coverLetterDownloadsUsed,
      coverLetterDownloadsLimit,
      coverLetterDownloadsLeft,
      canDownloadCoverLetter,
      // Shared
      periodEnd,
      daysRemaining,
      favouriteTemplates,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext);
