import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children?: ReactNode;
  /** Стартовая тема, если управление не внешнее. По умолчанию light. */
  defaultTheme?: Theme;
  /** Управляемый режим: тема приходит снаружи. */
  theme?: Theme;
  onThemeChange?: (theme: Theme) => void;
  /**
   * global — ставит data-theme на <html> (так работает сайт).
   * scoped — ставит data-theme на собственный контейнер: нужно, когда на одной
   * странице надо показать светлую и тёмную версию рядом (демо, превью,
   * скриншоты для дизайн-агента).
   */
  mode?: 'global' | 'scoped';
  className?: string;
}

/**
 * Корневая обёртка дизайн-системы. Компоненты работают и без неё (токены живут
 * на :root), но переключение темы и scoped-превью — только через неё.
 */
export function ThemeProvider({
  children,
  defaultTheme = 'light',
  theme: controlled,
  onThemeChange,
  mode = 'global',
  className,
}: ThemeProviderProps) {
  const [uncontrolled, setUncontrolled] = useState<Theme>(defaultTheme);
  const theme = controlled ?? uncontrolled;

  const setTheme = useCallback(
    (next: Theme) => {
      if (controlled === undefined) setUncontrolled(next);
      onThemeChange?.(next);
    },
    [controlled, onThemeChange],
  );

  useEffect(() => {
    if (mode !== 'global' || typeof document === 'undefined') return;
    const previous = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', theme);
    return () => {
      if (previous === null) document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', previous);
    };
  }, [theme, mode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    }),
    [theme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <div className={className} data-theme={mode === 'scoped' ? theme : undefined}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

/** Доступ к текущей теме. Вне ThemeProvider бросает — молчаливый light хуже. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme() вызван вне <ThemeProvider>');
  return ctx;
}
