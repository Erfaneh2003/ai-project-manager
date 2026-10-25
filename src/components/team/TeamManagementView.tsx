import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { TeamMember, MemberAvailability } from '../../types';
import {
  Users,
  Briefcase,
  UserCheck,
  Plus,
  Clock,
  Sparkles,
  BarChart,
  Mail,
  Shield,
  Layers,
  CheckCircle,
} from 'lucide-react';

export const TeamManagementView: React.FC = () => {
  const { teamMembers, tasks, openAllocationModal, openEditModal, t } = useProject();

  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberSkills, setNewMemberSkills] = useState('');
  const [newMemberExperience, setNewMemberExperience] = useState(3);
  const [newMemberAvailability, setNewMemberAvailability] = useState<MemberAvailability>('available');

  const getMemberTasks = (memberId: string) => {
    return tasks.filter((t) => t.assigneeId === memberId && t.status !== 'done');
  };

  const getAvailabilityBadge = (avail: MemberAvailability) => {
    switch (avail) {
      case 'available':
        return (
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            {t('available')}
          </span>
        );
      case 'limited':
        return (
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            {t('limited')}
          </span>
        );
      case 'busy':
        return (
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
            {t('busy')}
          </span>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('team')}
            </h1>
            <span className="text-xs text-slate-500 font-mono">
              ({teamMembers.length} Members Registered)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Engineered candidate profiles parsed by Agent 2 for intelligent task allocation scoring.
          </p>
        </div>

        <button
          onClick={() => setShowAddMember(!showAddMember)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Add Member inline expandable form */}
      {showAddMember && (
        <div className="p-5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Register New Team Member
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Navid Farhang"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Role
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Backend Engineer"
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Go, PostgreSQL, Kubernetes"
                value={newMemberSkills}
                onChange={(e) => setNewMemberSkills(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setShowAddMember(false)}
              className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!newMemberName) return;
                const newMember: TeamMember = {
                  id: `user-${Date.now()}`,
                  name: newMemberName,
                  role: newMemberRole || 'Software Engineer',
                  skills: newMemberSkills
                    .split(',')
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0),
                  experience: Number(newMemberExperience) || 3,
                  workload: 25,
                  availability: newMemberAvailability,
                  email: `${newMemberName.toLowerCase().replace(/\s+/g, '.')}@techflow.internal`,
                };
                teamMembers.push(newMember);
                setShowAddMember(false);
                setNewMemberName('');
                setNewMemberRole('');
                setNewMemberSkills('');
              }}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Save Member
            </button>
          </div>
        </div>
      )}

      {/* Team Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teamMembers.map((member) => {
          const activeTasks = getMemberTasks(member.id);

          return (
            <div
              key={member.id}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div>
                {/* Header with avatar, name & role */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-200">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {member.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{member.role}</p>
                    </div>
                  </div>

                  <div>{getAvailabilityBadge(member.availability)}</div>
                </div>

                {/* Experience & Email */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-3">
                  <span>{member.experience} years experience</span>
                  <span className="truncate max-w-[160px]">{member.email}</span>
                </div>

                {/* Workload Progress Bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                    <span className="text-slate-500 font-sans">{t('currentWorkload')}</span>
                    <span
                      className={`font-bold ${
                        member.workload > 80
                          ? 'text-rose-600 dark:text-rose-400'
                          : member.workload > 60
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {member.workload}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        member.workload > 80
                          ? 'bg-rose-500'
                          : member.workload > 60
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${member.workload}%` }}
                    />
                  </div>
                </div>

                {/* Skills tags */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    {t('skills')}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {member.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Assigned Tasks */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  {t('activeTasks')} ({activeTasks.length})
                </span>
                {activeTasks.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No active tasks assigned.</span>
                ) : (
                  <div className="space-y-1">
                    {activeTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => openEditModal(t)}
                        className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 hover:text-indigo-600 cursor-pointer truncate py-0.5"
                      >
                        <span className="truncate">{t.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono ml-2 shrink-0">
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
