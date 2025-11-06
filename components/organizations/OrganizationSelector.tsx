"use client";

import { useTranslations } from "next-intl";
import { Check, ChevronsUpDown, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { cn } from "@/lib/utils";

export function OrganizationSelector() {
  const t = useTranslations("Organization");
  const {
    organizations,
    currentOrganization,
    isPersonalWorkspace,
    isLoading,
    setCurrentOrganization,
    switchToPersonalWorkspace,
  } = useOrganization();
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return (
      <Button variant="outline" className="w-[200px] justify-between" disabled>
        <span className="truncate">Loading...</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  const displayText = isPersonalWorkspace
    ? t("personal_workspace")
    : currentOrganization?.name || t("select_organization");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          <span className="flex items-center gap-2 truncate">
            {isPersonalWorkspace ? (
              <User className="h-4 w-4 shrink-0" />
            ) : (
              <Building2 className="h-4 w-4 shrink-0" />
            )}
            <span className="truncate">{displayText}</span>
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder={t("search_organizations") || "Search..."} />
          <CommandList>
            <CommandEmpty>{t("no_organizations")}</CommandEmpty>

            {/* Personal Workspace */}
            <CommandGroup heading="Personal">
              <CommandItem
                onSelect={() => {
                  switchToPersonalWorkspace();
                  setOpen(false);
                }}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                <span>{t("personal_workspace")}</span>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    isPersonalWorkspace ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            </CommandGroup>

            {/* Organizations */}
            {organizations.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading={t("all_organizations")}>
                  {organizations.map((org) => (
                    <CommandItem
                      key={org.id}
                      onSelect={() => {
                        setCurrentOrganization(org);
                        setOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <Building2 className="mr-2 h-4 w-4" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate">{org.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {org.role} • {t("member_count", { count: org.memberCount })}
                        </span>
                      </div>
                      <Check
                        className={cn(
                          "ml-2 h-4 w-4 shrink-0",
                          currentOrganization?.id === org.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
