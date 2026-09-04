'use client';

import { useState, useEffect } from 'react';
import { useCouple } from '@/lib/CoupleContext';
import { getBucketList, addBucketListItem, updateBucketListItem } from '@/lib/dataManager';
import { BucketListItem, DateIdea } from '@/lib/types';
import {
  Sparkles,
  Heart,
  CheckCircle2,
  Circle,
  Plus,
  Loader,
  Lightbulb,
} from 'lucide-react';

const DAILY_QUESTIONS = [
  'Was war das beste Moment heute, das wir gemeinsam erlebt haben?',
  'Wenn Sie Ihre Gedanken lesen könnten - worüber würden Sie gerade nachdenken?',
  'Welcher Traum hast du, den wir gemeinsam verwirklichen könnten?',
  'Was schätzt du an mir am meisten in dieser Woche?',
  'Welches Abenteuer würdest du gerne zusammen erleben?',
  'Was hat dich heute bewegt oder berührt?',
  'Wenn alles möglich wäre - wohin würden wir reisen?',
  'Wofür bist du dankbar in unserer Beziehung?',
];

export const Connection = () => {
  const { coupleId } = useCouple();
  const [bucketList, setBucketList] = useState<BucketListItem[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'vacation' | 'goal' | 'milestone'>(
    'vacation'
  );
  const [dateIdeas, setDateIdeas] = useState<DateIdea[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [budget, setBudget] = useState('budget');
  const [setting, setSetting] = useState('zuhause');
  const [energyLevel, setEnergyLevel] = useState('medium');
  const [dailyQuestion, setDailyQuestion] = useState('');
  const [showDateForm, setShowDateForm] = useState(false);

  useEffect(() => {
    setBucketList(getBucketList(coupleId));

    // Set random daily question
    const randomQuestion = DAILY_QUESTIONS[Math.floor(Math.random() * DAILY_QUESTIONS.length)];
    setDailyQuestion(randomQuestion);
  }, [coupleId]);

  const handleAddItem = () => {
    if (!newItemTitle.trim()) return;

    addBucketListItem(coupleId, {
      title: newItemTitle,
      category: newItemCategory,
      completed: false,
    });

    setBucketList(getBucketList(coupleId));
    setNewItemTitle('');
    setShowAddItem(false);
  };

  const handleToggleItem = (itemId: string, completed: boolean) => {
    updateBucketListItem(itemId, {
      completed: !completed,
    });
    setBucketList(getBucketList(coupleId));
  };

  const handleGenerateDateIdeas = async () => {
    setLoadingIdeas(true);
    try {
      const response = await fetch('/api/ai/date-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget,
          setting,
          energyLevel: energyLevel === 'high' ? 'abenteuer' : 'couch-modus',
        }),
      });

      const data = await response.json();
      setDateIdeas(data);
    } catch (error) {
      console.error('Error generating date ideas:', error);
      alert('Fehler beim Generieren von Ideen. Bitte versuchen Sie es später.');
    } finally {
      setLoadingIdeas(false);
      setShowDateForm(false);
    }
  };

  const categoryEmojis = {
    vacation: '✈️',
    goal: '🎯',
    milestone: '🏆',
  };

  const categoryLabels = {
    vacation: 'Ferien',
    goal: 'Ziele',
    milestone: 'Meilensteine',
  };

  const bucketsByCategory = {
    vacation: bucketList.filter((b) => b.category === 'vacation'),
    goal: bucketList.filter((b) => b.category === 'goal'),
    milestone: bucketList.filter((b) => b.category === 'milestone'),
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="pt-6 px-4">
        <h1 className="text-3xl font-semibold text-gray-900">Verbindung & Inspiration</h1>
        <p className="text-gray-600 text-sm mt-1">Gemeinsam träumen, erleben, wachsen</p>
      </div>

      {/* Daily Question */}
      <div className="px-4">
        <div className="card p-4 bg-gradient-to-br from-couple-light to-white space-y-3 border-2 border-couple-primary">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="text-couple-primary" size={20} />
            <p className="font-semibold text-sm text-couple-primary">
              Heutige Gesprächsfrage
            </p>
          </div>
          <p className="text-sm text-gray-900 leading-relaxed font-medium">
            &ldquo;{dailyQuestion}&rdquo;
          </p>
          <p className="text-xs text-gray-600 italic">
            Nehmen Sie sich Zeit für ein echtes Gespräch heute...
          </p>
        </div>
      </div>

      {/* Date Night Generator */}
      <div className="px-4 space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles size={20} className="text-couple-primary" />
          Date Night Generator
        </h2>

        {!showDateForm && dateIdeas.length === 0 ? (
          <button
            onClick={() => setShowDateForm(true)}
            className="btn-primary w-full"
          >
            Ideen generieren
          </button>
        ) : null}

        {showDateForm && (
          <div className="card p-4 space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-gray-900 mb-2 block">
                Budget
              </span>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="input-base"
              >
                <option value="gratis">Gratis 🤑</option>
                <option value="budget">Budget 💰</option>
                <option value="luxus">Luxus 🥂</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-900 mb-2 block">
                Ort
              </span>
              <select
                value={setting}
                onChange={(e) => setSetting(e.target.value)}
                className="input-base"
              >
                <option value="zuhause">Zu Hause</option>
                <option value="unterwegs">Unterwegs</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-900 mb-2 block">
                Energie-Level
              </span>
              <select
                value={energyLevel}
                onChange={(e) => setEnergyLevel(e.target.value)}
                className="input-base"
              >
                <option value="low">Couch-Modus 🛋️</option>
                <option value="medium">Gemütlich 😊</option>
                <option value="high">Abenteuer 🚀</option>
              </select>
            </label>

            <div className="flex gap-2">
              <button
                onClick={handleGenerateDateIdeas}
                disabled={loadingIdeas}
                className={`btn-primary flex-1 flex items-center justify-center gap-2 ${
                  loadingIdeas ? 'opacity-75' : ''
                }`}
              >
                {loadingIdeas ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Generiert...
                  </>
                ) : (
                  'Generieren'
                )}
              </button>
              <button
                onClick={() => {
                  setShowDateForm(false);
                  setDateIdeas([]);
                }}
                className="btn-secondary flex-1"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {dateIdeas.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => {
                setShowDateForm(true);
                setDateIdeas([]);
              }}
              className="text-sm btn-ghost w-full"
            >
              Neue Ideen generieren
            </button>

            {dateIdeas.map((idea, idx) => (
              <div key={idx} className="card p-4 space-y-3 border-l-4 border-couple-secondary">
                <div>
                  <h3 className="font-semibold text-gray-900">{idea.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{idea.description}</p>
                </div>

                <div className="flex gap-2 text-xs">
                  <span className="bg-couple-secondary/10 text-couple-secondary px-2 py-1 rounded">
                    {idea.estimatedCost === 'gratis'
                      ? '🤑 Gratis'
                      : idea.estimatedCost === 'budget'
                      ? '💰 Budget'
                      : '🥂 Luxus'}
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    ⏱️ {idea.estimatedDuration}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700">Schritt-für-Schritt:</p>
                  <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                    {idea.steps.map((step, stepIdx) => (
                      <li key={stepIdx}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bucket List */}
      <div className="px-4 space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Heart size={20} className="text-couple-primary" />
          Gemeinsame Träume & Ziele
        </h2>

        <button
          onClick={() => setShowAddItem(!showAddItem)}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Neuen Traum hinzufügen
        </button>

        {showAddItem && (
          <div className="card p-4 space-y-3">
            <input
              type="text"
              placeholder="Was träumen Sie zusammen?"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              className="input-base"
              autoFocus
            />

            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value as 'vacation' | 'goal' | 'milestone')}
              className="input-base"
            >
              <option value="vacation">✈️ Ferien</option>
              <option value="goal">🎯 Ziel</option>
              <option value="milestone">🏆 Meilenstein</option>
            </select>

            <div className="flex gap-2">
              <button onClick={handleAddItem} className="btn-primary flex-1">
                Hinzufügen
              </button>
              <button
                onClick={() => setShowAddItem(false)}
                className="btn-secondary flex-1"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {Object.entries(bucketsByCategory).map(([category, items]) => (
          <div key={category} className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 px-2">
              {categoryEmojis[category as keyof typeof categoryEmojis]}{' '}
              {categoryLabels[category as keyof typeof categoryLabels]}
            </h3>

            {items.length === 0 ? (
              <p className="text-xs text-gray-400 px-2">Noch keine Träume...</p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="card p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <button
                    onClick={() => handleToggleItem(item.id, item.completed)}
                    className="flex-shrink-0 text-couple-primary hover:scale-110 transition-transform"
                  >
                    {item.completed ? (
                      <CheckCircle2 size={22} />
                    ) : (
                      <Circle size={22} />
                    )}
                  </button>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        item.completed
                          ? 'line-through text-gray-400'
                          : 'text-gray-900'
                      }`}
                    >
                      {item.title}
                    </p>
                    {item.completedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        ✓ Erreicht am{' '}
                        {new Date(item.completedAt).toLocaleDateString('de-CH')}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
