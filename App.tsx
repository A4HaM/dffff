import { useCallback, useEffect, useMemo, useState } from 'react';
import { ElementIndexView } from './components/ElementIndexView';
import { FlashcardSessionView } from './components/FlashcardSessionView';
import { PeriodicTableView } from './components/PeriodicTableView';
import { AppView, TopBar } from './components/TopBar';
import { ELEMENTS } from './data/elements';
import { ALL_LANGUAGES, getLanguageMeta, SupportedLanguage } from './i18n/translations';
import { QuizMode, QuizSubject } from './types/element';
import { playCardSwipeSound } from './utils/soundEffects';

const STORAGE_KEY = 'elementa_selected_elements_v1';
const LANGUAGE_STORAGE_KEY = 'elementa_language_v1';
const DEFAULT_SELECTION = [1, 6, 7, 8, 11, 17, 26, 29, 47, 79];

function loadInitialSelection(): Set<number> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every((n) => typeof n === 'number')) {
        return new Set(parsed.filter((n) => n >= 1 && n <= 118));
      }
    }
  } catch {
    // Ignore storage read issues
  }
  return new Set(DEFAULT_SELECTION);
}

function loadInitialLanguage(): SupportedLanguage {
  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && ALL_LANGUAGES.some((opt) => opt.id === saved)) {
      return saved as SupportedLanguage;
    }
  } catch {
    // Ignore storage read issues
  }
  return 'en';
}

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('table');
  const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(loadInitialSelection);
  const [language, setLanguage] = useState<SupportedLanguage>(loadInitialLanguage);
  const [testSubjects, setTestSubjects] = useState<QuizSubject[]>(['symbol', 'name']);
  const [quizMode, setQuizMode] = useState<QuizMode>('flip');

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(Array.from(selectedNumbers))
      );
    } catch {
      // Ignore storage write issues
    }
  }, [selectedNumbers]);

  useEffect(() => {
    const meta = getLanguageMeta(language);
    document.documentElement.lang = language;
    document.documentElement.dir = meta.rtl ? 'rtl' : 'ltr';
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Ignore storage write issues
    }
  }, [language]);

  const selectedElements = useMemo(
    () => ELEMENTS.filter((el) => selectedNumbers.has(el.number)),
    [selectedNumbers]
  );

  const handleToggleElement = useCallback((num: number) => {
    setSelectedNumbers((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  }, []);

  const handleSetSelection = useCallback((nums: number[]) => {
    setSelectedNumbers(new Set(nums));
  }, []);

  const handleSelectBatch = useCallback((nums: number[], mode: 'add' | 'remove') => {
    setSelectedNumbers((prev) => {
      const next = new Set(prev);
      for (const n of nums) {
        if (mode === 'add') next.add(n);
        else next.delete(n);
      }
      return next;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedNumbers(new Set());
  }, []);

  const handleStartQuiz = useCallback(() => {
    if (selectedNumbers.size > 0 && testSubjects.length >= 2) {
      playCardSwipeSound();
    }
    setActiveView('flashcards');
  }, [selectedNumbers.size, testSubjects.length]);

  return (
    <div className="min-h-screen flex flex-col bg-[#080B10] text-slate-100">
      <TopBar
        activeView={activeView}
        onChangeView={setActiveView}
        selectedCount={selectedNumbers.size}
        onStartQuiz={handleStartQuiz}
        language={language}
        onChangeLanguage={setLanguage}
      />

      <main className="flex-1">
        {activeView === 'table' && (
          <PeriodicTableView
            selectedNumbers={selectedNumbers}
            onToggleElement={handleToggleElement}
            onSetSelection={handleSetSelection}
            onSelectBatch={handleSelectBatch}
            onClearSelection={handleClearSelection}
            onStartQuiz={handleStartQuiz}
            language={language}
            testSubjects={testSubjects}
            onChangeTestSubjects={setTestSubjects}
            quizMode={quizMode}
            onChangeQuizMode={setQuizMode}
          />
        )}

        {activeView === 'flashcards' && (
          <FlashcardSessionView
            selectedElements={selectedElements}
            onApplyPreset={handleSetSelection}
            onBackToTable={() => setActiveView('table')}
            language={language}
            testSubjects={testSubjects}
            onChangeTestSubjects={setTestSubjects}
            quizMode={quizMode}
            onChangeQuizMode={setQuizMode}
          />
        )}

        {activeView === 'index' && (
          <ElementIndexView
            selectedNumbers={selectedNumbers}
            onToggleElement={handleToggleElement}
            onSelectBatch={handleSelectBatch}
            onStartQuiz={handleStartQuiz}
            language={language}
          />
        )}
      </main>
    </div>
  );
}
