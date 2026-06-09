from __future__ import annotations

from typing import Iterable, List


def _primary_skill(skills: Iterable[str]) -> str:
    for skill in skills or []:
        text = str(skill or "").strip()
        if text:
            return text
    return "your core tools"


def build_fixed_question_fallback(
    *,
    role_name: str,
    role_slug: str,
    round_type: str,
    difficulty: str,
    desired_count: int,
    skills: Iterable[str] | None = None,
) -> List[dict]:
    role_label = (role_name or role_slug or "this role").strip()
    difficulty_key = str(difficulty or "").upper().strip()
    round_key = str(round_type or "").upper().strip()
    skill_label = _primary_skill(skills or [])

    if round_key == "WARMUP":
        bank = _warmup_bank(role_label)
    elif round_key == "BEHAVIORAL":
        bank = _behavioral_bank()
    elif round_key == "CODING":
        bank = _coding_bank(skill_label, difficulty_key)
    else:
        bank = _role_related_bank(role_label, skill_label, difficulty_key)

    if difficulty_key == "PROFESSIONAL":
        prioritized = [q for q in bank if q["topic"].endswith("tradeoffs") or q["topic"].endswith("leadership")]
        remainder = [q for q in bank if q not in prioritized]
        bank = remainder[:2] + prioritized + remainder[2:]
    elif difficulty_key == "BEGINNER":
        bank = sorted(
            bank,
            key=lambda q: 0 if q["topic"] in {"introduction", "motivation", "foundations"} else 1,
        )

    return bank[: max(1, desired_count)]


def _warmup_bank(role_label: str) -> List[dict]:
    return [
        _q(f"What interested you in pursuing {role_label} roles?", "motivation"),
        _q(f"How would you briefly introduce your background for a {role_label} position?", "introduction"),
        _q("What kind of work helps you feel most confident and engaged?", "work_preferences"),
        _q("Which recent experience best reflects the kind of contribution you want to make next?", "recent_experience"),
        _q("What strengths do you rely on most when starting something unfamiliar?", "strengths"),
        _q("How do you usually prepare when you know an important interview or project discussion is coming up?", "preparation"),
        _q("What type of team environment helps you do your best work?", "team_environment"),
        _q("What part of your experience do you most want interviewers to understand?", "highlight"),
        _q("How do you approach learning a new tool or process when expectations are not fully clear?", "learning_approach"),
        _q("What kind of feedback helps you improve fastest?", "feedback_style"),
        _q("What are you hoping to gain from your next role beyond the title itself?", "career_goals"),
        _q("When you join a new team, how do you build trust in the first few weeks?", "trust_building"),
    ]


def _behavioral_bank() -> List[dict]:
    return [
        _q("Tell me about a time you faced a difficult challenge at work and how you handled it.", "behavioral_challenge"),
        _q("Describe a situation where you had to work with a difficult teammate.", "team_conflict"),
        _q("Tell me about a time you made a mistake and what you learned from it.", "learning_from_mistake"),
        _q("Describe a time you had to work under pressure or a tight deadline.", "pressure_handling"),
        _q("Tell me about a time you took initiative without being asked.", "initiative"),
        _q("Describe a time when priorities changed unexpectedly and you had to adapt quickly.", "adaptability"),
        _q("Tell me about a time you had to influence someone who initially disagreed with you.", "influence"),
        _q("Describe a situation where communication broke down and how you helped restore clarity.", "communication_breakdown"),
        _q("Tell me about a time you had to balance speed with quality.", "speed_vs_quality"),
        _q("Describe a decision you made with incomplete information.", "ambiguity"),
        _q("Tell me about a time you supported a teammate or stakeholder through a difficult situation.", "supporting_others"),
        _q("Describe a situation where you had to manage competing expectations from different people.", "stakeholder_management"),
        _q("Tell me about a time you delivered a strong result despite constraints.", "resource_constraints"),
        _q("Describe a time you received critical feedback and how you responded.", "receiving_feedback"),
        _q("Tell me about a time you had to earn trust after something went wrong.", "rebuilding_trust"),
    ]


def _role_related_bank(role_label: str, skill_label: str, difficulty_key: str) -> List[dict]:
    advanced = difficulty_key == "PROFESSIONAL"
    foundation = "Walk me through" if advanced else "Tell me about"

    return [
        _q(f"{foundation.lower()} a project where you applied skills relevant to {role_label}.", "role_experience"),
        _q(f"How do you decide what good performance looks like in a {role_label} role?", "success_metrics"),
        _q(f"What steps do you take to keep your {skill_label} knowledge current?", "continuous_learning"),
        _q(f"Describe how you would approach your first 30 days in a new {role_label} position.", "first_30_days"),
        _q(f"What are the most important tradeoffs you watch for in {role_label} work?", "role_tradeoffs"),
        _q(f"Describe a time your domain judgment materially changed the outcome of a project in a {role_label}-type setting.", "domain_judgment"),
        _q(f"How do you explain complex {role_label} decisions to non-specialist stakeholders?", "stakeholder_translation"),
        _q(f"What risks do you usually look for first when reviewing work related to {role_label}?", "risk_identification"),
        _q(f"Tell me about a time you improved a process, workflow, or standard relevant to {role_label}.", "process_improvement"),
        _q(f"How do you prioritize when several important {role_label} tasks compete for attention?", "prioritization"),
        _q(f"What signals tell you a {role_label} project is drifting off track?", "execution_signals"),
        _q(f"Describe how you balance business goals with technical or operational realities in {role_label} work.", "business_alignment"),
        _q(f"Tell me about a time you had to make a recommendation in your area of expertise with limited certainty.", "expert_recommendation"),
        _q(f"What distinguishes solid work from truly excellent work in a strong {role_label} team?", "quality_bar"),
        _q(f"How do you evaluate whether a solution in {role_label} is scalable and maintainable over time?", "scalability_maintainability"),
    ]


def _coding_bank(skill_label: str, difficulty_key: str) -> List[dict]:
    advanced = difficulty_key == "PROFESSIONAL"

    bank = [
        _q("Explain a recent coding problem you solved and how you approached it.", "problem_solving"),
        _q("How do you structure code for readability and maintainability?", "code_quality"),
        _q("Tell me about a performance issue you identified and fixed.", "performance_debugging"),
        _q("How do you debug a bug that is difficult to reproduce?", "debugging_strategy"),
        _q("Describe how you would design a simple and scalable feature.", "system_design_basics"),
        _q("What steps do you take when reviewing or improving existing code?", "code_review"),
        _q(f"How do you decide when to introduce abstraction versus keeping a {skill_label} solution simple?", "abstraction_tradeoffs"),
        _q("Describe a time you had to reason through an edge case that was not obvious at first.", "edge_case_reasoning"),
        _q("How do you validate that a fix actually addresses the root cause rather than the symptom?", "root_cause_validation"),
        _q("Tell me about a time you had to balance delivery speed with long-term maintainability.", "delivery_tradeoffs"),
        _q("How do you approach testing when the system has several moving parts or external dependencies?", "testing_strategy"),
        _q("Describe how you would investigate a production issue with incomplete logs or signals.", "incident_investigation"),
        _q("What tradeoffs do you consider when choosing data structures or algorithms for a feature?", "algorithm_tradeoffs"),
        _q("How do you make technical decisions when multiple designs could work?", "design_decision_making"),
        _q("Tell me about a time you improved the reliability of a system or codebase.", "reliability_improvement"),
    ]

    if advanced:
        bank.insert(
            4,
            _q("Describe a design decision where you had to defend one architecture over another under real constraints.", "architecture_tradeoffs"),
        )
        bank.insert(
            9,
            _q("How do you decide whether a recurring issue deserves a systemic refactor instead of another local fix?", "refactor_judgment"),
        )

    return bank


def _q(text: str, topic: str) -> dict:
    return {
        "text": text,
        "topic": topic,
        "followup_allowed": True,
    }
