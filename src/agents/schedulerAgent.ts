import { Task } from '../types';

/**
 * Agent 3 — Scheduler & Tracker Agent
 * Responsible for:
 * - Deadline tracking & timeline verification
 * - Flagging overdue tasks and tasks approaching deadline (<= 3 days)
 * - Identifying dependency bottlenecks (tasks blocked by incomplete prerequisites)
 * - Monitoring estimated hours vs actual hours consumption
 */

export interface ScheduleAuditReport {
  overdueTasks: Task[];
  approachingDeadlineTasks: Task[];
  blockedByDependencyTasks: {
    task: Task;
    unresolvedPrerequisites: Task[];
  }[];
  hoursVariance: {
    exceededTasks: { task: Task; variance: number }[];
    totalEstimated: number;
    totalActual: number;
  };
  scheduleInsights: string[];
}

export function auditProjectSchedule(tasks: Task[]): ScheduleAuditReport {
  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date(todayStr).getTime();

  const taskMap = new Map<string, Task>();
  tasks.forEach((t) => taskMap.set(t.id, t));

  const overdueTasks: Task[] = [];
  const approachingDeadlineTasks: Task[] = [];
  const blockedByDependencyTasks: { task: Task; unresolvedPrerequisites: Task[] }[] = [];
  const exceededTasks: { task: Task; variance: number }[] = [];

  let totalEstimated = 0;
  let totalActual = 0;

  tasks.forEach((task) => {
    totalEstimated += task.estimatedHours;
    totalActual += task.actualHours;

    const dueTime = new Date(task.dueDate).getTime();
    const diffDays = Math.ceil((dueTime - today) / (1000 * 60 * 60 * 24));

    if (task.status !== 'done') {
      if (diffDays < 0) {
        overdueTasks.push(task);
      } else if (diffDays <= 3) {
        approachingDeadlineTasks.push(task);
      }
    }

    // Check dependency violations
    if (task.dependencies && task.dependencies.length > 0) {
      const unresolved = task.dependencies
        .map((depId) => taskMap.get(depId))
        .filter((depTask): depTask is Task => !!depTask && depTask.status !== 'done');

      if (unresolved.length > 0 && task.status !== 'done') {
        blockedByDependencyTasks.push({
          task,
          unresolvedPrerequisites: unresolved,
        });
      }
    }

    // Check hours variance
    if (task.actualHours > task.estimatedHours) {
      exceededTasks.push({
        task,
        variance: task.actualHours - task.estimatedHours,
      });
    }
  });

  const scheduleInsights: string[] = [];

  if (overdueTasks.length > 0) {
    scheduleInsights.push(
      `CRITICAL: ${overdueTasks.length} task(s) are overdue past scheduled deadline.`
    );
  }
  if (approachingDeadlineTasks.length > 0) {
    scheduleInsights.push(
      `ATTENTION: ${approachingDeadlineTasks.length} task(s) are due within the next 72 hours.`
    );
  }
  if (blockedByDependencyTasks.length > 0) {
    scheduleInsights.push(
      `DEPENDENCY ALERT: ${blockedByDependencyTasks.length} task(s) are waiting on unfinished prerequisite tasks.`
    );
  }
  if (exceededTasks.length > 0) {
    scheduleInsights.push(
      `BUDGET NOTICE: ${exceededTasks.length} task(s) have exceeded initial hour estimates.`
    );
  }
  if (scheduleInsights.length === 0) {
    scheduleInsights.push('Project timeline is healthy with zero overdue milestones.');
  }

  return {
    overdueTasks,
    approachingDeadlineTasks,
    blockedByDependencyTasks,
    hoursVariance: {
      exceededTasks,
      totalEstimated,
      totalActual,
    },
    scheduleInsights,
  };
}

export function calculateTaskDeadlineStatus(task: Task): {
  isOverdue: boolean;
  isApproaching: boolean;
  daysRemaining: number;
} {
  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date(todayStr).getTime();
  const dueTime = new Date(task.dueDate).getTime();
  const daysRemaining = Math.ceil((dueTime - today) / (1000 * 60 * 60 * 24));

  const isOverdue = task.status !== 'done' && daysRemaining < 0;
  const isApproaching = task.status !== 'done' && daysRemaining >= 0 && daysRemaining <= 3;

  return {
    isOverdue,
    isApproaching,
    daysRemaining,
  };
}
