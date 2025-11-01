"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type QuestionType = "multiple_choice" | "text_input" | "rating_scale" | "checkbox" | "dropdown" | "yes_no";

type Question = {
  id: string;
  type: QuestionType;
  text: string;
  options: any;
  required: boolean;
  order: number;
  logic: any;
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
  const params = useParams();
  const uniqueId = params.uniqueId as string;
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Record<string, any>>({});

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
          setError("Survey not found");
        } else {
          throw new Error("Failed to fetch survey");
        }
      } else {
        const data = await response.json();
        setSurvey(data.survey);
      }
    } catch (err) {
      setError("Failed to load survey. Please try again.");
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
              placeholder={question.options.placeholder || "Your answer..."}
              className="w-full min-h-[120px]"
            />
          );
        }
        return (
          <Input
            type="text"
            value={answer || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.options.placeholder || "Your answer..."}
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
                    ${
                      answer === num
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
              <SelectValue placeholder="Select an option..." />
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
                  Yes
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
                  No
                </Label>
              </div>
            </div>
          </RadioGroup>
        );

      default:
        return <p className="text-gray-500">Unsupported question type</p>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading survey...</p>
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
                Survey Not Found
              </h2>
              <p className="text-gray-600">
                {error || "The survey you're looking for doesn't exist or is no longer available."}
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
                Survey Closed
              </h2>
              <p className="text-gray-600">
                This survey is no longer accepting responses.
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

        {/* Survey Form - Will be implemented in Story 3.3 */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {survey.questions.length === 0 ? (
                <p className="text-center text-gray-500">
                  This survey has no questions yet.
                </p>
              ) : (
                survey.questions.map((question, index) => (
                  <div key={question.id} className="pb-6 border-b last:border-b-0">
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

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
