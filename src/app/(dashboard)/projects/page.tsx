'use client';

import React, { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { 
  FolderKanban, 
  Plus, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Circle, 
  Users, 
  X, 
  Loader2,
  Layers,
  Sparkles
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTasks } from '@/context/TaskContext';
import { useToast } from '@/context/ToastContext';
import { getInitials } from '@/utils/format';
import styles from './style.module.scss';

export default function ProjectsPage() {
  const { projects, tasks, users, createProject } = useTasks();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Overall workspace stats
  const overallStats = useMemo(() => {
    const totalProjects = projects.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
    const avgRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return { totalProjects, totalTasks, completedTasks, avgRate };
  }, [projects, tasks]);

  useGSAP(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (heroRef.current) {
      tl.fromTo(
        heroRef.current,
        { opacity: 0, y: 16, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, clearProps: 'filter' },
        0
      );
    }

    if (gridRef.current) {
      tl.fromTo(
        gridRef.current.children,
        { opacity: 0, y: 20, filter: 'blur(8px)', scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          scale: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          clearProps: 'filter,transform',
        },
        0.15
      );
    }
  }, { scope: containerRef });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const newProj = await createProject({
        name: name.trim(),
        description: description.trim() || 'Active team workstream and engineering tasks.',
      });
      toast({
        variant: 'success',
        title: 'Project Created',
        description: `"${newProj.name}" is now live.`,
      });
      setName('');
      setDescription('');
      setIsModalOpen(false);
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Project Creation Failed',
        description: err instanceof Error ? err.message : 'Could not create project',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.projectsContainer} ref={containerRef}>
      <div className={styles.ambientGlow} />

      {/* Hero Header */}
      <section className={styles.heroRow} ref={heroRef}>
        <div>
          <div className={styles.pulseTag}>
            <span className={styles.pulseDot} />
            <span>Active Workspaces</span>
          </div>
          <h1 className={styles.heading}>Projects & Workstreams</h1>
          <p className={styles.subheading}>
            Manage cross-functional initiatives, delivery schedules, and Kanban boards.
          </p>
        </div>

        <div className={styles.heroActions}>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={styles.primaryBtn}
          >
            <Plus size={15} strokeWidth={2} />
            <span>New Project</span>
          </button>
        </div>
      </section>

      {/* Overall Stat Cards */}
      <section className={styles.metricsOverview}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active Projects</span>
          <span className={styles.statValue}>{overallStats.totalProjects}</span>
          <span className={styles.statHint}>Across engineering teams</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Tracked Issues</span>
          <span className={styles.statValue}>{overallStats.totalTasks}</span>
          <span className={styles.statHint}>Linked to initiatives</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Avg Delivery Rate</span>
          <span className={styles.statValue}>{overallStats.avgRate}%</span>
          <span className={styles.statHint}>Shipped sprint tasks</span>
        </div>
      </section>

      {/* Projects Grid */}
      <div className={styles.projectsGrid} ref={gridRef}>
        {projects.map((project) => {
          const projectTasks = tasks.filter((t) => t.projectId === project.id);
          const totalCount = projectTasks.length;
          const doneCount = projectTasks.filter((t) => t.status === 'DONE').length;
          const inProgressCount = projectTasks.filter((t) => t.status === 'IN_PROGRESS').length;
          const rate = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

          // Determine health status badge
          let health: { label: string; className: string } = { label: 'Under Review', className: styles.underReview };
          if (rate === 100 && totalCount > 0) {
            health = { label: 'Completed', className: styles.shipped };
          } else if (rate >= 40 || inProgressCount > 0) {
            health = { label: 'On Track', className: styles.onTrack };
          }

          // Assigned member profiles
          const memberProfiles = (project.memberIds || [])
            .map((mId) => users.find((u) => u.id === mId))
            .filter((u): u is typeof users[0] => Boolean(u));

          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className={styles.projectCard}
              title={`Open ${project.name} Kanban board`}
            >
              <div className={styles.cardTop}>
                <div className={styles.projectIconBadge}>
                  <FolderKanban size={18} strokeWidth={1.75} />
                </div>
                <div className={styles.topMeta}>
                  <span className={`${styles.healthBadge} ${health.className}`}>
                    {health.label}
                  </span>
                  <ArrowUpRight size={15} className={styles.cardArrow} />
                </div>
              </div>

              <div className={styles.cardMain}>
                <h3 className={styles.projectName}>{project.name}</h3>
                <p className={styles.projectDesc}>{project.description}</p>
              </div>

              <div className={styles.progressSection}>
                <div className={styles.progressMeta}>
                  <span>Progress</span>
                  <span className={styles.rate}>{rate}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${rate}%` }} />
                </div>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.taskCounts}>
                  <span className={styles.countItem} title="Completed">
                    <CheckCircle2 size={12} />
                    <span>{doneCount}</span>
                  </span>
                  <span className={styles.countItem} title="In Progress">
                    <Clock size={12} />
                    <span>{inProgressCount}</span>
                  </span>
                  <span className={styles.countItem} title="Total issues">
                    <Layers size={12} />
                    <span>{totalCount}</span>
                  </span>
                </div>

                <div className={styles.memberAvatars}>
                  {memberProfiles.length > 0 ? (
                    memberProfiles.map((m) => (
                      <div
                        key={m.id}
                        className={styles.memberAvatar}
                        title={`${m.name} (${m.role || 'Member'})`}
                      >
                        {getInitials(m.name)}
                      </div>
                    ))
                  ) : (
                    <div className={styles.memberAvatar} title="Team assigned">
                      <Users size={11} />
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div 
          className={styles.modalOverlay}
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Create New Project</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={styles.closeBtn}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Project Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Real-Time Telemetry Pipeline"
                  className={styles.input}
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize the initiative goals and engineering objectives..."
                  className={styles.textarea}
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={styles.cancelBtn}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={13} className="spin" />
                      <span>Creating…</span>
                    </>
                  ) : (
                    <span>Create Project</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
