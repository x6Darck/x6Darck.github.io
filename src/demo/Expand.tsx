import { useEffect, type ReactNode } from 'react';

/** Full-screen pannable view for phones: the replica keeps its readable size and the visitor scrolls around it. */
export function Expand({ open, onClose, w, closeLabel, title, children }: { open: boolean; onClose: () => void; w: number; closeLabel: string; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="expand" role="dialog" aria-modal="true" aria-label={title}>
      <div className="expand-bar"><span className="mono text-sm">{title}</span><button type="button" className="stepbar-btn" onClick={onClose} autoFocus>{closeLabel}</button></div>
      <div className="expand-scroll"><div style={{ width: w }}>{children}</div></div>
    </div>
  );
}
