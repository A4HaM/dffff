import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  RotateCcw,
  Shuffle,
  X,
} from 'lucide-react';
import { CATEGORY_META, ELEMENTS, getCasGroupLabel, STUDY_PRESETS } from '../data/elements';
import {
  getAnswerLabelPrefix,
  getMetallicStrings,
  getMinTwoSubjectsLabel,
  getQuizSubjectOptions,
} from '../i18n/metallicTranslations';
import {
  getElementName,
  getTranslations,
  SupportedLanguage,
} from '../i18n/translations';
import {
  CardDirection,
  ChemicalElement,
  FlashcardItem,
  QuizAttempt,
  QuizMode,
  QuizSubject,
} from '../types/element';
import { isElementNameMatch } from '../utils/answerMatching';
import {
  playCardSwipeSound,
  playCorrectAnswerSound,
  playExtremeFailureSound,
  playJapaneseEasAlarmSound,
  playPerfectScoreSound,
  playQuizVictorySound,
  playWrongAnswerSound,
} from '../utils/soundEffects';

interface FlashcardSessionViewProps {
  selectedElements: ChemicalElement[];
  onApplyPreset: (nums: number[]) => void;
  onBackToTable: () => void;
  language: SupportedLanguage;
  testSubjects: QuizSubject[];
  onChangeTestSubjects: (subjects: QuizSubject[]) => void;
  quizMode: QuizMode;
  onChangeQuizMode: (mode: QuizMode) => void;
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const PAIR_TO_DIRECTION: Record<string, CardDirection> = {
  'symbol->name': 'symbol-to-name',
  'name->symbol': 'name-to-symbol',
  'number->name': 'number-to-name',
  'name->number': 'name-to-number',
  'symbol->number': 'symbol-to-number',
  'number->symbol': 'number-to-symbol',
};

function getSubjectPairs(subjects: QuizSubject[]): [CardDirection, CardDirection][] {
  const unique = Array.from(new Set(subjects));
  const pairs: [CardDirection, CardDirection][] = [];
  for (let i = 0; i < unique.length; i++) {
    for (let j = i + 1; j < unique.length; j++) {
      const forward = PAIR_TO_DIRECTION[`${unique[i]}->${unique[j]}`];
      const inverse = PAIR_TO_DIRECTION[`${unique[j]}->${unique[i]}`];
      if (forward && inverse) {
        pairs.push([forward, inverse]);
      }
    }
  }
  return pairs;
}

function getPromptType(dir: CardDirection): 'symbol' | 'name' | 'number' {
  if (dir === 'symbol-to-name' || dir === 'symbol-to-number') return 'symbol';
  if (dir === 'number-to-name' || dir === 'number-to-symbol') return 'number';
  return 'name';
}

function getTargetType(dir: CardDirection): 'symbol' | 'name' | 'number' {
  if (dir === 'symbol-to-name' || dir === 'number-to-name') return 'name';
  if (dir === 'name-to-symbol' || dir === 'number-to-symbol') return 'symbol';
  return 'number';
}

function buildDeck(
  elements: ChemicalElement[],
  subjects: QuizSubject[],
  shouldShuffle = true
): FlashcardItem[] {
  const pairs = shuffleArray(getSubjectPairs(subjects));
  if (pairs.length === 0) return [];

  const ordered = shouldShuffle ? shuffleArray(elements) : [...elements];
  const rawDirections: CardDirection[] = [];
  const fullPairCount = Math.floor(ordered.length / 2);

  for (let i = 0; i < fullPairCount; i++) {
    const [forward, inverse] = pairs[i % pairs.length];
    rawDirections.push(forward, inverse);
  }

  if (ordered.length % 2 === 1) {
    const remainingPair = pairs[fullPairCount % pairs.length];
    rawDirections.push(remainingPair[Math.random() < 0.5 ? 0 : 1]);
  }

  const assignedDirections = shuffleArray(rawDirections);
  return ordered.map((element, index) => ({
    element,
    direction: assignedDirections[index],
  }));
}

function buildChoiceOptions(target: ChemicalElement): ChemicalElement[] {
  const sameCategory = ELEMENTS.filter(
    (e) => e.number !== target.number && e.category === target.category
  );
  const sameInitial = ELEMENTS.filter(
    (e) =>
      e.number !== target.number &&
      e.category !== target.category &&
      (e.symbol[0] === target.symbol[0] || e.name[0] === target.name[0])
  );
  const others = ELEMENTS.filter(
    (e) =>
      e.number !== target.number &&
      e.category !== target.category &&
      e.symbol[0] !== target.symbol[0] &&
      e.name[0] !== target.name[0]
  );

  const pool = [
    ...shuffleArray(sameInitial).slice(0, 2),
    ...shuffleArray(sameCategory),
    ...shuffleArray(others),
  ];

  const uniqueDistractors: ChemicalElement[] = [];
  const seen = new Set<number>([target.number]);
  for (const candidate of pool) {
    if (!seen.has(candidate.number)) {
      seen.add(candidate.number);
      uniqueDistractors.push(candidate);
    }
    if (uniqueDistractors.length === 3) break;
  }

  return shuffleArray([target, ...uniqueDistractors]);
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const FlashcardSessionView: React.FC<FlashcardSessionViewProps> = ({
  selectedElements,
  onApplyPreset,
  onBackToTable,
  language,
  testSubjects,
  onChangeTestSubjects,
  quizMode,
  onChangeQuizMode,
}) => {
  const t = getTranslations(language);
  const m = getMetallicStrings(language);

  const [emptyFirstCount, setEmptyFirstCount] = useState('20');

  const [deck, setDeck] = useState<FlashcardItem[]>(() =>
    buildDeck(selectedElements, testSubjects)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [typedInput, setTypedInput] = useState('');
  const [submittedState, setSubmittedState] = useState<{
    correct: boolean;
    userAnswer: string;
    selectedChoiceNumber?: number;
  } | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPracticingMissed, setIsPracticingMissed] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const sessionKeyRef = useRef<string>('');

  const selectedKey = useMemo(
    () =>
      selectedElements
        .map((e) => e.number)
        .sort((a, b) => a - b)
        .join(','),
    [selectedElements]
  );

  const subjectsKey = useMemo(
    () => [...testSubjects].sort().join(','),
    [testSubjects]
  );

  const resetSession = useCallback(
    (
      sourceElements: ChemicalElement[],
      nextSubjects: QuizSubject[],
      practicingMissed = false
    ) => {
      setIsPracticingMissed(practicingMissed);
      setDeck(buildDeck(sourceElements, nextSubjects, true));
      setCurrentIndex(0);
      setIsFlipped(false);
      setTypedInput('');
      setSubmittedState(null);
      setAttempts([]);
      setElapsedSeconds(0);
    },
    []
  );

  useEffect(() => {
    const nextKey = `${selectedKey}|${subjectsKey}`;
    if (sessionKeyRef.current !== nextKey) {
      sessionKeyRef.current = nextKey;
      resetSession(selectedElements, testSubjects);
    }
  }, [selectedKey, subjectsKey, selectedElements, testSubjects, resetSession]);

  const isSessionComplete = deck.length > 0 && currentIndex >= deck.length;
  const currentCard = !isSessionComplete ? deck[currentIndex] : null;

  useEffect(() => {
    if (deck.length === 0 || isSessionComplete) return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [deck.length, isSessionComplete]);

  useEffect(() => {
    if (quizMode === 'type' && !submittedState && !isSessionComplete) {
      inputRef.current?.focus();
    }
  }, [quizMode, currentIndex, submittedState, isSessionComplete]);

  const choiceOptions = useMemo(() => {
    if (!currentCard || quizMode !== 'choice') return [];
    return buildChoiceOptions(currentCard.element);
  }, [currentCard, quizMode]);

  const handleToggleSubject = (subject: QuizSubject) => {
    const nextSubjects = testSubjects.includes(subject)
      ? testSubjects.filter((s) => s !== subject)
      : [...testSubjects, subject];
    onChangeTestSubjects(nextSubjects);
    const nextKey = `${selectedKey}|${[...nextSubjects].sort().join(',')}`;
    sessionKeyRef.current = nextKey;
    resetSession(selectedElements, nextSubjects);
    if (nextSubjects.length >= 2 && selectedElements.length > 0) {
      playCardSwipeSound();
    }
  };

  const handleModeChange = (nextMode: QuizMode) => {
    onChangeQuizMode(nextMode);
    setIsFlipped(false);
    setTypedInput('');
    setSubmittedState(null);
  };

  const advanceCard = useCallback(
    (attempt: QuizAttempt) => {
      const nextAttempts = [...attempts, attempt];
      if (deck.length > 0 && currentIndex + 1 >= deck.length) {
        const correctTotal = nextAttempts.filter((a) => a.correct).length;
        const accuracyPct = Math.round((correctTotal / nextAttempts.length) * 100);
        // Let the final flip card's grade sound finish before starting the finale sound
        const delay = quizMode === 'flip' ? 0.3 : 0;
        if (accuracyPct <= 10) {
          playExtremeFailureSound(delay);
        } else if (accuracyPct >= 66 && accuracyPct <= 70) {
          playJapaneseEasAlarmSound(delay);
        } else if (accuracyPct >= 85 && !isPracticingMissed) {
          playPerfectScoreSound(delay);
        } else {
          playQuizVictorySound(delay);
        }
      } else {
        playCardSwipeSound(quizMode === 'flip' ? 0.14 : 0);
      }
      setAttempts(nextAttempts);
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setTypedInput('');
      setSubmittedState(null);
    },
    [attempts, currentIndex, deck.length, quizMode, isPracticingMissed]
  );

  const handleFlipGrade = useCallback(
    (correct: boolean) => {
      if (!currentCard) return;
      if (correct) {
        playCorrectAnswerSound();
      } else {
        playWrongAnswerSound();
      }
      advanceCard({
        element: currentCard.element,
        direction: currentCard.direction,
        correct,
      });
    },
    [currentCard, advanceCard]
  );

  const handleTypeSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!currentCard) return;

    if (submittedState) {
      advanceCard({
        element: currentCard.element,
        direction: currentCard.direction,
        correct: submittedState.correct,
        userAnswer: submittedState.userAnswer,
      });
      return;
    }

    const trimmed = typedInput.trim();
    if (!trimmed) return;

    const localizedTargetName = getElementName(currentCard.element, language);
    const targetType = getTargetType(currentCard.direction);
    let correct = false;
    if (targetType === 'name') {
      correct = isElementNameMatch(trimmed, localizedTargetName, language, currentCard.element);
    } else if (targetType === 'symbol') {
      correct = trimmed.toLowerCase() === currentCard.element.symbol.toLowerCase();
    } else {
      const normalizedDigits = trimmed.replace(/^#/, '').trim();
      correct =
        /^\d+$/.test(normalizedDigits) &&
        parseInt(normalizedDigits, 10) === currentCard.element.number;
    }

    if (correct) {
      playCorrectAnswerSound();
    } else {
      playWrongAnswerSound();
    }
    setSubmittedState({ correct, userAnswer: trimmed });
  };

  const handleRevealTypeAnswer = () => {
    if (!currentCard || submittedState) return;
    playWrongAnswerSound();
    setSubmittedState({
      correct: false,
      userAnswer: typedInput.trim() || t.flashcards.skipped,
    });
  };

  const handleChoicePick = useCallback(
    (picked: ChemicalElement) => {
      if (!currentCard) return;
      if (submittedState) {
        advanceCard({
          element: currentCard.element,
          direction: currentCard.direction,
          correct: submittedState.correct,
          userAnswer: submittedState.userAnswer,
        });
        return;
      }

      const correct = picked.number === currentCard.element.number;
      const targetType = getTargetType(currentCard.direction);
      let answerLabel: string;
      if (targetType === 'name') {
        answerLabel = getElementName(picked, language);
      } else if (targetType === 'symbol') {
        answerLabel = picked.symbol;
      } else {
        answerLabel = `#${picked.number}`;
      }
      if (correct) {
        playCorrectAnswerSound();
      } else {
        playWrongAnswerSound();
      }
      setSubmittedState({
        correct,
        userAnswer: answerLabel,
        selectedChoiceNumber: picked.number,
      });
    },
    [currentCard, submittedState, advanceCard, language]
  );

  useEffect(() => {
    if (!currentCard || isSessionComplete) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTypingInInput =
        target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

      if (quizMode === 'flip') {
        if (e.code === 'Space') {
          e.preventDefault();
          setIsFlipped((prev) => !prev);
        } else if (isFlipped && (e.key === '1' || e.key === 'ArrowRight')) {
          e.preventDefault();
          handleFlipGrade(true);
        } else if (isFlipped && (e.key === '2' || e.key === 'ArrowLeft')) {
          e.preventDefault();
          handleFlipGrade(false);
        }
      } else if (quizMode === 'choice') {
        if (!submittedState && ['1', '2', '3', '4'].includes(e.key)) {
          const idx = Number(e.key) - 1;
          if (choiceOptions[idx]) {
            e.preventDefault();
            handleChoicePick(choiceOptions[idx]);
          }
        } else if (submittedState && (e.key === 'Enter' || e.code === 'Space')) {
          e.preventDefault();
          advanceCard({
            element: currentCard.element,
            direction: currentCard.direction,
            correct: submittedState.correct,
            userAnswer: submittedState.userAnswer,
          });
        }
      } else if (quizMode === 'type' && !isTypingInInput && submittedState && e.key === 'Enter') {
        e.preventDefault();
        advanceCard({
          element: currentCard.element,
          direction: currentCard.direction,
          correct: submittedState.correct,
          userAnswer: submittedState.userAnswer,
        });
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    currentCard,
    isSessionComplete,
    quizMode,
    isFlipped,
    submittedState,
    choiceOptions,
    handleFlipGrade,
    handleChoicePick,
    advanceCard,
  ]);

  if (selectedElements.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="rounded-xl border border-slate-800/80 bg-[#10151E] p-8 text-center space-y-5">
          <h1 className="font-display text-2xl font-semibold text-slate-50">
            {t.flashcards.emptyTitle}
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {t.flashcards.emptyBody}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onBackToTable}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-cyan-300 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{t.flashcards.pickOnTable}</span>
            </button>

            <div className="inline-flex items-center rounded-lg border border-slate-700/80 bg-[#161D2A] p-1">
              <button
                type="button"
                onClick={() => {
                  const n = Math.min(118, Math.max(1, parseInt(emptyFirstCount, 10) || 20));
                  onApplyPreset(Array.from({ length: n }, (_, i) => i + 1));
                }}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white transition-colors"
              >
                {m.firstPrefix}
              </button>
              <input
                type="text"
                inputMode="numeric"
                maxLength={3}
                value={emptyFirstCount}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, '');
                  if (!raw) {
                    setEmptyFirstCount('');
                    return;
                  }
                  const n = parseInt(raw, 10);
                  setEmptyFirstCount(n > 118 ? '118' : raw);
                }}
                onBlur={() => {
                  const n = parseInt(emptyFirstCount, 10);
                  setEmptyFirstCount(
                    Number.isNaN(n) || n < 1 ? '20' : String(Math.min(118, n))
                  );
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const n = Math.min(118, Math.max(1, parseInt(emptyFirstCount, 10) || 20));
                    onApplyPreset(Array.from({ length: n }, (_, i) => i + 1));
                  }
                }}
                aria-label={m.firstNDescription(
                  Math.min(118, Math.max(1, parseInt(emptyFirstCount, 10) || 20))
                )}
                className="w-10 rounded border border-slate-700 bg-[#080B10] px-1 py-1 text-center font-mono text-xs text-slate-100 tabular-nums focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {STUDY_PRESETS.slice(0, 3).map((preset) => {
              const presetLabel = t.presets[preset.id]?.label ?? preset.label;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onApplyPreset(preset.numbers)}
                  className="rounded-lg border border-slate-700/80 bg-[#161D2A] px-3.5 py-2.5 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  {t.flashcards.loadPreset(presetLabel)}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  const correctCount = attempts.filter((a) => a.correct).length;
  const missedAttempts = attempts.filter((a) => !a.correct);

  const currentLocalizedName = currentCard
    ? getElementName(currentCard.element, language)
    : '';

  return (
    <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 space-y-6">
      {/* Study Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-[#10151E] p-3">
        <div className="flex flex-wrap items-center gap-2 max-w-full">
          {/* Test Subjects Multi-Select Checkboxes */}
          <div
            className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-800 bg-[#080B10] px-2 py-1 max-w-full"
            role="group"
            aria-label={m.testOnHeading}
          >
            <span className="text-[11px] font-semibold text-slate-400 px-1">
              {m.testOnHeading}:
            </span>
            {getQuizSubjectOptions(t.flashcards.symbolToName, language).map((opt) => {
              const checked = testSubjects.includes(opt.id);
              return (
                <label
                  key={opt.id}
                  className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-medium cursor-pointer select-none transition-colors whitespace-nowrap shrink-0 ${
                    checked
                      ? 'border-cyan-400/40 bg-[#161D2A] text-cyan-200'
                      : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-[#10151E]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleSubject(opt.id)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded-[4px] border transition-colors ${
                      checked
                        ? 'border-cyan-300 bg-cyan-400 text-slate-950'
                        : 'border-slate-600 bg-[#10151E]'
                    }`}
                  >
                    {checked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                  </span>
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>

          {/* Quiz Interaction Mode */}
          <div
            className="flex flex-wrap items-center rounded-lg border border-slate-800 bg-[#080B10] p-1 max-w-full"
            role="group"
            aria-label="Flashcard interaction mode"
          >
            {(
              [
                { id: 'flip', label: t.flashcards.flipCard },
                { id: 'type', label: t.flashcards.typeAnswer },
                { id: 'choice', label: t.flashcards.multipleChoice },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleModeChange(opt.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  quizMode === opt.id
                    ? 'bg-[#161D2A] text-slate-50 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              resetSession(selectedElements, testSubjects);
              playCardSwipeSound();
            }}
            disabled={testSubjects.length < 2}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#080B10] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-[#161D2A] hover:text-slate-100 disabled:opacity-40 transition-colors whitespace-nowrap shrink-0"
          >
            <Shuffle className="h-3.5 w-3.5" />
            <span>{t.flashcards.shuffle}</span>
          </button>
        </div>
      </div>

      {/* Session Progress & Score Strip */}
      {!isSessionComplete && currentCard && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-3 text-slate-300 font-mono tabular-nums">
              <span>{t.flashcards.cardProgress(currentIndex + 1, deck.length)}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">{formatDuration(elapsedSeconds)}</span>
            </div>

            <div className="flex items-center gap-3 font-mono tabular-nums">
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <Check className="h-3.5 w-3.5" />
                <span>{t.flashcards.correctCount(correctCount)}</span>
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="inline-flex items-center gap-1 text-rose-400">
                <X className="h-3.5 w-3.5" />
                <span>{t.flashcards.missedCount(missedAttempts.length)}</span>
              </span>
            </div>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800/80">
            <div
              className="h-full bg-cyan-400 transition-all duration-200"
              style={{ width: `${(currentIndex / deck.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Active Flashcard Stage OR Completion Summary */}
      {isSessionComplete ? (
        <div className="rounded-xl border border-slate-800/80 bg-[#10151E] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-6">
            <div>
              <p className="text-xs font-medium text-cyan-400">
                {t.flashcards.sessionComplete}
              </p>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-50">
                {attempts.length > 0
                  ? t.flashcards.accuracyLabel(
                      Math.round((correctCount / attempts.length) * 100)
                    )
                  : t.flashcards.roundComplete}
              </h2>
              <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-400 font-mono tabular-nums">
                <span>{t.flashcards.masteredCount(correctCount, attempts.length)}</span>
                <span aria-hidden="true">·</span>
                <span>{t.flashcards.timeLabel(formatDuration(elapsedSeconds))}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {missedAttempts.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    resetSession(
                      missedAttempts.map((m) => m.element),
                      testSubjects,
                      true
                    );
                    playCardSwipeSound();
                  }}
                  className="rounded-lg bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-300 transition-colors whitespace-nowrap shrink-0"
                >
                  {t.flashcards.practiceMissed(missedAttempts.length)}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  resetSession(selectedElements, testSubjects, false);
                  playCardSwipeSound();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#161D2A] px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{t.flashcards.restartAll}</span>
              </button>

              <button
                type="button"
                onClick={onBackToTable}
                className="rounded-lg border border-slate-800 bg-[#080B10] px-4 py-2 text-xs font-medium text-slate-300 hover:bg-[#161D2A] hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
              >
                {t.flashcards.changeElements}
              </button>
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {attempts.map((attempt, idx) => {
              const cat = CATEGORY_META[attempt.element.category];
              return (
                <div
                  key={`${attempt.element.number}-${idx}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-800/80 bg-[#0B0F17] px-3.5 py-2.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs text-slate-500 tabular-nums w-6">
                      #{attempt.element.number}
                    </span>
                    <span className={`font-display text-lg font-bold w-8 ${cat.accentText}`}>
                      {attempt.element.symbol}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-100 truncate">
                        {getElementName(attempt.element, language)}
                      </div>
                      {!attempt.correct && attempt.userAnswer && (
                        <div className="text-[11px] text-slate-400 truncate">
                          {t.flashcards.answeredPrefix} {attempt.userAnswer}
                        </div>
                      )}
                    </div>
                  </div>

                  {attempt.correct ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 shrink-0">
                      <Check className="h-3.5 w-3.5" />
                      <span>{t.flashcards.correctTag}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-400 shrink-0">
                      <X className="h-3.5 w-3.5" />
                      <span>{t.flashcards.missedTag}</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : testSubjects.length < 2 ? (
        <div className="mx-auto max-w-xl rounded-xl border border-slate-800/80 bg-[#10151E] p-8 text-center space-y-2">
          <p className="text-sm font-medium text-amber-300">
            {getMinTwoSubjectsLabel(language)}
          </p>
        </div>
      ) : currentCard ? (() => {
        const promptType = getPromptType(currentCard.direction);
        const targetType = getTargetType(currentCard.direction);
        const involvesNumber = promptType === 'number' || targetType === 'number';
        const subjectOptions = getQuizSubjectOptions(t.flashcards.symbolToName, language);
        const subjectLabelMap = Object.fromEntries(
          subjectOptions.map((opt) => [opt.id, opt.label])
        ) as Record<'symbol' | 'name' | 'number', string>;
        const promptSubjectLabel = subjectLabelMap[promptType];
        const targetSubjectLabel = subjectLabelMap[targetType];
        const answerPrefix = getAnswerLabelPrefix(language);
        const answerBadgeText = `${answerPrefix}: ${targetSubjectLabel}`;
        const bannerSymbol = involvesNumber
          ? `${currentCard.element.symbol} · #${currentCard.element.number}`
          : currentCard.element.symbol;
        const frontAriaLabel = isFlipped
          ? currentLocalizedName
          : promptType === 'symbol'
          ? currentCard.element.symbol
          : promptType === 'number'
          ? `#${currentCard.element.number}`
          : currentLocalizedName;

        return (
        <div className="mx-auto max-w-2xl space-y-5">
          {/* FLIP CARD MODE */}
          {quizMode === 'flip' && (
            <>
              <div className="perspective-1200">
                <button
                  type="button"
                  onClick={() => setIsFlipped((prev) => !prev)}
                  aria-label={frontAriaLabel}
                  className={`flashcard-inner preserve-3d relative block w-full min-h-[340px] sm:min-h-[380px] cursor-pointer text-left transition-transform duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-2xl ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                  style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                >
                  {/* Card Front */}
                  <div className="backface-hidden absolute inset-0 flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#10151E] p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-slate-400">
                        {targetType === 'name'
                          ? t.flashcards.identifyName
                          : targetType === 'symbol'
                          ? t.flashcards.identifySymbol
                          : m.identifyNumber}
                      </span>
                      <span className="font-medium text-slate-400 whitespace-nowrap shrink-0">
                        {promptSubjectLabel} → {targetSubjectLabel}
                      </span>
                    </div>

                    <div className="my-auto flex flex-col items-center justify-center text-center py-6 space-y-3">
                      <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                        {promptSubjectLabel}
                      </span>
                      {promptType === 'symbol' ? (
                        <div className="font-display text-7xl sm:text-8xl font-bold tracking-tight text-slate-50">
                          {currentCard.element.symbol}
                        </div>
                      ) : promptType === 'number' ? (
                        <div className="font-mono text-7xl sm:text-8xl font-bold tracking-tight text-slate-50 tabular-nums">
                          #{currentCard.element.number}
                        </div>
                      ) : (
                        <div className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-slate-50 text-balance">
                          {currentLocalizedName}
                        </div>
                      )}
                      <div className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/35 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                        <span>{answerBadgeText}</span>
                      </div>
                    </div>

                    <div className="text-center text-xs text-slate-500">
                      {t.flashcards.clickToReveal}
                    </div>
                  </div>

                  {/* Card Back */}
                  <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col justify-between rounded-2xl border border-cyan-500/40 bg-[#121925] p-6 sm:p-8">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className={CATEGORY_META[currentCard.element.category].accentText}>
                        {t.categories[currentCard.element.category].label}
                      </span>
                      <span className="font-mono tabular-nums text-slate-300">
                        #{currentCard.element.number} · {currentCard.element.atomicMass} u
                      </span>
                    </div>

                    <div className="my-auto flex flex-col items-center justify-center text-center space-y-2 py-4">
                      {involvesNumber && (
                        <div
                          className={`font-mono tabular-nums font-bold ${
                            targetType === 'number'
                              ? 'text-5xl sm:text-6xl text-cyan-300'
                              : 'text-2xl sm:text-3xl text-cyan-200'
                          }`}
                        >
                          #{currentCard.element.number}
                        </div>
                      )}
                      <div
                        className={`font-display font-bold tracking-tight ${
                          targetType === 'symbol'
                            ? 'text-6xl sm:text-7xl text-cyan-300'
                            : 'text-4xl sm:text-5xl text-slate-200'
                        }`}
                      >
                        {currentCard.element.symbol}
                      </div>
                      <div
                        className={`font-display font-semibold ${
                          targetType === 'name'
                            ? 'text-3xl sm:text-4xl text-cyan-300'
                            : 'text-xl sm:text-2xl text-slate-100'
                        }`}
                      >
                        {currentLocalizedName}
                      </div>
                      {language === 'en' ? (
                        <p className="max-w-md pt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {currentCard.element.hint}
                        </p>
                      ) : (
                        <p className="pt-2 text-xs text-slate-400">
                          {t.table.periodLabel(currentCard.element.period)} ·{' '}
                          {t.table.groupLabel(getCasGroupLabel(currentCard.element.group))}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>
                        {t.flashcards.configPrefix} {currentCard.element.electronConfig}
                      </span>
                      <span>
                        {t.flashcards.stpPrefix} {t.states[currentCard.element.state]}
                      </span>
                    </div>
                  </div>
                </button>
              </div>

              {/* Flip Grading Controls */}
              <div className="flex items-center justify-center gap-3">
                {!isFlipped ? (
                  <button
                    type="button"
                    onClick={() => setIsFlipped(true)}
                    className="w-full sm:w-auto min-w-[200px] rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300 transition-colors"
                  >
                    {t.flashcards.revealAnswer}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleFlipGrade(false)}
                      className="flex-1 sm:flex-initial min-w-[168px] inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/30 px-5 py-3 text-sm font-semibold text-rose-200 hover:bg-rose-950/50 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      <span>{t.flashcards.needsPractice}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFlipGrade(true)}
                      className="flex-1 sm:flex-initial min-w-[168px] inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-5 py-3 text-sm font-semibold text-emerald-200 hover:bg-emerald-950/50 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      <span>{t.flashcards.gotIt}</span>
                    </button>
                  </>
                )}
              </div>

              <p className="text-center text-xs text-slate-500">
                {t.flashcards.flipKeyboardHint}
              </p>
            </>
          )}

          {/* TYPE ANSWER MODE */}
          {quizMode === 'type' && (
            <div className="rounded-2xl border border-slate-800 bg-[#10151E] p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-400">
                  {targetType === 'name'
                    ? t.flashcards.typeNamePrompt
                    : targetType === 'symbol'
                    ? t.flashcards.typeSymbolPrompt
                    : m.typeNumberPrompt}
                </span>
                <span className="inline-flex items-center rounded-md border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-0.5 font-semibold text-cyan-200 whitespace-nowrap shrink-0">
                  {answerBadgeText}
                </span>
              </div>

              <div className="py-6 text-center space-y-2">
                <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  {promptSubjectLabel}
                </div>
                {promptType === 'symbol' ? (
                  <div className="font-display text-7xl sm:text-8xl font-bold tracking-tight text-slate-50">
                    {currentCard.element.symbol}
                  </div>
                ) : promptType === 'number' ? (
                  <div className="font-mono text-7xl sm:text-8xl font-bold tracking-tight text-slate-50 tabular-nums">
                    #{currentCard.element.number}
                  </div>
                ) : (
                  <div className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-slate-50 text-balance">
                    {currentLocalizedName}
                  </div>
                )}
              </div>

              <form onSubmit={handleTypeSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode={targetType === 'number' ? 'numeric' : 'text'}
                    value={typedInput}
                    onChange={(e) => setTypedInput(e.target.value)}
                    disabled={Boolean(submittedState)}
                    placeholder={
                      targetType === 'name'
                        ? t.flashcards.enterNamePlaceholder
                        : targetType === 'symbol'
                        ? t.flashcards.enterSymbolPlaceholder
                        : m.enterNumberPlaceholder
                    }
                    aria-label={
                      targetType === 'name'
                        ? t.flashcards.typeNamePrompt
                        : targetType === 'symbol'
                        ? t.flashcards.typeSymbolPrompt
                        : m.typeNumberPrompt
                    }
                    className="flex-1 rounded-xl border border-slate-700 bg-[#080B10] px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none disabled:opacity-70"
                  />

                  {!submittedState ? (
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={!typedInput.trim()}
                        className="flex-1 sm:flex-initial rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-40 transition-colors whitespace-nowrap"
                      >
                        {t.flashcards.check}
                      </button>
                      <button
                        type="button"
                        onClick={handleRevealTypeAnswer}
                        className="rounded-xl border border-slate-700 bg-[#161D2A] px-4 py-3 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors whitespace-nowrap"
                      >
                        {t.flashcards.show}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300 transition-colors whitespace-nowrap"
                    >
                      {currentIndex + 1 === deck.length
                        ? t.flashcards.finishSession
                        : t.flashcards.nextCard}
                    </button>
                  )}
                </div>
              </form>

              {submittedState && (
                <div
                  className={`rounded-xl border px-4 py-3.5 text-sm space-y-1 ${
                    submittedState.correct
                      ? 'border-emerald-500/40 bg-emerald-950/25 text-emerald-200'
                      : 'border-rose-500/40 bg-rose-950/25 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    {submittedState.correct ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-400" />
                        <span>
                          {t.flashcards.correctAnswerBanner(
                            currentLocalizedName,
                            bannerSymbol
                          )}
                        </span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 text-rose-400" />
                        <span>
                          {t.flashcards.revealedAnswerBanner(
                            currentLocalizedName,
                            bannerSymbol
                          )}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">
                    {language === 'en'
                      ? currentCard.element.hint
                      : `${t.categories[currentCard.element.category].label} · ${currentCard.element.atomicMass} u · ${t.states[currentCard.element.state]}`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* MULTIPLE CHOICE MODE */}
          {quizMode === 'choice' && (
            <div className="rounded-2xl border border-slate-800 bg-[#10151E] p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-400">
                  {targetType === 'name'
                    ? t.flashcards.chooseNamePrompt
                    : targetType === 'symbol'
                    ? t.flashcards.chooseSymbolPrompt
                    : m.chooseNumberPrompt}
                </span>
                <span className="inline-flex items-center rounded-md border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-0.5 font-semibold text-cyan-200 whitespace-nowrap shrink-0">
                  {answerBadgeText}
                </span>
              </div>

              <div className="py-4 text-center space-y-2">
                <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  {promptSubjectLabel}
                </div>
                {promptType === 'symbol' ? (
                  <div className="font-display text-7xl sm:text-8xl font-bold tracking-tight text-slate-50">
                    {currentCard.element.symbol}
                  </div>
                ) : promptType === 'number' ? (
                  <div className="font-mono text-7xl sm:text-8xl font-bold tracking-tight text-slate-50 tabular-nums">
                    #{currentCard.element.number}
                  </div>
                ) : (
                  <div className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-slate-50 text-balance">
                    {currentLocalizedName}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {choiceOptions.map((option, idx) => {
                  const isTarget = option.number === currentCard.element.number;
                  const isPicked = submittedState?.selectedChoiceNumber === option.number;
                  let label: string;
                  if (targetType === 'name') {
                    label = getElementName(option, language);
                  } else if (targetType === 'symbol') {
                    label = option.symbol;
                  } else {
                    label = `#${option.number}`;
                  }

                  let btnClass =
                    'border-slate-800 bg-[#0B0F17] text-slate-100 hover:border-cyan-400/60 hover:bg-[#161D2A]';
                  if (submittedState) {
                    if (isTarget) {
                      btnClass =
                        'border-emerald-500/70 bg-emerald-950/35 text-emerald-100';
                    } else if (isPicked && !isTarget) {
                      btnClass = 'border-rose-500/70 bg-rose-950/35 text-rose-100';
                    } else {
                      btnClass = 'border-slate-800/60 bg-[#0B0F17] text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={option.number}
                      type="button"
                      onClick={() => handleChoicePick(option)}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors ${btnClass}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-xs text-slate-500 tabular-nums">
                          {idx + 1}
                        </span>
                        <span
                          className={`truncate ${
                            targetType === 'symbol'
                              ? 'font-display text-xl font-bold'
                              : targetType === 'number'
                              ? 'font-mono text-xl font-bold tabular-nums'
                              : 'text-base font-medium'
                          }`}
                        >
                          {label}
                        </span>
                      </div>

                      {submittedState && isTarget && (
                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                      )}
                      {submittedState && isPicked && !isTarget && (
                        <X className="h-4 w-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {submittedState && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-slate-800/80">
                  <p className="text-xs text-slate-300">
                    <span className="font-semibold text-slate-100">
                      {currentLocalizedName} ({bannerSymbol})
                    </span>{' '}
                    —{' '}
                    {language === 'en'
                      ? currentCard.element.hint
                      : `${t.categories[currentCard.element.category].label} · ${currentCard.element.atomicMass} u`}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      advanceCard({
                        element: currentCard.element,
                        direction: currentCard.direction,
                        correct: submittedState.correct,
                        userAnswer: submittedState.userAnswer,
                      })
                    }
                    className="rounded-xl bg-cyan-400 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:bg-cyan-300 transition-colors whitespace-nowrap shrink-0"
                  >
                    {currentIndex + 1 === deck.length
                      ? t.flashcards.viewResults
                      : t.flashcards.nextCard}
                  </button>
                </div>
              )}

              <p className="text-center text-xs text-slate-500">
                {t.flashcards.choiceKeyboardHint}
              </p>
            </div>
          )}
        </div>
        );
      })() : null}
    </section>
  );
};
