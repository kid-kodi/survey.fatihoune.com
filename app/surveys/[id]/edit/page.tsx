"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { ArrowLeft, Plus, Trash2, GripVertical, GitBranch, CheckCircle2, ExternalLink, Copy } from "lucide-react";
import { LogicEditor } from "@/components/LogicEditor";
import { QuestionLogic } from "@/lib/logic-types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type QuestionType = "multiple_choice" | "text_input" | "rating_scale" | "checkbox" | "dropdown" | "yes_no";

type Question = {
  id: string;
  surveyId: string;
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

const questionTypeDefaults: Record<QuestionType, any> = {
  multiple_choice: { choices: ["Option 1", "Option 2"] },
  text_input: { variant: "short", placeholder: "Your answer here...", maxLength: 500 },
  rating_scale: { min: 1, max: 5, minLabel: "Poor", maxLabel: "Excellent" },
  checkbox: { choices: ["Option 1", "Option 2"] },
  dropdown: { choices: ["Option 1", "Option 2"] },
  yes_no: {},
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
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
          options: questionTypeDefaults[type],
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

  const handleUpdateQuestion = async (updatedQuestion: Question) => {
    try {
      const response = await fetch(
        `/api/surveys/${surveyId}/questions/${updatedQuestion.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: updatedQuestion.type,
            text: updatedQuestion.text,
            options: updatedQuestion.options,
            required: updatedQuestion.required,
            logic: updatedQuestion.logic,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update question");
      }

      setSurvey((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          questions: prev.questions.map((q) =>
            q.id === updatedQuestion.id ? updatedQuestion : q
          ),
        };
      });
    } catch (error) {
      console.error("Update question error:", error);
      alert("Failed to update question. Please try again.");
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/surveys/${surveyId}/questions/${questionId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete question");
      }

      setSurvey((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          questions: prev.questions.filter((q) => q.id !== questionId),
        };
      });
    } catch (error) {
      console.error("Delete question error:", error);
      alert("Failed to delete question. Please try again.");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !survey) {
      return;
    }

    const oldIndex = survey.questions.findIndex((q) => q.id === active.id);
    const newIndex = survey.questions.findIndex((q) => q.id === over.id);

    const newQuestions = arrayMove(survey.questions, oldIndex, newIndex);

    // Optimistically update UI
    setSurvey((prev) => {
      if (!prev) return prev;
      return { ...prev, questions: newQuestions };
    });

    // Persist to backend
    try {
      const response = await fetch(`/api/surveys/${surveyId}/questions/reorder`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionIds: newQuestions.map((q) => q.id),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reorder questions");
      }
    } catch (error) {
      console.error("Reorder questions error:", error);
      alert("Failed to reorder questions. Please refresh the page.");
      // Revert on error
      fetchSurvey();
    }
  };

  const handlePublish = async () => {
    if (!survey) return;

    setIsPublishing(true);
    setValidationErrors([]);
    setPublishSuccess(false);

    try {
      const response = await fetch(`/api/surveys/${surveyId}/publish`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.validationErrors) {
          setValidationErrors(data.validationErrors);
        } else {
          setError(data.error || "Failed to publish survey");
        }
      } else {
        // Update local state
        setSurvey((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: "published",
            publishedAt: data.survey.publishedAt,
          };
        });
        setPublishSuccess(true);
        // Auto-hide success message after 5 seconds
        setTimeout(() => setPublishSuccess(false), 5000);
      }
    } catch (error) {
      console.error("Publish survey error:", error);
      setError("An unexpected error occurred while publishing");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!survey) return;
    if (!confirm("Are you sure you want to unpublish this survey? It will no longer be accessible to respondents.")) {
      return;
    }

    setIsPublishing(true);
    setPublishSuccess(false);

    try {
      const response = await fetch(`/api/surveys/${surveyId}/publish`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to unpublish survey");
      } else {
        // Update local state
        setSurvey((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: "draft",
          };
        });
      }
    } catch (error) {
      console.error("Unpublish survey error:", error);
      setError("An unexpected error occurred while unpublishing");
    } finally {
      setIsPublishing(false);
    }
  };

  const copyPublicUrl = () => {
    if (!survey) return;
    const url = `${window.location.origin}/s/${survey.uniqueId}`;
    navigator.clipboard.writeText(url);
    alert("Public URL copied to clipboard!");
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
              {survey.status === "draft" ? (
                <>
                  <span className="text-sm text-gray-500">Auto-saved</span>
                  <Button
                    onClick={handlePublish}
                    disabled={isPublishing}
                  >
                    {isPublishing ? "Publishing..." : "Publish Survey"}
                  </Button>
                </>
              ) : (
                <>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    Published
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyPublicUrl}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/s/${survey.uniqueId}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleUnpublish}
                    disabled={isPublishing}
                  >
                    {isPublishing ? "Unpublishing..." : "Unpublish"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Success Message */}
        {publishSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="flex items-center justify-between">
                <span>
                  <strong>Survey published successfully!</strong> Your survey is now live at:
                </span>
                <div className="flex items-center gap-2 ml-4">
                  <a
                    href={`/s/${survey.uniqueId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline"
                  >
                    {window.location.origin}/s/{survey.uniqueId}
                  </a>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyPublicUrl}
                    className="h-6 px-2"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              <strong>Cannot publish survey:</strong>
              <ul className="mt-2 list-disc list-inside">
                {validationErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Survey Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{survey.title}</CardTitle>
                {survey.description && (
                  <CardDescription>{survey.description}</CardDescription>
                )}
              </div>
              {survey.status === "published" && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              )}
            </div>
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
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Select Question Type</DialogTitle>
                    <DialogDescription>
                      Choose the type of question you want to add
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-3 py-4">
                    <Button
                      variant="outline"
                      className="justify-start h-auto p-4 text-left"
                      onClick={() => handleAddQuestion("multiple_choice")}
                    >
                      <div>
                        <div className="font-semibold">Multiple Choice</div>
                        <div className="text-sm text-gray-500">
                          Respondents choose one option
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start h-auto p-4 text-left"
                      onClick={() => handleAddQuestion("text_input")}
                    >
                      <div>
                        <div className="font-semibold">Text Input</div>
                        <div className="text-sm text-gray-500">
                          Short or long text responses
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start h-auto p-4 text-left"
                      onClick={() => handleAddQuestion("rating_scale")}
                    >
                      <div>
                        <div className="font-semibold">Rating Scale</div>
                        <div className="text-sm text-gray-500">
                          Numeric rating (e.g., 1-5 stars)
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start h-auto p-4 text-left"
                      onClick={() => handleAddQuestion("checkbox")}
                    >
                      <div>
                        <div className="font-semibold">Checkbox</div>
                        <div className="text-sm text-gray-500">
                          Select multiple options
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start h-auto p-4 text-left"
                      onClick={() => handleAddQuestion("dropdown")}
                    >
                      <div>
                        <div className="font-semibold">Dropdown</div>
                        <div className="text-sm text-gray-500">
                          Select from dropdown list
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start h-auto p-4 text-left"
                      onClick={() => handleAddQuestion("yes_no")}
                    >
                      <div>
                        <div className="font-semibold">Yes/No</div>
                        <div className="text-sm text-gray-500">
                          Simple binary choice
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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={survey.questions.map((q) => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {survey.questions.map((question, index) => (
                      <QuestionEditor
                        key={question.id}
                        question={question}
                        index={index}
                        allQuestions={survey.questions}
                        onUpdate={handleUpdateQuestion}
                        onDelete={handleDeleteQuestion}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
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
  allQuestions,
  onUpdate,
  onDelete,
}: {
  question: Question;
  index: number;
  allQuestions: Question[];
  onUpdate: (question: Question) => void;
  onDelete: (questionId: string) => void;
}) {
  const [localQuestion, setLocalQuestion] = useState(question);
  const [showLogicEditor, setShowLogicEditor] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleTextChange = (text: string) => {
    setLocalQuestion((prev) => ({ ...prev, text }));
  };

  const handleRequiredToggle = (required: boolean) => {
    setLocalQuestion((prev) => ({ ...prev, required }));
  };

  const handleOptionsChange = (options: any) => {
    setLocalQuestion((prev) => ({ ...prev, options }));
  };

  const handleLogicSave = (logic: QuestionLogic | null) => {
    setLocalQuestion((prev) => ({ ...prev, logic }));
  };

  // Auto-save when changes are made
  useEffect(() => {
    if (JSON.stringify(localQuestion) !== JSON.stringify(question)) {
      const timer = setTimeout(() => {
        onUpdate(localQuestion);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [localQuestion]);

  return (
    <Card ref={setNodeRef} style={style}>
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div
            className="flex items-center text-gray-400 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
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

            {/* Multiple Choice Options */}
            {question.type === "multiple_choice" && (
              <ChoiceOptions
                choices={localQuestion.options.choices || []}
                onChange={(choices) =>
                  handleOptionsChange({ ...localQuestion.options, choices })
                }
                icon="radio"
              />
            )}

            {/* Checkbox Options */}
            {question.type === "checkbox" && (
              <ChoiceOptions
                choices={localQuestion.options.choices || []}
                onChange={(choices) =>
                  handleOptionsChange({ ...localQuestion.options, choices })
                }
                icon="checkbox"
              />
            )}

            {/* Dropdown Options */}
            {question.type === "dropdown" && (
              <ChoiceOptions
                choices={localQuestion.options.choices || []}
                onChange={(choices) =>
                  handleOptionsChange({ ...localQuestion.options, choices })
                }
                icon="dropdown"
              />
            )}

            {/* Text Input Settings */}
            {question.type === "text_input" && (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <Label className="text-sm text-gray-600">Type:</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={localQuestion.options.variant === "short" ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        handleOptionsChange({ ...localQuestion.options, variant: "short" })
                      }
                    >
                      Short Text
                    </Button>
                    <Button
                      variant={localQuestion.options.variant === "long" ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        handleOptionsChange({ ...localQuestion.options, variant: "long" })
                      }
                    >
                      Long Text
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Placeholder:</Label>
                  <Input
                    value={localQuestion.options.placeholder || ""}
                    onChange={(e) =>
                      handleOptionsChange({
                        ...localQuestion.options,
                        placeholder: e.target.value,
                      })
                    }
                    placeholder="e.g., Enter your answer here..."
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* Rating Scale Settings */}
            {question.type === "rating_scale" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-gray-600">Min Value:</Label>
                    <Input
                      type="number"
                      value={localQuestion.options.min || 1}
                      onChange={(e) =>
                        handleOptionsChange({
                          ...localQuestion.options,
                          min: parseInt(e.target.value) || 1,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Max Value:</Label>
                    <Input
                      type="number"
                      value={localQuestion.options.max || 5}
                      onChange={(e) =>
                        handleOptionsChange({
                          ...localQuestion.options,
                          max: parseInt(e.target.value) || 5,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-gray-600">Min Label:</Label>
                    <Input
                      value={localQuestion.options.minLabel || ""}
                      onChange={(e) =>
                        handleOptionsChange({
                          ...localQuestion.options,
                          minLabel: e.target.value,
                        })
                      }
                      placeholder="e.g., Poor"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Max Label:</Label>
                    <Input
                      value={localQuestion.options.maxLabel || ""}
                      onChange={(e) =>
                        handleOptionsChange({
                          ...localQuestion.options,
                          maxLabel: e.target.value,
                        })
                      }
                      placeholder="e.g., Excellent"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Yes/No Preview */}
            {question.type === "yes_no" && (
              <div className="flex gap-2">
                <div className="flex h-9 items-center rounded-md border border-gray-300 px-4">
                  Yes
                </div>
                <div className="flex h-9 items-center rounded-md border border-gray-300 px-4">
                  No
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-4">
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLogicEditor(true)}
                  className="h-8 text-xs"
                >
                  <GitBranch className="h-3.5 w-3.5 mr-1.5" />
                  {localQuestion.logic ? "Edit Logic" : "Add Logic"}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {localQuestion.logic && (
                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800 hover:bg-purple-100">
                    <GitBranch className="h-3 w-3 mr-1" />
                    Has Logic
                  </Badge>
                )}
                <span className="text-xs text-gray-500">
                  Q{index + 1} • {question.type.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <LogicEditor
        open={showLogicEditor}
        onOpenChange={setShowLogicEditor}
        currentQuestion={localQuestion}
        allQuestions={allQuestions}
        onSave={handleLogicSave}
      />
    </Card>
  );
}

function ChoiceOptions({
  choices,
  onChange,
  icon,
}: {
  choices: string[];
  onChange: (choices: string[]) => void;
  icon: "radio" | "checkbox" | "dropdown";
}) {
  const handleAddOption = () => {
    onChange([...choices, `Option ${choices.length + 1}`]);
  };

  const handleUpdateOption = (index: number, value: string) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    onChange(newChoices);
  };

  const handleDeleteOption = (index: number) => {
    if (choices.length > 2) {
      onChange(choices.filter((_, i) => i !== index));
    }
  };

  const getIcon = () => {
    if (icon === "radio") {
      return <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-gray-300" />;
    }
    if (icon === "checkbox") {
      return <div className="flex h-4 w-4 items-center justify-center rounded border-2 border-gray-300" />;
    }
    return <div className="text-gray-400 text-xs">▼</div>;
  };

  return (
    <div className="space-y-2">
      {choices.map((choice, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {getIcon()}
          <Input
            value={choice}
            onChange={(e) => handleUpdateOption(idx, e.target.value)}
            placeholder={`Option ${idx + 1}`}
            className="flex-1"
          />
          {choices.length > 2 && (
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
  );
}
