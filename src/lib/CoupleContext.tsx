'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CoupleUser } from './types';
import { getCoupleUsers, loadData, initializeDemoData } from './dataManager';

interface CoupleContextType {
  coupleId: string;
  currentUser: CoupleUser | null;
  partner: CoupleUser | null;
  isLoading: boolean;
  refreshData: () => void;
}

const CoupleContext = createContext<CoupleContextType | undefined>(undefined);

export const CoupleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [coupleId] = useState<string>('couple_demo_' + Math.random().toString(36).slice(2, 11));
  const [currentUser, setCurrentUser] = useState<CoupleUser | null>(null);
  const [partner, setPartner] = useState<CoupleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize demo data on first load
    initializeDemoData(coupleId);

    const users = getCoupleUsers(coupleId);
    if (users.length >= 2) {
      // Default to first user, you can switch between users
      setCurrentUser(users[0]);
      setPartner(users[1]);
    }

    setIsLoading(false);
  }, [coupleId]);

  const refreshData = () => {
    loadData();
  };

  return (
    <CoupleContext.Provider
      value={{
        coupleId,
        currentUser,
        partner,
        isLoading,
        refreshData,
      }}
    >
      {children}
    </CoupleContext.Provider>
  );
};

export const useCouple = () => {
  const context = useContext(CoupleContext);
  if (!context) {
    throw new Error('useCouple must be used within CoupleProvider');
  }
  return context;
};
