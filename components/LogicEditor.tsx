"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Trash2, GitBranch } from "lucide-react";
import {
  LogicRule,
  QuestionLogic,
  LogicCondition,
  getConditionsForQuestionType,
  getConditionLabel,
  detectCircularDependency,
} from "@/lib/logic-types";

import { Checkbox } from "@/components/ui/checkbox";

type QuestionType = "multiple_choice" | "text_input" | "rating_scale" | "checkbox" | "dropdown" | "yes_no";

type Question = {
  id: string;
  type: QuestionType;
  text: string;
  options: any;
  order: number;
  logic: QuestionLogic | null;
};

type LogicEditorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentQuestion: Question;
  allQuestions: Question[];
  onSave: (logic: QuestionLogic | null) => void;
};

export function LogicEditor({
  open,
  onOpenChange,
  currentQuestion,
  allQuestions,
  onSave,
}: LogicEditorProps) {
  const [logic, setLogic] = useState<QuestionLogic | null>(
    currentQuestion.logic
  );
  const [error, setError] = useState<string>("");

  // Get questions that can be used as triggers (only previous questions)
  const availableQuestions = allQuestions.filter(
    (q) => q.order < currentQuestion.order && q.id !== currentQuestion.id
  );

  useEffect(() => {
    setLogic(currentQuestion.logic);
    setError("");
  }, [currentQuestion, open]);

  const handleAddRule = () => {
    if (availableQuestions.length === 0) {
      setError("No previous questions available to create logic");
      return;
    }

    const firstQuestion = availableQuestions[0];
    const defaultCondition = getConditionsForQuestionType(firstQuestion.type)[0];

    const newRule: LogicRule = {
      triggerQuestionId: firstQuestion.id,
      condition: defaultCondition,
      value: "",
    };

    setLogic({
      rules: logic?.rules ? [...logic.rules, newRule] : [newRule],
    });
    setError("");
  };

  const handleUpdateRule = (index: number, updatedRule: Partial<LogicRule>) => {
    if (!logic?.rules) return;

    const newRules = [...logic.rules];
    newRules[index] = { ...newRules[index], ...updatedRule };

    // Check for circular dependencies
    if (updatedRule.triggerQuestionId) {
      if (
        detectCircularDependency(
          currentQuestion.id,
          updatedRule.triggerQuestionId,
          allQuestions
        )
      ) {
        setError(
          "Circular dependency detected: This question cannot depend on a later question or itself"
        );
        return;
      }
    }

    setLogic({ ...logic, rules: newRules });
    setError("");
  };

  const handleDeleteRule = (index: number) => {
    if (!logic?.rules) return;

    const newRules = logic.rules.filter((_, i) => i !== index);
    setLogic(newRules.length > 0 ? { ...logic, rules: newRules } : null);
    setError("");
  };

  const handleSave = () => {
    // Validate all rules
    if (logic?.rules) {
      for (const rule of logic.rules) {
        if (!rule.triggerQuestionId || !rule.value) {
          setError("Please complete all logic rules before saving");
          return;
        }
      }
    }

    onSave(logic);
    onOpenChange(false);
  };

  const handleRemoveAllLogic = () => {
    setLogic(null);
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Conditional Logic
          </DialogTitle>
          <DialogDescription>
            Show this question only when specific conditions are met based on
            previous answers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {availableQuestions.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No previous questions available. Add questions before this one to
                enable conditional logic.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {logic?.rules && logic.rules.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Show this question if:
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveAllLogic}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Remove All Logic
                </Button>
              </div>

              {logic.rules.map((rule, index) => (
                <LogicRuleEditor
                  key={index}
                  rule={rule}
                  availableQuestions={availableQuestions}
                  onUpdate={(updatedRule) => handleUpdateRule(index, updatedRule)}
                  onDelete={() => handleDeleteRule(index)}
                />
              ))}

              {logic.rules.length === 1 && (
                <div className="text-xs text-gray-500 italic">
                  Note: MVP version supports single logic rule. Multiple rules with
                  AND/OR operators coming in Phase 2.
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mb-4 inline-flex rounded-full bg-gray-100 p-3">
                <GitBranch className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                No conditional logic set for this question
              </p>
              {availableQuestions.length > 0 && (
                <Button onClick={handleAddRule} variant="outline">
                  Add Logic Rule
                </Button>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Logic</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LogicRuleEditor({
  rule,
  availableQuestions,
  onUpdate,
  onDelete,
}: {
  rule: LogicRule;
  availableQuestions: Question[];
  onUpdate: (rule: Partial<LogicRule>) => void;
  onDelete: () => void;
}) {
  const selectedQuestion = availableQuestions.find(
    (q) => q.id === rule.triggerQuestionId
  );

  const availableConditions = selectedQuestion
    ? getConditionsForQuestionType(selectedQuestion.type)
    : [];

  const handleQuestionChange = (questionId: string) => {
    const newQuestion = availableQuestions.find((q) => q.id === questionId);
    if (!newQuestion) return;

    const defaultCondition = getConditionsForQuestionType(newQuestion.type)[0];
    onUpdate({
      triggerQuestionId: questionId,
      condition: defaultCondition,
      value: "",
    });
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <Label className="text-sm font-medium">Logic Rule</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-3">
          {/* Question Selection */}
          <div>
            <Label className="text-xs text-gray-600">If answer to:</Label>
            <Select
              value={rule.triggerQuestionId}
              onValueChange={handleQuestionChange}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a question" />
              </SelectTrigger>
              <SelectContent>
                {availableQuestions.map((q, idx) => (
                  <SelectItem key={q.id} value={q.id}>
                    Q{idx + 1}: {q.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Condition Selection */}
          {selectedQuestion && (
            <div>
              <Label className="text-xs text-gray-600">Condition:</Label>
              <Select
                value={rule.condition}
                onValueChange={(value) =>
                  onUpdate({ condition: value as LogicCondition })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableConditions.map((cond) => (
                    <SelectItem key={cond} value={cond}>
                      {getConditionLabel(cond)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Value Selection */}
          {selectedQuestion && (
            <div>
              <Label className="text-xs text-gray-600">Value:</Label>
              {renderValueInput(selectedQuestion, rule, onUpdate)}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function renderValueInput(
  question: Question,
  rule: LogicRule,
  onUpdate: (rule: Partial<LogicRule>) => void
) {
  // For multiple choice, dropdown, yes/no - show dropdown of options
  if (
    question.type === "multiple_choice" ||
    question.type === "dropdown" ||
    question.type === "yes_no"
  ) {
    const choices =
      question.type === "yes_no"
        ? ["Yes", "No"]
        : question.options.choices || [];

    return (
      <Select
        value={typeof rule.value === "string" ? rule.value : ""}
        onValueChange={(value) => onUpdate({ value })}
      >
        <SelectTrigger className="mt-1">
          <SelectValue placeholder="Select a value" />
        </SelectTrigger>
        <SelectContent>
          {choices.map((choice: string) => (
            <SelectItem key={choice} value={choice}>
              {choice}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // For checkbox with "contains" condition - show checkboxes
  if (question.type === "checkbox" && rule.condition === "contains") {
    const choices = question.options.choices || [];
    const selectedValues = Array.isArray(rule.value) ? rule.value : [];

    return (
      <div className="mt-1 space-y-2 border rounded-md p-3">
        {choices.map((choice: string) => (
          <div key={choice} className="flex items-center space-x-2">
            <Checkbox
              id={`checkbox-${choice}`}
              checked={selectedValues.includes(choice)}
              onCheckedChange={(checked) => {
                const newValues = checked
                  ? [...selectedValues, choice]
                  : selectedValues.filter((v) => v !== choice);
                onUpdate({ value: newValues });
              }}
            />
            <label
              htmlFor={`checkbox-${choice}`}
              className="text-sm font-normal cursor-pointer"
            >
              {choice}
            </label>
          </div>
        ))}
      </div>
    );
  }

  // For rating scale - show number input
  if (question.type === "rating_scale") {
    const min = question.options.min || 1;
    const max = question.options.max || 5;

    return (
      <Input
        type="number"
        min={min}
        max={max}
        value={typeof rule.value === "string" ? rule.value : ""}
        onChange={(e) => onUpdate({ value: e.target.value })}
        placeholder={`Enter value (${min}-${max})`}
        className="mt-1"
      />
    );
  }

  // For text input - show text input
  return (
    <Input
      type="text"
      value={typeof rule.value === "string" ? rule.value : ""}
      onChange={(e) => onUpdate({ value: e.target.value })}
      placeholder="Enter value"
      className="mt-1"
    />
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border bg-card text-card-foreground ${className}`}>
      {children}
    </div>
  );
}
