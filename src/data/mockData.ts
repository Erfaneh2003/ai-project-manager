import { Project, Task, TeamMember, AgentActivity } from '../types';

// Helper to generate dynamic ISO date strings relative to current date
const getRelativeDateStr = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_PROJECT: Project = {
  id: 'proj-ecommerce-01',
  name: 'E-Commerce Platform',
  description:
    'Modern multi-vendor e-commerce web platform featuring real-time inventory management, high-concurrency payment processing, role-based merchant dashboards, and intelligent order routing.',
  requirements:
    'Build a scalable e-commerce infrastructure with customer authentication, product catalog management, high-concurrency payment gateway integration, order tracking dashboard, and automated fulfillment.',
  startDate: getRelativeDateStr(-14),
  deadline: getRelativeDateStr(24),
  priority: 'high',
  status: 'active',
  createdAt: getRelativeDateStr(-14),
};

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'user-ali',
    name: 'Ali Rezaei',
    role: 'Senior Backend & Cloud Architect',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Redis', 'JWT', 'System Design'],
    experience: 5,
    workload: 45,
    availability: 'available',
    email: 'ali.rezaei@techflow.internal',
  },
  {
    id: 'user-sara',
    name: 'Sara Mohammadi',
    role: 'Lead Frontend & UI Engineer',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Redux', 'UI/UX', 'Jest'],
    experience: 3,
    workload: 35,
    availability: 'available',
    email: 'sara.m@techflow.internal',
  },
  {
    id: 'user-reza',
    name: 'Reza Abbasi',
    role: 'Principal Database & Data Engineer',
    skills: ['PostgreSQL', 'Drizzle ORM', 'Database Optimization', 'Redis', 'Python', 'Kafka'],
    experience: 6,
    workload: 75,
    availability: 'limited',
    email: 'reza.abbasi@techflow.internal',
  },
  {
    id: 'user-maryam',
    name: 'Maryam Hosseini',
    role: 'Full-Stack Software Engineer',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'REST API', 'GraphQL', 'Tailwind CSS'],
    experience: 4,
    workload: 55,
    availability: 'available',
    email: 'maryam.h@techflow.internal',
  },
  {
    id: 'user-kian',
    name: 'Kian Farhadi',
    role: 'DevOps & Systems Integration Engineer',
    skills: ['Docker', 'Kubernetes', 'CI/CD', 'Stripe', 'Linux', 'Microservices', 'Monitoring'],
    experience: 2,
    workload: 85,
    availability: 'busy',
    email: 'kian.f@techflow.internal',
  },
];

export const INITIAL_TASKS: Task[] = [
  // 1. DONE
  {
    id: 'task-01',
    projectId: 'proj-ecommerce-01',
    title: 'System Architecture & API Specification',
    description:
      'Architect microservice boundaries, OpenAPI contracts, database schemas, and caching topology for the e-commerce engine.',
    status: 'done',
    priority: 'urgent',
    assigneeId: 'user-ali',
    suggestedAssigneeId: 'user-ali',
    requiredSkills: ['System Design', 'PostgreSQL', 'Architecture'],
    estimatedHours: 24,
    actualHours: 22,
    startDate: getRelativeDateStr(-14),
    dueDate: getRelativeDateStr(-6),
    dependencies: [],
    progress: 100,
    updatedAt: getRelativeDateStr(-6),
  },

  // 2. IN PROGRESS (approaching deadline)
  {
    id: 'task-02',
    projectId: 'proj-ecommerce-01',
    title: 'Core Database Schema & Drizzle ORM Setup',
    description:
      'Configure connection pool, migration scripts, indexes for catalog querying, and transactional order entities.',
    status: 'in_progress',
    priority: 'urgent',
    assigneeId: 'user-reza',
    suggestedAssigneeId: 'user-reza',
    requiredSkills: ['PostgreSQL', 'Drizzle ORM', 'Database Optimization'],
    estimatedHours: 28,
    actualHours: 20,
    startDate: getRelativeDateStr(-7),
    dueDate: getRelativeDateStr(2), // Approaching deadline! (<= 3 days)
    dependencies: ['task-01'],
    progress: 70,
    updatedAt: getRelativeDateStr(-1),
  },

  // 3. IN PROGRESS
  {
    id: 'task-03',
    projectId: 'proj-ecommerce-01',
    title: 'Storefront UI Components & Cart Flow',
    description:
      'Implement responsive product detail pages, instant cart drawer, discount coupon inputs, and checkout wizard.',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'user-sara',
    suggestedAssigneeId: 'user-sara',
    requiredSkills: ['React', 'Next.js', 'Tailwind CSS', 'TypeScript'],
    estimatedHours: 36,
    actualHours: 18,
    startDate: getRelativeDateStr(-5),
    dueDate: getRelativeDateStr(6),
    dependencies: ['task-01'],
    progress: 45,
    updatedAt: getRelativeDateStr(-1),
  },

  // 4. ASSIGNED
  {
    id: 'task-04',
    projectId: 'proj-ecommerce-01',
    title: 'Authentication & Role-Based Access Control (RBAC)',
    description:
      'Implement JWT token generation, refresh rotation, OAuth sign-in, and permission guards for admin vs customer accounts.',
    status: 'assigned',
    priority: 'high',
    assigneeId: 'user-ali',
    suggestedAssigneeId: 'user-ali',
    recommendation: {
      candidateId: 'user-ali',
      candidateName: 'Ali Rezaei',
      overallScore: 94,
      reason: 'Strong FastAPI and PostgreSQL experience with 55% available capacity.',
      suggestedAt: getRelativeDateStr(-2),
    },
    requiredSkills: ['FastAPI', 'JWT', 'PostgreSQL', 'Python'],
    estimatedHours: 30,
    actualHours: 0,
    startDate: getRelativeDateStr(1),
    dueDate: getRelativeDateStr(8),
    dependencies: ['task-01', 'task-02'],
    progress: 0,
    updatedAt: getRelativeDateStr(-2),
  },

  // 5. ASSIGNED
  {
    id: 'task-05',
    projectId: 'proj-ecommerce-01',
    title: 'Admin Analytics & Order Management Dashboard',
    description:
      'Develop administrative portal to track real-time revenue velocity, pending fulfillment queues, and customer support tickets.',
    status: 'assigned',
    priority: 'medium',
    assigneeId: 'user-maryam',
    suggestedAssigneeId: 'user-maryam',
    recommendation: {
      candidateId: 'user-maryam',
      candidateName: 'Maryam Hosseini',
      overallScore: 88,
      reason: 'Excellent full-stack React and Node experience with balanced workload.',
      suggestedAt: getRelativeDateStr(-2),
    },
    requiredSkills: ['React', 'Node.js', 'TypeScript', 'Tailwind CSS'],
    estimatedHours: 26,
    actualHours: 0,
    startDate: getRelativeDateStr(2),
    dueDate: getRelativeDateStr(10),
    dependencies: ['task-03'],
    progress: 0,
    updatedAt: getRelativeDateStr(-2),
  },

  // 6. BLOCKED (Overdue and depends on incomplete tasks)
  {
    id: 'task-06',
    projectId: 'proj-ecommerce-01',
    title: 'Third-Party Logistics & Webhook Dispatcher',
    description:
      'Dispatch carrier webhook events upon package dispatch, tracking number creation, and delivery confirmation callbacks.',
    status: 'blocked',
    priority: 'high',
    assigneeId: 'user-kian',
    suggestedAssigneeId: 'user-kian',
    requiredSkills: ['Docker', 'Microservices', 'CI/CD'],
    estimatedHours: 24,
    actualHours: 12,
    startDate: getRelativeDateStr(-8),
    dueDate: getRelativeDateStr(-2), // Overdue!
    dependencies: ['task-02'],
    progress: 25,
    updatedAt: getRelativeDateStr(-1),
  },

  // 7. BACKLOG
  {
    id: 'task-07',
    projectId: 'proj-ecommerce-01',
    title: 'Payment Gateway Integration (Stripe & Wallets)',
    description:
      'Support multi-currency checkout, Apple Pay / Google Pay, idempotency keys, and automated refund dispute webhooks.',
    status: 'backlog',
    priority: 'urgent',
    assigneeId: null,
    suggestedAssigneeId: 'user-ali',
    recommendation: {
      candidateId: 'user-ali',
      candidateName: 'Ali Rezaei',
      overallScore: 91,
      reason: 'Deep backend systems experience with high security discipline.',
      suggestedAt: getRelativeDateStr(-1),
    },
    requiredSkills: ['Python', 'Docker', 'Redis', 'FastAPI'],
    estimatedHours: 34,
    actualHours: 0,
    startDate: getRelativeDateStr(4),
    dueDate: getRelativeDateStr(14),
    dependencies: ['task-04'],
    progress: 0,
    updatedAt: getRelativeDateStr(-1),
  },

  // 8. BACKLOG
  {
    id: 'task-08',
    projectId: 'proj-ecommerce-01',
    title: 'Elasticsearch Indexing & Fuzzy Product Search',
    description:
      'Stream database catalog mutations into Elasticsearch cluster with multi-language tokenization and facet aggregation.',
    status: 'backlog',
    priority: 'medium',
    assigneeId: null,
    suggestedAssigneeId: null,
    recommendation: null,
    requiredSkills: ['PostgreSQL', 'Redis', 'Python'],
    estimatedHours: 22,
    actualHours: 0,
    startDate: getRelativeDateStr(7),
    dueDate: getRelativeDateStr(16),
    dependencies: ['task-02'],
    progress: 0,
    updatedAt: getRelativeDateStr(-1),
  },
];

export const INITIAL_AGENT_ACTIVITIES: AgentActivity[] = [
  {
    id: 'act-01',
    agent: 'project_manager',
    agentName: 'Intelligent Project Manager Agent',
    action: 'Requirements Decomposed',
    detail: 'Decomposed e-commerce requirements into 8 modular architectural tasks with dependency graph.',
    timestamp: '14 mins ago',
    severity: 'info',
  },
  {
    id: 'act-02',
    agent: 'task_allocation',
    agentName: 'Task Allocation Agent',
    action: 'Candidate Recommendation Generated',
    detail: 'Evaluated team capacity: Recommended Ali Rezaei (94% match) for Authentication API.',
    timestamp: '9 mins ago',
    severity: 'success',
  },
  {
    id: 'act-03',
    agent: 'scheduler',
    agentName: 'Scheduler & Tracker Agent',
    action: 'Approaching Deadline Alert',
    detail: 'Flagged "Core Database Schema": Due in 48 hours. Reza Abbasi currently at 70% progress.',
    timestamp: '5 mins ago',
    severity: 'warning',
  },
  {
    id: 'act-04',
    agent: 'scheduler',
    agentName: 'Scheduler & Tracker Agent',
    action: 'Overdue Task Detected',
    detail: '"Third-Party Logistics" is past due by 2 days and currently blocked by prerequisite task.',
    timestamp: '2 mins ago',
    severity: 'alert',
  },
];
