import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { AgentActivity } from '../../types';
import {
  Sparkles,
  Bot,
  UserCheck,
  CalendarClock,
  Briefcase,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const AiProjectManagerPanel: React.FC = () => {
  const {
    agentActivities,
    t,
    runFullAIAnalysis,
    isAnalyzing,
    openAllocationModal,
    tasks,
  } = useProject();

  const [filterAgent, setFilterAgent] = useState<'all' | 'project_manager' | 'task_allocation' | 'scheduler'>('all');

  const filteredActivities = agentActivities.filter((act) => {
    if (filterAgent === 'all') return true;
    return act.agent === filterAgent;
  });

  const getAgentBadge = (agent: AgentActivity['agent']) => {
    switch (agent) {
      case 'project_manager':
        return {
          name: 'PM Agent',
          color: 'text-blue-600 dark:text-blue-400',
          icon: Briefcase,
        };
      case 'task_allocation':
        return {
          name: 'Allocation Agent',
          color: 'text-emerald-600 dark:text-emerald-400',
          icon: UserCheck,
        };
      case 'scheduler':
        return {
          name: 'Scheduler Agent',
          color: 'text-amber-600 dark:text-amber-400',
          icon: CalendarClock,
        };
    }
  };

  const getSeverityIcon = (severity: AgentActivity['severity']) => {
    switch (severity) {
      case 'alert':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'success':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      default:
        return <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
  };

  return (
    <aside className="w-80 shrink-0 flex flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[calc(100vh-57px)]">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {t('aiProjectManager')}
              </h2>
              <span className="text-[10px] text-slate-500">Autonomous Orchestration</span>
            </div>
          </div>

          <button
            onClick={runFullAIAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-md shadow-xs transition-colors whitespace-nowrap"
          >
            <Sparkles className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing...' : t('runAiAnalysis')}</span>
          </button>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] font-medium text-slate-600 dark:text-slate-400 mt-3">
          <button
            onClick={() => setFilterAgent('all')}
            className={`flex-1 py-1 px-2 rounded-md transition-colors whitespace-nowrap ${
              filterAgent === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterAgent('project_manager')}
            className={`flex-1 py-1 px-1.5 rounded-md transition-colors whitespace-nowrap ${
              filterAgent === 'project_manager'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            PM
          </button>
          <button
            onClick={() => setFilterAgent('task_allocation')}
            className={`flex-1 py-1 px-1.5 rounded-md transition-colors whitespace-nowrap ${
              filterAgent === 'task_allocation'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Allocation
          </button>
          <button
            onClick={() => setFilterAgent('scheduler')}
            className={`flex-1 py-1 px-1.5 rounded-md transition-colors whitespace-nowrap ${
              filterAgent === 'scheduler'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Scheduler
          </button>
        </div>
      </div>

      {/* Activities Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-10 px-4 text-xs text-slate-400">
            No agent activities recorded for this filter.
          </div>
        ) : (
          filteredActivities.map((act) => {
            const agentMeta = getAgentBadge(act.agent);
            const AgentIcon = agentMeta.icon;
            const linkedTask = act.taskId ? tasks.find((t) => t.id === act.taskId) : undefined;

            return (
              <div
                key={act.id}
                className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <AgentIcon className={`w-3.5 h-3.5 ${agentMeta.color}`} />
                    <span className={`text-[11px] font-semibold ${agentMeta.color}`}>
                      {agentMeta.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                    {act.timestamp}
                  </span>
                </div>

                <div className="flex items-start gap-1.5 mb-1">
                  {getSeverityIcon(act.severity)}
                  <h4 className="text-xs font-medium text-slate-900 dark:text-slate-100 leading-snug">
                    {act.action}
                  </h4>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                  {act.detail}
                </p>

                {linkedTask && linkedTask.status === 'backlog' && (
                  <button
                    onClick={() => openAllocationModal(linkedTask)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 pt-1 border-t border-slate-200/60 dark:border-slate-700/60"
                  >
                    <span>Review Allocation</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Human in the loop reassurance footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-[10px] text-slate-500">
        <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
          Orchestration Invariant:
        </span>
        No automated assignments can overwrite manager authority.
      </div>
    </aside>
  );
};
