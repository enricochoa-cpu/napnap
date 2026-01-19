import { useState, useMemo } from 'react';
import { CircularClock } from './components/CircularClock';
import { BabyProfile } from './components/BabyProfile';
import { SleepForm } from './components/SleepForm';
import { SleepList } from './components/SleepList';
import { DayNavigator } from './components/DayNavigator';
import { DailySummary } from './components/DailySummary';
import { ActivityCollisionModal } from './components/ActivityCollisionModal';
import { useBabyProfile } from './hooks/useBabyProfile';
import { useSleepEntries } from './hooks/useSleepEntries';
import { formatDate, formatDateTime } from './utils/dateUtils';
import type { SleepEntry } from './types';

// Encouraging messages for parents
const PARENT_MESSAGES = [
  "You're doing amazing",
  "Rest when baby rests",
  "Every day gets easier",
  "Trust your instincts",
  "You've got this",
  "One nap at a time",
  "You're a great parent",
  "Take care of yourself too",
];

type View = 'home' | 'history' | 'profile' | 'add';

function App() {
  const { profile, createProfile, updateProfile } = useBabyProfile();
  const {
    addEntry,
    updateEntry,
    deleteEntry,
    endSleep,
    getEntriesForDate,
    activeSleep,
    awakeMinutes,
    getDailySummary,
    entries,
  } = useSleepEntries();

  // Get encouraging message (changes daily)
  const encouragingMessage = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return PARENT_MESSAGES[dayOfYear % PARENT_MESSAGES.length];
  }, []);

  // Format awake time for display
  const formatAwakeTime = (minutes: number | null) => {
    if (minutes === null) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [currentView, setCurrentView] = useState<View>('home');
  const [editingEntry, setEditingEntry] = useState<SleepEntry | null>(null);
  const [collisionEntry, setCollisionEntry] = useState<SleepEntry | null>(null);
  const [pendingEntry, setPendingEntry] = useState<Omit<SleepEntry, 'id' | 'date'> | null>(null);

  const dayEntries = getEntriesForDate(selectedDate);
  const daySummary = getDailySummary(selectedDate);
  const todayEntries = getEntriesForDate(formatDate(new Date()));

  // Check for collision with existing entries
  const checkCollision = (startTime: string, endTime: string | null): SleepEntry | null => {
    const newStart = new Date(startTime).getTime();
    const newEnd = endTime ? new Date(endTime).getTime() : Date.now();

    return entries.find((entry) => {
      if (editingEntry && entry.id === editingEntry.id) return false;
      const entryStart = new Date(entry.startTime).getTime();
      const entryEnd = entry.endTime ? new Date(entry.endTime).getTime() : Date.now();
      return newStart < entryEnd && newEnd > entryStart;
    }) || null;
  };

  const handleAddEntry = (data: Omit<SleepEntry, 'id' | 'date'>) => {
    const collision = checkCollision(data.startTime, data.endTime);
    if (collision && !editingEntry) {
      setCollisionEntry(collision);
      setPendingEntry(data);
      return;
    }

    if (editingEntry) {
      updateEntry(editingEntry.id, data);
    } else {
      addEntry(data);
    }
    setCurrentView('home');
    setEditingEntry(null);
  };

  const handleReplaceEntry = () => {
    if (collisionEntry && pendingEntry) {
      deleteEntry(collisionEntry.id);
      addEntry(pendingEntry);
    }
    setCollisionEntry(null);
    setPendingEntry(null);
    setCurrentView('home');
  };

  const handleEdit = (entry: SleepEntry) => {
    setEditingEntry(entry);
    setCurrentView('add');
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this sleep entry?')) {
      deleteEntry(id);
    }
  };

  const handleEndSleep = (id: string) => {
    endSleep(id, formatDateTime(new Date()));
  };

  const handleStartSleep = (type: 'nap' | 'night') => {
    const data = {
      startTime: formatDateTime(new Date()),
      endTime: null,
      type,
    };
    const collision = checkCollision(data.startTime, data.endTime);
    if (collision) {
      setCollisionEntry(collision);
      setPendingEntry(data);
      return;
    }
    addEntry(data);
  };

  // Home View - Minimalist with circular clock
  const renderHomeView = () => (
    <div className="flex flex-col items-center pt-8 pb-32 px-4 fade-in">
      {/* Header - Minimal */}
      <div className="text-center mb-6">
        <h1 className="text-display-lg text-[var(--text-primary)]">
          {profile?.name || 'Baby'}
        </h1>

        {/* Awake Time Counter - Prominent */}
        {activeSleep ? (
          <p className="text-[var(--success-color)] font-display font-semibold text-lg mt-2">
            {activeSleep.type === 'nap' ? 'Napping' : 'Sleeping'}
          </p>
        ) : awakeMinutes !== null ? (
          <div className="mt-2">
            <p className="text-[var(--wake-color)] font-display font-bold text-2xl">
              Awake {formatAwakeTime(awakeMinutes)}
            </p>
          </div>
        ) : (
          <p className="text-[var(--text-muted)] font-display mt-2">
            Ready to track sleep
          </p>
        )}

        {/* Encouraging Message */}
        <p className="text-[var(--text-muted)] font-display text-sm mt-3 italic">
          {encouragingMessage}
        </p>
      </div>

      {/* Circular Clock - Center Stage */}
      <CircularClock
        entries={todayEntries}
        selectedDate={formatDate(new Date())}
        activeSleep={activeSleep}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-sm mt-8">
        <div className="text-center">
          <div className="stat-value stat-value-nap">
            {Math.floor(daySummary.totalNapMinutes / 60)}h {daySummary.totalNapMinutes % 60}m
          </div>
          <div className="stat-label">Naps</div>
        </div>
        <div className="text-center">
          <div className="stat-value stat-value-night">
            {Math.floor(daySummary.totalNightMinutes / 60)}h {daySummary.totalNightMinutes % 60}m
          </div>
          <div className="stat-label">Night</div>
        </div>
        <div className="text-center">
          <div className="stat-value stat-value-total">
            {Math.floor(daySummary.totalSleepMinutes / 60)}h {daySummary.totalSleepMinutes % 60}m
          </div>
          <div className="stat-label">Total</div>
        </div>
      </div>
    </div>
  );

  // History View
  const renderHistoryView = () => (
    <div className="pb-32 px-4 fade-in">
      <div className="pt-6 mb-6">
        <DayNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />
      </div>

      <DailySummary summary={getDailySummary(selectedDate)} />

      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-display-sm">Sleep Log</h2>
          <button
            onClick={() => {
              setEditingEntry(null);
              setCurrentView('add');
            }}
            className="text-[var(--nap-color)] font-display font-medium text-sm"
          >
            + Add Entry
          </button>
        </div>
        <SleepList
          entries={dayEntries}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onEndSleep={handleEndSleep}
        />
      </div>
    </div>
  );

  // Profile View
  const renderProfileView = () => (
    <div className="pb-32 px-4 pt-6 fade-in">
      <h2 className="text-display-md mb-6">Profile</h2>
      <BabyProfile
        profile={profile}
        onSave={createProfile}
        onUpdate={updateProfile}
      />
    </div>
  );

  // Add/Edit View
  const renderAddView = () => (
    <div className="pb-32 px-4 pt-6 fade-in">
      <SleepForm
        entry={editingEntry}
        onSubmit={handleAddEntry}
        onCancel={() => {
          setCurrentView('home');
          setEditingEntry(null);
        }}
        selectedDate={selectedDate}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-deep)]">
      {/* Main Content */}
      <main className="max-w-lg mx-auto">
        {currentView === 'home' && renderHomeView()}
        {currentView === 'history' && renderHistoryView()}
        {currentView === 'profile' && renderProfileView()}
        {currentView === 'add' && renderAddView()}
      </main>

      {/* Bottom Action Bar */}
      {currentView === 'home' && (
        <div className="action-bar">
          <div className="max-w-lg mx-auto">
            {activeSleep ? (
              <button
                onClick={() => handleEndSleep(activeSleep.id)}
                className="btn btn-wake w-full"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Wake Up
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => handleStartSleep('nap')}
                  className="btn btn-nap flex-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Start Nap
                </button>
                <button
                  onClick={() => handleStartSleep('night')}
                  className="btn btn-night flex-1"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  Night Sleep
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="max-w-lg mx-auto flex">
          <button
            onClick={() => setCurrentView('home')}
            className={`flex-1 py-4 flex flex-col items-center gap-1 ${
              currentView === 'home' ? 'text-[var(--nap-color)]' : 'text-[var(--text-muted)]'
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-display font-medium">Today</span>
          </button>
          <button
            onClick={() => setCurrentView('history')}
            className={`flex-1 py-4 flex flex-col items-center gap-1 ${
              currentView === 'history' ? 'text-[var(--nap-color)]' : 'text-[var(--text-muted)]'
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs font-display font-medium">History</span>
          </button>
          <button
            onClick={() => setCurrentView('profile')}
            className={`flex-1 py-4 flex flex-col items-center gap-1 ${
              currentView === 'profile' ? 'text-[var(--nap-color)]' : 'text-[var(--text-muted)]'
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-display font-medium">Profile</span>
          </button>
        </div>
      </nav>

      {/* Activity Collision Modal */}
      {collisionEntry && (
        <ActivityCollisionModal
          existingEntry={collisionEntry}
          onReplace={handleReplaceEntry}
          onCancel={() => {
            setCollisionEntry(null);
            setPendingEntry(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
