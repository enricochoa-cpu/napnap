import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

/** When > 0, the app hides the bottom nav so modals/sheets can use full height (e.g. Save button visible). */
interface NavHiddenWhenModalContextValue {
  /** Call when a modal/sheet opens. Nav is hidden until removeModal is called. */
  addModal: () => void;
  /** Call when that modal/sheet closes. */
  removeModal: () => void;
  /** True when any modal has called addModal and not yet removeModal. */
  isNavHidden: boolean;
}

const NavHiddenWhenModalContext = createContext<NavHiddenWhenModalContextValue | null>(null);

export function NavHiddenWhenModalProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  const addModal = useCallback(() => setCount((c) => c + 1), []);
  const removeModal = useCallback(() => setCount((c) => Math.max(0, c - 1)), []);
  const value: NavHiddenWhenModalContextValue = {
    addModal,
    removeModal,
    isNavHidden: count > 0,
  };
  return (
    <NavHiddenWhenModalContext.Provider value={value}>
      {children}
    </NavHiddenWhenModalContext.Provider>
  );
}

export function useNavHiddenWhenModal(): NavHiddenWhenModalContextValue {
  const ctx = useContext(NavHiddenWhenModalContext);
  if (!ctx) {
    return {
      addModal: () => {},
      removeModal: () => {},
      isNavHidden: false,
    };
  }
  return ctx;
}
