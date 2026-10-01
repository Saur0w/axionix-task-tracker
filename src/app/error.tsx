'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-app)',
      color: 'var(--text-primary)',
      padding: '24px',
      textAlign: 'center'
    }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--danger)', marginBottom: '12px' }}>
        Something went wrong
      </h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', marginBottom: '24px' }}>
        An unexpected error occurred while rendering this page.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        style={{
          padding: '10px 24px',
          backgroundColor: 'var(--primary)',
          color: '#ffffff',
          borderRadius: 'var(--radius-sm)',
          border: 'none',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Try Again
      </button>
    </div>
  );
}
