import { useState, useMemo } from 'react';
import { SleepList } from './components/SleepList';
import { DayNavigator } from './components/DayNavigator';
import { DailySummary } from './components/DailySummary';
import { ActivityCollisionModal } from './components/ActivityCollisionModal';
import { MissingBedtimeModal } from './components/MissingBedtimeModal';
import { TodayView } from './components/TodayView';
import { SkyBackground } from './components/SkyBackground';
import { ProfileSection } from './components/Profile';
import { SleepEntrySheet } from './components/SleepEntrySheet';
import { useBabyProfile } from './hooks/useBabyProfile';
import { useSleepEntries } from './hooks/useSleepEntries';
import { useBabyShares } from './hooks/useBabyShares';
import { useAuth } from './hooks/useAuth';
import { useApplyCircadianTheme } from './hooks/useCircadianTheme';
import { formatDate, formatDateTime } from './utils/dateUtils';
import { parseISO, isToday } from 'date-fns';
import type { SleepEntry } from './types';

type View = 'home' | 'history' | 'stats' | 'profile';

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

const CloseIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

// Small icons for dropdown menu
const CloudIconSmall = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
  </svg>
);

const MoonIconSmall = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

function App() {
  const { signOut } = useAuth();
  const { theme } = useApplyCircadianTheme();
  const {
    profile,
    userProfile,
    sharedProfiles,
    activeBabyId,
    setActiveBabyId,
    activeBabyProfile,
    createProfile,
    updateProfile,
    refreshProfile,
  } = useBabyProfile();

  const {
    myShares,
    pendingInvitations,
    inviteByEmail,
    acceptInvitation,
    declineInvitation,
    revokeAccess,
  } = useBabyShares();

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
  } = useSleepEntries({ babyId: activeBabyId });

  // Refresh data when accepting an invitation
  const handleAcceptInvitation = async (shareId: string) => {
    const result = await acceptInvitation(shareId);
    if (result.success) {
      await refreshProfile();
    }
    return result;
  };

  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [currentView, setCurrentView] = useState<View>('home');
  const [editingEntry, setEditingEntry] = useState<SleepEntry | null>(null);
  const [collisionEntry, setCollisionEntry] = useState<SleepEntry | null>(null);
  const [pendingEntry, setPendingEntry] = useState<Omit<SleepEntry, 'id' | 'date'> | null>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showEntrySheet, setShowEntrySheet] = useState(false);
  const [newEntryType, setNewEntryType] = useState<'nap' | 'night'>('nap');
  const [showMissingBedtimeModal, setShowMissingBedtimeModal] = useState(true);
  const [showAddEntryMenu, setShowAddEntryMenu] = useState(false);

  const dayEntries = getEntriesForDate(selectedDate);

  // Check if we should show the missing bedtime modal
  // Show when: no activity today AND no active night sleep from yesterday
  const shouldShowMissingBedtimeModal = useMemo(() => {
    if (!showMissingBedtimeModal) return false;

    // Check for morning wake up (night sleep that ended today)
    const hasMorningWakeUp = entries.some(
      (e) => e.type === 'night' && e.endTime && isToday(parseISO(e.endTime))
    );
    if (hasMorningWakeUp) return false;

    // Check for any naps today (started or ended today)
    const hasTodayNaps = entries.some(
      (e) => e.type === 'nap' && (
        isToday(parseISO(e.startTime)) ||
        (e.endTime && isToday(parseISO(e.endTime)))
      )
    );
    if (hasTodayNaps) return false;

    // Check for active night sleep from yesterday (baby is still sleeping)
    const hasActiveNightFromYesterday = activeSleep &&
      activeSleep.type === 'night' &&
      !isToday(parseISO(activeSleep.startTime));
    if (hasActiveNightFromYesterday) return false;

    // Check for active night sleep that started today
    const hasActiveNightToday = activeSleep &&
      activeSleep.type === 'night' &&
      isToday(parseISO(activeSleep.startTime));
    if (hasActiveNightToday) return false;

    // Check for active nap (always counts as today's activity)
    if (activeSleep && activeSleep.type === 'nap') return false;

    // No activity today - show the modal
    return true;
  }, [showMissingBedtimeModal, entries, activeSleep]);

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
    setEditingEntry(null);
    setShowEntrySheet(false);
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
    setShowEntrySheet(true);
  };

  const handleOpenNewEntry = (type: 'nap' | 'night') => {
    setEditingEntry(null);
    setNewEntryType(type);
    setShowEntrySheet(true);
    setShowActionMenu(false);
  };

  // Handle "Log bedtime" from missing bedtime modal
  const handleLogMissingBedtime = (date: string) => {
    setShowMissingBedtimeModal(false);
    setEditingEntry(null);
    setNewEntryType('night');
    setSelectedDate(date);
    setShowEntrySheet(true);
  };

  // Handle "Start a new day" from missing bedtime modal
  const handleSkipMissingBedtime = () => {
    setShowMissingBedtimeModal(false);
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
    <div className="pb-32 px-6 fade-in">
      <div className="pt-8 mb-8">
        <DayNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-display-sm text-[var(--text-card-title)]">Sleep Log</h2>
        <div className="relative">
          <button
            onClick={() => setShowAddEntryMenu(!showAddEntryMenu)}
            className="text-[var(--nap-color)] font-display font-semibold text-sm"
          >
            + Add Entry
          </button>

          {/* Add Entry Dropdown */}
          {showAddEntryMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowAddEntryMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 z-50 bg-[var(--bg-card)] rounded-2xl shadow-lg border border-white/10 overflow-hidden min-w-[140px]">
                <button
                  onClick={() => {
                    handleOpenNewEntry('nap');
                    setShowAddEntryMenu(false);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-white/5 active:bg-white/10 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[var(--nap-color)]/15 flex items-center justify-center text-[var(--nap-color)]">
                    <CloudIconSmall />
                  </div>
                  <span className="text-[var(--text-primary)] font-display font-medium">Nap</span>
                </button>
                <button
                  onClick={() => {
                    handleOpenNewEntry('night');
                    setShowAddEntryMenu(false);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-white/5 active:bg-white/10 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[var(--night-color)]/15 flex items-center justify-center text-[var(--night-color)]">
                    <MoonIconSmall />
                  </div>
                  <span className="text-[var(--text-primary)] font-display font-medium">Bedtime</span>
                </button>
              </div>
            </>
          )}
        </div>
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
    <div className="pb-32 px-6 fade-in">
      <div className="pt-8 mb-8">
        <DayNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />
      </div>

      <DailySummary summary={getDailySummary(selectedDate, entries)} />
    </div>
  );

  // Profile View
  const renderProfileView = () => (
    <ProfileSection
      profile={profile}
      userProfile={userProfile}
      sharedProfiles={sharedProfiles}
      activeBabyId={activeBabyId}
      onActiveBabyChange={setActiveBabyId}
      onSave={createProfile}
      onUpdate={updateProfile}
      onSignOut={signOut}
      myShares={myShares}
      pendingInvitations={pendingInvitations}
      onInvite={inviteByEmail}
      onRevokeAccess={revokeAccess}
      onAcceptInvitation={handleAcceptInvitation}
      onDeclineInvitation={declineInvitation}
    />
  );

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] transition-colors duration-[1500ms]">
      {/* Circadian Sky Background */}
      <SkyBackground theme={theme} />

      {/* Main Content */}
      <main className="max-w-lg mx-auto relative z-0">
        {currentView === 'home' && (
          <TodayView
            profile={activeBabyProfile || profile}
            entries={entries}
            activeSleep={activeSleep}
            lastCompletedSleep={lastCompletedSleep}
            awakeMinutes={awakeMinutes}
            onEdit={handleEdit}
          />
        )}
        {currentView === 'history' && renderHistoryView()}
        {currentView === 'stats' && renderStatsView()}
        {currentView === 'profile' && renderProfileView()}
      </main>

      {/* Minimalist Floating Tab Bar */}
      <nav className="floating-nav">
        <div className="floating-nav-inner">
          <div className="floating-nav-bar">
            {/* Today */}
            <button
              onClick={() => setCurrentView('home')}
              className={`nav-tab ${currentView === 'home' ? 'nav-tab-active' : ''}`}
              aria-label="Today"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </button>

            {/* History */}
            <button
              onClick={() => setCurrentView('history')}
              className={`nav-tab ${currentView === 'history' ? 'nav-tab-active' : ''}`}
              aria-label="History"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
            </button>

            {/* Center Action Button */}
            <div className="nav-action">
              <button
                onClick={() => setShowActionMenu(true)}
                className="nav-action-btn"
                aria-label="Log sleep"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>

            {/* Stats */}
            <button
              onClick={() => setCurrentView('stats')}
              className={`nav-tab ${currentView === 'stats' ? 'nav-tab-active' : ''}`}
              aria-label="Stats"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </button>

            {/* Profile */}
            <button
              onClick={() => setCurrentView('profile')}
              className={`nav-tab ${currentView === 'profile' ? 'nav-tab-active' : ''}`}
              aria-label="Profile"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M20 21a8 8 0 1 0-16 0" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Action Menu Bottom Sheet */}
      {showActionMenu && (
        <>
          {/* Backdrop */}
          <div
            className="sheet-backdrop fade-in"
            onClick={() => setShowActionMenu(false)}
          />

          {/* Bottom Sheet */}
          <div className="sheet-content slide-up px-6">
            {/* Handle bar */}
            <div className="sheet-handle" />

            {/* Close button */}
            <button
              onClick={() => setShowActionMenu(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-[var(--text-muted)] active:bg-white/10 active:scale-95 transition-transform"
            >
              <CloseIcon />
            </button>

            {/* Title */}
            <h2 className="text-[var(--text-card-title)] font-display font-semibold text-lg mb-8 text-center">
              Log Sleep
            </h2>

            {/* Action buttons - floating cards with shadows */}
            <div className="space-y-4">
              {/* If baby is sleeping, show Wake Up button */}
              {activeSleep ? (
                <button
                  onClick={() => handleEndSleep(activeSleep.id)}
                  className="w-full p-5 rounded-3xl bg-[var(--wake-color)] text-[var(--bg-deep)] flex items-center gap-5 font-display font-semibold text-lg active:scale-[0.98] transition-transform shadow-[var(--shadow-glow-wake)]"
                >
                  <div className="w-14 h-14 rounded-full bg-[var(--bg-deep)]/10 flex items-center justify-center flex-shrink-0">
                    <SunIcon />
                  </div>
                  <span>Wake Up</span>
                </button>
              ) : (
                <>
                  {/* Wake Up (log morning) */}
                  <button
                    onClick={handleLogWakeUp}
                    className="w-full p-5 rounded-3xl bg-[var(--wake-color)] text-[var(--bg-deep)] flex items-center gap-5 font-display font-semibold text-lg active:scale-[0.98] transition-transform shadow-[var(--shadow-glow-wake)]"
                  >
                    <div className="w-14 h-14 rounded-full bg-[var(--bg-deep)]/10 flex items-center justify-center flex-shrink-0">
                      <SunIcon />
                    </div>
                    <span>Log Wake Up</span>
                  </button>

                  {/* Start Nap */}
                  <button
                    onClick={() => handleStartSleep('nap')}
                    className="w-full p-5 rounded-3xl bg-[var(--nap-color)] text-[var(--bg-deep)] flex items-center gap-5 font-display font-semibold text-lg active:scale-[0.98] transition-transform shadow-[var(--shadow-glow-nap)]"
                  >
                    <div className="w-14 h-14 rounded-full bg-[var(--bg-deep)]/10 flex items-center justify-center flex-shrink-0">
                      <CloudIcon />
                    </div>
                    <span>Start Nap</span>
                  </button>

                  {/* Start Bedtime */}
                  <button
                    onClick={() => handleStartSleep('night')}
                    className="w-full p-5 rounded-3xl bg-[var(--night-color)] text-white flex items-center gap-5 font-display font-semibold text-lg active:scale-[0.98] transition-transform shadow-[var(--shadow-glow-night)]"
                  >
                    <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                      <MoonIcon />
                    </div>
                    <span>Start Bedtime</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Missing Bedtime Modal */}
      {shouldShowMissingBedtimeModal && (
        <MissingBedtimeModal
          onLogBedtime={handleLogMissingBedtime}
          onSkip={handleSkipMissingBedtime}
        />
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

      {/* Sleep Entry Sheet */}
      <SleepEntrySheet
        entry={editingEntry}
        initialType={newEntryType}
        isOpen={showEntrySheet}
        onClose={() => {
          setShowEntrySheet(false);
          setEditingEntry(null);
        }}
        onSave={handleAddEntry}
        onDelete={deleteEntry}
        selectedDate={selectedDate}
      />
    </div>
  );
}

export default App;
