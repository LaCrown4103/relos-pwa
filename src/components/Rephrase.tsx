'use client';

import { useState } from 'react';
import { useCouple } from '@/lib/CoupleContext';
import { Copy, Send, Loader, Leaf, Lightbulb } from 'lucide-react';

interface TranslationState {
  original: string;
  translated: string;
  insights: string;
}

export const Rephrase = () => {
  const { coupleId } = useCouple();
  const [frustration, setFrustration] = useState('');
  const [translation, setTranslation] = useState<TranslationState | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!frustration.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalMessage: frustration,
          coupleId,
        }),
      });

      const data = await response.json();
      setTranslation({
        original: data.originalMessage,
        translated: data.translatedMessage,
        insights: data.insights,
      });
    } catch (error) {
      console.error('Translation error:', error);
      alert('Fehler bei der Übersetzung. Bitte versuchen Sie es später.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translation?.translated || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="pt-6 px-4">
        <h1 className="text-3xl font-semibold text-gray-900">Rephrase</h1>
        <p className="text-gray-600 text-sm mt-1">
          Frust in konstruktive Botschaften umwandeln
        </p>
      </div>

      {/* Info */}
      <div className="px-4">
        <div className="card bg-couple-light p-4 space-y-2">
          <p className="text-sm font-medium text-gray-900">Wie es funktioniert:</p>
          <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
            <li>Schreiben Sie ungefiltert auf, was Sie frustriert</li>
            <li>Rephrase wandelt es in GFK-Sprache um</li>
            <li>Kopieren Sie die Nachricht oder senden Sie sie direkt</li>
          </ol>
        </div>
      </div>

      {/* Input Section */}
      <div className="px-4 space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-gray-900 block mb-2">
            Was frustriert Sie gerade?
          </span>
          <textarea
            value={frustration}
            onChange={(e) => setFrustration(e.target.value)}
            placeholder="Schreiben Sie hier ungefiltert auf, was Sie ärgert..."
            className="input-base h-32 resize-none"
            disabled={loading}
          />
        </label>

        <button
          onClick={handleTranslate}
          disabled={loading || !frustration.trim()}
          className={`w-full py-3 rounded-full font-medium flex items-center justify-center gap-2 transition-all ${
            loading || !frustration.trim()
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'btn-primary'
          }`}
        >
          {loading ? (
            <>
              <Loader size={20} className="animate-spin" />
              Umwandlung läuft...
            </>
          ) : (
            'In konstruktive Ich-Botschaft umwandeln'
          )}
        </button>
      </div>

      {/* Translation Result */}
      {translation && (
        <div className="px-4 space-y-4">
          {/* Original */}
          <div className="card p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-600 uppercase">
              Original-Nachricht
            </p>
            <p className="text-sm text-gray-800 leading-relaxed">
              {translation.original}
            </p>
          </div>

          {/* Translated — the hero result, styled as a black feature card */}
          <div className="card p-4 space-y-3 bg-black border-black">
            <p className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-1.5">
              <Leaf size={14} />
              Gewaltfrei kommuniziert
            </p>
            <p className="text-sm text-white leading-relaxed font-medium">
              {translation.translated}
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 text-sm bg-white/10 text-white px-6 py-3 rounded-full font-medium hover:bg-white/20"
              >
                <Copy size={18} />
                {copied ? 'Kopiert!' : 'Kopieren'}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(translation.translated);
                  alert('Bereit zum Versenden!');
                }}
                className="flex-1 flex items-center justify-center gap-2 text-sm bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-200"
              >
                <Send size={18} />
                Senden
              </button>
            </div>
          </div>

          {/* Insights */}
          <div className="card p-4 space-y-2 bg-gray-50 border-gray-200">
            <p className="text-xs font-semibold text-gray-900 uppercase flex items-center gap-1.5">
              <Lightbulb size={14} />
              Warum diese Umwandlung?
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              {translation.insights}
            </p>
          </div>

          {/* Reset */}
          <button
            onClick={() => {
              setFrustration('');
              setTranslation(null);
            }}
            className="btn-ghost w-full text-center"
          >
            Neue Nachricht
          </button>
        </div>
      )}

      {/* GFK Info */}
      <div className="px-4 pb-4">
        <div className="card p-4 space-y-3 bg-gray-50">
          <p className="text-sm font-semibold text-gray-900">
            Gewaltfreie Kommunikation (GFK)
          </p>
          <div className="text-xs text-gray-700 space-y-2">
            <p>
              <span className="font-medium">1. Beobachtung:</span> Fakten ohne Vorwürfe
            </p>
            <p>
              <span className="font-medium">2. Gefühl:</span> Ihre echte emotionale Reaktion
            </p>
            <p>
              <span className="font-medium">3. Grund:</span> Warum Ihnen das wichtig ist
            </p>
            <p>
              <span className="font-medium">4. Bitte:</span> Konkret, was Sie sich wünschen
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
