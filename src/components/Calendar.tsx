'use client';

import { useState, useEffect } from 'react';
import { useCouple } from '@/lib/CoupleContext';
import { getCalendarEvents, addCalendarEvent, updateCalendarEvent } from '@/lib/dataManager';
import { CalendarEvent, EventType } from '@/lib/types';
import { Plus, AlertCircle, History } from 'lucide-react';
import { SectionLabel } from './SectionLabel';

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
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    type: EventType.PaarZeit,
    date: '',
    time: '',
  });

  useEffect(() => {
    const calendarEvents = getCalendarEvents(coupleId);
    setEvents(calendarEvents);
  }, [coupleId]);

  const openAddEventModal = (date?: string) => {
    setNewEvent((prev) => ({
      ...prev,
      date: date || new Date().toISOString().split('T')[0],
    }));
    setShowAddEvent(true);
  };

  const handleDayClick = (day: number) => {
    const clicked = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    openAddEventModal(clicked.toISOString().split('T')[0]);
  };

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

  const openEditModal = (event: CalendarEvent) => {
    const start = new Date(event.startDate);
    const pad = (n: number) => String(n).padStart(2, '0');
    setEditingEvent(event);
    setEditForm({
      title: event.title,
      type: event.type,
      // Both date and time must come from the same (local) clock, or
      // reconstructing startDate below silently shifts it and falsely
      // logs a "Datum/Zeit geändert" history entry for an untouched field.
      date: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
      time: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
    });
  };

  const handleSaveEdit = () => {
    if (!editingEvent || !editForm.title.trim()) return;

    updateCalendarEvent(
      editingEvent.id,
      {
        title: editForm.title,
        type: editForm.type,
        startDate: new Date(`${editForm.date}T${editForm.time}`).toISOString(),
      },
      { id: currentUser?.id || '', name: currentUser?.name || 'Unbekannt' }
    );

    setEvents(getCalendarEvents(coupleId));
    setEditingEvent(null);
  };

  const eventTypeConfig = {
    [EventType.PaarZeit]: {
      label: 'Paar-Zeit',
      color: 'bg-couple-secondary text-couple-dark border-couple-secondary',
      dotColor: 'bg-couple-secondary',
    },
    [EventType.MeTime]: {
      label: 'Me-Time',
      color: 'bg-couple-surface text-white border-gray-500',
      dotColor: 'bg-gray-400',
    },
    [EventType.Verpflichtung]: {
      label: 'Verpflichtung',
      color: 'bg-couple-surface text-gray-300 border-white/20',
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
        <SectionLabel index={2} label="Kalender" />
        <h1 className="text-3xl font-extrabold text-white">Kalender</h1>
        <p className="text-gray-400 font-light text-sm mt-1">Planen & Verbindung</p>
      </div>

      {/* Me-Time Warning — bright card so it pops against the dark page */}
      {userHasNoMeTime && (
        <div className="px-4">
          <div className="card bg-white text-couple-dark border-white p-4 flex gap-3">
            <AlertCircle className="text-couple-dark flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-couple-dark">
                Me-Time-Erinnerung
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Planen Sie Me-Time in den nächsten 7 Tagen!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Event */}
      <div className="px-4">
        <button
          onClick={() => openAddEventModal()}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Aktivität hinzufügen
        </button>
      </div>

      {/* Mini Calendar */}
      <div className="px-4">
        <div className="card p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-white">
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
              <div key={day} className="text-center text-xs font-semibold text-gray-400 py-2">
                {day}
              </div>
            ))}

            {calendarDays.map((day, idx) => {
              const dayEvents = day ? getEventsForDate(day) : [];
              if (!day) {
                return (
                  <div
                    key={idx}
                    className="aspect-square rounded-lg border border-transparent bg-white/5"
                  />
                );
              }
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className="aspect-square rounded-lg border border-white/15 bg-couple-dark hover:border-couple-secondary p-1 relative text-left"
                >
                  <p className="text-xs font-medium text-gray-300">{day}</p>
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
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event List */}
      <div className="px-4">
        <h2 className="text-lg font-semibold text-white mb-3">Kommende Aktivitäten</h2>
        <div className="space-y-2">
          {events
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
            .slice(0, 5)
            .map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => openEditModal(event)}
                className={`card p-3 border-l-4 w-full text-left hover:brightness-110 ${eventTypeConfig[event.type].color}`}
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
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-black/10">
                        {eventTypeConfig[event.type].label}
                      </span>
                      {event.history && event.history.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-black/10">
                          <History size={12} />
                          {event.history.length}x bearbeitet
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEvent && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setShowAddEvent(false)}
        >
          <div
            className="card w-full max-w-sm p-5 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
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
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setEditingEvent(null)}
        >
          <div
            className="card w-full max-w-sm p-5 space-y-3 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              placeholder="Titel..."
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="input-base"
              autoFocus
            />

            <select
              value={editForm.type}
              onChange={(e) =>
                setEditForm({ ...editForm, type: e.target.value as EventType })
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
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                className="input-base flex-1"
              />
              <input
                type="time"
                value={editForm.time}
                onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                className="input-base flex-1"
              />
            </div>

            <div className="flex gap-2">
              <button onClick={handleSaveEdit} className="btn-primary flex-1">
                Speichern
              </button>
              <button
                onClick={() => setEditingEvent(null)}
                className="btn-secondary flex-1"
              >
                Abbrechen
              </button>
            </div>

            {/* Change history — append-only, so nobody can quietly rewrite a shared plan */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-1.5">
                <History size={14} />
                Verlauf
              </p>
              {editingEvent.history && editingEvent.history.length > 0 ? (
                <ul className="space-y-1.5">
                  {[...editingEvent.history]
                    .reverse()
                    .map((entry, idx) => (
                      <li key={idx} className="text-xs text-gray-300">
                        <span className="font-medium text-white">{entry.userName}</span>{' '}
                        hat {entry.summary.toLowerCase()} ·{' '}
                        {new Date(entry.changedAt).toLocaleDateString('de-CH', {
                          day: 'numeric',
                          month: 'short',
                        })}{' '}
                        {new Date(entry.changedAt).toLocaleTimeString('de-CH', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        Uhr
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500">Noch keine Änderungen.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
