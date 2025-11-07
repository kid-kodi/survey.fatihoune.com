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
import { ArrowLeft, Plus, Trash2, GripVertical, GitBranch, CheckCircle2, ExternalLink, Copy, Share2, Lock, Users } from "lucide-react";
import { LogicEditor } from "@/components/LogicEditor";
import { ShareDialog } from "@/components/ShareDialog";
import { QuestionLogic } from "@/lib/logic-types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VisibilitySelector } from "@/components/surveys/VisibilitySelector";
import { useOrganization } from "@/contexts/OrganizationContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { useTranslations } from "next-intl";

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
  visibility?: "private" | "organization";
  organizationId?: string | null;
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
  const t = useTranslations('SurveyEditor');
  const tOrg = useTranslations('Organization');
  const router = useRouter();
  const params = useParams();
  const surveyId = params.id as string;
  const { data: session, isPending } = useSession();
  const { currentOrganization, isPersonalWorkspace } = useOrganization();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTypeDialog, setShowTypeDialog] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [pendingVisibility, setPendingVisibility] = useState<"private" | "organization" | null>(null);
  const [showVisibilityDialog, setShowVisibilityDialog] = useState(false);

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
      setError(`${t("failed_load_survey")}`);
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
          text: t("untitled_question"),
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
      alert(`${t("failed_add_question")}`);
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
      alert(`${t("failed_add_question")}`);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm(`${t("delete_question")}`)) {
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
      alert(`${t("failed_delete_question")}`);
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
      alert(`${t("failed_reorder_questions")}`);
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
          setError(data.error || `${t("failed_publish")}`);
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
      setError(`${t("unexpected_error_publishing")}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!survey) return;
    if (!confirm(`${t("confirm_unpublish")}`)) {
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
        setError(data.error || `${t("failed_unpublish")}`);
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
      setError(`${t("unexpected_error_unpublishing")}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleVisibilityChange = (newVisibility: "private" | "organization") => {
    setPendingVisibility(newVisibility);
    setShowVisibilityDialog(true);
  };

  const confirmVisibilityChange = async () => {
    if (!survey || !pendingVisibility) return;

    try {
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visibility: pendingVisibility,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update visibility");
      }

      // Update local state
      setSurvey((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          visibility: pendingVisibility,
        };
      });

      setShowVisibilityDialog(false);
      setPendingVisibility(null);
    } catch (error) {
      console.error("Error updating visibility:", error);
      setError("Failed to update visibility");
    }
  };

  const copyPublicUrl = () => {
    if (!survey) return;
    const url = `${window.location.origin}/s/${survey.uniqueId}`;
    navigator.clipboard.writeText(url);
    alert(`${t("public_url_copied")}`);
  };

  if (isPending || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">{t("loading")}</p>
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
                {t("back_to_dashboard")}
              </Button>
            </div>
          </div>
        </nav>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 border border-red-200">
            {error || `${t("survey_not_found")}`}
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
                {t("back")}
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {survey.title}
                </h1>
                <p className="text-sm text-gray-500">{t("survey_builder")}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {survey.status === "draft" ? (
                <>
                  <span className="text-sm text-gray-500">{t("auto_saved")}</span>
                  <Button
                    onClick={handlePublish}
                    disabled={isPublishing}
                  >
                    {isPublishing ? `${t("publishing")}` : 
                    `${t("publish_survey")}`}
                  </Button>
                </>
              ) : (
                <>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    {t("published")}
                  </Badge>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setShareDialogOpen(true)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    {t("share")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyPublicUrl}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {t("copy_link")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/s/${survey.uniqueId}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {t("view")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleUnpublish}
                    disabled={isPublishing}
                  >
                    {isPublishing ? `${t("unpublishing")}` : 
                    `${t("unpublish")}`}
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
                  <strong>{t("survey_published_success")}</strong> {t("survey_live_at")}
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
              <strong>{t("cannot_publish_survey")}</strong>
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
                  {t("live")}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Visibility Setting */}
              {survey.organizationId && (
                <div className="space-y-2">
                  <Label htmlFor="visibility">{tOrg("visibility")}</Label>
                  <VisibilitySelector
                    value={survey.visibility || "organization"}
                    onChange={(value) => {
                      setPendingVisibility(value);
                      setShowVisibilityDialog(true);
                    }}
                    disabled={false}
                    isOrganizationContext={!!survey.organizationId}
                  />
                  <p className="text-sm text-muted-foreground">
                    {survey.visibility === "private"
                      ? tOrg("visibility_private_help")
                      : tOrg("visibility_organization_help")}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("questions")}</CardTitle>
                <CardDescription>
                  {t("add_edit_questions")}
                </CardDescription>
              </div>
              <Dialog open={showTypeDialog} onOpenChange={setShowTypeDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {t("add_question")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{t("select_question_type")}</DialogTitle>
                    <DialogDescription>
                      {t("choose_question_type")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-3 py-4">
                    <Button
                      variant="outline"
                      className="justify-start h-auto p-4 text-left"
                      onClick={() => handleAddQuestion("multiple_choice")}
                    >
                      <div>
                        <div className="font-semibold">{t("multiple_choice")}</div>
                        <div className="text-sm text-gray-500">
                          {t("multiple_choice_desc")}
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start h-auto p-4 text-left"
                      onClick={() => handleAddQuestion("text_input")}
                    >
                      <div>
                        <div className="font-semibold">{t("text_input")}</div>
                        <div className="text-sm text-gray-500">
                          {t("text_input_desc")}
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start h-auto p-4 text-left"
                      onClick={() => handleAddQuestion("rating_scale")}
                    >
                      <div>
                        <div className="font-semibold">{t("rating_scale")}</div>
                        <div className="text-sm text-gray-500">
                          {t("rating_scale_desc")}
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start h-auto p-4 text-left"
                      onClick={() => handleAddQuestion("checkbox")}
                    >
                      <div>
                        <div className="font-semibold">{t("checkbox")}</div>
                        <div className="text-sm text-gray-500">
                          {t("checkbox_desc")}
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start h-auto p-4 text-left"
                      onClick={() => handleAddQuestion("dropdown")}
                    >
                      <div>
                        <div className="font-semibold">{t("dropdown")}</div>
                        <div className="text-sm text-gray-500">
                          {t("dropdown_desc")}
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start h-auto p-4 text-left"
                      onClick={() => handleAddQuestion("yes_no")}
                    >
                      <div>
                        <div className="font-semibold">{t("yes_no")}</div>
                        <div className="text-sm text-gray-500">
                          {t("yes_no_desc")}
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
                  {t("no_questions_yet")}
                </h3>
                <p className="mb-4 text-gray-600">
                  {t("add_first_question")}
                </p>
                <Button onClick={() => setShowTypeDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("add_question")}
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

      {/* Share Dialog */}
      {survey && (
        <ShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          surveyTitle={survey.title}
          uniqueId={survey.uniqueId}
        />
      )}

      {/* Visibility Change Confirmation Dialog */}
      <AlertDialog open={showVisibilityDialog} onOpenChange={setShowVisibilityDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tOrg("change_visibility_confirm_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingVisibility === "private"
                ? tOrg("change_visibility_to_private_confirm")
                : tOrg("change_visibility_to_organization_confirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingVisibility(null)}>
              {tOrg("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmVisibilityChange}>
              {tOrg("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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

  const t = useTranslations('SurveyEditor');

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
                placeholder={`${t("question_text")}`}
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
                  <Label className="text-sm text-gray-600">{t("type")}</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={localQuestion.options.variant === "short" ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        handleOptionsChange({ ...localQuestion.options, variant: "short" })
                      }
                    >
                      {t("short_text")}
                    </Button>
                    <Button
                      variant={localQuestion.options.variant === "long" ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        handleOptionsChange({ ...localQuestion.options, variant: "long" })
                      }
                    >
                      {t("long_text")}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">{t("placeholder")}</Label>
                  <Input
                    value={localQuestion.options.placeholder || ""}
                    onChange={(e) =>
                      handleOptionsChange({
                        ...localQuestion.options,
                        placeholder: e.target.value,
                      })
                    }
                    placeholder={`${t("placeholder_example")}`}
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
                    <Label className="text-sm text-gray-600">{t("min_value")}</Label>
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
                    <Label className="text-sm text-gray-600">{t("max_value")}</Label>
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
                    <Label className="text-sm text-gray-600">{t("min_label")}</Label>
                    <Input
                      value={localQuestion.options.minLabel || ""}
                      onChange={(e) =>
                        handleOptionsChange({
                          ...localQuestion.options,
                          minLabel: e.target.value,
                        })
                      }
                      placeholder={`${t("min_label_example")}`}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">{t("max_label")}</Label>
                    <Input
                      value={localQuestion.options.maxLabel || ""}
                      onChange={(e) =>
                        handleOptionsChange({
                          ...localQuestion.options,
                          maxLabel: e.target.value,
                        })
                      }
                      placeholder={`${t("max_label_example")}`}
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
                  {t("yes")}
                </div>
                <div className="flex h-9 items-center rounded-md border border-gray-300 px-4">
                  {t("no")}
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
                    {t("required")}
                  </Label>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLogicEditor(true)}
                  className="h-8 text-xs"
                >
                  <GitBranch className="h-3.5 w-3.5 mr-1.5" />
                  {localQuestion.logic ? `${t("edit_logic")}` : `${t("add_logic")}`}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {localQuestion.logic && (
                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800 hover:bg-purple-100">
                    <GitBranch className="h-3 w-3 mr-1" />
                    {t("has_logic")}
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
  const t = useTranslations('SurveyEditor');
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
        {t("add_option")}
      </Button>
    </div>
  );
}
