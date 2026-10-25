import React from 'react';
import { useProject } from '../../context/ProjectContext';
import {
  KanbanSquare,
  PlusCircle,
  CalendarDays,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FolderDot,
} from 'lucide-react';

export const SidebarNav: React.FC = () => {
  const { activeTab, setActiveTab, t, project, healthSummary } = useProject();

  const navItems = [
    {
      id: 'dashboard' as const,
      label: t('dashboard'),
      icon: KanbanSquare,
      badge: healthSummary.totalTasks,
    },
    {
      id: 'create_project' as const,
      label: t('createProject'),
      icon: PlusCircle,
    },
    {
      id: 'scheduler' as const,
      label: t('scheduler'),
      icon: CalendarDays,
      badge: healthSummary.overdueTasks > 0 ? healthSummary.overdueTasks : undefined,
      badgeColor: 'text-rose-600 dark:text-rose-400 font-mono',
    },
    {
      id: 'team' as const,
      label: t('team'),
      icon: Users,
    },
  ];

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 min-h-[calc(100vh-57px)]">
      <div className="space-y-6">
        {/* Project Context Box */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1">
            <FolderDot className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="truncate">{project.name}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {project.description}
          </p>

          <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-mono tabular-nums">
            <span>{t('overallProgress')}</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {healthSummary.overallProgress}%
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1 overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${healthSummary.overallProgress}%` }}
            />
          </div>
        </div>

        {/* Navigation list */}
        <div className="space-y-1">
          <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Workspaces
          </span>
          <div className="pt-1.5 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-[11px] tabular-nums ${item.badgeColor || 'text-slate-500'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Active Agents Legend */}
        <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
            Active Multi-Agent Core
          </span>
          <div className="space-y-2 text-[11px]">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
              <div>
                <span className="font-medium text-slate-800 dark:text-slate-200">Agent 1: PM Agent</span>
                <p className="text-[10px] text-slate-500">Requirements & Breakdown</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
              <div>
                <span className="font-medium text-slate-800 dark:text-slate-200">Agent 2: Allocation</span>
                <p className="text-[10px] text-slate-500">Skill & Capacity Match</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0" />
              <div>
                <span className="font-medium text-slate-800 dark:text-slate-200">Agent 3: Scheduler</span>
                <p className="text-[10px] text-slate-500">Timeline & Overdue Alerts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Human-in-the-Loop assurance footer */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium mb-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Human-in-the-Loop</span>
        </div>
        <p className="text-[10px] leading-tight">
          AI suggests allocations; final assignment requires project manager approval.
        </p>
      </div>
    </aside>
  );
};
