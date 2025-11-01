import { LogicRule, LogicCondition, QuestionLogic } from "./logic-types";

/**
 * Evaluates a single logic rule against an answer
 */
function evaluateRule(rule: LogicRule, answer: any): boolean {
  // If no answer provided, rule fails (question stays hidden)
  if (answer === undefined || answer === null || answer === "") {
    return false;
  }

  switch (rule.condition) {
    case "equals":
      // For rating scale (numbers), convert to number for comparison
      if (typeof answer === "number" && typeof rule.value === "string") {
        return answer === parseInt(rule.value, 10);
      }
      return answer === rule.value;

    case "not_equals":
      // For rating scale (numbers), convert to number for comparison
      if (typeof answer === "number" && typeof rule.value === "string") {
        return answer !== parseInt(rule.value, 10);
      }
      return answer !== rule.value;

    case "contains":
      // For checkbox questions (array answers)
      if (!Array.isArray(answer)) {
        return false;
      }
      if (Array.isArray(rule.value)) {
        // Check if answer contains any of the values in rule.value
        return rule.value.some((val) => answer.includes(val));
      }
      // Single value check
      return answer.includes(rule.value);

    default:
      return false;
  }
}

/**
 * Evaluates all logic rules for a question to determine if it should be visible
 * @param questionLogic - The logic configuration for the question
 * @param answers - Map of questionId to answer values
 * @returns true if question should be visible, false if it should be hidden
 */
export function evaluateQuestionLogic(
  questionLogic: QuestionLogic | null,
  answers: Record<string, any>
): boolean {
  // If no logic defined, question is always visible
  if (!questionLogic || !questionLogic.rules || questionLogic.rules.length === 0) {
    return true;
  }

  const { rules, operator = "AND" } = questionLogic;

  // Evaluate each rule
  const ruleResults = rules.map((rule) => {
    const triggerAnswer = answers[rule.triggerQuestionId];
    return evaluateRule(rule, triggerAnswer);
  });

  // Apply operator logic (for future multi-rule support)
  if (operator === "OR") {
    // Show if ANY rule passes
    return ruleResults.some((result) => result);
  } else {
    // Default: AND - Show if ALL rules pass
    return ruleResults.every((result) => result);
  }
}

/**
 * Gets all visible question IDs based on current answers
 * @param questions - All survey questions with their logic
 * @param answers - Current answer values
 * @returns Set of question IDs that should be visible
 */
export function getVisibleQuestions(
  questions: Array<{ id: string; logic: QuestionLogic | null }>,
  answers: Record<string, any>
): Set<string> {
  const visibleIds = new Set<string>();

  for (const question of questions) {
    if (evaluateQuestionLogic(question.logic, answers)) {
      visibleIds.add(question.id);
    }
  }

  return visibleIds;
}
