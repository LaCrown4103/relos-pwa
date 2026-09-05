'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { Dashboard } from '@/components/Dashboard';
import { Calendar } from '@/components/Calendar';
import { Rephrase } from '@/components/Rephrase';
import { Connection } from '@/components/Connection';
import { Landing } from '@/components/Landing';
import { useCouple } from '@/lib/CoupleContext';

const SECTIONS = ['dashboard', 'calendar', 'rephrase', 'connection'];
const LANDING_SEEN_KEY = 'kracher_seen_landing';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLanding, setShowLanding] = useState<boolean | null>(null);
  const { isLoading } = useCouple();
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && SECTIONS.includes(tab)) {
      setActiveTab(tab);
    }
    setShowLanding(!sessionStorage.getItem(LANDING_SEEN_KEY));
  }, []);

  useEffect(() => {
    if (showLanding !== false) return;
    sectionRefs.current[activeTab]?.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
    // Only run once, right after the one-pager mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLanding]);

  useEffect(() => {
    if (showLanding !== false) return;
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = mostVisible?.target instanceof HTMLElement ? mostVisible.target.dataset.section : undefined;
        if (id) setActiveTab(id);
      },
      { root: container, threshold: [0.5, 0.75] }
    );

    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [showLanding]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    sectionRefs.current[tab]?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleEnterApp = () => {
    sessionStorage.setItem(LANDING_SEEN_KEY, '1');
    setShowLanding(false);
  };

  if (isLoading || showLanding === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-couple-dark">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-couple-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Kracher wird geladen...</p>
        </div>
      </div>
    );
  }

  if (showLanding) {
    return <Landing onEnter={handleEnterApp} />;
  }

  return (
    <main className="max-w-md mx-auto bg-couple-dark relative">
      <div
        ref={containerRef}
        className="h-dvh overflow-y-auto snap-y snap-proximity scroll-smooth"
      >
        <div
          ref={(el) => {
            sectionRefs.current.dashboard = el;
          }}
          data-section="dashboard"
          className="min-h-dvh snap-start"
        >
          <Dashboard />
        </div>
        <div
          ref={(el) => {
            sectionRefs.current.calendar = el;
          }}
          data-section="calendar"
          className="min-h-dvh snap-start"
        >
          <Calendar />
        </div>
        <div
          ref={(el) => {
            sectionRefs.current.rephrase = el;
          }}
          data-section="rephrase"
          className="min-h-dvh snap-start"
        >
          <Rephrase />
        </div>
        <div
          ref={(el) => {
            sectionRefs.current.connection = el;
          }}
          data-section="connection"
          className="min-h-dvh snap-start"
        >
          <Connection />
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </main>
  );
}
