"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";

const inviteSchema = z.object({
  emailsText: z.string().min(1, "Please enter at least one email"),
});

interface InviteParticipantsModalProps {
  surveyId: string;
  onInvitationsSent?: () => void;
}

export function InviteParticipantsModal({
  surveyId,
  onInvitationsSent,
}: InviteParticipantsModalProps) {
  const t = useTranslations("Survey");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validEmails, setValidEmails] = useState<string[]>([]);
  const [invalidEmails, setInvalidEmails] = useState<string[]>([]);

  const form = useForm({
    resolver: zodResolver(inviteSchema),
    defaultValues: { emailsText: "" },
  });

  function parseEmails(text: string): { valid: string[]; invalid: string[] } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emails = text
      .split(/[\n,;]+/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    const valid = emails.filter((e) => emailRegex.test(e));
    const invalid = emails.filter((e) => !emailRegex.test(e));

    return { valid, invalid };
  }

  function handleTextChange(text: string) {
    const { valid, invalid } = parseEmails(text);
    setValidEmails(valid);
    setInvalidEmails(invalid);
  }

  async function onSubmit(data: z.infer<typeof inviteSchema>) {
    if (validEmails.length === 0) {
      toast.error("No valid emails to send");
      return;
    }

    if (validEmails.length > 50) {
      toast.error("Maximum 50 emails can be invited at once");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/surveys/${surveyId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: validEmails }),
      });

      const result = await response.json();

      if (response.ok) {
        const successCount = result.success.count;
        const failedCount = result.failed.count;

        if (successCount > 0) {
          toast.success(
            `${successCount} invitation(s) sent successfully!`
          );
        }

        if (failedCount > 0) {
          const errorMessages = result.failed.errors
            .map((e: { email: string; reason: string }) => `${e.email}: ${e.reason}`)
            .join("\n");
          toast.error(`${failedCount} invitation(s) failed:\n${errorMessages}`);
        }

        form.reset();
        setValidEmails([]);
        setInvalidEmails([]);
        setOpen(false);

        // Notify parent component that invitations were sent
        if (onInvitationsSent) {
          onInvitationsSent();
        }
      } else {
        toast.error(result.error || "Failed to send invitations");
      }
    } catch (error) {
      console.error("Send invitations error:", error);
      toast.error("An error occurred while sending invitations");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Mail className="mr-2 h-4 w-4" />
          {t("invite_participants")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("invite_participants_title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t("email_addresses_label")}
            </label>
            <Textarea
              {...form.register("emailsText")}
              onChange={(e) => {
                form.setValue("emailsText", e.target.value);
                handleTextChange(e.target.value);
              }}
              placeholder={`participant1@example.com\nparticipant2@example.com`}
              rows={8}
              disabled={isLoading}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t("email_format_hint")}
            </p>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-green-600 font-medium">
                {validEmails.length} {t("valid_emails_count")}
              </span>
              {invalidEmails.length > 0 && (
                <span className="text-red-600 ml-2">
                  ({invalidEmails.length} invalid)
                </span>
              )}
            </div>
            {validEmails.length > 50 && (
              <span className="text-red-600 text-xs">
                Maximum 50 emails allowed
              </span>
            )}
          </div>

          {invalidEmails.length > 0 && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-xs font-medium text-red-800 mb-1">
                Invalid emails:
              </p>
              <p className="text-xs text-red-700 break-all">
                {invalidEmails.join(", ")}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || validEmails.length === 0 || validEmails.length > 50}
            >
              {isLoading
                ? t("sending")
                : `${t("send")} ${validEmails.length} ${t("invitations")}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
