import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { SVGProps } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { SleepList } from './components/SleepList';
import { DayNavigator } from './components/DayNavigator';
import { ActivityCollisionModal } from './components/ActivityCollisionModal';
import { MissingBedtimeModal } from './components/MissingBedtimeModal';
import { TodayView } from './components/TodayView';
import { SkyBackground } from './components/SkyBackground';
import { ProfileSection, type ProfileView } from './components/Profile';
import { SleepEntrySheet } from './components/SleepEntrySheet';
import { WakeUpSheet } from './components/WakeUpSheet';
import { PredictedNapSheet, type PredictedNapData } from './components/PredictedNapSheet';
import { QuickActionSheet } from './components/QuickActionSheet';
import { StatsView } from './components/StatsView';
import { useBabyProfile } from './hooks/useBabyProfile';
import { useSleepEntries } from './hooks/useSleepEntries';
import { useGrowthLogs } from './hooks/useGrowthLogs';
import { useBabyShares } from './hooks/useBabyShares';
import { useAuth } from './hooks/useAuth';
import { useDeleteAccount } from './hooks/useDeleteAccount';
import { useApplyCircadianTheme } from './hooks/useCircadianTheme';
import {
  formatDate,
  formatDateTime,
  formatAge,
} from './utils/dateUtils';
import {
  getOnboardingDraft,
  removeOnboardingDraft,
  setToStorage,
  STORAGE_KEYS,
} from './utils/storage';
import { parseISO, isToday, addDays, format } from 'date-fns';
import type { SleepEntry } from './types';
import { useNavHiddenWhenModal } from './contexts/NavHiddenWhenModalContext';

type View = 'home' | 'history' | 'stats' | 'profile';

/** Shown in header avatar when there is no baby/user name (empty state) instead of "?". */
function PersonIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="8" r="3" />
      <path d="M5 20v-2a5 5 0 0 1 14 0v2" />
    </svg>
  );
}

function App() {
  const { signOut } = useAuth();
  const { deleteAccount, isDeleting: isDeletingAccount, error: deleteAccountError } = useDeleteAccount(signOut);
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
    loading: profileLoading,
    error: profileError,
  } = useBabyProfile();
  const { t } = useTranslation();

  // Apply onboarding draft after first sign-up: create profile from stored baby name, DOB, user name, relationship.
  const appliedOnboardingDraftRef = useRef(false);
  useEffect(() => {
    if (profileLoading || profile !== null || appliedOnboardingDraftRef.current) return;
    const raw = getOnboardingDraft();
    if (!raw) return;
    let draft: { babyName?: string; babyDob?: string; userName?: string; relationship?: 'dad' | 'mum' | 'other' };
    try {
      draft = JSON.parse(raw);
    } catch {
      return;
    }
    if (!draft || typeof draft.babyName !== 'string' || typeof draft.babyDob !== 'string') return;
    appliedOnboardingDraftRef.current = true;
    createProfile({
      name: draft.babyName,
      dateOfBirth: draft.babyDob,
      gender: 'other',
      userName: draft.userName ?? '',
      userRole: draft.relationship ?? 'other',
    }).then((result) => {
      if (result) {
        removeOnboardingDraft();
        setToStorage(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
      } else appliedOnboardingDraftRef.current = false; // Allow retry if create failed
    });
  }, [profileLoading, profile, createProfile]);

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
    addPause,
    updatePause,
    deletePause,
    getEntriesForDate,
    activeSleep,
    awakeMinutes,
    lastCompletedSleep,
    entries,
    loading: entriesLoading,
    error: entriesError,
  } = useSleepEntries({ babyId: activeBabyId });

  const hasNightEntry = !!(activeSleep?.type === 'night' || lastCompletedSleep?.type === 'night');

  const { weightLogs, heightLogs, headLogs, error: growthError } = useGrowthLogs({ babyId: activeBabyId });

  const hasPendingBabyInvite = pendingInvitations.length > 0;

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
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const scrollMainToTop = useCallback(() => {
    mainScrollRef.current?.scrollTo(0, 0);
  }, []);

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
    // Reset date to today when navigating to home — prevents FAB creating entries for yesterday
    if (newView === 'home') {
      setSelectedDate(formatDate(new Date()));
    }
    // Scroll container is the inner main wrapper (not window) so reset its scroll on tab change
    scrollMainToTop();
    window.scrollTo(0, 0);
  };
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  // Derive editingEntry from the live entries array so it stays in sync (e.g. when pauses are added)
  const editingEntry = useMemo(() => {
    if (!editingEntryId) return null;
    return entries.find((e) => e.id === editingEntryId) ?? null;
  }, [editingEntryId, entries]);
  const [activePauseStart, setActivePauseStart] = useState<Date | null>(null);
  const [collisionEntry, setCollisionEntry] = useState<SleepEntry | null>(null);
  const [pendingEntry, setPendingEntry] = useState<Omit<SleepEntry, 'id' | 'date'> | null>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showEntrySheet, setShowEntrySheet] = useState(false);
  const [showWakeUpSheet, setShowWakeUpSheet] = useState(false);
  const [wakeUpEntry, setWakeUpEntry] = useState<SleepEntry | null>(null);
  const [newEntryType, setNewEntryType] = useState<'nap' | 'night'>('nap');
  const [showMissingBedtimeModal, setShowMissingBedtimeModal] = useState(() => {
    // Persist dismissal across page refreshes within the same session
    const dismissed = sessionStorage.getItem('missingBedtimeDismissed');
    if (dismissed === format(new Date(), 'yyyy-MM-dd')) return false;
    return true;
  });
  const [entrySheetError, setEntrySheetError] = useState<string | null>(null);
  const [logWakeUpMode, setLogWakeUpMode] = useState(false);
  /** Pre-filled start/end times from predicted nap tap (HH:mm format) */
  const [predictedStartTime, setPredictedStartTime] = useState<string | undefined>();
  const [predictedEndTime, setPredictedEndTime] = useState<string | undefined>();
  const [showPredictedNapSheet, setShowPredictedNapSheet] = useState(false);
  const [predictedNapData, setPredictedNapData] = useState<PredictedNapData | null>(null);
  const [skippedNapIndices, setSkippedNapIndices] = useState<Set<number>>(new Set());
  const [requestOpenAddBaby, setRequestOpenAddBaby] = useState(false);
  const [profileInitialView, setProfileInitialView] = useState<ProfileView>('menu');
  /** Incremented when user taps Profile tab so ProfileSection resets to menu (tap tab = go to Profile root). */
  const [profileTabTapCount, setProfileTabTapCount] = useState(0);

  const hasAnyBaby = sharedProfiles.length > 0;

  const goToAddBaby = () => {
    handleViewChange('profile');
    setRequestOpenAddBaby(true);
  };

  const dayEntries = getEntriesForDate(selectedDate);

  // Check if we should show the missing bedtime modal.
  // Suppress when user has any completed night whose end date is today OR tomorrow
  // (tonight's bedtime + tomorrow's wake is stored with endTime tomorrow, so we must count that).
  const shouldShowMissingBedtimeModal = useMemo(() => {
    if (!showMissingBedtimeModal) return false;

    if (!hasAnyBaby) return false;

    // Don't show while entries are loading
    if (entriesLoading) return false;

    // Don't show for new users with no entries (nothing to "forget")
    if (entries.length === 0) return false;

    const today = new Date();
    const tomorrow = addDays(today, 1);
    const todayStr = format(today, 'yyyy-MM-dd');
    const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');

    const hasCompletedNightRecently = entries.some((e) => {
      if (e.type !== 'night' || !e.endTime) return false;
      const endDateStr = format(parseISO(e.endTime), 'yyyy-MM-dd');
      return endDateStr === todayStr || endDateStr === tomorrowStr;
    });
    if (hasCompletedNightRecently) return false;

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
  }, [showMissingBedtimeModal, hasAnyBaby, entries, activeSleep, entriesLoading]);

  // Dates that have at least one sleep entry (for calendar dots)
  const datesWithEntries = useMemo(() => new Set(entries.map(e => e.date)), [entries]);

  // Baby age string for display in DayNavigator (localized)
  const babyAge = useMemo(() => {
    const p = activeBabyProfile || profile;
    return p?.dateOfBirth ? formatAge(t, p.dateOfBirth) : '';
  }, [activeBabyProfile, profile, t]);

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
    setEntrySheetError(null);
    const collision = checkCollision(data.startTime, data.endTime);
    if (collision && !editingEntry) {
      setCollisionEntry(collision);
      setPendingEntry(data);
      return;
    }

    if (editingEntry) {
      const ok = await updateEntry(editingEntry.id, data);
      if (!ok) {
        setEntrySheetError('Could not save. Please try again.');
        throw new Error('Save failed');
      }
    } else {
      const result = await addEntry(data);
      if (result === null) {
        setEntrySheetError('Could not save. Please try again.');
        throw new Error('Save failed');
      }
    }
    setEditingEntryId(null);
    setShowEntrySheet(false);
    setLogWakeUpMode(false);
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

  /** "Adjust times" from collision modal: dismiss modal, re-open entry sheet with the pending times. */
  const handleAdjustCollision = () => {
    if (pendingEntry) {
      const startDate = parseISO(pendingEntry.startTime);
      const pad = (n: number) => n.toString().padStart(2, '0');
      setPredictedStartTime(`${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`);
      if (pendingEntry.endTime) {
        const endDate = parseISO(pendingEntry.endTime);
        setPredictedEndTime(`${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`);
      } else {
        setPredictedEndTime(undefined);
      }
      setNewEntryType(pendingEntry.type);
      setEditingEntryId(null);
      setShowEntrySheet(true);
    }
    setCollisionEntry(null);
    setPendingEntry(null);
  };

  const handleEdit = (entry: SleepEntry) => {
    setEditingEntryId(entry.id);
    setSelectedDate(entry.date);
    setShowEntrySheet(true);
  };

  const handleNightWaking = () => {
    if (activeSleep?.type === 'night') {
      // Active bedtime: start a live pause and open the sheet
      setActivePauseStart(new Date());
      setEditingEntryId(activeSleep.id);
      setShowEntrySheet(true);
    } else if (lastCompletedSleep?.type === 'night') {
      // Last completed bedtime: open it for retrospective pause adding
      setEditingEntryId(lastCompletedSleep.id);
      setSelectedDate(lastCompletedSleep.date);
      setShowEntrySheet(true);
    }
  };

  const handleOpenNewEntry = (type: 'nap' | 'night') => {
    // If we know user has no baby, redirect to add baby instead of opening entry sheet
    if (!profileLoading && !hasAnyBaby) {
      setShowActionMenu(false);
      goToAddBaby();
      return;
    }
    // When on Today view, always reset date to today — prevents stale selectedDate
    // from a previous History visit creating entries for the wrong day
    if (currentView === 'home') {
      setSelectedDate(formatDate(new Date()));
    }
    setEditingEntryId(null);
    setNewEntryType(type);
    setPredictedStartTime(undefined);
    setPredictedEndTime(undefined);
    setShowEntrySheet(true);
    setShowActionMenu(false);
  };

  // Handle "Log bedtime" from missing bedtime modal
  const handleLogMissingBedtime = (date: string) => {
    setShowMissingBedtimeModal(false);
    setEditingEntryId(null);
    setNewEntryType('night');
    setSelectedDate(date);
    setShowEntrySheet(true);
  };

  // Handle "Start a new day" from missing bedtime modal
  const handleSkipMissingBedtime = () => {
    setShowMissingBedtimeModal(false);
    // Persist dismissal so it doesn't reappear on page refresh within the same session
    sessionStorage.setItem('missingBedtimeDismissed', format(new Date(), 'yyyy-MM-dd'));
  };

  const handleEndSleep = (id: string) => {
    // Route all wake-ups (naps AND nights) through WakeUpSheet for time picker
    const entry = entries.find((e) => e.id === id);
    if (entry) {
      setWakeUpEntry(entry);
      setShowWakeUpSheet(true);
    } else {
      // Fallback: entry not found, end immediately
      endSleep(id, formatDateTime(new Date()));
    }
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

  // Handle predicted nap ghost card tap → opens PredictedNapSheet
  const handlePredictedNapTap = (data: PredictedNapData) => {
    setPredictedNapData(data);
    setShowPredictedNapSheet(true);
  };

  // Handle starting a nap from the PredictedNapSheet (Play button)
  const handleStartPredictedNap = async (startTime: Date) => {
    const startTimeISO = startTime.toISOString();
    const collision = checkCollision(startTimeISO, null);
    if (collision) {
      setCollisionEntry(collision);
      setPendingEntry({ startTime: startTimeISO, endTime: null, type: 'nap' });
      setShowPredictedNapSheet(false);
      return;
    }
    await addEntry({ startTime: startTimeISO, endTime: null, type: 'nap' });
    setShowPredictedNapSheet(false);
    setSkippedNapIndices(new Set()); // Reset skipped naps when a nap starts
  };

  // Handle skipping a predicted nap
  const handleSkipNap = (napIndex: number) => {
    setSkippedNapIndices((prev) => new Set([...prev, napIndex]));
    setShowPredictedNapSheet(false);
  };

  // Handle un-skipping a nap (from the skipped view's "Open nap" button)
  const handleUnskipNap = (napIndex: number) => {
    setSkippedNapIndices((prev) => {
      const next = new Set(prev);
      next.delete(napIndex);
      return next;
    });
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

    // No active night sleep: open entry sheet for "last night" with bedtime default 20:00 and wake = now
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    setSelectedDate(formatDate(yesterday));
    setEditingEntryId(null);
    setNewEntryType('night');
    setLogWakeUpMode(true);
    setShowEntrySheet(true);
    setShowActionMenu(false);
  };

  // History View
  const renderHistoryView = () => (
    <div className="pb-32 px-6">
      <div className="pt-8 mb-8">
        <DayNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} babyAge={babyAge} datesWithEntries={datesWithEntries} />
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-display-sm text-[var(--text-card-title)]">{t('history.sleepLog')}</h2>
        {!profileLoading && !hasAnyBaby && (
          <button
            onClick={goToAddBaby}
            className="text-[var(--nap-color)] font-display font-semibold text-sm"
          >
            {t('nav.addBabyToStart')}
          </button>
        )}
      </div>
      {entriesLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-4 flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-[var(--text-muted)]/10" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-[var(--text-muted)]/10 rounded" />
                <div className="h-3 w-16 bg-[var(--text-muted)]/10 rounded" />
              </div>
              <div className="h-3 w-12 bg-[var(--text-muted)]/10 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <SleepList
          entries={dayEntries}
          allEntries={entries}
          selectedDate={selectedDate}
          onEdit={handleEdit}
          onEndSleep={handleEndSleep}
        />
      )}
    </div>
  );

  // Stats View — onAddWeight/onAddHeight send user to Profile to add growth data (one-point empty state)
  const renderStatsView = () => (
    <StatsView
      entries={entries}
      profile={activeBabyProfile || profile}
      weightLogs={weightLogs}
      heightLogs={heightLogs}
      headLogs={headLogs}
      onAddWeight={() => {
        setProfileInitialView('measures');
        handleViewChange('profile');
      }}
      onAddHeight={() => {
        setProfileInitialView('measures');
        handleViewChange('profile');
      }}
    />
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
      onDeleteAccount={deleteAccount}
      isDeletingAccount={isDeletingAccount}
      deleteAccountError={deleteAccountError}
      requestOpenAddBaby={requestOpenAddBaby}
      onClearRequestOpenAddBaby={() => setRequestOpenAddBaby(false)}
      profileLoading={profileLoading}
      initialView={profileInitialView}
      resetToMenuTrigger={profileTabTapCount}
      onScrollToTop={scrollMainToTop}
      onExitProfile={() => {
        // Return to previous tab (e.g. Stats) when user taps back from an externally-entered view
        setProfileInitialView('menu');
        handleViewChange(previousView.current);
      }}
    />
  );

  const activeDisplayBaby = activeBabyProfile || profile;
  const headerAvatarLetter =
    activeDisplayBaby?.name?.charAt(0).toUpperCase() ||
    userProfile?.userName?.charAt(0).toUpperCase() ||
    null;
  const headerAvatarUrl = activeDisplayBaby?.avatarUrl;
  const headerAvatarAriaLabel = hasPendingBabyInvite
    ? t('profile.myBabiesHasInviteAria')
    : t('profile.myBabiesAria');

  const { isNavHidden } = useNavHiddenWhenModal();

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-[100dvh] bg-[var(--bg-deep)] transition-colors duration-[1500ms]">
      {/* Skip to content link for keyboard navigation (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-[var(--bg-card)] focus:text-[var(--text-primary)] focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--nap-color)] font-display font-medium"
      >
        Skip to content
      </a>

      {/* Circadian Sky Background */}
      <SkyBackground theme={theme} />

      {/* Main Content with Slide Transitions */}
      <main id="main-content" className="max-w-lg mx-auto relative z-0">
        {/* Inner scroll container: avoids Chrome bug where main+overflow + transformed child breaks document scroll. Scroll lives here so it works in all browsers. */}
        <div
          ref={mainScrollRef}
          className="min-h-[100dvh] overflow-y-auto overflow-x-hidden"
          style={{ height: '100dvh' }}
        >
        {/* Error banner for data fetch failures */}
        {(profileError || entriesError || growthError) && (
          <div className="mx-4 mt-4 px-4 py-3 rounded-xl bg-[var(--danger-color)]/10 border border-[var(--danger-color)]/20" role="alert">
            <p className="text-sm text-[var(--danger-color)] font-display font-medium">
              {t('common.dataLoadError', 'Something went wrong loading your data. Pull down to refresh.')}
            </p>
          </div>
        )}

        {/* Header avatar – shown only on Today and Sleep Log views */}
        {(currentView === 'home' || currentView === 'history') && (
          <div className="px-6 pt-6 w-fit">
            <button
              type="button"
              onClick={() => {
                setProfileInitialView('my-babies');
                handleViewChange('profile');
              }}
              className="relative flex items-center justify-center rounded-full w-11 h-11 min-w-[44px] min-h-[44px] flex-shrink-0"
              aria-label={headerAvatarAriaLabel}
              style={{
                // Transparent interior with a single nap-colored ring so the photo
                // appears directly inside the green circle with no extra borders.
                background: 'transparent',
                boxShadow: '0 0 0 2px var(--nap-color)',
              }}
            >
              {/* Inner circle: image (or fallback) as background, then overlay, then initial on top */}
              <span className="absolute inset-[2px] rounded-full overflow-hidden bg-[var(--bg-deep)]">
                {headerAvatarUrl ? (
                  <>
                    <img
                      src={headerAvatarUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover opacity-55"
                      aria-hidden="true"
                    />
                    <span className="absolute inset-0 bg-[var(--bg-deep)]/60" aria-hidden="true" />
                  </>
                ) : (
                  <span className="absolute inset-0 bg-[var(--nap-color)]/20" aria-hidden="true" />
                )}
                {/* Initial or person icon when no name — avoids showing "?" in empty state */}
                <span className="absolute inset-0 flex items-center justify-center text-base font-display font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
                  {headerAvatarLetter ? (
                    headerAvatarLetter
                  ) : (
                    <PersonIcon className="w-5 h-5 opacity-90" aria-hidden />
                  )}
                </span>
              </span>
              {hasPendingBabyInvite && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--wake-color)] border border-[var(--bg-deep)]" />
              )}
            </button>
          </div>
        )}

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
                hasNoBaby={!profileLoading && !hasAnyBaby}
                onAddBabyClick={goToAddBaby}
                hasPendingInvite={!profileLoading && !hasAnyBaby && hasPendingBabyInvite}
                onPendingInviteClick={() => {
                  setProfileInitialView('menu');
                  handleViewChange('profile');
                }}
                onStartPredictedNap={handlePredictedNapTap}
                skippedNapIndices={skippedNapIndices}
                activePauseStart={activePauseStart}
              />
            )}
            {currentView === 'history' && renderHistoryView()}
            {currentView === 'stats' && renderStatsView()}
            {currentView === 'profile' && renderProfileView()}
          </motion.div>
        </AnimatePresence>
        </div>
      </main>

      {/* Minimalist Floating Tab Bar — hidden when a modal/sheet is open so Save button is visible */}
      {!isNavHidden && (
      <nav className="floating-nav">
        <div className="floating-nav-inner">
          <div className="floating-nav-bar">
            {/* Today — Heroicons Home: outline (inactive) / solid (active) */}
            <button
              onClick={() => handleViewChange('home')}
              className={`nav-tab ${currentView === 'home' ? 'nav-tab-active' : ''}`}
              aria-label={t('nav.today')}
            >
              {currentView === 'home' ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
                  <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              )}
            </button>

            {/* Sleep logs (History) — Heroicons Calendar: outline (inactive) / solid (active) */}
            <button
              onClick={() => handleViewChange('history')}
              className={`nav-tab ${currentView === 'history' ? 'nav-tab-active' : ''}`}
              aria-label={t('nav.history')}
            >
              {currentView === 'history' ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
              )}
            </button>

            {/* Center Action Button — open sheet when loading or has baby (optimistic); only go to add baby when we know there is none */}
            <div className="nav-action">
              <button
                onClick={() => (profileLoading || hasAnyBaby ? setShowActionMenu(true) : goToAddBaby())}
                className="nav-action-btn"
                aria-label={profileLoading || hasAnyBaby ? t('nav.logSleep') : t('nav.addBabyToStart')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>

            {/* Stats — Heroicons ChartBar: outline (inactive) / solid (active) */}
            <button
              onClick={() => handleViewChange('stats')}
              className={`nav-tab ${currentView === 'stats' ? 'nav-tab-active' : ''}`}
              aria-label={t('nav.stats')}
            >
              {currentView === 'stats' ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125z" />
                </svg>
              )}
            </button>

            {/* My Profile — tap always goes to Profile tab and resets to menu (so one tap from Baby Detail = Account/Menu) */}
            <button
              onClick={() => {
                setProfileInitialView('menu');
                setProfileTabTapCount((c) => c + 1);
                handleViewChange('profile');
              }}
              className={`nav-tab ${currentView === 'profile' ? 'nav-tab-active' : ''}`}
              aria-label={t('nav.profile')}
            >
              <div className="relative inline-flex items-center justify-center">
                {currentView === 'profile' ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <circle cx="12" cy="8" r="4" />
                    <path d="M20 21a8 8 0 1 0-16 0" />
                  </svg>
                )}
                {hasPendingBabyInvite && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--wake-color)] border border-[var(--bg-deep)]" />
                )}
              </div>
            </button>
          </div>
        </div>
      </nav>
      )}

      {/* Quick Action Sheet */}
      <QuickActionSheet
        isOpen={showActionMenu}
        onClose={() => setShowActionMenu(false)}
        onSelectWakeUp={() => {
          handleLogWakeUp();
          setShowActionMenu(false);
        }}
        onSelectNap={() => {
          // Use current selectedDate so History view's chosen day is respected when adding
          handleOpenNewEntry('nap');
          setShowActionMenu(false);
        }}
        onSelectBedtime={() => {
          // Use current selectedDate so History view's chosen day is respected when adding
          handleOpenNewEntry('night');
          setShowActionMenu(false);
        }}
        hasActiveSleep={!!activeSleep}
        onEndSleep={activeSleep ? () => {
          handleEndSleep(activeSleep.id);
        } : undefined}
        hasNightEntry={hasNightEntry}
        onNightWaking={handleNightWaking}
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
          onAdjust={handleAdjustCollision}
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
          setEditingEntryId(null);
          setEntrySheetError(null);
          setLogWakeUpMode(false);
          setPredictedStartTime(undefined);
          setPredictedEndTime(undefined);
          setActivePauseStart(null);
        }}
        onSave={handleAddEntry}
        onDelete={deleteEntry}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        saveError={entrySheetError}
        defaultEndTimeToNow={logWakeUpMode}
        initialStartTimeOverride={predictedStartTime}
        initialEndTimeOverride={predictedEndTime}
        onAddPause={addPause}
        onUpdatePause={updatePause}
        onDeletePause={deletePause}
        activePauseStart={activePauseStart}
        onPauseStart={() => setActivePauseStart(new Date())}
        onPauseEnd={() => setActivePauseStart(null)}
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

      {/* Predicted Nap Sheet — Napper-style estimated nap preview & track flow */}
      <PredictedNapSheet
        isOpen={showPredictedNapSheet}
        onClose={() => setShowPredictedNapSheet(false)}
        onStartNap={handleStartPredictedNap}
        onSkipNap={handleSkipNap}
        onUnskipNap={handleUnskipNap}
        prediction={predictedNapData}
        isSkipped={!!predictedNapData && skippedNapIndices.has(predictedNapData.napIndex)}
      />
    </div>
    </MotionConfig>
  );
}

export default App;
