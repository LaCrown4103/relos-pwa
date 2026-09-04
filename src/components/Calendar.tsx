'use client';

import { useState, useEffect } from 'react';
import { useCouple } from '@/lib/CoupleContext';
import { getCalendarEvents, addCalendarEvent } from '@/lib/dataManager';
import { CalendarEvent, EventType } from '@/lib/types';
import { Plus, AlertCircle } from 'lucide-react';

export const Calendar = () => {
  const { coupleId, currentUser } = useCouple();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: EventType.PaarZeit,
    date: new Date().toISOString().split('T')[0],
    time: '18:00',
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const calendarEvents = getCalendarEvents(coupleId);
    setEvents(calendarEvents);
  }, [coupleId]);

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) return;

    addCalendarEvent(coupleId, {
      createdBy: currentUser?.id || '',
      title: newEvent.title,
      type: newEvent.type,
      startDate: new Date(`${newEvent.date}T${newEvent.time}`).toISOString(),
      description: '',
    });

    setEvents(getCalendarEvents(coupleId));
    setNewEvent({
      title: '',
      type: EventType.PaarZeit,
      date: new Date().toISOString().split('T')[0],
      time: '18:00',
    });
    setShowAddEvent(false);
  };

  const eventTypeConfig = {
    [EventType.PaarZeit]: {
      label: 'Paar-Zeit',
      color: 'bg-red-100 text-red-800 border-red-300',
      dotColor: 'bg-red-500',
    },
    [EventType.MeTime]: {
      label: 'Me-Time',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      dotColor: 'bg-blue-500',
    },
    [EventType.Verpflichtung]: {
      label: 'Verpflichtung',
      color: 'bg-gray-100 text-gray-800 border-gray-300',
      dotColor: 'bg-gray-500',
    },
  };

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (day: number) => {
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      .toISOString()
      .split('T')[0];
    return events.filter((e) => e.startDate.split('T')[0] === dateStr);
  };

  const checkMeTimeWarning = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const userMeTime = events.filter(
      (e) => e.type === EventType.MeTime && e.createdBy === currentUser?.id
    );

    const recentUserMeTime = userMeTime.filter(
      (e) => new Date(e.startDate) >= sevenDaysAgo
    );

    return recentUserMeTime.length === 0;
  };

  const calendarDays = [];
  const daysCount = daysInMonth(currentMonth);
  const startDay = firstDayOfMonth(currentMonth);

  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysCount; day++) {
    calendarDays.push(day);
  }

  const userHasNoMeTime = checkMeTimeWarning();

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="pt-6 px-4">
        <h1 className="text-3xl font-bold text-gray-900">Kalender</h1>
        <p className="text-gray-600 text-sm mt-1">Planen & Verbindung</p>
      </div>

      {/* Me-Time Warning */}
      {userHasNoMeTime && (
        <div className="px-4">
          <div className="card bg-yellow-50 border-yellow-200 p-4 flex gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-900">
                Me-Time-Erinnerung
              </p>
              <p className="text-xs text-yellow-800 mt-1">
                Planen Sie Me-Time in den nächsten 7 Tagen!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Event */}
      <div className="px-4">
        <button
          onClick={() => setShowAddEvent(!showAddEvent)}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Aktivität hinzufügen
        </button>

        {showAddEvent && (
          <div className="card p-4 mt-4 space-y-3">
            <input
              type="text"
              placeholder="Titel..."
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="input-base"
              autoFocus
            />

            <select
              value={newEvent.type}
              onChange={(e) =>
                setNewEvent({ ...newEvent, type: e.target.value as EventType })
              }
              className="input-base"
            >
              <option value={EventType.PaarZeit}>Paar-Zeit</option>
              <option value={EventType.MeTime}>Me-Time</option>
              <option value={EventType.Verpflichtung}>Verpflichtung</option>
            </select>

            <div className="flex gap-2">
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="input-base flex-1"
              />
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                className="input-base flex-1"
              />
            </div>

            <div className="flex gap-2">
              <button onClick={handleAddEvent} className="btn-primary flex-1">
                Erstellen
              </button>
              <button
                onClick={() => setShowAddEvent(false)}
                className="btn-secondary flex-1"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mini Calendar */}
      <div className="px-4">
        <div className="card p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">
              {currentMonth.toLocaleDateString('de-CH', {
                month: 'long',
                year: 'numeric',
              })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const newMonth = new Date(currentMonth);
                  newMonth.setMonth(newMonth.getMonth() - 1);
                  setCurrentMonth(newMonth);
                }}
                className="btn-ghost text-sm"
              >
                ←
              </button>
              <button
                onClick={() => {
                  const newMonth = new Date(currentMonth);
                  newMonth.setMonth(newMonth.getMonth() + 1);
                  setCurrentMonth(newMonth);
                }}
                className="btn-ghost text-sm"
              >
                →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}

            {calendarDays.map((day, idx) => {
              const dayEvents = day ? getEventsForDate(day) : [];
              return (
                <div
                  key={idx}
                  className={`aspect-square rounded-lg border p-1 relative ${
                    day
                      ? 'bg-white border-gray-200 hover:border-couple-primary'
                      : 'bg-gray-50 border-transparent'
                  }`}
                >
                  {day && (
                    <>
                      <p className="text-xs font-medium text-gray-700">{day}</p>
                      <div className="flex gap-0.5 mt-0.5 flex-wrap">
                        {dayEvents.map((event, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${
                              eventTypeConfig[event.type].dotColor
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event List */}
      <div className="px-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Kommende Aktivitäten</h2>
        <div className="space-y-2">
          {events
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
            .slice(0, 5)
            .map((event) => (
              <div
                key={event.id}
                className={`card p-3 border-l-4 ${eventTypeConfig[event.type].color}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{event.title}</p>
                    <p className="text-xs mt-1">
                      {new Date(event.startDate).toLocaleDateString('de-CH', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      ·{' '}
                      {new Date(event.startDate).toLocaleTimeString('de-CH', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      Uhr
                    </p>
                    <span className="inline-block text-xs px-2 py-0.5 rounded mt-2 bg-white/50">
                      {eventTypeConfig[event.type].label}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
