'use client';

import { ChevronDown } from 'lucide-react';

interface LandingProps {
  onEnter: () => void;
}

export const Landing = ({ onEnter }: LandingProps) => {
  return (
    <div
      onClick={onEnter}
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-couple-dark text-white p-6 pt-12 pb-10 cursor-pointer select-none"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-couple-secondary">
        Couple OS
      </p>

      <div className="space-y-4">
        <h1 className="font-serif italic text-6xl leading-[0.95]">Kracher</h1>
        <p className="font-light text-lg text-white/70 max-w-xs">
          Energie, Planung, Kommunikation und Verbindung — alles an einem Ort für euch als Paar.
        </p>
      </div>

      <div className="flex flex-col items-center gap-2 text-white/60 text-xs font-semibold uppercase tracking-widest">
        <span>Tippen oder scrollen zum Start</span>
        <ChevronDown className="animate-bounce" size={20} />
      </div>
    </div>
  );
};
