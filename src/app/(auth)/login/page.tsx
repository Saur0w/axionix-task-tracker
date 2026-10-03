'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import AxionixLogo from '@/components/ui/Logo';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { simulateErrorStore, useSimulateError } from '@/context/TaskContext';
import { getInitials } from '@/utils/format';
import styles from './style.module.scss';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, logout, switchUser, availableUsers } = useAuth();
  const { toast } = useToast();
  const simulateError = useSimulateError();

  const [email, setEmail] = useState('sthap@axionix.dev');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced || !cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 24, filter: 'blur(12px)', scale: 0.98 },
      { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, duration: 0.6, ease: 'power3.out', clearProps: 'filter,transform' }
    );
  }, { scope: containerRef });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter an email address.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const loggedUser = await login(email, password);
      toast({
        variant: 'success',
        title: 'Welcome back!',
        description: `Signed in as ${loggedUser.name}.`,
      });
      router.push('/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setErrorMessage(msg);
      toast({
        variant: 'error',
        title: 'Sign In Failed',
        description: msg,
      });

      // Subtle shake animation on card for failed attempts
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { x: -8 },
          { x: 0, duration: 0.35, ease: 'elastic.out(1, 0.3)', clearProps: 'x' }
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectDemoProfile = async (targetUserId: string, targetEmail: string) => {
    setEmail(targetEmail);
    setPassword('password123');
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const switched = await switchUser(targetUserId);
      toast({
        variant: 'success',
        title: 'Signed In',
        description: `Switched to ${switched.name}.`,
      });
      router.push('/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not switch profile';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialMockLogin = async (provider: 'Google' | 'GitHub') => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const primaryUser = availableUsers[0];
      await login(primaryUser.email, 'oauth-sso');
      toast({
        variant: 'success',
        title: `Signed in via ${provider}`,
        description: `Connected workspace account for ${primaryUser.name}.`,
      });
      router.push('/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'OAuth sign in failed';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMockErrorOff = () => {
    simulateErrorStore.set(false);
    toast({
      variant: 'info',
      title: 'Mock Error disabled',
      description: 'API failure mode has been turned off.',
    });
  };

  return (
    <div className={styles.loginContainer} ref={containerRef}>
      <div className={styles.ambientGlow} />
      <div className={styles.ambientGrid} />

      <div className={styles.loginCard} ref={cardRef}>
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <div className={styles.logoWrapper}>
            <AxionixLogo size={24} />
          </div>
          <h1 className={styles.title}>Sign in to Axionix</h1>
          <p className={styles.subtitle}>
            Enter your team credentials or choose a demo profile to continue.
          </p>
        </div>

        {/* Notice if Mock Error simulation is enabled in Header */}
        {simulateError && (
          <div className={styles.mockErrorWarning}>
            <AlertTriangle size={16} className={styles.warningIcon} />
            <div>
              <span>
                <strong>Assignment Mock Error is Active:</strong> All authentication and API mutations are set to fail intentionally.
              </span>
              <button
                type="button"
                onClick={toggleMockErrorOff}
                className={styles.disableErrorBtn}
              >
                Disable Mock Error
              </button>
            </div>
          </div>
        )}

        {/* Existing Session Notice */}
        {user && (
          <div className={styles.activeSessionBanner}>
            <p className={styles.sessionText}>
              Currently signed in as <strong>{user.name}</strong> ({user.email})
            </p>
            <div className={styles.sessionActions}>
              <Link href="/dashboard" className={styles.continueBtn}>
                <span>Go to Dashboard</span>
                <ArrowRight size={13} />
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className={styles.signOutSmallBtn}
              >
                Sign out
              </button>
            </div>
          </div>
        )}

        {/* One-Click Quick Demo Profiles */}
        <div className={styles.demoProfiles}>
          <span className={styles.demoLabel}>1-Click Demo Profiles</span>
          <div className={styles.profileGrid}>
            {availableUsers.map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => handleSelectDemoProfile(profile.id, profile.email)}
                className={`${styles.profileChip} ${user?.id === profile.id ? styles.active : ''}`}
                title={`Sign in as ${profile.name} (${profile.email})`}
                disabled={isSubmitting}
              >
                <div className={styles.chipAvatar}>
                  {getInitials(profile.name)}
                </div>
                <span className={styles.chipName}>{profile.name}</span>
                <span className={styles.chipRole}>{profile.role?.split(' ')[0] || 'Team'}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.divider}>or with email</div>

        {/* Error Message Display */}
        {errorMessage && (
          <div className={styles.errorBanner} role="alert">
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="login-email" className={styles.labelRow}>
              <span className={styles.label}>Email Address</span>
            </label>
            <div className={styles.inputWrapper}>
              <Mail size={15} className={styles.inputIcon} />
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@axionix.dev"
                className={styles.input}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="login-password" className={styles.label}>
                Password
              </label>
              <span 
                className={styles.forgotLink}
                title="Demo accepts any password >= 4 chars"
                onClick={() => toast({ variant: 'info', title: 'Demo Mode', description: 'Any password works for testing (e.g. password123).' })}
              >
                Demo hint?
              </span>
            </div>
            <div className={styles.inputWrapper}>
              <Lock size={15} className={styles.inputIcon} />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={styles.input}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.toggleBtn}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="spin" />
                <span>Signing in…</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Third-Party Social SSO */}
        <div className={styles.ssoRow}>
          <button
            type="button"
            onClick={() => handleSocialMockLogin('Google')}
            className={styles.ssoBtn}
            disabled={isSubmitting}
            title="Sign in with Google workspace"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialMockLogin('GitHub')}
            className={styles.ssoBtn}
            disabled={isSubmitting}
            title="Sign in with GitHub"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </button>
        </div>

        {/* Footer info */}
        <p className={styles.footerNote}>
          Axionix Engineering Workspace • <Link href="/dashboard">Direct to Dashboard</Link>
        </p>
      </div>
    </div>
  );
}
