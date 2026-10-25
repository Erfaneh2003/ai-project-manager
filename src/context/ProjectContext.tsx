import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Project,
  Task,
  TeamMember,
  AgentActivity,
  TaskStatus,
  ProjectHealthSummary,
} from '../types';
import {
  INITIAL_PROJECT,
  INITIAL_TEAM_MEMBERS,
  INITIAL_TASKS,
  INITIAL_AGENT_ACTIVITIES,
} from '../data/mockData';
import { calculateProjectHealth } from '../agents/projectManagerAgent';
import { evaluateCandidatesForTask, getTopCandidateRecommendation } from '../agents/taskAllocationAgent';
import { auditProjectSchedule } from '../agents/schedulerAgent';
import { Language, translations } from '../lib/i18n';

interface ProjectContextType {
  project: Project;
  projects: Project[];
  tasks: Task[];
  teamMembers: TeamMember[];
  agentActivities: AgentActivity[];
  healthSummary: ProjectHealthSummary;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeTab: 'dashboard' | 'create_project' | 'scheduler' | 'team';
  setActiveTab: (tab: 'dashboard' | 'create_project' | 'scheduler' | 'team') => void;
  selectedTaskForAllocation: Task | null;
  openAllocationModal: (task: Task) => void;
  closeAllocationModal: () => void;
  selectedTaskForEdit: Task | null;
  openEditModal: (task: Task) => void;
  closeEditModal: () => void;
  isAnalyzing: boolean;
  createProjectWithTasks: (newProject: Project, newTasks: Omit<Task, 'id' | 'updatedAt'>[]) => void;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addTask: (newTask: Omit<Task, 'id' | 'updatedAt'>) => void;
  deleteTask: (taskId: string) => void;
  approveTaskAllocation: (taskId: string, candidateId: string) => void;
  rejectTaskAllocation: (taskId: string) => void;
  runFullAIAnalysis: () => Promise<void>;
  resetToDemoData: () => void;
  switchProject: (projectId: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('taskmatrix_projects');
    return saved ? JSON.parse(saved) : [INITIAL_PROJECT];
  });

  const [currentProjectId, setCurrentProjectId] = useState<string>(() => {
    return projects[0]?.id || INITIAL_PROJECT.id;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('taskmatrix_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('taskmatrix_members');
    return saved ? JSON.parse(saved) : INITIAL_TEAM_MEMBERS;
  });

  const [agentActivities, setAgentActivities] = useState<AgentActivity[]>(() => {
    const saved = localStorage.getItem('taskmatrix_activities');
    return saved ? JSON.parse(saved) : INITIAL_AGENT_ACTIVITIES;
  });

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('taskmatrix_lang') as Language;
    return saved || 'en';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create_project' | 'scheduler' | 'team'>('dashboard');
  const [selectedTaskForAllocation, setSelectedTaskForAllocation] = useState<Task | null>(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('taskmatrix_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('taskmatrix_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskmatrix_members', JSON.stringify(teamMembers));
  }, [teamMembers]);

  useEffect(() => {
    localStorage.setItem('taskmatrix_activities', JSON.stringify(agentActivities));
  }, [agentActivities]);

  useEffect(() => {
    localStorage.setItem('taskmatrix_lang', language);
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const currentProject = projects.find((p) => p.id === currentProjectId) || projects[0] || INITIAL_PROJECT;

  const healthSummary = calculateProjectHealth(currentProject, tasks);

  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  const openAllocationModal = (task: Task) => {
    setSelectedTaskForAllocation(task);
  };

  const closeAllocationModal = () => {
    setSelectedTaskForAllocation(null);
  };

  const openEditModal = (task: Task) => {
    setSelectedTaskForEdit(task);
  };

  const closeEditModal = () => {
    setSelectedTaskForEdit(null);
  };

  // Add agent activity helper
  const logAgentActivity = (
    agent: AgentActivity['agent'],
    agentName: string,
    action: string,
    detail: string,
    severity: AgentActivity['severity'],
    taskId?: string
  ) => {
    const newAct: AgentActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      agent,
      agentName,
      action,
      detail,
      timestamp: 'Just now',
      taskId,
      projectId: currentProjectId,
      severity,
    };
    setAgentActivities((prev) => [newAct, ...prev.slice(0, 30)]);
  };

  // 1. Create Project with Tasks
  const createProjectWithTasks = (
    newProject: Project,
    newTasks: Omit<Task, 'id' | 'updatedAt'>[]
  ) => {
    const formattedTasks: Task[] = newTasks.map((t, idx) => ({
      ...t,
      id: `task-${Date.now()}-${idx}`,
      projectId: newProject.id,
      updatedAt: new Date().toISOString().split('T')[0],
    }));

    setProjects((prev) => [newProject, ...prev]);
    setCurrentProjectId(newProject.id);
    setTasks((prev) => [...formattedTasks, ...prev]);

    logAgentActivity(
      'project_manager',
      'Intelligent Project Manager Agent',
      'New Project Initiated',
      `Launched "${newProject.name}" and synthesized ${newTasks.length} baseline tasks from requirements.`,
      'info'
    );

    setActiveTab('dashboard');
  };

  // 2. Update Task Status
  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = {
            ...t,
            status: newStatus,
            progress: newStatus === 'done' ? 100 : t.progress,
            updatedAt: new Date().toISOString().split('T')[0],
          };
          return updated;
        }
        return t;
      })
    );

    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      logAgentActivity(
        'scheduler',
        'Scheduler & Tracker Agent',
        'Status Transition Logged',
        `Task "${task.title}" updated from [${task.status}] to [${newStatus}].`,
        newStatus === 'done' ? 'success' : newStatus === 'blocked' ? 'alert' : 'info',
        taskId
      );
    }
  };

  // 3. Update generic Task properties
  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            ...updates,
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return t;
      })
    );
  };

  // 4. Add single task
  const addTask = (newTask: Omit<Task, 'id' | 'updatedAt'>) => {
    const createdTask: Task = {
      ...newTask,
      id: `task-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setTasks((prev) => [createdTask, ...prev]);

    logAgentActivity(
      'project_manager',
      'Intelligent Project Manager Agent',
      'Task Ingested',
      `Added task "${createdTask.title}" with priority ${createdTask.priority.toUpperCase()}.`,
      'info',
      createdTask.id
    );
  };

  // 5. Delete task
  const deleteTask = (taskId: string) => {
    const taskToDelete = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (taskToDelete) {
      logAgentActivity(
        'project_manager',
        'Intelligent Project Manager Agent',
        'Task Removed',
        `Removed task "${taskToDelete.title}".`,
        'warning',
        taskId
      );
    }
  };

  // 6. HUMAN-IN-THE-LOOP APPROVAL FLOW
  const approveTaskAllocation = (taskId: string, candidateId: string) => {
    const member = teamMembers.find((m) => m.id === candidateId);
    const targetTask = tasks.find((t) => t.id === taskId);

    if (!member || !targetTask) return;

    // Transition task to 'assigned' and lock assigneeId
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            assigneeId: candidateId,
            suggestedAssigneeId: candidateId,
            status: t.status === 'backlog' ? 'assigned' : t.status,
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return t;
      })
    );

    // Increase member workload slightly based on task hours
    setTeamMembers((prev) =>
      prev.map((m) => {
        if (m.id === candidateId) {
          const workloadDelta = Math.min(15, Math.round(targetTask.estimatedHours / 3));
          return {
            ...m,
            workload: Math.min(95, m.workload + workloadDelta),
          };
        }
        return m;
      })
    );

    logAgentActivity(
      'task_allocation',
      'Task Allocation Agent',
      'Human Approval Verified',
      `Project Manager approved allocation of "${targetTask.title}" to ${member.name}. Task marked as Assigned.`,
      'success',
      taskId
    );

    closeAllocationModal();
  };

  // Reject recommendation
  const rejectTaskAllocation = (taskId: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            suggestedAssigneeId: null,
            recommendation: null,
          };
        }
        return t;
      })
    );

    logAgentActivity(
      'task_allocation',
      'Task Allocation Agent',
      'Proposal Rejected',
      `Suggested candidate for "${targetTask.title}" was dismissed by Project Manager. Kept in backlog.`,
      'warning',
      taskId
    );

    closeAllocationModal();
  };

  // 7. RUN FULL MULTI-AGENT AI ANALYSIS
  const runFullAIAnalysis = async () => {
    setIsAnalyzing(true);

    try {
      // 1. Agent 1: Project Manager Analysis
      const currentHealth = calculateProjectHealth(currentProject, tasks);
      logAgentActivity(
        'project_manager',
        'Intelligent Project Manager Agent',
        'Health & Velocity Audit',
        `Analyzed ${currentHealth.totalTasks} tasks: Progress at ${currentHealth.overallProgress}%. ${currentHealth.completedTasks} completed, ${currentHealth.inProgressTasks} active.`,
        'info'
      );

      // 2. Agent 2: Task Allocation Evaluation for unassigned backlog tasks
      const unassignedTasks = tasks.filter(
        (t) => t.projectId === currentProjectId && (!t.assigneeId || t.status === 'backlog')
      );

      let allocatedCount = 0;
      setTasks((prev) =>
        prev.map((t) => {
          if (t.projectId === currentProjectId && (!t.assigneeId || t.status === 'backlog')) {
            const recommendation = getTopCandidateRecommendation(t, teamMembers);
            if (recommendation) {
              allocatedCount++;
              return {
                ...t,
                suggestedAssigneeId: recommendation.member.id,
                recommendation: {
                  candidateId: recommendation.member.id,
                  candidateName: recommendation.member.name,
                  overallScore: recommendation.overallScore,
                  reason: recommendation.recommendationReason,
                  suggestedAt: new Date().toISOString().split('T')[0],
                },
              };
            }
          }
          return t;
        })
      );

      if (allocatedCount > 0) {
        logAgentActivity(
          'task_allocation',
          'Task Allocation Agent',
          'Candidate Proposals Generated',
          `Generated optimal candidate proposals for ${allocatedCount} backlog task(s). Awaiting Human-in-the-Loop manager approval.`,
          'success'
        );
      }

      // 3. Agent 3: Scheduler & Timeline Audit
      const scheduleAudit = auditProjectSchedule(tasks.filter((t) => t.projectId === currentProjectId));
      scheduleAudit.scheduleInsights.forEach((insight) => {
        const severity = insight.startsWith('CRITICAL')
          ? 'alert'
          : insight.startsWith('ATTENTION')
          ? 'warning'
          : insight.startsWith('DEPENDENCY')
          ? 'warning'
          : 'info';

        logAgentActivity(
          'scheduler',
          'Scheduler & Tracker Agent',
          'Schedule Anomaly Detection',
          insight,
          severity
        );
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const switchProject = (projectId: string) => {
    setCurrentProjectId(projectId);
  };

  const resetToDemoData = () => {
    setProjects([INITIAL_PROJECT]);
    setCurrentProjectId(INITIAL_PROJECT.id);
    setTasks(INITIAL_TASKS);
    setTeamMembers(INITIAL_TEAM_MEMBERS);
    setAgentActivities(INITIAL_AGENT_ACTIVITIES);
  };

  return (
    <ProjectContext.Provider
      value={{
        project: currentProject,
        projects,
        tasks: tasks.filter((t) => t.projectId === currentProject.id),
        teamMembers,
        agentActivities,
        healthSummary,
        language,
        setLanguage,
        t,
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        selectedTaskForAllocation,
        openAllocationModal,
        closeAllocationModal,
        selectedTaskForEdit,
        openEditModal,
        closeEditModal,
        isAnalyzing,
        createProjectWithTasks,
        updateTaskStatus,
        updateTask,
        addTask,
        deleteTask,
        approveTaskAllocation,
        rejectTaskAllocation,
        runFullAIAnalysis,
        resetToDemoData,
        switchProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
