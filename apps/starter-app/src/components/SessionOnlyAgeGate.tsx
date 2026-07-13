'use client';

import { useEffect, useRef, useState } from 'react';

interface SessionOnlyAgeGateProps {
  tenantId: string;
  siteName: string;
  contentId: string;
}

export function SessionOnlyAgeGate({ tenantId, siteName, contentId }: SessionOnlyAgeGateProps) {
  const storageKey = `pumpkin_preview_age_${tenantId}`;
  const [locked, setLocked] = useState(true);
  const [status, setStatus] = useState('');
  const acceptRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocked(window.sessionStorage.getItem(storageKey) !== '1');
  }, [storageKey]);

  useEffect(() => {
    const content = document.getElementById(contentId);
    if (!content) return;

    if (locked) {
      content.setAttribute('inert', '');
      content.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = 'hidden';
      acceptRef.current?.focus();
    } else {
      content.removeAttribute('inert');
      content.removeAttribute('aria-hidden');
      document.body.style.removeProperty('overflow');
    }

    return () => {
      document.body.style.removeProperty('overflow');
    };
  }, [contentId, locked]);

  useEffect(() => {
    if (!locked) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setStatus('Preview remains closed until you acknowledge the age requirement or leave.');
        acceptRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [locked]);

  const acknowledge = () => {
    window.sessionStorage.setItem(storageKey, '1');
    setStatus('');
    setLocked(false);
  };

  const leavePreview = () => {
    window.sessionStorage.removeItem(storageKey);
    window.location.assign('/');
  };

  if (!locked) return <span data-pumpkin-age-gate-state="acknowledged-session" hidden />;

  return (
    <div
      aria-describedby="pumpkin-age-description"
      aria-labelledby="pumpkin-age-title"
      aria-modal="true"
      className="pumpkin-age-gate"
      data-pumpkin-age-gate=""
      data-pumpkin-age-gate-state="locked"
      ref={dialogRef}
      role="dialog"
    >
      <div className="pumpkin-age-panel">
        <p className="pumpkin-age-kicker">Owner-review preview</p>
        <h2 id="pumpkin-age-title">21+ acknowledgement</h2>
        <p id="pumpkin-age-description">
          {siteName} contains adult-nightlife material intended for visitors age 21 or older.
          This preview collects no age, identity, or contact information.
        </p>
        <div className="pumpkin-age-actions">
          <button className="btn btn-gold" onClick={acknowledge} ref={acceptRef} type="button">
            I am 21 or older
          </button>
          <button className="btn btn-ghost" onClick={leavePreview} type="button">
            Leave preview
          </button>
        </div>
        <p aria-live="polite" className="pumpkin-age-status">{status}</p>
      </div>
    </div>
  );
}
