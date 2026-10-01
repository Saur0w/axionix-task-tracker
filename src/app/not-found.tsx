import React from 'react';
import Link from 'next/link';

export default function NotFound() {
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
      <h1 style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '12px' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', marginBottom: '24px' }}>
        The page you are looking for might have been moved, deleted, or does not exist.
      </p>
      <Link
        href="/dashboard"
        style={{
          padding: '10px 20px',
          backgroundColor: 'var(--primary)',
          color: '#ffffff',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 600,
          textDecoration: 'none'
        }}
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
