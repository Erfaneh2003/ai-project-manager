export type TaskStatus = 'backlog' | 'assigned' | 'in_progress' | 'blocked' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type MemberAvailability = 'available' | 'busy' | 'limited';

export interface Project {
  id: string;
  name: string;
  description: string;
  requirements: string;
  startDate: string;
  deadline: string;
  priority: TaskPriority;
  status: 'active' | 'completed' | 'on_hold';
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  skills: string[];
  experience: number; // in years
  workload: number; // 0 - 100 percentage
  availability: MemberAvailability;
  email: string;
}

export interface CandidateEvaluation {
  member: TeamMember;
  overallScore: number; // 0 - 100%
  skillMatchScore: number; // 0 - 100%
  experienceScore: number; // 0 - 100%
  workloadScore: number; // 0 - 100%
  availabilityScore: number; // 0 - 100%
  matchedSkills: string[];
  missingSkills: string[];
  recommendationReason: string;
}

export interface TaskAssignmentRecommendation {
  candidateId: string;
  candidateName: string;
  overallScore: number;
  reason: string;
  suggestedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  suggestedAssigneeId?: string | null;
  recommendation?: TaskAssignmentRecommendation | null;
  requiredSkills: string[];
  estimatedHours: number;
  actualHours: number;
  startDate: string;
  dueDate: string;
  dependencies: string[]; // array of Task IDs
  progress: number; // 0 - 100 percentage
  updatedAt: string;
}

export type AgentType = 'project_manager' | 'task_allocation' | 'scheduler';

export interface AgentActivity {
  id: string;
  agent: AgentType;
  agentName: string;
  action: string;
  detail: string;
  timestamp: string;
  taskId?: string;
  projectId?: string;
  severity: 'info' | 'success' | 'warning' | 'alert';
}

export interface ProjectHealthSummary {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  assignedTasks: number;
  backlogTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  approachingDeadlineTasks: number;
  overallProgress: number;
  totalEstimatedHours: number;
  totalActualHours: number;
}
