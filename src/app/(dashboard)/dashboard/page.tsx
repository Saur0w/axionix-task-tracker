"use client";

import { useState } from "react";
import styles from "./style.module.scss";

export default function DashboardPage() {
  const [shouldCrash, setShouldCrash] = useState(false);

  // If true, throw an error during render to trigger error.tsx!
  if (shouldCrash) {
    throw new Error("Simulated Crash: Failed to load dashboard data!");
  }

  return (
    <section className={styles.container}>
      <button 
        type="button" 
        onClick={() => setShouldCrash(true)}
        style={{
          padding: "10px 16px",
          background: "var(--danger)",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: 600,
          width: "fit-content"
        }}
      >
        💥 Click to Trigger Error Page
      </button>
    </section>
  );
}
