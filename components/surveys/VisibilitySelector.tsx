"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lock, Users } from "lucide-react";

type Visibility = "private" | "organization";

interface VisibilitySelectorProps {
  value: Visibility;
  onChange: (value: Visibility) => void;
  disabled?: boolean;
  isOrganizationContext?: boolean;
}

export function VisibilitySelector({
  value,
  onChange,
  disabled = false,
  isOrganizationContext = false,
}: VisibilitySelectorProps) {
  const t = useTranslations("Organization");

  // If not in organization context, force private
  if (!isOrganizationContext) {
    return (
      <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
        <Lock className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">
          {t("visibility_private")}
        </span>
      </div>
    );
  }

  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="private">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <div>
              <div className="font-medium">{t("visibility_private")}</div>
              <div className="text-xs text-muted-foreground">
                {t("visibility_private_help")}
              </div>
            </div>
          </div>
        </SelectItem>
        <SelectItem value="organization">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <div>
              <div className="font-medium">{t("visibility_organization")}</div>
              <div className="text-xs text-muted-foreground">
                {t("visibility_organization_help")}
              </div>
            </div>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
