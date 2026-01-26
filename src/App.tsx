import { useState } from 'react';
import { BabyProfile } from './components/BabyProfile';
import { SleepForm } from './components/SleepForm';
import { SleepList } from './components/SleepList';
import { DayNavigator } from './components/DayNavigator';
import { DailySummary } from './components/DailySummary';
import { ActivityCollisionModal } from './components/ActivityCollisionModal';
import { TodayView } from './components/TodayView';
import { useBabyProfile } from './hooks/useBabyProfile';
import { useSleepEntries } from './hooks/useSleepEntries';
import { useAuth } from './hooks/useAuth';
import { formatDate, formatDateTime } from './utils/dateUtils';
import type { SleepEntry } from './types';

type View = 'home' | 'history' | 'stats' | 'profile' | 'add';

// Icons for the action menu
const SunIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="5" />
    <path
      d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const CloudIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
  </svg>
);

const MoonIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

function App() {
  const { signOut } = useAuth();
  const { profile, userProfile, createProfile, updateProfile } = useBabyProfile();
  const {
    addEntry,
    updateEntry,
    deleteEntry,
    endSleep,
    getEntriesForDate,
    activeSleep,
    awakeMinutes,
    lastCompletedSleep,
    getDailySummary,
    entries,
  } = useSleepEntries();

  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [currentView, setCurrentView] = useState<View>('home');
  const [editingEntry, setEditingEntry] = useState<SleepEntry | null>(null);
  const [collisionEntry, setCollisionEntry] = useState<SleepEntry | null>(null);
  const [pendingEntry, setPendingEntry] = useState<Omit<SleepEntry, 'id' | 'date'> | null>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);

  const dayEntries = getEntriesForDate(selectedDate);

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

  const handleEndSleep = (id: string) => {
    endSleep(id, formatDateTime(new Date()));
    setShowActionMenu(false);
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
      setShowActionMenu(false);
      return;
    }
    addEntry(data);
    setShowActionMenu(false);
  };

  // Handle logging wake-up time
  const handleLogWakeUp = () => {
    // If there's an active night sleep, end it
    if (activeSleep && activeSleep.type === 'night') {
      handleEndSleep(activeSleep.id);
      return;
    }

    // Find any active (unended) night sleep from previous days
    const activeNightSleep = entries.find(
      (e) => e.type === 'night' && e.endTime === null
    );

    if (activeNightSleep) {
      endSleep(activeNightSleep.id, formatDateTime(new Date()));
      setShowActionMenu(false);
      return;
    }

    // No active night sleep - create a completed night sleep entry
    // Default to 8 hours ago as bedtime
    const now = new Date();
    const defaultBedtime = new Date(now.getTime() - 8 * 60 * 60 * 1000);
    const data = {
      startTime: formatDateTime(defaultBedtime),
      endTime: formatDateTime(now),
      type: 'night' as const,
    };
    addEntry(data);
    setShowActionMenu(false);
  };

  // History View
  const renderHistoryView = () => (
    <div className="pb-32 px-4 fade-in">
      <div className="pt-6 mb-6">
        <DayNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />
      </div>

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
        allEntries={entries}
        selectedDate={selectedDate}
        onEdit={handleEdit}
        onEndSleep={handleEndSleep}
      />
    </div>
  );

  // Stats View
  const renderStatsView = () => (
    <div className="pb-32 px-4 fade-in">
      <div className="pt-6 mb-6">
        <DayNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />
      </div>

      <DailySummary summary={getDailySummary(selectedDate, entries)} />
    </div>
  );

  // Profile View
  const renderProfileView = () => (
    <div className="pb-32 px-4 pt-6 fade-in">
      <BabyProfile
        profile={profile}
        userProfile={userProfile}
        onSave={createProfile}
        onUpdate={updateProfile}
      />

      {/* Sign Out Button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => signOut()}
          className="text-sm text-[var(--danger-color)] font-display font-medium"
        >
          Sign Out
        </button>
      </div>
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
        onDelete={(id) => {
          deleteEntry(id);
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
        {currentView === 'home' && (
          <TodayView
            profile={profile}
            entries={entries}
            activeSleep={activeSleep}
            lastCompletedSleep={lastCompletedSleep}
            awakeMinutes={awakeMinutes}
          />
        )}
        {currentView === 'history' && renderHistoryView()}
        {currentView === 'stats' && renderStatsView()}
        {currentView === 'profile' && renderProfileView()}
        {currentView === 'add' && renderAddView()}
      </main>

      {/* Bottom Navigation with Central + Button */}
      <nav className="bottom-nav">
        <div className="max-w-lg mx-auto flex items-center relative">
          {/* Left side nav items */}
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

          {/* Central FAB Button */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={() => setShowActionMenu(true)}
              className="fab -mt-7"
            >
              <PlusIcon />
            </button>
          </div>

          {/* Right side nav items */}
          <button
            onClick={() => setCurrentView('stats')}
            className={`flex-1 py-4 flex flex-col items-center gap-1 ${
              currentView === 'stats' ? 'text-[var(--nap-color)]' : 'text-[var(--text-muted)]'
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs font-display font-medium">Stats</span>
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

      {/* Action Menu Bottom Sheet */}
      {showActionMenu && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setShowActionMenu(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Bottom Sheet */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-[var(--bg-card)] rounded-t-3xl p-6 pb-10 slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="w-12 h-1 bg-[var(--text-muted)]/30 rounded-full mx-auto mb-6" />

            {/* Close button */}
            <button
              onClick={() => setShowActionMenu(false)}
              className="absolute top-6 right-6 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <CloseIcon />
            </button>

            {/* Title */}
            <h2 className="text-[var(--text-primary)] font-display font-semibold text-lg mb-6 text-center">
              Log Sleep
            </h2>

            {/* Action buttons */}
            <div className="space-y-3">
              {/* If baby is sleeping, show Wake Up button */}
              {activeSleep ? (
                <button
                  onClick={() => handleEndSleep(activeSleep.id)}
                  className="w-full p-5 rounded-2xl bg-[var(--wake-color)] text-[var(--bg-deep)] flex items-center gap-4 font-display font-semibold text-lg"
                >
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-deep)]/20 flex items-center justify-center">
                    <SunIcon />
                  </div>
                  <span>Wake Up</span>
                </button>
              ) : (
                <>
                  {/* Wake Up (log morning) */}
                  <button
                    onClick={handleLogWakeUp}
                    className="w-full p-5 rounded-2xl bg-[var(--wake-color)] text-[var(--bg-deep)] flex items-center gap-4 font-display font-semibold text-lg"
                  >
                    <div className="w-12 h-12 rounded-full bg-[var(--bg-deep)]/20 flex items-center justify-center">
                      <SunIcon />
                    </div>
                    <span>Log Wake Up</span>
                  </button>

                  {/* Start Nap */}
                  <button
                    onClick={() => handleStartSleep('nap')}
                    className="w-full p-5 rounded-2xl bg-[var(--nap-color)] text-[var(--bg-deep)] flex items-center gap-4 font-display font-semibold text-lg"
                  >
                    <div className="w-12 h-12 rounded-full bg-[var(--bg-deep)]/20 flex items-center justify-center">
                      <CloudIcon />
                    </div>
                    <span>Start Nap</span>
                  </button>

                  {/* Start Bedtime */}
                  <button
                    onClick={() => handleStartSleep('night')}
                    className="w-full p-5 rounded-2xl bg-[var(--night-color)] text-white flex items-center gap-4 font-display font-semibold text-lg"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <MoonIcon />
                    </div>
                    <span>Start Bedtime</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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
