import React from 'react';
import { useProject } from '../../context/ProjectContext';
import {
  Sparkles,
  Layers,
  Globe,
  Sun,
  Moon,
  RotateCcw,
  PlusCircle,
  FolderKanban,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    project,
    projects,
    switchProject,
    t,
    language,
    setLanguage,
    theme,
    toggleTheme,
    runFullAIAnalysis,
    isAnalyzing,
    resetToDemoData,
    setActiveTab,
  } = useProject();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-6 px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
      {/* Zone 1: Brand wordmark & Project selector */}
      <div className="flex items-center gap-6 shrink-0">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              {t('appTitle')}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
              {t('appSubtitle')}
            </span>
          </div>
        </div>

        {/* Project Switcher */}
        <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-800">
          <FolderKanban className="w-4 h-4 text-slate-400" />
          <select
            value={project.id}
            onChange={(e) => switchProject(e.target.value)}
            className="text-xs font-semibold text-slate-700 dark:text-slate-200 bg-transparent border-0 cursor-pointer focus:ring-0 focus:outline-hidden py-1 pr-6"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900">
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-300">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap"
        >
          {t('dashboard')}
        </button>
        <button
          onClick={() => setActiveTab('create_project')}
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap"
        >
          {t('createProject')}
        </button>
        <button
          onClick={() => setActiveTab('scheduler')}
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap"
        >
          {t('scheduler')}
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap"
        >
          {t('team')}
        </button>
      </nav>

      {/* Zone 3: Actions (Run AI Analysis, Lang, Theme, Reset) */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Reset Demo Data */}
        <button
          onClick={resetToDemoData}
          title={t('resetDemo')}
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Language switcher */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'fa' : 'en')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap"
          title="Switch Language"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'فارسی' : 'EN'}</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          title="Toggle Light/Dark"
        >
          {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
        </button>

        {/* Primary Action Button: Run AI Analysis */}
        <button
          onClick={runFullAIAnalysis}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs transition-all whitespace-nowrap"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? t('analyzingAgents') : t('runAiAnalysis')}</span>
        </button>
      </div>
    </header>
  );
};
