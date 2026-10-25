import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { calculateTaskDeadlineStatus, auditProjectSchedule } from '../../agents/schedulerAgent';
import { Task, TaskStatus } from '../../types';
import {
  CalendarDays,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  GitBranch,
  BarChart3,
  Calendar,
  Layers,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const SchedulerView: React.FC = () => {
  const { tasks, teamMembers, openEditModal, updateTaskStatus, t } = useProject();
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');

  const scheduleAudit = auditProjectSchedule(tasks);

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  const getAssigneeName = (assigneeId: string | null) => {
    if (!assigneeId) return 'Unassigned';
    const member = teamMembers.find((m) => m.id === assigneeId);
    return member ? member.name : 'Unknown';
  };

  // Timeline date range calculations
  const allDates = tasks.flatMap((t) => [new Date(t.startDate).getTime(), new Date(t.dueDate).getTime()]);
  const minTime = allDates.length > 0 ? Math.min(...allDates) : Date.now();
  const maxTime = allDates.length > 0 ? Math.max(...allDates) : Date.now() + 86400000 * 30;
  const timeSpan = Math.max(86400000 * 14, maxTime - minTime);

  const getTimelineBarStyles = (startDate: string, dueDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(dueDate).getTime();
    const leftPercent = Math.max(0, Math.min(95, ((start - minTime) / timeSpan) * 100));
    const widthPercent = Math.max(4, Math.min(100 - leftPercent, ((end - start) / timeSpan) * 100));
    return { left: `${leftPercent}%`, width: `${widthPercent}%` };
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('scheduler')}
            </h1>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              Agent 3: Tracker Active
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time deadline auditing, milestone sequencing, and dependency monitoring.
          </p>
        </div>

        {/* View mode toggle & filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t('timelineView')}
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t('listView')}
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Statuses</option>
            <option value="backlog">{t('backlog')}</option>
            <option value="assigned">{t('assigned')}</option>
            <option value="in_progress">{t('inProgress')}</option>
            <option value="blocked">{t('blocked')}</option>
            <option value="done">{t('done')}</option>
          </select>
        </div>
      </div>

      {/* Scheduler Alert Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overdue alert card */}
        <div className={`p-4 rounded-xl border ${
          scheduleAudit.overdueTasks.length > 0
            ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>Overdue Tasks</span>
            </span>
            <span className="text-base font-bold font-mono text-rose-700 dark:text-rose-400 tabular-nums">
              {scheduleAudit.overdueTasks.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            {scheduleAudit.overdueTasks.length > 0
              ? `${scheduleAudit.overdueTasks.map((t) => t.title).join(', ')} require urgent replanning.`
              : 'Zero tasks overdue.'}
          </p>
        </div>

        {/* Approaching deadlines card */}
        <div className={`p-4 rounded-xl border ${
          scheduleAudit.approachingDeadlineTasks.length > 0
            ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>Due Soon (≤ 72h)</span>
            </span>
            <span className="text-base font-bold font-mono text-amber-700 dark:text-amber-400 tabular-nums">
              {scheduleAudit.approachingDeadlineTasks.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            {scheduleAudit.approachingDeadlineTasks.length > 0
              ? `${scheduleAudit.approachingDeadlineTasks.length} tasks scheduled to complete within 3 days.`
              : 'No immediate deadlines in the next 3 days.'}
          </p>
        </div>

        {/* Hours variance card */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4" />
              <span>{t('hoursProgress')}</span>
            </span>
            <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 tabular-nums">
              {scheduleAudit.hoursVariance.totalActual}h / {scheduleAudit.hoursVariance.totalEstimated}h
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all"
              style={{
                width: `${Math.min(
                  100,
                  Math.round(
                    (scheduleAudit.hoursVariance.totalActual /
                      Math.max(1, scheduleAudit.hoursVariance.totalEstimated)) *
                      100
                  )
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main View: Timeline or Table */}
      {viewMode === 'timeline' ? (
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Interactive Gantt / Sequence Track
            </span>
            <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Done
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 inline-block" /> In Progress
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" /> Overdue / Blocked
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {filteredTasks.map((task) => {
              const deadline = calculateTaskDeadlineStatus(task);
              const barStyles = getTimelineBarStyles(task.startDate, task.dueDate);
              const hasDependencies = task.dependencies && task.dependencies.length > 0;

              return (
                <div
                  key={task.id}
                  onClick={() => openEditModal(task)}
                  className="group cursor-pointer p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-100 dark:border-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {task.title}
                      </span>
                      <span className="text-[11px] text-slate-400">· {getAssigneeName(task.assigneeId)}</span>
                      {hasDependencies && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono flex items-center gap-0.5">
                          <GitBranch className="w-3 h-3" />
                          <span>dep ({task.dependencies.length})</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[11px] tabular-nums">
                      {deadline.isOverdue ? (
                        <span className="text-rose-600 dark:text-rose-400 font-bold">
                          Overdue ({task.dueDate})
                        </span>
                      ) : deadline.isApproaching ? (
                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                          Due in {deadline.daysRemaining}d ({task.dueDate})
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          {task.startDate} → {task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Visual Timeline Bar Track */}
                  <div className="relative w-full h-5 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden">
                    <div
                      className={`absolute top-0 bottom-0 rounded-md transition-all flex items-center px-2 text-[10px] font-mono text-white font-semibold truncate ${
                        task.status === 'done'
                          ? 'bg-emerald-600'
                          : deadline.isOverdue
                          ? 'bg-rose-600'
                          : task.status === 'blocked'
                          ? 'bg-rose-500'
                          : deadline.isApproaching
                          ? 'bg-amber-600'
                          : 'bg-indigo-600'
                      }`}
                      style={barStyles}
                    >
                      {task.title} ({task.progress}%)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Schedule Table View */
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Task Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4 font-mono">{t('startDate')}</th>
                <th className="py-3 px-4 font-mono">{t('dueDate')}</th>
                <th className="py-3 px-4 font-mono text-right">{t('estimatedHours')}</th>
                <th className="py-3 px-4 font-mono text-right">{t('actualHours')}</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-mono">
              {filteredTasks.map((task) => {
                const deadline = calculateTaskDeadlineStatus(task);
                return (
                  <tr
                    key={task.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-sans font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                      {task.title}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="capitalize text-slate-700 dark:text-slate-300">
                        {t(task.status as any)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600 dark:text-slate-400">
                      {getAssigneeName(task.assigneeId)}
                    </td>
                    <td className="py-3 px-4 text-slate-500 tabular-nums">{task.startDate}</td>
                    <td className="py-3 px-4 tabular-nums">
                      {deadline.isOverdue ? (
                        <span className="text-rose-600 dark:text-rose-400 font-bold">
                          {task.dueDate} (Overdue)
                        </span>
                      ) : deadline.isApproaching ? (
                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                          {task.dueDate} (Soon)
                        </span>
                      ) : (
                        <span className="text-slate-600 dark:text-slate-400">{task.dueDate}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-slate-600 dark:text-slate-400">
                      {task.estimatedHours}h
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-slate-600 dark:text-slate-400">
                      {task.actualHours}h
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => openEditModal(task)}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-sans font-medium text-xs"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
