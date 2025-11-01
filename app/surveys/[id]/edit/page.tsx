"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";

type QuestionType = "multiple_choice" | "text_input" | "rating_scale" | "checkbox" | "dropdown" | "yes_no";

type Question = {
  id: string;
  surveyId: string;
  type: QuestionType;
  text: string;
  options: any;
  required: boolean;
  order: number;
};

type Survey = {
  id: string;
  uniqueId: string;
  title: string;
  description: string | null;
  status: "draft" | "published" | "archived";
  questions: Question[];
};

export default function SurveyEditPage() {
  const router = useRouter();
  const params = useParams();
  const surveyId = params.id as string;
  const { data: session, isPending } = useSession();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTypeDialog, setShowTypeDialog] = useState(false);

  useEffect(() => {
    if (session?.user && surveyId) {
      fetchSurvey();
    }
  }, [session, surveyId]);

  const fetchSurvey = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await fetch(`/api/surveys/${surveyId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch survey");
      }

      const data = await response.json();
      setSurvey(data.survey);
    } catch (err) {
      setError("Failed to load survey. Please try again.");
      console.error("Fetch survey error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuestion = async (type: QuestionType) => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          text: "Untitled Question",
          options: type === "multiple_choice" ? { choices: ["Option 1", "Option 2"] } : {},
          required: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create question");
      }

      const data = await response.json();
      setSurvey((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          questions: [...prev.questions, data.question],
        };
      });

      setShowTypeDialog(false);
    } catch (error) {
      console.error("Add question error:", error);
      alert("Failed to add question. Please try again.");
    }
  };

  if (isPending || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center">
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard")}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </nav>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 border border-red-200">
            {error || "Survey not found"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard")}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {survey.title}
                </h1>
                <p className="text-sm text-gray-500">Survey Builder</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" disabled>
                Save Draft
              </Button>
              <Button disabled>Publish</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Survey Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{survey.title}</CardTitle>
            {survey.description && (
              <CardDescription>{survey.description}</CardDescription>
            )}
          </CardHeader>
        </Card>

        {/* Questions Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Questions</CardTitle>
                <CardDescription>
                  Add and edit survey questions
                </CardDescription>
              </div>
              <Dialog open={showTypeDialog} onOpenChange={setShowTypeDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Question
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Select Question Type</DialogTitle>
                    <DialogDescription>
                      Choose the type of question you want to add
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-3 py-4">
                    <Button
                      variant="outline"
                      className="justify-start h-auto p-4"
                      onClick={() => handleAddQuestion("multiple_choice")}
                    >
                      <div className="text-left">
                        <div className="font-semibold">Multiple Choice</div>
                        <div className="text-sm text-gray-500">
                          Let respondents choose one option
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start h-auto p-4"
                      disabled
                    >
                      <div className="text-left">
                        <div className="font-semibold">Text Input</div>
                        <div className="text-sm text-gray-500">
                          Coming in Story 2.4
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start h-auto p-4"
                      disabled
                    >
                      <div className="text-left">
                        <div className="font-semibold">Other Types</div>
                        <div className="text-sm text-gray-500">
                          Rating, Checkbox, Dropdown, Yes/No - Coming in Story 2.4
                        </div>
                      </div>
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {survey.questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-full bg-gray-100 p-4">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  No questions yet
                </h3>
                <p className="mb-4 text-gray-600">
                  Add your first question to start building your survey
                </p>
                <Button onClick={() => setShowTypeDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {survey.questions.map((question, index) => (
                  <QuestionEditor
                    key={question.id}
                    question={question}
                    index={index}
                    onUpdate={(updatedQuestion) => {
                      setSurvey((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          questions: prev.questions.map((q) =>
                            q.id === updatedQuestion.id ? updatedQuestion : q
                          ),
                        };
                      });
                    }}
                    onDelete={(questionId) => {
                      setSurvey((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          questions: prev.questions.filter(
                            (q) => q.id !== questionId
                          ),
                        };
                      });
                    }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function QuestionEditor({
  question,
  index,
  onUpdate,
  onDelete,
}: {
  question: Question;
  index: number;
  onUpdate: (question: Question) => void;
  onDelete: (questionId: string) => void;
}) {
  const [localQuestion, setLocalQuestion] = useState(question);
  const [isSaving, setIsSaving] = useState(false);

  const handleTextChange = (text: string) => {
    setLocalQuestion((prev) => ({ ...prev, text }));
  };

  const handleRequiredToggle = (required: boolean) => {
    setLocalQuestion((prev) => ({ ...prev, required }));
  };

  const handleAddOption = () => {
    const newOptions = {
      ...localQuestion.options,
      choices: [
        ...(localQuestion.options.choices || []),
        `Option ${(localQuestion.options.choices || []).length + 1}`,
      ],
    };
    setLocalQuestion((prev) => ({ ...prev, options: newOptions }));
  };

  const handleUpdateOption = (optionIndex: number, value: string) => {
    const newChoices = [...(localQuestion.options.choices || [])];
    newChoices[optionIndex] = value;
    setLocalQuestion((prev) => ({
      ...prev,
      options: { ...prev.options, choices: newChoices },
    }));
  };

  const handleDeleteOption = (optionIndex: number) => {
    const newChoices = (localQuestion.options.choices || []).filter(
      (_: any, i: number) => i !== optionIndex
    );
    setLocalQuestion((prev) => ({
      ...prev,
      options: { ...prev.options, choices: newChoices },
    }));
  };

  // Auto-save when changes are made (debounced would be better in production)
  useEffect(() => {
    if (JSON.stringify(localQuestion) !== JSON.stringify(question)) {
      const timer = setTimeout(() => {
        onUpdate(localQuestion);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [localQuestion]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="flex items-center text-gray-400">
            <GripVertical className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <Input
                value={localQuestion.text}
                onChange={(e) => handleTextChange(e.target.value)}
                className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0"
                placeholder="Question text"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(question.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {question.type === "multiple_choice" && (
              <div className="space-y-2">
                {(localQuestion.options.choices || []).map((choice: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-gray-300" />
                    <Input
                      value={choice}
                      onChange={(e) => handleUpdateOption(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1"
                    />
                    {(localQuestion.options.choices || []).length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteOption(idx)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center space-x-2">
                <Switch
                  id={`required-${question.id}`}
                  checked={localQuestion.required}
                  onCheckedChange={handleRequiredToggle}
                />
                <Label htmlFor={`required-${question.id}`} className="text-sm">
                  Required
                </Label>
              </div>
              <span className="text-xs text-gray-500">
                Q{index + 1} • {question.type.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
