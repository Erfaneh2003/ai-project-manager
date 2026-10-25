import { Task, Project, ProjectHealthSummary, TaskPriority } from '../types';

/**
 * Agent 1 — Intelligent Project Manager Agent
 * Responsible for:
 * - Receiving Project Requirements & Description
 * - Decomposing requirements into modular, actionable tasks
 * - Determining Priority and Dependencies between tasks
 * - Monitoring overall project health and completion metrics
 */

export interface RequirementBreakdownInput {
  projectId: string;
  projectName: string;
  description: string;
  requirements: string;
  startDate: string;
  deadline: string;
  priority: TaskPriority;
}

export function generateSuggestedTasksFromRequirements(
  input: RequirementBreakdownInput
): Omit<Task, 'id' | 'updatedAt'>[] {
  const reqText = `${input.description} ${input.requirements}`.toLowerCase();
  const start = new Date(input.startDate);
  const end = new Date(input.deadline);
  const totalDays = Math.max(7, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  const formatOffsetDate = (dayOffset: number): string => {
    const d = new Date(start);
    d.setDate(d.getDate() + dayOffset);
    return d.toISOString().split('T')[0];
  };

  // Curated knowledge base of domain tasks
  const candidatePool: Array<{
    title: string;
    description: string;
    keywords: string[];
    requiredSkills: string[];
    priority: TaskPriority;
    estHours: number;
    phase: number;
  }> = [
    {
      title: 'System Architecture & Data Modeling',
      description: 'Design relational schema, entity relationships, index strategies, and API specifications.',
      keywords: ['database', 'schema', 'architecture', 'data', 'store', 'sql', 'system'],
      requiredSkills: ['PostgreSQL', 'System Design', 'Data Modeling', 'Architecture'],
      priority: 'urgent',
      estHours: 24,
      phase: 1,
    },
    {
      title: 'Authentication & Role-Based Access Control',
      description: 'Implement JWT session handling, password hashing, OAuth integrations, and permission guards.',
      keywords: ['auth', 'login', 'authentication', 'user', 'jwt', 'security', 'role'],
      requiredSkills: ['FastAPI', 'JWT', 'PostgreSQL', 'Security'],
      priority: 'high',
      estHours: 32,
      phase: 2,
    },
    {
      title: 'Product Catalog & Inventory Management API',
      description: 'Develop CRUD endpoints for products, inventory levels, variant options, and category taxonomy.',
      keywords: ['product', 'item', 'catalog', 'inventory', 'ecommerce', 'e-commerce', 'stock'],
      requiredSkills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'],
      priority: 'high',
      estHours: 28,
      phase: 2,
    },
    {
      title: 'Storefront UI Components & Cart Flow',
      description: 'Build responsive product grid, filters, interactive cart drawer, and checkout step wizard.',
      keywords: ['frontend', 'ui', 'dashboard', 'interface', 'react', 'web', 'cart', 'storefront'],
      requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Redux'],
      priority: 'high',
      estHours: 40,
      phase: 3,
    },
    {
      title: 'Payment Gateway Integration & Webhooks',
      description: 'Integrate multi-currency payment providers, handle secure webhook verification and reconciliation.',
      keywords: ['payment', 'checkout', 'stripe', 'money', 'billing', 'wallet', 'transaction'],
      requiredSkills: ['Node.js', 'Stripe', 'Redis', 'Security'],
      priority: 'urgent',
      estHours: 36,
      phase: 3,
    },
    {
      title: 'Elasticsearch Indexing & Fuzzy Search',
      description: 'Set up search engine indexers with autocomplete, facet filters, and sub-100ms query latency.',
      keywords: ['search', 'elastic', 'filter', 'query', 'speed', 'catalog'],
      requiredSkills: ['Elasticsearch', 'Python', 'PostgreSQL'],
      priority: 'medium',
      estHours: 20,
      phase: 3,
    },
    {
      title: 'Order Processing & Status Notification Service',
      description: 'Background worker queue to transition order lifecycle events, generate invoices, and push updates.',
      keywords: ['order', 'notification', 'email', 'queue', 'service', 'processing'],
      requiredSkills: ['Python', 'Redis', 'Docker', 'Celery'],
      priority: 'medium',
      estHours: 24,
      phase: 4,
    },
    {
      title: 'End-to-End Integration & Stress Testing',
      description: 'Execute automated regression test suites, load test concurrent checkouts, and verify edge cases.',
      keywords: ['test', 'testing', 'qa', 'integration', 'cypress', 'stress', 'verification'],
      requiredSkills: ['TypeScript', 'CI/CD', 'Docker', 'Jest'],
      priority: 'high',
      estHours: 20,
      phase: 5,
    },
    {
      title: 'CI/CD Pipeline & Cloud Deployment Automation',
      description: 'Configure automated container build scripts, staging environments, and production rollouts.',
      keywords: ['deploy', 'cloud', 'docker', 'kubernetes', 'devops', 'pipeline', 'infrastructure'],
      requiredSkills: ['Docker', 'Kubernetes', 'CI/CD', 'Linux'],
      priority: 'medium',
      estHours: 18,
      phase: 5,
    },
  ];

  // Score candidate pool based on user's input text
  const selectedCandidates = candidatePool
    .map((candidate) => {
      let score = 0;
      candidate.keywords.forEach((kw) => {
        if (reqText.includes(kw)) score += 2;
      });
      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score);

  // Take top matching candidates (at least 5-6 tasks)
  const topList = selectedCandidates.slice(0, Math.max(6, Math.min(8, selectedCandidates.length)));
  topList.sort((a, b) => a.candidate.phase - b.candidate.phase);

  const phaseStep = Math.max(2, Math.floor(totalDays / (topList.length + 1)));

  return topList.map((item, index) => {
    const taskStartOffset = Math.min(totalDays - 5, index * phaseStep);
    const taskDuration = Math.max(3, Math.min(8, Math.round(item.candidate.estHours / 5)));
    const taskDueOffset = Math.min(totalDays, taskStartOffset + taskDuration);

    return {
      projectId: input.projectId,
      title: item.candidate.title,
      description: item.candidate.description,
      status: 'backlog' as const,
      priority: item.candidate.priority,
      assigneeId: null,
      suggestedAssigneeId: null,
      recommendation: null,
      requiredSkills: item.candidate.requiredSkills,
      estimatedHours: item.candidate.estHours,
      actualHours: 0,
      startDate: formatOffsetDate(taskStartOffset),
      dueDate: formatOffsetDate(taskDueOffset),
      dependencies: [],
      progress: 0,
    };
  });
}

export function calculateProjectHealth(project: Project, tasks: Task[]): ProjectHealthSummary {
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = projectTasks.filter((t) => t.status === 'in_progress').length;
  const assignedTasks = projectTasks.filter((t) => t.status === 'assigned').length;
  const backlogTasks = projectTasks.filter((t) => t.status === 'backlog').length;
  const blockedTasks = projectTasks.filter((t) => t.status === 'blocked').length;

  const today = new Date().toISOString().split('T')[0];

  const overdueTasks = projectTasks.filter((t) => {
    return t.status !== 'done' && t.dueDate < today;
  }).length;

  const approachingDeadlineTasks = projectTasks.filter((t) => {
    if (t.status === 'done') return false;
    const dueTime = new Date(t.dueDate).getTime();
    const todayTime = new Date(today).getTime();
    const diffDays = (dueTime - todayTime) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 3;
  }).length;

  const totalProgress = projectTasks.reduce((acc, t) => acc + t.progress, 0);
  const overallProgress = totalTasks > 0 ? Math.round(totalProgress / totalTasks) : 0;

  const totalEstimatedHours = projectTasks.reduce((acc, t) => acc + t.estimatedHours, 0);
  const totalActualHours = projectTasks.reduce((acc, t) => acc + t.actualHours, 0);

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    assignedTasks,
    backlogTasks,
    blockedTasks,
    overdueTasks,
    approachingDeadlineTasks,
    overallProgress,
    totalEstimatedHours,
    totalActualHours,
  };
}
