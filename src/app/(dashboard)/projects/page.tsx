'use client';

import React from 'react';
import Link from 'next/link';

export default function ProjectsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Projects</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Manage team projects and task boards.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        <Link 
          href="/projects/proj-1" 
          style={{
            padding: '24px', 
            borderRadius: 'var(--radius-md)', 
            backgroundColor: 'var(--bg-surface)', 
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Axionix Web Platform</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Core customer-facing portal and task management workflow.</p>
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', color: 'var(--primary)', fontSize: '0.85rem' }}>
            <span>5 Tasks</span>
            <span>View Board &rarr;</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
