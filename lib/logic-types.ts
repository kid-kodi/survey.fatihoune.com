export type QuestionType = "multiple_choice" | "text_input" | "rating_scale" | "checkbox" | "dropdown" | "yes_no";

export type LogicCondition = "equals" | "not_equals" | "contains";

export type LogicRule = {
  triggerQuestionId: string;
  condition: LogicCondition;
  value: string | string[]; // string for single values, string[] for checkbox "contains"
};

export type QuestionLogic = {
  rules: LogicRule[];
  // For MVP, we only support simple IF logic (single rule)
  // In Phase 2, we can add AND/OR logic for multiple rules
  operator?: "AND" | "OR"; // For future use
};

export function getConditionsForQuestionType(
  questionType: QuestionType
): LogicCondition[] {
  switch (questionType) {
    case "multiple_choice":
    case "dropdown":
    case "yes_no":
      return ["equals", "not_equals"];
    case "checkbox":
      return ["contains", "not_equals"];
    case "rating_scale":
      return ["equals", "not_equals"];
    case "text_input":
      return ["equals", "not_equals"];
    default:
      return ["equals", "not_equals"];
  }
}

export function getConditionLabel(condition: LogicCondition): string {
  switch (condition) {
    case "equals":
      return "is";
    case "not_equals":
      return "is not";
    case "contains":
      return "contains";
    default:
      return condition;
  }
}

export function validateLogicRule(
  rule: LogicRule,
  questions: Array<{ id: string; type: QuestionType; order: number }>
): { valid: boolean; error?: string } {
  const triggerQuestion = questions.find((q) => q.id === rule.triggerQuestionId);

  if (!triggerQuestion) {
    return { valid: false, error: "Trigger question not found" };
  }

  const availableConditions = getConditionsForQuestionType(triggerQuestion.type);
  if (!availableConditions.includes(rule.condition)) {
    return {
      valid: false,
      error: `Condition "${rule.condition}" is not valid for question type "${triggerQuestion.type}"`,
    };
  }

  if (rule.condition === "contains" && !Array.isArray(rule.value)) {
    return {
      valid: false,
      error: "Contains condition requires an array of values",
    };
  }

  if (rule.condition !== "contains" && typeof rule.value !== "string") {
    return {
      valid: false,
      error: "Condition requires a string value",
    };
  }

  return { valid: true };
}

export function detectCircularDependency(
  currentQuestionId: string,
  triggerQuestionId: string,
  questions: Array<{ id: string; logic: QuestionLogic | null; order: number }>
): boolean {
  // A question cannot depend on itself
  if (currentQuestionId === triggerQuestionId) {
    return true;
  }

  // A question cannot depend on questions that come after it
  const currentQuestion = questions.find((q) => q.id === currentQuestionId);
  const triggerQuestion = questions.find((q) => q.id === triggerQuestionId);

  if (!currentQuestion || !triggerQuestion) {
    return false;
  }

  if (triggerQuestion.order >= currentQuestion.order) {
    return true;
  }

  // Check if trigger question depends on current question (indirect circular dependency)
  if (triggerQuestion.logic?.rules) {
    for (const rule of triggerQuestion.logic.rules) {
      if (
        detectCircularDependency(
          triggerQuestionId,
          rule.triggerQuestionId,
          questions
        )
      ) {
        // Check if any of the dependencies eventually lead back to current question
        const visited = new Set<string>();
        const hasCycle = (questionId: string): boolean => {
          if (questionId === currentQuestionId) return true;
          if (visited.has(questionId)) return false;
          visited.add(questionId);

          const q = questions.find((question) => question.id === questionId);
          if (!q?.logic?.rules) return false;

          return q.logic.rules.some((r) => hasCycle(r.triggerQuestionId));
        };

        if (hasCycle(triggerQuestionId)) {
          return true;
        }
      }
    }
  }

  return false;
}
