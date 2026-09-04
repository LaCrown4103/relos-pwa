'use client';

import { useState, useEffect } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { Dashboard } from '@/components/Dashboard';
import { Calendar } from '@/components/Calendar';
import { Wingman } from '@/components/Wingman';
import { Connection } from '@/components/Connection';
import { useCouple } from '@/lib/CoupleContext';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { isLoading } = useCouple();

  useEffect(() => {
    // Handle URL tab param
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-couple-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">RelOS wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-md mx-auto bg-white min-h-screen relative">
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'calendar' && <Calendar />}
      {activeTab === 'wingman' && <Wingman />}
      {activeTab === 'connection' && <Connection />}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  );
}
