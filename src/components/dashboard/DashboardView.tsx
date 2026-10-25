import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { calculateTaskDeadlineStatus } from '../../agents/schedulerAgent';
import { AiProjectManagerPanel } from '../agents/AiProjectManagerPanel';
import {
  Sparkles,
  AlertTriangle,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Users,
  AlertCircle,
  Plus,
  GitBranch,
  Search,
  Filter,
  MoreVertical,
} from 'lucide-react';

const STATUS_COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'backlog', label: 'Backlog', color: 'border-slate-300 dark:border-slate-700' },
  { id: 'assigned', label: 'Assigned', color: 'border-blue-400 dark:border-blue-600' },
  { id: 'in_progress', label: 'In Progress', color: 'border-amber-400 dark:border-amber-600' },
  { id: 'blocked', label: 'Blocked', color: 'border-rose-400 dark:border-rose-600' },
  { id: 'done', label: 'Done', color: 'border-emerald-400 dark:border-emerald-600' },
];

export const DashboardView: React.FC = () => {
  const {
    project,
    tasks,
    teamMembers,
    healthSummary,
    updateTaskStatus,
    openAllocationModal,
    openEditModal,
    t,
  } = useProject();

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">Urgent</span>;
      case 'high':
        return <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">High</span>;
      case 'medium':
        return <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">Medium</span>;
      default:
        return <span className="text-[11px] font-medium text-slate-500">Low</span>;
    }
  };

  const getAssignee = (assigneeId: string | null) => {
    if (!assigneeId) return null;
    return teamMembers.find((m) => m.id === assigneeId) || null;
  };

  const nextStatusMap: Record<TaskStatus, TaskStatus | null> = {
    backlog: 'assigned',
    assigned: 'in_progress',
    in_progress: 'done',
    blocked: 'in_progress',
    done: null,
  };

  const prevStatusMap: Record<TaskStatus, TaskStatus | null> = {
    backlog: null,
    assigned: 'backlog',
    in_progress: 'assigned',
    blocked: 'in_progress',
    done: 'in_progress',
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Kanban Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Project Dashboard Banner */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {project.name}
                </h1>
                <span className="text-xs text-slate-500">· {t(project.priority as any)} Priority</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl mt-1 leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Search & Filter Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('searchTasks')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-48"
                />
              </div>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <option value="all">{t('allPriorities')}</option>
                <option value="urgent">{t('priorityUrgent')}</option>
                <option value="high">{t('priorityHigh')}</option>
                <option value="medium">{t('priorityMedium')}</option>
                <option value="low">{t('priorityLow')}</option>
              </select>
            </div>
          </div>

          {/* KPI Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
            {/* Overall Progress */}
            <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                {t('overallProgress')}
              </span>
              <div className="flex items-baseline justify-between font-mono tabular-nums">
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {healthSummary.overallProgress}%
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400">
                  {healthSummary.completedTasks}/{healthSummary.totalTasks} Done
                </span>
              </div>
            </div>

            {/* Total Tasks */}
            <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                {t('totalTasks')}
              </span>
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {healthSummary.totalTasks}
              </span>
            </div>

            {/* Completed Tasks */}
            <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                {t('completedTasks')}
              </span>
              <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                {healthSummary.completedTasks}
              </span>
            </div>

            {/* Overdue Tasks */}
            <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                {t('overdueTasks')}
              </span>
              <div className="flex items-baseline justify-between font-mono tabular-nums">
                <span
                  className={`text-lg font-bold ${
                    healthSummary.overdueTasks > 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {healthSummary.overdueTasks}
                </span>
                {healthSummary.approachingDeadlineTasks > 0 && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400">
                    +{healthSummary.approachingDeadlineTasks} soon
                  </span>
                )}
              </div>
            </div>

            {/* Team Members */}
            <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                {t('teamMembersCount')}
              </span>
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {teamMembers.length}
              </span>
            </div>
          </div>
        </div>

        {/* Kanban Board Columns Container */}
        <div className="flex-1 p-6 overflow-x-auto bg-slate-100/50 dark:bg-slate-950/40">
          <div className="flex gap-4 min-w-[1100px] h-full items-start">
            {STATUS_COLUMNS.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.status === col.id);

              return (
                <div
                  key={col.id}
                  className="w-72 shrink-0 flex flex-col bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 max-h-[calc(100vh-250px)]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between p-3 border-b border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {t(col.id as any)}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 font-medium tabular-nums">
                        ({colTasks.length})
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        openEditModal({
                          id: `task-${Date.now()}`,
                          projectId: project.id,
                          title: '',
                          description: '',
                          status: col.id,
                          priority: 'medium',
                          assigneeId: null,
                          requiredSkills: [],
                          estimatedHours: 8,
                          actualHours: 0,
                          startDate: new Date().toISOString().split('T')[0],
                          dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
                          dependencies: [],
                          progress: 0,
                          updatedAt: new Date().toISOString().split('T')[0],
                        })
                      }
                      title="Add task to column"
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Task Cards Column Body */}
                  <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                    {colTasks.length === 0 ? (
                      <div className="text-center py-8 text-[11px] text-slate-400">
                        No tasks in {col.label}
                      </div>
                    ) : (
                      colTasks.map((task) => {
                        const assignee = getAssignee(task.assigneeId);
                        const suggestedAssignee = getAssignee(task.suggestedAssigneeId || null);
                        const deadlineInfo = calculateTaskDeadlineStatus(task);
                        const hasDependencies = task.dependencies && task.dependencies.length > 0;

                        return (
                          <div
                            key={task.id}
                            className="p-3.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500 transition-all group"
                          >
                            {/* Card Top: Priority & Due Date */}
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              {getPriorityBadge(task.priority)}

                              {/* Due Date Indicator */}
                              <div className="flex items-center gap-1 font-mono text-[11px] tabular-nums">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {deadlineInfo.isOverdue ? (
                                  <span className="text-rose-600 dark:text-rose-400 font-semibold">
                                    {task.dueDate} (Overdue)
                                  </span>
                                ) : deadlineInfo.isApproaching ? (
                                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                                    {task.dueDate} ({deadlineInfo.daysRemaining}d left)
                                  </span>
                                ) : (
                                  <span className="text-slate-500">{task.dueDate}</span>
                                )}
                              </div>
                            </div>

                            {/* Task Title */}
                            <h4
                              onClick={() => openEditModal(task)}
                              className="text-xs font-bold text-slate-900 dark:text-white leading-snug cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 mb-1"
                            >
                              {task.title}
                            </h4>

                            {/* Short Description */}
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2.5">
                              {task.description}
                            </p>

                            {/* Skills required */}
                            <div className="flex flex-wrap items-center gap-1 mb-2.5">
                              {task.requiredSkills.slice(0, 3).map((skill) => (
                                <span
                                  key={skill}
                                  className="text-[10px] font-mono bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded"
                                >
                                  {skill}
                                </span>
                              ))}
                              {task.requiredSkills.length > 3 && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  +{task.requiredSkills.length - 3}
                                </span>
                              )}
                            </div>

                            {/* Dependencies link */}
                            {hasDependencies && (
                              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono mb-2">
                                <GitBranch className="w-3 h-3 text-slate-400" />
                                <span>Depends on {task.dependencies.length} prerequisite task(s)</span>
                              </div>
                            )}

                            {/* Progress bar (if in progress or blocked) */}
                            {task.status !== 'backlog' && (
                              <div className="mb-2.5">
                                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1">
                                  <span>Progress</span>
                                  <span>{task.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      task.status === 'done'
                                        ? 'bg-emerald-500'
                                        : task.status === 'blocked'
                                        ? 'bg-rose-500'
                                        : 'bg-indigo-600'
                                    }`}
                                    style={{ width: `${task.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Assignee / AI Allocation section */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                              {assignee ? (
                                <div
                                  onClick={() => openAllocationModal(task)}
                                  className="flex items-center gap-1.5 cursor-pointer hover:opacity-80"
                                  title="Click to reassign or view allocation reasoning"
                                >
                                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-200">
                                    {assignee.name.charAt(0)}
                                  </div>
                                  <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200">
                                    {assignee.name}
                                  </span>
                                </div>
                              ) : task.recommendation ? (
                                <button
                                  onClick={() => openAllocationModal(task)}
                                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  <span>{task.recommendation.candidateName.split(' ')[0]} ({task.recommendation.overallScore}%)</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => openAllocationModal(task)}
                                  className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  <span>{t('allocateTask')}</span>
                                </button>
                              )}

                              {/* Status Transition controls */}
                              <div className="flex items-center gap-1">
                                {prevStatusMap[task.status] && (
                                  <button
                                    onClick={() => updateTaskStatus(task.id, prevStatusMap[task.status]!)}
                                    title={`Move to ${prevStatusMap[task.status]}`}
                                    className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                                  >
                                    <ArrowLeft className="w-3 h-3" />
                                  </button>
                                )}
                                {nextStatusMap[task.status] && (
                                  <button
                                    onClick={() => updateTaskStatus(task.id, nextStatusMap[task.status]!)}
                                    title={`Move to ${nextStatusMap[task.status]}`}
                                    className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                                  >
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Sidebar: AI Project Manager Activity Stream */}
      <AiProjectManagerPanel />
    </div>
  );
};
