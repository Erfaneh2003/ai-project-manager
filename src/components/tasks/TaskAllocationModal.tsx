import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { evaluateCandidatesForTask } from '../../agents/taskAllocationAgent';
import {
  X,
  Sparkles,
  Check,
  User,
  ShieldCheck,
  Briefcase,
  Clock,
  Layers,
  ArrowRight,
  ThumbsDown,
} from 'lucide-react';

export const TaskAllocationModal: React.FC = () => {
  const {
    selectedTaskForAllocation: task,
    closeAllocationModal,
    teamMembers,
    approveTaskAllocation,
    rejectTaskAllocation,
    t,
  } = useProject();

  if (!task) return null;

  // Run deterministic evaluation across all candidates
  const candidateEvaluations = evaluateCandidatesForTask(task, teamMembers);
  const topCandidate = candidateEvaluations[0];

  // Selected candidate state (defaults to top candidate)
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(
    topCandidate ? topCandidate.member.id : ''
  );
  const [isChoosingAnother, setIsChoosingAnother] = useState(false);

  const activeSelection = candidateEvaluations.find(
    (c) => c.member.id === selectedCandidateId
  ) || topCandidate;

  const handleApprove = () => {
    if (activeSelection) {
      approveTaskAllocation(task.id, activeSelection.member.id);
    }
  };

  const handleReject = () => {
    rejectTaskAllocation(task.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Task Allocation & Recommendation
              </h3>
              <p className="text-[11px] text-slate-500">
                Agent 2: Intelligent Workload & Skill Evaluation
              </p>
            </div>
          </div>
          <button
            onClick={closeAllocationModal}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Task Summary Banner */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
              Target Task
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
              {task.title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              {task.description}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
              <span className="text-slate-500 font-medium">Required Skills:</span>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                {task.requiredSkills.map((skill, idx) => (
                  <span key={skill} className="font-mono text-[11px] bg-slate-200/70 dark:bg-slate-700/70 px-2 py-0.5 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* AI Recommendation Spotlight */}
          {topCandidate && (
            <div className="p-4 rounded-xl border-2 border-emerald-500/30 dark:border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    {t('aiRecommendation')}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    · {topCandidate.member.name} ({topCandidate.overallScore}% {t('matchScore')})
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Optimal Match</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                <strong className="font-semibold text-slate-900 dark:text-white">Reason: </strong>
                {topCandidate.recommendationReason}
              </p>

              {/* Match breakdown metrics */}
              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-emerald-200/60 dark:border-emerald-800/60 text-center font-mono tabular-nums">
                <div className="p-2 rounded bg-white/60 dark:bg-slate-800/60 border border-emerald-200/40">
                  <span className="text-[10px] text-slate-500 block">Skills Match</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {topCandidate.skillMatchScore}%
                  </span>
                </div>
                <div className="p-2 rounded bg-white/60 dark:bg-slate-800/60 border border-emerald-200/40">
                  <span className="text-[10px] text-slate-500 block">Experience</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {topCandidate.member.experience} yrs
                  </span>
                </div>
                <div className="p-2 rounded bg-white/60 dark:bg-slate-800/60 border border-emerald-200/40">
                  <span className="text-[10px] text-slate-500 block">Workload</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {topCandidate.member.workload}%
                  </span>
                </div>
                <div className="p-2 rounded bg-white/60 dark:bg-slate-800/60 border border-emerald-200/40">
                  <span className="text-[10px] text-slate-500 block">Availability</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 capitalize">
                    {topCandidate.member.availability}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Candidate comparison list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Team Candidates ({candidateEvaluations.length})
              </span>
              <button
                type="button"
                onClick={() => setIsChoosingAnother(!isChoosingAnother)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                {isChoosingAnother ? 'Show Top Recommendation' : t('chooseAnother')}
              </button>
            </div>

            <div className="space-y-2.5">
              {candidateEvaluations.map((evalItem) => {
                const isSelected = evalItem.member.id === selectedCandidateId;
                return (
                  <div
                    key={evalItem.member.id}
                    onClick={() => setSelectedCandidateId(evalItem.member.id)}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-600 dark:ring-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200">
                          {evalItem.member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {evalItem.member.name}
                            </span>
                            {evalItem.member.id === topCandidate?.member.id && (
                              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                                Best Pick
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500">{evalItem.member.role}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                          {evalItem.overallScore}%
                        </span>
                        <span className="block text-[10px] text-slate-400">Suitability</span>
                      </div>
                    </div>

                    {/* Progress bars & metrics */}
                    <div className="grid grid-cols-3 gap-3 text-[11px] text-slate-500 font-mono tabular-nums pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <div>
                        <span>Skills Match: </span>
                        <strong className="text-slate-700 dark:text-slate-300">{evalItem.skillMatchScore}%</strong>
                      </div>
                      <div>
                        <span>Current Load: </span>
                        <strong className="text-slate-700 dark:text-slate-300">{evalItem.member.workload}%</strong>
                      </div>
                      <div>
                        <span>Experience: </span>
                        <strong className="text-slate-700 dark:text-slate-300">{evalItem.member.experience} yrs</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer (Human-in-the-Loop Actions) */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60">
          <div className="text-[11px] text-slate-500">
            {t('humanInTheLoopNotice')}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleReject}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {t('rejectAssignment')}
            </button>

            <button
              onClick={handleApprove}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <Check className="w-3.5 h-3.5" />
              <span>
                {t('approveAssignment')} {activeSelection ? `(${activeSelection.member.name.split(' ')[0]})` : ''}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
