"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { QuestionLogic } from "@/lib/logic-types";
import { getVisibleQuestions } from "@/lib/logic-evaluator";
import { useTranslations } from "next-intl";

type QuestionType = "multiple_choice" | "text_input" | "rating_scale" | "checkbox" | "dropdown" | "yes_no";

type Question = {
  id: string;
  type: QuestionType;
  text: string;
  options: any;
  required: boolean;
  order: number;
  logic: QuestionLogic | null;
};

type Survey = {
  id: string;
  uniqueId: string;
  title: string;
  description: string | null;
  status: "draft" | "published" | "archived";
  questions: Question[];
};

export default function PublicSurveyPage() {
  const t = useTranslations('PublicSurvey');
  const params = useParams();
  const searchParams = useSearchParams();
  const uniqueId = params.uniqueId as string;
  const invitationToken = searchParams.get("invitation");
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Compute visible questions based on current answers and conditional logic
  const visibleQuestionIds = useMemo(() => {
    if (!survey) return new Set<string>();
    return getVisibleQuestions(survey.questions, answers);
  }, [survey, answers]);

  // Filter to only visible questions
  const visibleQuestions = useMemo(() => {
    if (!survey) return [];
    return survey.questions.filter((q) => visibleQuestionIds.has(q.id));
  }, [survey, visibleQuestionIds]);

  useEffect(() => {
    if (uniqueId) {
      fetchSurvey();
    }
  }, [uniqueId]);

  const fetchSurvey = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await fetch(`/api/public/surveys/${uniqueId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError(`${t("survey_not_found")}`);
        } else {
          throw new Error("Failed to fetch survey");
        }
      } else {
        const data = await response.json();
        setSurvey(data.survey);
      }
    } catch (err) {
      setError(`${t("failed_load")}`);
      console.error("Fetch survey error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const renderQuestion = (question: Question) => {
    const answer = answers[question.id];

    switch (question.type) {
      case "multiple_choice":
        return (
          <RadioGroup
            value={answer || ""}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            <div className="space-y-3">
              {(question.options.choices || []).map((choice: string, idx: number) => (
                <div key={idx} className="flex items-center space-x-3">
                  <RadioGroupItem
                    value={choice}
                    id={`${question.id}-${idx}`}
                    className="min-w-[20px] min-h-[20px]"
                  />
                  <Label
                    htmlFor={`${question.id}-${idx}`}
                    className="text-base font-normal cursor-pointer flex-1"
                  >
                    {choice}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case "text_input":
        const variant = question.options.variant || "short";
        if (variant === "long") {
          return (
            <Textarea
              value={answer || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder={question.options.placeholder || `${t('your_answer')}`}
              className="w-full min-h-[120px]"
            />
          );
        }
        return (
          <Input
            type="text"
            value={answer || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.options.placeholder || `${t('your_answer')}`}
            className="w-full"
            maxLength={question.options.maxLength || undefined}
          />
        );

      case "rating_scale":
        const min = question.options.min || 1;
        const max = question.options.max || 5;
        const minLabel = question.options.minLabel;
        const maxLabel = question.options.maxLabel;

        return (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleAnswerChange(question.id, num)}
                  className={`
                    min-w-[44px] min-h-[44px] px-4 py-2 rounded-md border-2 font-medium
                    transition-colors
                    ${answer === num
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }
                  `}
                >
                  {num}
                </button>
              ))}
            </div>
            {(minLabel || maxLabel) && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>{minLabel || ""}</span>
                <span>{maxLabel || ""}</span>
              </div>
            )}
          </div>
        );

      case "checkbox":
        const selectedValues = answer || [];
        return (
          <div className="space-y-3">
            {(question.options.choices || []).map((choice: string, idx: number) => (
              <div key={idx} className="flex items-center space-x-3">
                <Checkbox
                  id={`${question.id}-${idx}`}
                  checked={selectedValues.includes(choice)}
                  onCheckedChange={(checked) => {
                    const newValues = checked
                      ? [...selectedValues, choice]
                      : selectedValues.filter((v: string) => v !== choice);
                    handleAnswerChange(question.id, newValues);
                  }}
                  className="min-w-[20px] min-h-[20px]"
                />
                <Label
                  htmlFor={`${question.id}-${idx}`}
                  className="text-base font-normal cursor-pointer flex-1"
                >
                  {choice}
                </Label>
              </div>
            ))}
          </div>
        );

      case "dropdown":
        return (
          <Select
            value={answer || ""}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`${t("select_option")}`} />
            </SelectTrigger>
            <SelectContent>
              {(question.options.choices || []).map((choice: string, idx: number) => (
                <SelectItem key={idx} value={choice}>
                  {choice}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "yes_no":
        return (
          <RadioGroup
            value={answer || ""}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            <div className="flex gap-4">
              <div className="flex items-center space-x-3">
                <RadioGroupItem
                  value="Yes"
                  id={`${question.id}-yes`}
                  className="min-w-[20px] min-h-[20px]"
                />
                <Label
                  htmlFor={`${question.id}-yes`}
                  className="text-base font-normal cursor-pointer"
                >
                  {t("yes")}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem
                  value="No"
                  id={`${question.id}-no`}
                  className="min-w-[20px] min-h-[20px]"
                />
                <Label
                  htmlFor={`${question.id}-no`}
                  className="text-base font-normal cursor-pointer"
                >
                  {t("yes")}
                </Label>
              </div>
            </div>
          </RadioGroup>
        );

      default:
        return <p className="text-gray-500">{t("unsupported_question")}</p>;
    }
  };

  const validateForm = () => {
    if (!survey) return false;

    const errors: string[] = [];
    // Only validate visible required questions
    visibleQuestions.forEach((question) => {
      if (question.required) {
        const answer = answers[question.id];
        if (
          answer === undefined ||
          answer === null ||
          answer === "" ||
          (Array.isArray(answer) && answer.length === 0)
        ) {
          // Find the question's position in visible questions for display
          const questionNumber = visibleQuestions.indexOf(question) + 1;
          errors.push(`Q${questionNumber}: ${question.text}`);
        }
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Only submit answers for visible questions (exclude hidden questions based on logic)
      // Add invitation token to URL if present
      const url = invitationToken
        ? `/api/public/surveys/${survey?.uniqueId}/responses?invitation=${invitationToken}`
        : `/api/public/surveys/${survey?.uniqueId}/responses`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: visibleQuestions.map((q) => ({
            questionId: q.id,
            answer: answers[q.id] || null,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `${t("failed_submit")}`);
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Submit response error:", error);
      setError(`${t("failed_submit")}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                {t("thank_you")}
              </h2>
              <p className="text-gray-600 mb-4">
                {t("thank_you_completion")}{" "}
                <strong>{survey?.title}</strong>.
              </p>
              <p className="text-gray-600">
                {t("response_recorded")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">{t("loading_survey")}</p>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-red-100 p-3">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                {t("survey_not_found")}
              </h2>
              <p className="text-gray-600">
                {error || `${t("survey_not_available")}`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (survey.status === "archived") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-3">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                {t("survey_closed")}
              </h2>
              <p className="text-gray-600">
                {t("no_longer_accepting")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Survey Header */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl">{survey.title}</CardTitle>
            {survey.description && (
              <CardDescription className="text-base mt-2">
                {survey.description}
              </CardDescription>
            )}
          </CardHeader>
        </Card>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>{t("please_answer_required")}</strong>
              <ul className="mt-2 list-disc list-inside">
                {validationErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Survey Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {survey.questions.length === 0 ? (
                  <p className="text-center text-gray-500">
                    {t("no_questions")}
                  </p>
                ) : (
                  visibleQuestions.map((question, index) => (
                    <div
                      key={question.id}
                      className="pb-6 border-b last:border-b-0 transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-top-2"
                    >
                      <div className="mb-4">
                        <label className="text-base font-medium text-gray-900 block">
                          <span className="text-gray-500 mr-2">Q{index + 1}.</span>
                          {question.text}
                          {question.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                      </div>

                      {renderQuestion(question)}
                    </div>
                  ))
                )}
              </div>

              {visibleQuestions.length > 0 && (
                <div className="mt-8 flex justify-end">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="min-w-[200px]"
                  >
                    {isSubmitting ? `${t("submitting")}` : `${t("submit_survey")}`}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
