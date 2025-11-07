"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, FileText, Sparkles } from "lucide-react";
import { SURVEY_TEMPLATES, SurveyTemplate } from "@/lib/templates";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { VisibilitySelector } from "@/components/surveys/VisibilitySelector";
import { useOrganization } from "@/contexts/OrganizationContext";
import Link from "next/link";
import { trackSurveyCreated } from "@/lib/analytics";

type CreateMode = "choice" | "scratch" | "template";
type Visibility = "private" | "organization";

export default function NewSurveyPage() {
  const t = useTranslations('NewSurvey');
  const tOrg = useTranslations('Organization');
  const tSub = useTranslations('Subscription');
  const router = useRouter();
  const { currentOrganization, isPersonalWorkspace } = useOrganization();
  const [mode, setMode] = useState<CreateMode>("choice");
  const [selectedTemplate, setSelectedTemplate] = useState<SurveyTemplate | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    visibility: "organization" as Visibility,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [usage, setUsage] = useState<{
    current: number;
    limit: number | 'unlimited';
  } | null>(null);

  useEffect(() => {
    fetch('/api/usage/surveys')
      .then((res) => res.json())
      .then((data) => setUsage(data))
      .catch((err) => console.error('Failed to fetch survey usage:', err));
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = `${t("title_required")}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/surveys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          templateId: selectedTemplate?.id || null,
          visibility: formData.visibility,
          organizationId: !isPersonalWorkspace && currentOrganization ? currentOrganization.id : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          general: data.error || `${t("failed_create")}`,
        });
      } else {
        // Track survey creation
        trackSurveyCreated();
        // Redirect to survey builder
        router.push(`/surveys/${data.survey.id}/edit`);
      }
    } catch (error) {
      setErrors({
        general: `${t("unexpected_error")}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template: SurveyTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      title: template.name,
      description: template.description,
      visibility: "organization" as Visibility,
    });
    setMode("template");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Choice Screen
  if (mode === "choice") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* <nav className="border-b bg-white">
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
              <h1 className="text-xl font-bold text-gray-900">{t("create_new_survey")}</h1>
            </div>
          </div>
        </nav> */}


        {/* <div className="mb-8 space-y-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("back_to_dashboard")}
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("create_new_survey")}
          </h1>
        </div> */}
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("back_to_dashboard")}
              </Button>
            </Link>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t("create_new_survey")}
            </h2>
            <p className="text-gray-600">
              {t("choose_template")}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
              onClick={() => setMode("scratch")}
            >
              <CardHeader>
                <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>{t("start_from_scratch")}</CardTitle>
                <CardDescription>
                  {t("scratch_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{t("scratch_point1")}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{t("scratch_point2")}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{t("scratch_point3")}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary relative"
              onClick={() => setMode("template")}
            >
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  {t("recommended")}
                </Badge>
              </div>
              <CardHeader>
                <div className="mb-4 inline-flex rounded-lg bg-purple-100 p-3">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>{t("use_template")}</CardTitle>
                <CardDescription>
                  {t("template_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{t("template_point1")}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{t("template_point2")}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{t("template_point3")}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Template Gallery
  if (mode === "template" && !selectedTemplate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex h-16 items-center">
              <Button
                variant="ghost"
                onClick={() => setMode("choice")}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("back")}
              </Button>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t("survey_templates")}
            </h2>
            <p className="text-gray-600">
              {t("template_selection")}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SURVEY_TEMPLATES.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
                onClick={() => handleTemplateSelect(template)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline">{template.category}</Badge>
                    <div className="text-2xl">{template.icon === "MessageSquare" ? "💬" : template.icon === "Users" ? "👥" : template.icon === "Calendar" ? "📅" : template.icon === "Package" ? "📦" : "📈"}</div>
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{template.questions.length}</span> {t("questions_included")}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Survey Details Form (for both scratch and template modes)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-start flex-col">
            <Button
              variant="ghost"
              onClick={() => {
                if (selectedTemplate) {
                  setSelectedTemplate(null);
                  setMode("template");
                  setFormData({ title: "", description: "", visibility: "organization" as Visibility });
                } else {
                  setMode("choice");
                }
              }}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("back")}
            </Button>
            <h1 className="text-xl font-bold text-gray-900">
              {selectedTemplate ? `Create from Template: ${selectedTemplate.name}` : "Create New Survey"}
            </h1>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>{t("survey_details")}</CardTitle>
            <CardDescription>
              {selectedTemplate
                ? `${t("template_customize")}`
                : `${t("scratch_customize")}`}
            </CardDescription>
            {usage && usage.limit !== 'unlimited' && (
              <p className="text-sm text-gray-600 mt-2">
                {tSub('surveys_used', {
                  current: usage.current,
                  limit: usage.limit,
                })}
              </p>
            )}
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errors.general && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200">
                  {errors.general}
                </div>
              )}

              {selectedTemplate && (
                <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800 border border-blue-200">
                  <div className="flex items-start">
                    <Sparkles className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>{t("template_selected")}</strong> {selectedTemplate.name}
                      <br />
                      {selectedTemplate.questions.length} {t("questions_will_be_added")}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">
                  {t("survey_title")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder={`${t("title_placeholder")}`}
                  value={formData.title}
                  onChange={handleChange}
                  className={errors.title ? "border-red-500" : ""}
                  disabled={isLoading}
                  autoFocus
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("description")}</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder={`${t("description_placeholder")}`}
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isLoading}
                  rows={4}
                />
                <p className="text-sm text-gray-500">
                  {t("description_helper")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">{tOrg("visibility")}</Label>
                <VisibilitySelector
                  value={formData.visibility}
                  onChange={(value) => setFormData({ ...formData, visibility: value })}
                  disabled={isLoading}
                  isOrganizationContext={!isPersonalWorkspace && !!currentOrganization}
                />
                <p className="text-sm text-gray-500">
                  {formData.visibility === "private"
                    ? "Only you can see and manage this survey"
                    : "All organization members can see this survey based on their permissions"}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (selectedTemplate) {
                    setSelectedTemplate(null);
                    setMode("template");
                    setFormData({ title: "", description: "", visibility: "organization" as Visibility });
                  } else {
                    setMode("choice");
                  }
                }}
                disabled={isLoading}
              >
                {t("back")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? `${t("creating")}` : `${t("create_survey")}`}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
