/**
 * useSecurityDeterrents — best-effort deterrents for casual misuse.
 *
 * IMPORTANT: This does NOT prevent screenshots, screen recording, or
 * determined users. It is a UI-level deterrent only.
 */
import { useEffect } from 'react';

export default function useSecurityDeterrents() {
  useEffect(() => {
    // Block right-click context menu
    const noRightClick = (e) => e.preventDefault();

    // Block common dev-tools keyboard shortcuts
    const noDevKeys = (e) => {
      const ctrl  = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      if (e.key === 'F12') { e.preventDefault(); return; }
      if (ctrl && shift && ['I', 'J', 'C'].includes(e.key.toUpperCase())) { e.preventDefault(); return; }
      if (ctrl && e.key.toUpperCase() === 'U') { e.preventDefault(); return; }
    };

    document.addEventListener('contextmenu', noRightClick);
    document.addEventListener('keydown', noDevKeys);

    return () => {
      document.removeEventListener('contextmenu', noRightClick);
      document.removeEventListener('keydown', noDevKeys);
    };
  }, []);
}
