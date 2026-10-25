import { Task, TeamMember, CandidateEvaluation } from '../types';

/**
 * Agent 2 — Task Allocation Agent
 * Evaluates candidate suitability using deterministic multi-criteria scoring:
 * - Skill Match (weight 0.45)
 * - Experience (weight 0.20)
 * - Availability (weight 0.20)
 * - Current Workload (weight 0.15)
 * 
 * Enforces Human-in-the-Loop: Generates actionable recommendations,
 * but final assignment is locked until Project Manager human approval.
 */

export function evaluateCandidatesForTask(
  task: Task,
  teamMembers: TeamMember[]
): CandidateEvaluation[] {
  const normalizedTaskSkills = task.requiredSkills.map((s) => s.trim().toLowerCase());

  const evaluations: CandidateEvaluation[] = teamMembers.map((member) => {
    const memberSkillsNorm = member.skills.map((s) => s.trim().toLowerCase());

    // 1. Skill Match Score (0 - 100)
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    task.requiredSkills.forEach((reqSkill) => {
      const isMatched = memberSkillsNorm.some(
        (ms) => ms.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(ms)
      );
      if (isMatched) {
        matchedSkills.push(reqSkill);
      } else {
        missingSkills.push(reqSkill);
      }
    });

    const skillRatio =
      task.requiredSkills.length > 0 ? matchedSkills.length / task.requiredSkills.length : 1;
    const skillMatchScore = Math.round(skillRatio * 100);

    // 2. Experience Score (0 - 100)
    // 5+ years = 100, 4 = 85, 3 = 70, 2 = 55, 1 = 40
    let experienceScore = Math.min(100, Math.max(30, member.experience * 18 + 10));
    if (task.priority === 'urgent' && member.experience >= 4) {
      experienceScore = Math.min(100, experienceScore + 10);
    }

    // 3. Availability Score (0 - 100)
    let availabilityScore = 100;
    if (member.availability === 'available') {
      availabilityScore = 95;
    } else if (member.availability === 'limited') {
      availabilityScore = 55;
    } else if (member.availability === 'busy') {
      availabilityScore = 20;
    }

    // 4. Workload Score (0 - 100)
    // Lower workload => higher score
    const workloadScore = Math.max(0, 100 - member.workload);

    // Composite Weighted Score:
    // Skill: 45%, Experience: 20%, Availability: 20%, Workload: 15%
    const rawOverallScore =
      skillMatchScore * 0.45 +
      experienceScore * 0.20 +
      availabilityScore * 0.20 +
      workloadScore * 0.15;

    const overallScore = Math.min(99, Math.max(15, Math.round(rawOverallScore)));

    // Generate natural language reasoning
    const reasonParts: string[] = [];
    if (matchedSkills.length > 0) {
      reasonParts.push(`Proven expertise in ${matchedSkills.slice(0, 2).join(' & ')}`);
    } else {
      reasonParts.push('Adjacent skill background');
    }

    if (member.experience >= 4) {
      reasonParts.push(`${member.experience} years senior experience`);
    }

    if (member.workload <= 50) {
      reasonParts.push(`healthy capacity (${member.workload}% current workload)`);
    } else if (member.workload <= 75) {
      reasonParts.push(`moderate load (${member.workload}%)`);
    } else {
      reasonParts.push(`high active workload (${member.workload}%)`);
    }

    const recommendationReason = `${reasonParts.join(', ')} makes ${member.name.split(' ')[0]} ${
      overallScore >= 80 ? 'the ideal candidate' : overallScore >= 65 ? 'a viable match' : 'a backup alternative'
    }.`;

    return {
      member,
      overallScore,
      skillMatchScore,
      experienceScore,
      workloadScore,
      availabilityScore,
      matchedSkills,
      missingSkills,
      recommendationReason,
    };
  });

  // Sort descending by overall match score
  return evaluations.sort((a, b) => b.overallScore - a.overallScore);
}

export function getTopCandidateRecommendation(
  task: Task,
  teamMembers: TeamMember[]
): CandidateEvaluation | null {
  const evaluations = evaluateCandidatesForTask(task, teamMembers);
  return evaluations.length > 0 ? evaluations[0] : null;
}
