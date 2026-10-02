"use client";

import styles from "./style.module.scss";
import { Plus, Flame } from "lucide-react";
import { useMemo } from "react";
import { useTasks } from "@/context/TaskContext";

export default function DashboardPage() {
    const { tasks, projects, updateTaskStatus, createTask } = useTasks();
    const stats = useMemo(() => {
        const total = tasks.length;
        const done = tasks.filter((t) => t.status === 'DONE').length;
        const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
        const todo = tasks.filter((t) => t.status === 'TODO').length;
        const rate = total > 0 ? Math.round((done / total) * 100) : 0;
        return { total, done, inProgress, todo, rate };
    }, [tasks]);

    return (
        <div className={styles.dashboard}>
            <section className={styles.heroRow}>
                <div className={styles.heroText}>
                    <div className={styles.pulseTag}>
                        <span className={styles.pulseTag} />
                        <span>Active Sprint Cycle</span>
                    </div>
                    <h1 className={styles.heading}>
                        Engineering Overview
                    </h1>
                    <p className={styles.subHeading}>
                        Real-time project telemetry, assigned issues, and delivery status.
                    </p>
                </div>

                <div className={styles.heroActions}>
                    <button type="button" className={styles.primaryBtn}>
                        <Plus size={15} />
                        <span>Create Issue</span>
                    </button>
                    <button
                        type="button"
                        className={styles.crashBtn}
                        title="Trigger test crash for error boundary">
                        <Flame size={14} />
                        <span>Simulate Crash</span>
                    </button>
                </div>
            </section>

            <section className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Total Issues</span>
                    <span className={styles.metricValue}>{stats.total}</span>
                    <span className={styles.metricHint}>Active in workspace</span>
                </div>
                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>In Progress</span>
                    <span className={`${styles.metricValue} ${styles.amber}`}>{stats.inProgress}</span>
                    <span className={styles.metricHint}>Under active review</span>
                </div>
                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Completed</span>
                    <span className={`${styles.metricValue} ${styles.green}`}>{stats.done}</span>
                    <span className={styles.metricHint}>Shipped this cycle</span>
                </div>
                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Completion Rate</span>
                    <span className={styles.metricValue}>{stats.rate}%</span>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${stats.rate}%` }} />
                    </div>
                </div>
            </section>
        </div>
    )
}