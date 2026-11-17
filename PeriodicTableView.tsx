import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { CATEGORY_META, ELEMENTS, getCasGroupLabel, getMetallicType, STUDY_PRESETS } from '../data/elements';
import { getMetallicStrings, getMinTwoSubjectsLabel, getQuizSubjectOptions } from '../i18n/metallicTranslations';
import {
  getElementName,
  getTranslations,
  SupportedLanguage,
} from '../i18n/translations';
import { ChemicalElement, ElementCategory, QuizMode, QuizSubject } from '../types/element';

interface BoundaryEdges {
  left?: boolean;
  bottom?: boolean;
  startTop?: boolean;
  endBottom?: boolean;
}

// Stepped Metal / Nonmetal dividing line along the 4px grid gutters:
// Separates Hydrogen (H) above Li, and steps down between Metals (bottom-left)
// and Nonmetals/Metalloids (top-right): B -> Si -> As -> Te -> At -> Ts.
const METAL_NONMETAL_STAIRCASE: Record<number, BoundaryEdges> = {
  1: { bottom: true },
  5: { left: true, bottom: true, startTop: true },
  14: { left: true, bottom: true },
  33: { left: true, bottom: true },
  52: { left: true, bottom: true },
  85: { left: true },
  117: { left: true, endBottom: true },
};

interface PeriodicTableViewProps {
  selectedNumbers: Set<number>;
  onToggleElement: (num: number) => void;
  onSetSelection: (nums: number[]) => void;
  onSelectBatch: (nums: number[], mode: 'add' | 'remove') => void;
  onClearSelection: () => void;
  onStartQuiz: () => void;
  language: SupportedLanguage;
  testSubjects: QuizSubject[];
  onChangeTestSubjects: (subjects: QuizSubject[]) => void;
  quizMode: QuizMode;
  onChangeQuizMode: (mode: QuizMode) => void;
}

export const PeriodicTableView: React.FC<PeriodicTableViewProps> = ({
  selectedNumbers,
  onToggleElement,
  onSetSelection,
  onSelectBatch,
  onClearSelection,
  onStartQuiz,
  language,
  testSubjects,
  onChangeTestSubjects,
  quizMode,
  onChangeQuizMode,
}) => {
  const t = getTranslations(language);
  const m = getMetallicStrings(language);
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedElement, setInspectedElement] = useState<ChemicalElement | null>(
    ELEMENTS[5]
  );
  const [hoveredCategory, setHoveredCategory] = useState<ElementCategory | null>(null);
  const [highlightMetalloids, setHighlightMetalloids] = useState(false);
  const [hoverMetalloids, setHoverMetalloids] = useState(false);
  const [showDividingLine, setShowDividingLine] = useState(true);
  const [highlightDividingLine, setHighlightDividingLine] = useState(false);
  const [selectionNotice, setSelectionNotice] = useState(false);
  const [subjectNotice, setSubjectNotice] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [firstCountInput, setFirstCountInput] = useState('20');
  const lastFirstCountRef = useRef(20);

  const dragModeRef = useRef<'add' | 'remove' | null>(null);

  useEffect(() => {
    const handlePointerUp = () => {
      dragModeRef.current = null;
    };
    window.addEventListener('pointerup', handlePointerUp);
    return () => window.removeEventListener('pointerup', handlePointerUp);
  }, []);

  const searchMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    return new Set(
      ELEMENTS.filter((el) => {
        const localizedName = getElementName(el, language).toLowerCase();
        return (
          localizedName.includes(q) ||
          el.name.toLowerCase().includes(q) ||
          el.symbol.toLowerCase().includes(q) ||
          String(el.number) === q
        );
      }).map((el) => el.number)
    );
  }, [searchQuery, language]);

  const categoryCounts = useMemo(() => {
    const map = new Map<ElementCategory, { total: number; selected: number; numbers: number[] }>();
    for (const key of Object.keys(CATEGORY_META) as ElementCategory[]) {
      map.set(key, { total: 0, selected: 0, numbers: [] });
    }
    for (const el of ELEMENTS) {
      const entry = map.get(el.category)!;
      entry.total += 1;
      entry.numbers.push(el.number);
      if (selectedNumbers.has(el.number)) {
        entry.selected += 1;
      }
    }
    return map;
  }, [selectedNumbers]);

  const handleTilePointerDown = (e: React.PointerEvent, el: ChemicalElement) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const isSelected = selectedNumbers.has(el.number);
    const mode = isSelected ? 'remove' : 'add';
    dragModeRef.current = mode;
    setInspectedElement(el);
    setSelectionNotice(false);
    onSelectBatch([el.number], mode);
  };

  const handleTilePointerEnter = (el: ChemicalElement) => {
    setInspectedElement(el);
    if (dragModeRef.current) {
      onSelectBatch([el.number], dragModeRef.current);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchMatches && searchMatches.size > 0) {
      const firstMatchNum = Array.from(searchMatches)[0];
      onToggleElement(firstMatchNum);
      const found = ELEMENTS.find((el) => el.number === firstMatchNum);
      if (found) setInspectedElement(found);
    }
  };

  const handleCategoryClick = (cat: ElementCategory) => {
    const info = categoryCounts.get(cat);
    if (!info) return;
    const allSelected = info.selected === info.total;
    onSelectBatch(info.numbers, allSelected ? 'remove' : 'add');
    setSelectionNotice(false);
  };

  const handleToggleSubject = (subject: QuizSubject) => {
    const next = testSubjects.includes(subject)
      ? testSubjects.filter((s) => s !== subject)
      : [...testSubjects, subject];
    onChangeTestSubjects(next);
    if (next.length >= 2) {
      setSubjectNotice(false);
    }
  };

  const handleStartClick = () => {
    let blocked = false;
    if (selectedNumbers.size === 0) {
      setSelectionNotice(true);
      blocked = true;
    }
    if (testSubjects.length < 2) {
      setSubjectNotice(true);
      setIsSettingsOpen(true);
      blocked = true;
    }
    if (blocked) return;
    onStartQuiz();
  };

  const parsedFirstCount = useMemo(() => {
    const n = parseInt(firstCountInput, 10);
    if (Number.isNaN(n)) return lastFirstCountRef.current;
    return Math.min(118, Math.max(1, n));
  }, [firstCountInput]);

  const isFirstNActive = useMemo(() => {
    const n = selectedNumbers.size;
    if (n < 1 || n >= 118) return false;
    for (let i = 1; i <= n; i++) {
      if (!selectedNumbers.has(i)) return false;
    }
    return n === parsedFirstCount;
  }, [selectedNumbers, parsedFirstCount]);

  const applyFirstCount = (count: number) => {
    const clamped = Math.min(118, Math.max(1, count));
    lastFirstCountRef.current = clamped;
    setFirstCountInput(String(clamped));
    onSetSelection(Array.from({ length: clamped }, (_, i) => i + 1));
    setSelectionNotice(false);
  };

  const handleFirstCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    setFirstCountInput(raw);
    if (!raw) return;
    const n = parseInt(raw, 10);
    if (!Number.isNaN(n) && n >= 1) {
      const clamped = Math.min(118, n);
      lastFirstCountRef.current = clamped;
      if (n > 118) {
        setFirstCountInput('118');
      }
      onSetSelection(Array.from({ length: clamped }, (_, i) => i + 1));
      setSelectionNotice(false);
    }
  };

  const handleFirstCountBlur = () => {
    const n = parseInt(firstCountInput, 10);
    if (Number.isNaN(n) || n < 1) {
      setFirstCountInput(String(lastFirstCountRef.current));
    } else {
      const clamped = Math.min(118, n);
      lastFirstCountRef.current = clamped;
      setFirstCountInput(String(clamped));
    }
  };

  const activePresetId = useMemo(() => {
    for (const preset of STUDY_PRESETS) {
      if (
        preset.numbers.length === selectedNumbers.size &&
        preset.numbers.every((n) => selectedNumbers.has(n))
      ) {
        return preset.id;
      }
    }
    return null;
  }, [selectedNumbers]);

  const inspectedMeta = inspectedElement ? CATEGORY_META[inspectedElement.category] : null;
  const inspectedCatLabel = inspectedElement
    ? t.categories[inspectedElement.category].label
    : '';

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 space-y-4">
      {/* Workspace Header & Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-[28px] font-semibold tracking-tight text-slate-50 text-balance">
            {t.table.title}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {t.table.subtitle}
          </p>
        </div>

        {/* Preset & Search Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={t.table.findPlaceholder}
              aria-label={t.table.findPlaceholder}
              className="w-48 rounded-lg border border-slate-800 bg-[#10151E] py-1.5 pl-8 pr-7 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label={t.table.clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-800/80 bg-[#10151E] p-1">
            <div
              title={m.firstNDescription(parsedFirstCount)}
              className={`inline-flex items-center rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                isFirstNActive
                  ? 'bg-cyan-400/15 text-cyan-300 border-cyan-400/30'
                  : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-[#161D2A]'
              }`}
            >
              <button
                type="button"
                onClick={() => applyFirstCount(parsedFirstCount)}
                className="pl-2.5 pr-1.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-l-md"
              >
                {m.firstPrefix}
              </button>
              <input
                type="text"
                inputMode="numeric"
                maxLength={3}
                value={firstCountInput}
                onChange={handleFirstCountChange}
                onBlur={handleFirstCountBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyFirstCount(parsedFirstCount);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    applyFirstCount(parsedFirstCount + 1);
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    applyFirstCount(parsedFirstCount - 1);
                  }
                }}
                aria-label={m.firstNDescription(parsedFirstCount)}
                className={`w-9 mr-1 rounded border px-1 py-0.5 text-center font-mono text-xs tabular-nums transition-colors focus:border-cyan-400 focus:outline-none ${
                  isFirstNActive
                    ? 'border-cyan-400/40 bg-[#080B10]/70 text-cyan-200 font-semibold'
                    : 'border-slate-700/70 bg-[#080B10]/80 text-slate-200'
                }`}
              />
            </div>

            {STUDY_PRESETS.filter(
              (preset) =>
                preset.id !== 'noble-halogens' && preset.id !== 'period-4-metals'
            ).map((preset) => {
              const isActive = activePresetId === preset.id;
              const presetText = t.presets[preset.id];
              return (
                <button
                  key={preset.id}
                  type="button"
                  title={presetText?.description ?? preset.description}
                  onClick={() => {
                    onSetSelection(preset.numbers);
                    setSelectionNotice(false);
                  }}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    isActive
                      ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-400/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#161D2A] border border-transparent'
                  }`}
                >
                  {presetText?.label ?? preset.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              onClearSelection();
              setSelectionNotice(false);
            }}
            disabled={selectedNumbers.size === 0}
            className="rounded-lg border border-slate-800 bg-[#10151E] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-[#161D2A] hover:text-slate-100 disabled:opacity-40 transition-colors whitespace-nowrap shrink-0"
          >
            {t.table.clear}
          </button>
        </div>
      </div>

      {/* Live Element Inspector + Selection Readiness Strip + Inline Flashcard Settings */}
      <div className="sticky top-16 z-20 flex flex-col gap-3 rounded-xl border border-slate-800/80 bg-[#10151E]/95 backdrop-blur-md px-4 py-3 shadow-lg shadow-black/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-h-[44px]">
          {inspectedElement && inspectedMeta ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 min-w-0">
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-xs text-slate-400 tabular-nums w-7">
                  #{inspectedElement.number}
                </span>
                <span className="font-display text-2xl font-bold text-slate-50 w-9">
                  {inspectedElement.symbol}
                </span>
                <span className="text-base font-semibold text-slate-100">
                  {getElementName(inspectedElement, language)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="font-medium text-slate-200">
                  {m.labels[getMetallicType(inspectedElement.category)]}
                </span>
                <span aria-hidden="true">·</span>
                <span className={inspectedMeta.accentText}>{inspectedCatLabel}</span>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-cyan-300">
                  {t.table.periodLabel(inspectedElement.period)} · {t.table.groupLabel(getCasGroupLabel(inspectedElement.group))}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{inspectedElement.atomicMass} u</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{inspectedElement.electronConfig}</span>
                <span aria-hidden="true">·</span>
                <span>{t.states[inspectedElement.state]}</span>
                {language === 'en' && (
                  <>
                    <span aria-hidden="true" className="hidden 2xl:inline">·</span>
                    <span className="hidden 2xl:inline text-slate-400 truncate max-w-sm">
                      {inspectedElement.hint}
                    </span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">{t.table.hoverPrompt}</p>
          )}

          <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end border-t border-slate-800/70 pt-2.5 sm:border-t-0 sm:pt-0">
            <div className="text-xs text-slate-300 tabular-nums">
              <span className="font-mono font-semibold text-cyan-300">
                {selectedNumbers.size}
              </span>{' '}
              <span className="text-slate-400">
                {selectedNumbers.size === 1
                  ? t.table.elementSelectedSingular
                  : t.table.elementsSelectedPlural}
              </span>
              {selectionNotice && selectedNumbers.size === 0 && (
                <span className="ml-2 text-amber-400 font-medium">
                  {t.table.selectAtLeastOne}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              aria-expanded={isSettingsOpen}
              className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                isSettingsOpen
                  ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-200'
                  : 'border-slate-700/80 bg-[#161D2A] text-slate-100 hover:border-slate-600 hover:bg-slate-800'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-cyan-300 shrink-0" aria-hidden="true" />
              <span>{m.flashcardSettings}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-150 shrink-0 ${
                  isSettingsOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        {isSettingsOpen && (
          <div
            role="region"
            aria-label={m.flashcardSettings}
            className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-3"
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 max-w-full">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 mr-0.5">
                  {m.testOnHeading}:
                </span>
                {getQuizSubjectOptions(t.flashcards.symbolToName, language).map((opt) => {
                  const checked = testSubjects.includes(opt.id);
                  return (
                    <label
                      key={opt.id}
                      className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-medium cursor-pointer select-none transition-colors whitespace-nowrap shrink-0 ${
                        checked
                          ? 'border-cyan-400/50 bg-cyan-400/15 text-cyan-200'
                          : 'border-slate-800 bg-[#080B10] text-slate-300 hover:border-slate-700 hover:text-slate-100'
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
                {testSubjects.length < 2 && (
                  <span
                    className={`text-[11px] font-medium ${
                      subjectNotice ? 'text-amber-400' : 'text-amber-300/85'
                    }`}
                  >
                    {getMinTwoSubjectsLabel(language)}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 mr-0.5">
                  {m.studyModeHeading}:
                </span>
                {(
                  [
                    { id: 'flip', label: t.flashcards.flipCard },
                    { id: 'type', label: t.flashcards.typeAnswer },
                    { id: 'choice', label: t.flashcards.multipleChoice },
                  ] as const
                ).map((opt) => {
                  const active = quizMode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onChangeQuizMode(opt.id)}
                      className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? 'border-cyan-400/50 bg-cyan-400/15 text-cyan-200'
                          : 'border-slate-800 bg-[#080B10] text-slate-300 hover:border-slate-700 hover:text-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleStartClick}
                className={`rounded-md px-3.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  selectedNumbers.size > 0 && testSubjects.length >= 2
                    ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-300'
                    : 'bg-[#161D2A] text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {selectedNumbers.size > 0
                  ? t.nav.startFlashcardsCount(selectedNumbers.size)
                  : t.nav.startFlashcards}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 18-Column Periodic Table Stage */}
      <div className="rounded-xl border border-slate-800/80 bg-[#0B0F17] p-3 sm:p-4 overflow-x-auto">
        <div
          dir="ltr"
          className="min-w-[1000px] select-none grid gap-1"
          style={{
            gridTemplateColumns: '22px repeat(18, minmax(0, 1fr))',
            gridTemplateRows: '34px repeat(7, minmax(0, 1fr)) 14px repeat(2, minmax(0, 1fr))',
          }}
        >
          {/* Stepped Group Headers (IUPAC 1–18 above CAS A/B, placed right above each block's top element) */}
          {[1, 2, 3, 4, 5, 6, 7, 11, 12, 13, 14, 15, 16, 17, 18].map((grp) => {
            const isActiveGroup = inspectedElement?.group === grp;
            const headerRow =
              grp === 1 || grp === 18
                ? 1
                : grp === 2 || grp >= 13
                ? 2
                : 4;
            return (
              <div
                key={`grp-${grp}`}
                style={{ gridRow: headerRow, gridColumn: grp + 1 }}
                className={`flex flex-col items-center justify-end pb-1 font-mono text-[10px] leading-tight tabular-nums transition-colors ${
                  isActiveGroup ? 'text-cyan-300 font-semibold' : 'text-slate-400'
                }`}
              >
                <span>{grp}</span>
                <span className={isActiveGroup ? 'text-cyan-200' : 'text-slate-500'}>
                  {getCasGroupLabel(grp)}
                </span>
              </div>
            );
          })}

          {/* Group 8, 9, 10 with Spanning 8B Bracket above Fe, Co, Ni */}
          <div
            style={{ gridRow: 4, gridColumn: '9 / span 3' }}
            className="flex flex-col justify-end pb-1 font-mono text-[10px] leading-tight tabular-nums"
          >
            <div className="grid grid-cols-3 text-center">
              {[8, 9, 10].map((grp) => {
                const isActiveGroup = inspectedElement?.group === grp;
                return (
                  <span
                    key={`grp-${grp}`}
                    className={`transition-colors ${
                      isActiveGroup ? 'text-cyan-300 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    {grp}
                  </span>
                );
              })}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 px-2">
              <span
                aria-hidden="true"
                className={`h-1.5 w-px shrink-0 transition-colors ${
                  inspectedElement && inspectedElement.group >= 8 && inspectedElement.group <= 10
                    ? 'bg-cyan-400/60'
                    : 'bg-slate-600'
                }`}
              />
              <span
                aria-hidden="true"
                className={`h-px flex-1 transition-colors ${
                  inspectedElement && inspectedElement.group >= 8 && inspectedElement.group <= 10
                    ? 'bg-cyan-400/60'
                    : 'bg-slate-600'
                }`}
              />
              <span
                className={`shrink-0 transition-colors ${
                  inspectedElement && inspectedElement.group >= 8 && inspectedElement.group <= 10
                    ? 'text-cyan-200 font-semibold'
                    : 'text-slate-500'
                }`}
              >
                8B
              </span>
              <span
                aria-hidden="true"
                className={`h-px flex-1 transition-colors ${
                  inspectedElement && inspectedElement.group >= 8 && inspectedElement.group <= 10
                    ? 'bg-cyan-400/60'
                    : 'bg-slate-600'
                }`}
              />
              <span
                aria-hidden="true"
                className={`h-1.5 w-px shrink-0 transition-colors ${
                  inspectedElement && inspectedElement.group >= 8 && inspectedElement.group <= 10
                    ? 'bg-cyan-400/60'
                    : 'bg-slate-600'
                }`}
              />
            </div>
          </div>

          {/* Period (Row) Numbers 1–7 */}
          {Array.from({ length: 7 }, (_, i) => i + 1).map((per) => {
            const isActivePeriod = inspectedElement?.period === per;
            return (
              <div
                key={`per-${per}`}
                style={{ gridRow: per + 1, gridColumn: 1 }}
                className={`flex items-center justify-center font-mono text-[10px] tabular-nums transition-colors ${
                  isActivePeriod ? 'text-cyan-300 font-semibold' : 'text-slate-500'
                }`}
              >
                {per}
              </div>
            );
          })}

          {/* f-Block Range Placeholders in Period 6 & 7 Group 3 */}
          <button
            type="button"
            style={{ gridRow: 7, gridColumn: 4 }}
            onClick={() => handleCategoryClick('lanthanide')}
            onMouseEnter={() => setHoveredCategory('lanthanide')}
            onMouseLeave={() => setHoveredCategory(null)}
            title={t.table.lanthanidesLabel}
            className="flex flex-col items-center justify-center rounded-md border border-dashed border-cyan-800/60 bg-cyan-950/20 px-1 py-1.5 text-center transition-colors hover:border-cyan-400/80 hover:bg-cyan-950/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <span className="font-mono text-[10px] font-medium text-cyan-300 tabular-nums">
              57–71
            </span>
            <span className="text-[9px] text-cyan-400/80 truncate max-w-full">
              La–Lu
            </span>
          </button>

          <button
            type="button"
            style={{ gridRow: 8, gridColumn: 4 }}
            onClick={() => handleCategoryClick('actinide')}
            onMouseEnter={() => setHoveredCategory('actinide')}
            onMouseLeave={() => setHoveredCategory(null)}
            title={t.table.actinidesLabel}
            className="flex flex-col items-center justify-center rounded-md border border-dashed border-orange-800/60 bg-orange-950/20 px-1 py-1.5 text-center transition-colors hover:border-orange-400/80 hover:bg-orange-950/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <span className="font-mono text-[10px] font-medium text-orange-300 tabular-nums">
              89–103
            </span>
            <span className="text-[9px] text-orange-400/80 truncate max-w-full">
              Ac–Lr
            </span>
          </button>

          {/* Row Labels for Lanthanides & Actinides */}
          <div
            style={{ gridRow: 10, gridColumn: '2 / span 3' }}
            className="flex items-center justify-end pr-2.5 text-[11px] font-medium text-slate-400"
          >
            {t.table.lanthanidesLabel}
          </div>
          <div
            style={{ gridRow: 11, gridColumn: '2 / span 3' }}
            className="flex items-center justify-end pr-2.5 text-[11px] font-medium text-slate-400"
          >
            {t.table.actinidesLabel}
          </div>

          {/* All 118 Element Tiles */}
          {ELEMENTS.map((el) => {
            const meta = CATEGORY_META[el.category];
            const isSelected = selectedNumbers.has(el.number);
            const isMetalloid = el.category === 'metalloid';
            const metalloidSpotlight = highlightMetalloids || hoverMetalloids;
            const matchesSearch = searchMatches ? searchMatches.has(el.number) : true;
            const matchesCategory = hoveredCategory ? el.category === hoveredCategory : true;
            const matchesMetalloid = metalloidSpotlight ? isMetalloid : true;
            const isDimmed = !matchesSearch || !matchesCategory || !matchesMetalloid;
            const localizedName = getElementName(el, language);
            const boundary = showDividingLine ? METAL_NONMETAL_STAIRCASE[el.number] : undefined;
            const lineTone = highlightDividingLine
              ? 'bg-slate-300/75'
              : 'bg-slate-400/45';

            return (
              <button
                key={el.number}
                type="button"
                style={{ gridRow: el.gridRow + 1, gridColumn: el.gridCol + 1 }}
                onPointerDown={(e) => handleTilePointerDown(e, el)}
                onPointerEnter={() => handleTilePointerEnter(el)}
                onFocus={() => setInspectedElement(el)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setInspectedElement(el);
                    onToggleElement(el.number);
                    setSelectionNotice(false);
                  }
                }}
                aria-pressed={isSelected}
                aria-label={`${localizedName}, ${el.symbol}, #${el.number}`}
                className={`group relative flex flex-col justify-between rounded-md border p-1.5 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 min-h-[54px] ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-500/20 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.4)]'
                    : `${meta.tileBg} ${meta.tileBorder} ${meta.tileHoverBorder} ${
                        isMetalloid
                          ? metalloidSpotlight
                            ? 'ring-1 ring-teal-400/80 shadow-[0_0_12px_rgba(45,212,191,0.16)]'
                            : 'ring-1 ring-inset ring-teal-400/25'
                          : ''
                      }`
                } ${isDimmed ? 'opacity-25' : 'opacity-100'}`}
              >
                {/* Metal / Nonmetal Dividing Staircase Segments */}
                {boundary?.left && (
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute -left-[4px] w-[2px] z-10 transition-colors ${lineTone} ${
                      boundary.startTop ? '-top-[1px]' : '-top-[4px]'
                    } ${boundary.endBottom ? '-bottom-[1px]' : '-bottom-[4px]'}`}
                  />
                )}
                {boundary?.bottom && (
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute -bottom-[4px] h-[2px] z-10 transition-colors ${lineTone} ${
                      boundary.left ? '-left-[4px]' : '-left-[1px]'
                    } ${el.number === 1 ? '-right-[1px]' : '-right-[4px]'}`}
                  />
                )}

                <div className="flex items-start justify-between gap-0.5 w-full">
                  <span
                    className={`font-mono text-[10px] leading-none tabular-nums ${
                      isSelected ? 'text-cyan-200 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    {el.number}
                  </span>
                  {isSelected ? (
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-sm bg-cyan-400 text-slate-950 shrink-0">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </span>
                  ) : isMetalloid ? (
                    <span
                      aria-hidden="true"
                      className="mt-0.5 mr-0.5 h-1.5 w-1.5 rotate-45 bg-teal-400/85 shrink-0"
                    />
                  ) : null}
                </div>

                {/* Chemical Symbol — always universal IUPAC symbol */}
                <span
                  className={`font-display text-sm xl:text-base font-bold leading-tight tracking-tight ${
                    isSelected ? 'text-white' : meta.accentText
                  }`}
                >
                  {el.symbol}
                </span>

                <span
                  className={`text-[9px] leading-none truncate w-full ${
                    isSelected ? 'text-cyan-100' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {localizedName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Category Legend */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-medium text-slate-400 mr-1">
          {t.table.toggleFamily}
        </span>
        {(Object.keys(CATEGORY_META) as ElementCategory[]).map((catKey) => {
          const meta = CATEGORY_META[catKey];
          const counts = categoryCounts.get(catKey);
          const allSelected = counts ? counts.selected === counts.total : false;
          const someSelected = counts ? counts.selected > 0 && !allSelected : false;

          return (
            <button
              key={catKey}
              type="button"
              onClick={() => handleCategoryClick(catKey)}
              onMouseEnter={() => setHoveredCategory(catKey)}
              onMouseLeave={() => setHoveredCategory(null)}
              className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                allSelected
                  ? 'border-cyan-400/70 bg-cyan-950/40 text-cyan-200'
                  : someSelected
                  ? 'border-slate-700 bg-[#161D2A] text-slate-200'
                  : 'border-slate-800/80 bg-[#10151E] text-slate-300 hover:border-slate-700 hover:text-slate-100'
              }`}
            >
              <span className={`h-2 w-2 rounded-xs ${meta.swatchBg} shrink-0`} aria-hidden="true" />
              <span>{t.categories[catKey].shortLabel}</span>
              {counts && (
                <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                  {counts.selected}/{counts.total}
                </span>
              )}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setHighlightMetalloids((prev) => !prev)}
          onMouseEnter={() => setHoverMetalloids(true)}
          onMouseLeave={() => setHoverMetalloids(false)}
          aria-pressed={highlightMetalloids}
          className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            highlightMetalloids
              ? 'border-teal-400/55 bg-teal-950/35 text-teal-200'
              : 'border-slate-800/80 bg-[#10151E] text-slate-300 hover:border-slate-700 hover:text-slate-100'
          }`}
        >
          <span className="h-2 w-2 rotate-45 bg-teal-400 shrink-0" aria-hidden="true" />
          <span>{m.showMetalloidsLabel}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowDividingLine((prev) => !prev)}
          onMouseEnter={() => setHighlightDividingLine(true)}
          onMouseLeave={() => setHighlightDividingLine(false)}
          aria-pressed={showDividingLine}
          className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            showDividingLine
              ? 'border-slate-700 bg-[#161D2A] text-slate-300'
              : 'border-slate-800/80 bg-[#10151E] text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <span className="h-0.5 w-3.5 bg-slate-400/70 shrink-0" aria-hidden="true" />
          <span>{m.dividingLineLabel}</span>
        </button>
      </div>
    </section>
  );
};
