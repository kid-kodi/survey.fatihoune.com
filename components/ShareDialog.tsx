"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy, ExternalLink } from "lucide-react";

type ShareDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surveyTitle: string;
  uniqueId: string;
};

export function ShareDialog({
  open,
  onOpenChange,
  surveyTitle,
  uniqueId,
}: ShareDialogProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  // Generate URLs
  const surveyUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/s/${uniqueId}`;
  const embedCode = `<iframe src="${surveyUrl}" width="100%" height="600px" frameborder="0" style="border: 1px solid #e5e7eb; border-radius: 8px;"></iframe>`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(surveyUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    } catch (error) {
      console.error("Failed to copy embed code:", error);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(surveyUrl, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Share Survey</DialogTitle>
          <DialogDescription>
            Share <strong>{surveyTitle}</strong> with your audience
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Share Link</TabsTrigger>
            <TabsTrigger value="embed">Embed Code</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="survey-link">Survey Link</Label>
              <div className="flex gap-2">
                <Input
                  id="survey-link"
                  value={surveyUrl}
                  readOnly
                  className="flex-1 font-mono text-sm"
                  onClick={(e) => e.currentTarget.select()}
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="min-w-[100px]"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Share this link with respondents to allow them to complete your survey.
              </p>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={handleOpenInNewTab}
                variant="outline"
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Survey in New Tab
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="embed" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="embed-code">Embed Code</Label>
              <div className="space-y-2">
                <textarea
                  id="embed-code"
                  value={embedCode}
                  readOnly
                  className="w-full h-24 px-3 py-2 text-sm font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  onClick={(e) => e.currentTarget.select()}
                />
                <Button
                  onClick={handleCopyEmbed}
                  variant="outline"
                  className="w-full"
                >
                  {copiedEmbed ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied to Clipboard
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Embed Code
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Paste this HTML code into your website to embed the survey. The survey will be displayed in a responsive iframe.
              </p>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Preview</h4>
              <div className="border rounded-md p-4 bg-gray-50">
                <div className="bg-white rounded border">
                  <iframe
                    src={surveyUrl}
                    width="100%"
                    height="300px"
                    style={{ border: "none" }}
                    title="Survey Preview"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This is how your survey will appear when embedded on a website.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
