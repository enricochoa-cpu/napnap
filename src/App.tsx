import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { SleepList } from './components/SleepList';
import { DayNavigator } from './components/DayNavigator';
import { ActivityCollisionModal } from './components/ActivityCollisionModal';
import { MissingBedtimeModal } from './components/MissingBedtimeModal';
import { TodayView } from './components/TodayView';
import { SkyBackground } from './components/SkyBackground';
import { ProfileSection } from './components/Profile';
import { SleepEntrySheet } from './components/SleepEntrySheet';
import { WakeUpSheet } from './components/WakeUpSheet';
import { QuickActionSheet } from './components/QuickActionSheet';
import { StatsView } from './components/StatsView';
import { useBabyProfile } from './hooks/useBabyProfile';
import { useSleepEntries } from './hooks/useSleepEntries';
import { useBabyShares } from './hooks/useBabyShares';
import { useAuth } from './hooks/useAuth';
import { useApplyCircadianTheme } from './hooks/useCircadianTheme';
import {
  formatDate,
  formatDateTime,
  calculateAge,
} from './utils/dateUtils';
import { parseISO, isToday } from 'date-fns';
import type { SleepEntry } from './types';

type View = 'home' | 'history' | 'stats' | 'profile';

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
    uploadBabyAvatar,
    deleteProfile,
    refreshProfile,
  } = useBabyProfile();

  const {
    myShares,
    pendingInvitations,
    inviteByEmail,
    acceptInvitation,
    declineInvitation,
    updateShareRole,
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
    entries,
    loading: entriesLoading,
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
  const previousView = useRef<View>('home');

  // View order for slide direction
  const viewOrder: View[] = ['home', 'history', 'stats', 'profile'];
  const getSlideDirection = (from: View, to: View): number => {
    const fromIndex = viewOrder.indexOf(from);
    const toIndex = viewOrder.indexOf(to);
    return toIndex > fromIndex ? 1 : -1;
  };
  const slideDirection = getSlideDirection(previousView.current, currentView);

  // Update previous view when current changes
  const handleViewChange = (newView: View) => {
    previousView.current = currentView;
    setCurrentView(newView);
    window.scrollTo(0, 0);
  };
  const [editingEntry, setEditingEntry] = useState<SleepEntry | null>(null);
  const [collisionEntry, setCollisionEntry] = useState<SleepEntry | null>(null);
  const [pendingEntry, setPendingEntry] = useState<Omit<SleepEntry, 'id' | 'date'> | null>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showEntrySheet, setShowEntrySheet] = useState(false);
  const [showWakeUpSheet, setShowWakeUpSheet] = useState(false);
  const [wakeUpEntry, setWakeUpEntry] = useState<SleepEntry | null>(null);
  const [newEntryType, setNewEntryType] = useState<'nap' | 'night'>('nap');
  const [showMissingBedtimeModal, setShowMissingBedtimeModal] = useState(true);
  const [showAddEntryMenu, setShowAddEntryMenu] = useState(false);

  const dayEntries = getEntriesForDate(selectedDate);

  // Check if we should show the missing bedtime modal
  // Show when: no activity today AND no active night sleep from yesterday
  const shouldShowMissingBedtimeModal = useMemo(() => {
    if (!showMissingBedtimeModal) return false;

    // Don't show while entries are loading
    if (entriesLoading) return false;

    // Don't show for new users with no entries (nothing to "forget")
    if (entries.length === 0) return false;

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
  }, [showMissingBedtimeModal, entries, activeSleep, entriesLoading]);

  // Dates that have at least one sleep entry (for calendar dots)
  const datesWithEntries = useMemo(() => new Set(entries.map(e => e.date)), [entries]);

  // Baby age string for display in DayNavigator
  const babyAge = useMemo(() => {
    const p = activeBabyProfile || profile;
    return p?.dateOfBirth ? calculateAge(p.dateOfBirth) : '';
  }, [activeBabyProfile, profile]);

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

  const handleAddEntry = async (data: Omit<SleepEntry, 'id' | 'date'>) => {
    const collision = checkCollision(data.startTime, data.endTime);
    if (collision && !editingEntry) {
      setCollisionEntry(collision);
      setPendingEntry(data);
      return;
    }

    if (editingEntry) {
      await updateEntry(editingEntry.id, data);
    } else {
      await addEntry(data);
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
    handleViewChange('home');
  };

  const handleEdit = (entry: SleepEntry) => {
    setEditingEntry(entry);
    setSelectedDate(entry.date);
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

  const handleWakeUpConfirm = async (wakeTime: Date) => {
    if (wakeUpEntry) {
      await endSleep(wakeUpEntry.id, formatDateTime(wakeTime));
    }
    setShowWakeUpSheet(false);
    setWakeUpEntry(null);
  };

  const handleWakeUpDelete = () => {
    if (wakeUpEntry) {
      deleteEntry(wakeUpEntry.id);
    }
    setShowWakeUpSheet(false);
    setWakeUpEntry(null);
  };

  // Handle logging wake-up time
  const handleLogWakeUp = () => {
    // If there's an active night sleep, show focused Wake Up sheet
    if (activeSleep && activeSleep.type === 'night') {
      setWakeUpEntry(activeSleep);
      setShowWakeUpSheet(true);
      setShowActionMenu(false);
      return;
    }

    // Find any active (unended) night sleep from previous days
    const activeNightSleep = entries.find(
      (e) => e.type === 'night' && e.endTime === null
    );

    if (activeNightSleep) {
      setWakeUpEntry(activeNightSleep);
      setShowWakeUpSheet(true);
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
    <div className="pb-32 px-6">
      <div className="pt-8 mb-8">
        <DayNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} babyAge={babyAge} datesWithEntries={datesWithEntries} />
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
              {/* Use theme-aware glass border so dropdown works on both dark and light backgrounds */}
              <div className="absolute right-0 top-full mt-2 z-50 bg-[var(--bg-card)] rounded-2xl shadow-lg border border-[var(--glass-border)] overflow-hidden min-w-[140px]">
                <button
                  onClick={() => {
                    handleOpenNewEntry('nap');
                    setShowAddEntryMenu(false);
                  }}
                  /* Use muted text token for hover so it stays visible in light themes */
                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-[var(--text-muted)]/10 active:bg-[var(--text-muted)]/15 transition-colors"
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
                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-[var(--text-muted)]/10 active:bg-[var(--text-muted)]/15 transition-colors"
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
    <StatsView entries={entries} />
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
      onUploadAvatar={uploadBabyAvatar}
      onSignOut={signOut}
      myShares={myShares}
      pendingInvitations={pendingInvitations}
      onInvite={inviteByEmail}
      onUpdateRole={updateShareRole}
      onRevokeAccess={revokeAccess}
      onAcceptInvitation={handleAcceptInvitation}
      onDeclineInvitation={declineInvitation}
      onDeleteBaby={deleteProfile}
    />
  );

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-[var(--bg-deep)] transition-colors duration-[1500ms]">
      {/* Circadian Sky Background */}
      <SkyBackground theme={theme} />

      {/* Main Content with Slide Transitions */}
      <main className="max-w-lg mx-auto relative z-0 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentView}
            initial={{ x: slideDirection * 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: slideDirection * -100, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
          >
            {currentView === 'home' && (
              <TodayView
                profile={activeBabyProfile || profile}
                entries={entries}
                activeSleep={activeSleep}
                lastCompletedSleep={lastCompletedSleep}
                awakeMinutes={awakeMinutes}
                onEdit={handleEdit}
                loading={entriesLoading}
                totalEntries={entries.length}
              />
            )}
            {currentView === 'history' && renderHistoryView()}
            {currentView === 'stats' && renderStatsView()}
            {currentView === 'profile' && renderProfileView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Minimalist Floating Tab Bar */}
      <nav className="floating-nav">
        <div className="floating-nav-inner">
          <div className="floating-nav-bar">
            {/* Today */}
            <button
              onClick={() => handleViewChange('home')}
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
              onClick={() => handleViewChange('history')}
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
              onClick={() => handleViewChange('stats')}
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
              onClick={() => handleViewChange('profile')}
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

      {/* Quick Action Sheet */}
      <QuickActionSheet
        isOpen={showActionMenu}
        onClose={() => setShowActionMenu(false)}
        onSelectWakeUp={() => {
          handleLogWakeUp();
          setShowActionMenu(false);
        }}
        onSelectNap={() => {
          setSelectedDate(formatDate(new Date()));
          handleOpenNewEntry('nap');
          setShowActionMenu(false);
        }}
        onSelectBedtime={() => {
          setSelectedDate(formatDate(new Date()));
          handleOpenNewEntry('night');
          setShowActionMenu(false);
        }}
        hasActiveSleep={!!activeSleep}
        onEndSleep={activeSleep ? () => {
          if (activeSleep.type === 'night') {
            setWakeUpEntry(activeSleep);
            setShowWakeUpSheet(true);
          } else {
            handleEndSleep(activeSleep.id);
          }
          setShowActionMenu(false);
        } : undefined}
      />

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

      {/* Wake Up Sheet — Napper-style focused modal for ending night sleep */}
      <WakeUpSheet
        isOpen={showWakeUpSheet}
        onClose={() => {
          setShowWakeUpSheet(false);
          setWakeUpEntry(null);
        }}
        onConfirm={handleWakeUpConfirm}
        onDelete={handleWakeUpDelete}
        bedtime={wakeUpEntry?.startTime ?? ''}
      />
    </div>
    </MotionConfig>
  );
}

export default App;
