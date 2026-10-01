'use client';

import React from 'react';
import Link from 'next/link';

export default function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [projectId, setProjectId] = React.useState<string>('');

  React.useEffect(() => {
    params.then((p) => setProjectId(p.id));
  }, [params]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Link href="/projects" style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>
        &larr; Back to Projects
      </Link>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Project Details: {projectId}</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Kanban board and task management view.</p>
    </div>
  );
}
