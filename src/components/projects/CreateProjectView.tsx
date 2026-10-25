import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Project, Task, TaskPriority } from '../../types';
import { generateSuggestedTasksFromRequirements } from '../../agents/projectManagerAgent';
import {
  Sparkles,
  Layers,
  Plus,
  Trash2,
  Calendar,
  CheckCircle,
  FileText,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const CreateProjectView: React.FC = () => {
  const { createProjectWithTasks, t, setActiveTab } = useProject();

  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectRequirements, setProjectRequirements] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState<TaskPriority>('high');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<Omit<Task, 'id' | 'updatedAt'>[]>([]);

  // Preset templates for quick testing
  const loadPreset = (presetType: 'ecommerce' | 'saas' | 'mobile') => {
    if (presetType === 'ecommerce') {
      setProjectName('E-Commerce Multi-Vendor Platform');
      setProjectDescription(
        'A scalable e-commerce marketplace with multi-currency checkout, vendor inventory management, and real-time shipping tracking.'
      );
      setProjectRequirements(
        'Build an e-commerce platform with customer authentication, product catalog API, payment gateway integration, responsive storefront dashboard, and automated fulfillment order processing.'
      );
      setPriority('urgent');
    } else if (presetType === 'saas') {
      setProjectName('AI-Driven Financial Intelligence Dashboard');
      setProjectDescription(
        'B2B SaaS application providing real-time cashflow analytics, automated bank transaction reconciliation, and risk forecasting.'
      );
      setProjectRequirements(
        'System architecture with PostgreSQL and TimescaleDB, OAuth2 multi-tenant authentication, bank webhook ingestion pipeline, analytics visualization charts, and PDF audit exports.'
      );
      setPriority('high');
    } else {
      setProjectName('On-Demand Logistics & Delivery App');
      setProjectDescription(
        'Cross-platform delivery tracking app with live courier GPS routing, customer notifications, and automated driver dispatch.'
      );
      setProjectRequirements(
        'Develop real-time driver dispatch engine, WebSockets location tracking, payment wallet integration, mobile push notifications, and courier route optimization.'
      );
      setPriority('medium');
    }
  };

  const handleGenerateTasks = () => {
    if (!projectName.trim()) {
      alert('Please provide a project name.');
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      const tasks = generateSuggestedTasksFromRequirements({
        projectId: `proj-${Date.now()}`,
        projectName,
        description: projectDescription,
        requirements: projectRequirements,
        startDate,
        deadline,
        priority,
      });

      setGeneratedTasks(tasks);
      setIsGenerating(false);
    }, 450);
  };

  const handleUpdateTaskField = (index: number, field: string, value: any) => {
    setGeneratedTasks((prev) =>
      prev.map((t, idx) => (idx === index ? { ...t, [field]: value } : t))
    );
  };

  const handleRemoveTask = (index: number) => {
    setGeneratedTasks((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddNewTask = () => {
    const newTask: Omit<Task, 'id' | 'updatedAt'> = {
      projectId: '',
      title: 'New Custom Task',
      description: 'Define task deliverables and requirements here.',
      status: 'backlog',
      priority: 'medium',
      assigneeId: null,
      suggestedAssigneeId: null,
      recommendation: null,
      requiredSkills: ['Full-Stack', 'System Architecture'],
      estimatedHours: 16,
      actualHours: 0,
      startDate,
      dueDate: deadline,
      dependencies: [],
      progress: 0,
    };
    setGeneratedTasks((prev) => [...prev, newTask]);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: projectName,
      description: projectDescription || 'No description provided.',
      requirements: projectRequirements || 'No explicit requirements provided.',
      startDate,
      deadline,
      priority,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const finalTasks =
      generatedTasks.length > 0
        ? generatedTasks
        : [
            {
              projectId: newProject.id,
              title: 'Initial Project Setup & Roadmap',
              description: 'Kickoff planning, architecture review, and milestone breakdown.',
              status: 'backlog' as const,
              priority: 'high' as const,
              assigneeId: null,
              suggestedAssigneeId: null,
              recommendation: null,
              requiredSkills: ['Architecture', 'Management'],
              estimatedHours: 12,
              actualHours: 0,
              startDate,
              dueDate: deadline,
              dependencies: [],
              progress: 0,
            },
          ];

    createProjectWithTasks(newProject, finalTasks);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('createProject')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Agent 1 (Intelligent Project Manager) will analyze your requirements and construct an initial task architecture.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium">Quick Presets:</span>
          <button
            type="button"
            onClick={() => loadPreset('ecommerce')}
            className="px-2.5 py-1 text-[11px] rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          >
            E-Commerce
          </button>
          <button
            type="button"
            onClick={() => loadPreset('saas')}
            className="px-2.5 py-1 text-[11px] rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          >
            B2B SaaS
          </button>
          <button
            type="button"
            onClick={() => loadPreset('mobile')}
            className="px-2.5 py-1 text-[11px] rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          >
            Delivery App
          </button>
        </div>
      </div>

      {/* Main Project Form */}
      <form onSubmit={handleSaveProject} className="space-y-6">
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              {t('projectName')} *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. NextGen E-Commerce Core"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              {t('projectDescription')}
            </label>
            <textarea
              rows={2}
              placeholder="Brief summary of business goals and scope..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              {t('projectRequirements')} *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Describe what needs to be built: e.g. Customer authentication, product catalog API, payment processing with Stripe, admin analytics..."
              value={projectRequirements}
              onChange={(e) => setProjectRequirements(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Metadata Row: Dates and Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                {t('startDate')}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                {t('dueDate')} (Deadline)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                {t('projectPriority')}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="urgent">{t('priorityUrgent')}</option>
                <option value="high">{t('priorityHigh')}</option>
                <option value="medium">{t('priorityMedium')}</option>
                <option value="low">{t('priorityLow')}</option>
              </select>
            </div>
          </div>

          {/* Trigger: Generate Tasks with AI */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              Run Intelligent Project Manager Agent to synthesize tasks automatically:
            </span>

            <button
              type="button"
              onClick={handleGenerateTasks}
              disabled={isGenerating || !projectRequirements.trim()}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Synthesizing...' : t('generateTasksWithAi')}</span>
            </button>
          </div>
        </div>

        {/* AI Generated Tasks Review Section */}
        {generatedTasks.length > 0 && (
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{t('tasksGenerated')} ({generatedTasks.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('reviewTasksDesc')}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddNewTask}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg hover:bg-indigo-100"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            <div className="space-y-3">
              {generatedTasks.map((task, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                      0{idx + 1}.
                    </span>

                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) => handleUpdateTaskField(idx, 'title', e.target.value)}
                      className="flex-1 px-2.5 py-1 text-xs font-bold rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />

                    <select
                      value={task.priority}
                      onChange={(e) => handleUpdateTaskField(idx, 'priority', e.target.value)}
                      className="text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemoveTask(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={task.description}
                    onChange={(e) => handleUpdateTaskField(idx, 'description', e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  />

                  <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 font-sans block">Skills:</span>
                      <input
                        type="text"
                        value={task.requiredSkills.join(', ')}
                        onChange={(e) =>
                          handleUpdateTaskField(
                            idx,
                            'requiredSkills',
                            e.target.value.split(',').map((s) => s.trim())
                          )
                        }
                        className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-sans block">Est. Hours:</span>
                      <input
                        type="number"
                        value={task.estimatedHours}
                        onChange={(e) => handleUpdateTaskField(idx, 'estimatedHours', Number(e.target.value))}
                        className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-sans block">Due Date:</span>
                      <input
                        type="date"
                        value={task.dueDate}
                        onChange={(e) => handleUpdateTaskField(idx, 'dueDate', e.target.value)}
                        className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            {t('cancel')}
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
          >
            <span>{t('createProjectBtn')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
