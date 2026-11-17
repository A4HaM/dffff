import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Globe, Search, X } from 'lucide-react';
import {
  ALL_LANGUAGES,
  getLanguageMeta,
  getTranslations,
  SupportedLanguage,
} from '../i18n/translations';

export type AppView = 'table' | 'flashcards' | 'index';

interface TopBarProps {
  activeView: AppView;
  onChangeView: (view: AppView) => void;
  selectedCount: number;
  onStartQuiz: () => void;
  language: SupportedLanguage;
  onChangeLanguage: (lang: SupportedLanguage) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  onChangeView,
  selectedCount,
  onStartQuiz,
  language,
  onChangeLanguage,
}) => {
  const t = getTranslations(language).nav;
  const activeLangMeta = getLanguageMeta(language);

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [langQuery, setLangQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isLangOpen) return;
    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 10);

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLangOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLangOpen]);

  const filteredLanguages = useMemo(() => {
    const q = langQuery.trim().toLowerCase();
    if (!q) return ALL_LANGUAGES;
    return ALL_LANGUAGES.filter(
      (lang) =>
        lang.nativeName.toLowerCase().includes(q) ||
        lang.englishName.toLowerCase().includes(q) ||
        lang.id.toLowerCase().includes(q)
    );
  }, [langQuery]);

  const handleSelectLanguage = (langId: SupportedLanguage) => {
    onChangeLanguage(langId);
    setIsLangOpen(false);
    setLangQuery('');
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800/80 bg-[#080B10]/95 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => onChangeView('table')}
          className="font-display text-lg font-bold tracking-tight text-slate-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded"
        >
          Elementa
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium" aria-label="Primary navigation">
          <button
            type="button"
            onClick={() => onChangeView('table')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-t ${
              activeView === 'table'
                ? 'border-cyan-400 text-slate-50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.periodicTable}
          </button>
          <button
            type="button"
            onClick={() => onChangeView('index')}
            className={`hidden md:inline-block whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-t ${
              activeView === 'index'
                ? 'border-cyan-400 text-slate-50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.elementIndex}
          </button>
        </nav>

        {/* Zone 3: Searchable Language Picker + Primary CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsLangOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={isLangOpen}
              aria-label={t.languageLabel}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-[#10151E] px-3 py-2 text-xs font-medium text-slate-200 hover:border-slate-700 hover:bg-[#161D2A] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              <span className="max-w-[110px] truncate">{activeLangMeta.nativeName}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-150 shrink-0 ${
                  isLangOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>

            {isLangOpen && (
              <div
                dir="ltr"
                className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl border border-slate-700/80 bg-[#10151E] shadow-2xl overflow-hidden z-50"
              >
                {/* Search Input Inside Language Popover */}
                <div className="border-b border-slate-800/80 p-2.5">
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
                      aria-hidden="true"
                    />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={langQuery}
                      onChange={(e) => setLangQuery(e.target.value)}
                      placeholder={t.searchLanguagePlaceholder}
                      aria-label={t.searchLanguagePlaceholder}
                      className="w-full rounded-lg border border-slate-800 bg-[#080B10] py-1.5 pl-8 pr-7 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                    {langQuery && (
                      <button
                        type="button"
                        onClick={() => setLangQuery('')}
                        aria-label="Clear language search"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Language List */}
                <ul
                  role="listbox"
                  aria-label={t.languageLabel}
                  className="max-h-72 overflow-y-auto divide-y divide-slate-800/40 p-1"
                >
                  {filteredLanguages.length === 0 ? (
                    <li className="px-3 py-6 text-center text-xs text-slate-400">
                      {t.noLanguageResults}
                    </li>
                  ) : (
                    filteredLanguages.map((lang) => {
                      const isActive = lang.id === language;
                      return (
                        <li key={lang.id}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            onClick={() => handleSelectLanguage(lang.id)}
                            className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                              isActive
                                ? 'bg-cyan-500/15 text-cyan-200'
                                : 'text-slate-200 hover:bg-[#161D2A]'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-semibold truncate">
                                {lang.nativeName}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">
                                {lang.englishName}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono text-[10px] uppercase text-slate-500">
                                {lang.id}
                              </span>
                              {isActive && (
                                <Check className="h-3.5 w-3.5 text-cyan-400" />
                              )}
                            </div>
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>
            )}
          </div>

          {activeView === 'flashcards' ? (
            <button
              type="button"
              onClick={() => onChangeView('table')}
              className="px-4 py-2 text-xs font-semibold text-slate-100 bg-[#161D2A] border border-slate-700/80 rounded-lg hover:bg-slate-800 hover:border-slate-600 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              {t.editSelection}
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartQuiz}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors whitespace-nowrap shrink-0 tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080B10]"
            >
              {selectedCount > 0 ? t.startFlashcardsCount(selectedCount) : t.startFlashcards}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
