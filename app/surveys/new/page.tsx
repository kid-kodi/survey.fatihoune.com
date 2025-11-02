"use client";

import { useState } from "react";
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

type CreateMode = "choice" | "scratch" | "template";

export default function NewSurveyPage() {
  const router = useRouter();
  const [mode, setMode] = useState<CreateMode>("choice");
  const [selectedTemplate, setSelectedTemplate] = useState<SurveyTemplate | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Survey title is required";
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          general: data.error || "Failed to create survey",
        });
      } else {
        // Redirect to survey builder
        router.push(`/surveys/${data.survey.id}/edit`);
      }
    } catch (error) {
      setErrors({
        general: "An unexpected error occurred. Please try again.",
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
              <h1 className="text-xl font-bold text-gray-900">Create New Survey</h1>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              How would you like to start?
            </h2>
            <p className="text-gray-600">
              Choose a template for quick setup or start from scratch
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
                <CardTitle>Start from Scratch</CardTitle>
                <CardDescription>
                  Create a custom survey from the ground up with complete flexibility
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Complete control over every question</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Build exactly what you need</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>No pre-filled content</span>
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
                  Recommended
                </Badge>
              </div>
              <CardHeader>
                <div className="mb-4 inline-flex rounded-lg bg-purple-100 p-3">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Use a Template</CardTitle>
                <CardDescription>
                  Get started quickly with professionally designed survey templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Pre-built questions and structure</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Save time with proven formats</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Fully customizable after creation</span>
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
        <nav className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center">
              <Button
                variant="ghost"
                onClick={() => setMode("choice")}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Choose a Template</h1>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Survey Templates
            </h2>
            <p className="text-gray-600">
              Select a template to get started. You can customize it after creation.
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
                    <span className="font-medium">{template.questions.length}</span> questions included
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
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <Button
              variant="ghost"
              onClick={() => {
                if (selectedTemplate) {
                  setSelectedTemplate(null);
                  setMode("template");
                  setFormData({ title: "", description: "" });
                } else {
                  setMode("choice");
                }
              }}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
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
            <CardTitle>Survey Details</CardTitle>
            <CardDescription>
              {selectedTemplate
                ? "Customize your survey title and description. Questions will be pre-filled from the template."
                : "Enter a title and optional description for your survey"}
            </CardDescription>
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
                      <strong>Template selected:</strong> {selectedTemplate.name}
                      <br />
                      {selectedTemplate.questions.length} questions will be added to your survey
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">
                  Survey Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g., Customer Satisfaction Survey"
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
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Briefly describe what this survey is about..."
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isLoading}
                  rows={4}
                />
                <p className="text-sm text-gray-500">
                  This will be shown to respondents at the top of your survey
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
                    setFormData({ title: "", description: "" });
                  } else {
                    setMode("choice");
                  }
                }}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Survey"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
