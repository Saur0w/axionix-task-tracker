'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RotateCcw, Compass, Copy, Check } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import styles from './error.module.scss';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  const containerRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLSpanElement>(null);
  const digitsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const spinIconRef = useRef<SVGSVGElement>(null);

  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useGSAP(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (bgRef.current) {
      gsap.set(bgRef.current, {
        backgroundImage: "url('/images/error.jpg')",
      });
    }

    if (isReduced) {
      gsap.set([bgRef.current, contentRef.current], { opacity: 1 });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to(bgRef.current, {
      opacity: 1,
      duration: 0.9,
      ease: 'power2.out',
    }, 0);

    tl.set(contentRef.current, { opacity: 1 }, 0.1);

    if (taglineRef.current) {
      tl.fromTo(
        taglineRef.current,
        { opacity: 0, y: -12, filter: 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6 },
        0.2
      );
    }

    const validDigits = digitsRef.current.filter(Boolean);
    if (validDigits.length > 0) {
      tl.fromTo(
        validDigits,
        {
          yPercent: 110,
          opacity: 0,
          filter: 'blur(8px)',
        },
        {
          yPercent: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.85,
          stagger: 0.08,
          ease: 'power4.out',
        },
        0.3
      );
    }

    if (messageRef.current) {
      tl.fromTo(
        messageRef.current,
        { opacity: 0, y: 18, filter: 'blur(5px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.65 },
        0.55
      );
    }

    if (pillRef.current) {
      tl.fromTo(
        pillRef.current,
        { opacity: 0, y: 14, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.55 },
        0.7
      );
    }

    if (buttonsRef.current) {
      tl.fromTo(
        buttonsRef.current.children,
        { opacity: 0, y: 15, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'back.out(1.4)',
        },
        0.8
      );
    }
  }, { scope: containerRef });

  const handleCopy = () => {
    if (!error?.message) return;
    navigator.clipboard.writeText(error.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setIsRetrying(true);
    if (spinIconRef.current) {
      gsap.to(spinIconRef.current, {
        rotation: '+=360',
        duration: 0.6,
        ease: 'power2.inOut',
        onComplete: () => {
          setIsRetrying(false);
          reset();
        },
      });
    } else {
      reset();
    }
  };

  return (
    <section className={styles.spaceWrapper} ref={containerRef}>
      <div className={styles.bgImage} ref={bgRef} />
      <div className={styles.gradientFade} />
      <div className={styles.contentRight} ref={contentRef}>
        <span className={styles.tagline} ref={taglineRef}>
          <span className={styles.statusDot} />
          Signal Lost
        </span>

        <h1 className={styles.errorCode}>
          {['5', '0', '0'].map((digit, i) => (
            <span key={i} className={styles.digitMask}>
              <span
                ref={(el) => {
                  digitsRef.current[i] = el;
                }}
                className={styles.digit}
              >
                {digit}
              </span>
            </span>
          ))}
        </h1>

        <p className={styles.message} ref={messageRef}>
          Communication with route <code className={styles.path}>{pathname || '/dashboard'}</code> was interrupted by an unexpected exception.
        </p>

        {error?.message && (
          <div className={styles.exceptionPill} ref={pillRef}>
            <div className={styles.pillText}>
              <span className={styles.logTag}>LOG:</span>
              <span>{error.message}</span>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
              title="Copy error message"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}

        <div className={styles.buttonGroup} ref={buttonsRef}>
          <button
            type="button"
            onClick={handleReset}
            disabled={isRetrying}
            className={styles.reconnectBtn}
          >
            <RotateCcw size={15} ref={spinIconRef} />
            <span>{isRetrying ? 'Re-establishing...' : 'Re-establish Link'}</span>
          </button>

          <Link href="/dashboard" className={styles.orbitBtn}>
            <Compass size={15} />
            <span>Back to Base</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
