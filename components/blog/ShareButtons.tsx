"use client";

import { Button } from "@/components/ui/button";
import { Share2, Twitter, Linkedin, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const t = useTranslations("Blog");

  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const shareOnLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const shareViaEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Share2 className="w-4 h-4" />
        Share:
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={shareOnTwitter}
        className="gap-2"
      >
        <Twitter className="w-4 h-4" />
        {t("share_on_twitter")}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={shareOnLinkedIn}
        className="gap-2"
      >
        <Linkedin className="w-4 h-4" />
        {t("share_on_linkedin")}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={shareViaEmail}
        className="gap-2"
      >
        <Mail className="w-4 h-4" />
        {t("share_via_email")}
      </Button>
    </div>
  );
}
