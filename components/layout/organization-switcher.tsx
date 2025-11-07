"use client"

import { useTranslations } from "next-intl";
import { Building2, Check, ChevronsUpDown, Plus, User } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useOrganization } from "@/contexts/OrganizationContext";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { CreateOrganizationModal } from "../organizations/CreateOrganizationModal";

export function OrganizationSwitcher() {
  const { isMobile } = useSidebar();

  const t = useTranslations("Organization");
  const {
    organizations,
    currentOrganization,
    isPersonalWorkspace,
    isLoading,
    setCurrentOrganization,
    switchToPersonalWorkspace,
    refreshOrganizations
  } = useOrganization();

  if (isLoading) {
    return (
      <Button variant="outline" className="w-full justify-between" disabled>
        <span className="truncate">Loading...</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  const displayText = isPersonalWorkspace
    ? t("personal_workspace")
    : currentOrganization?.name || t("select_organization");

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                {isPersonalWorkspace ? (
                  <User className="h-4 w-4 shrink-0" />
                ) : (
                  <Building2 className="h-4 w-4 shrink-0" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayText}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Organizations
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => switchToPersonalWorkspace()}
              className="gap-2 p-2"
            >
              <User className="size-3.5 shrink-0" />
              <span>{t("personal_workspace")}</span>
              <Check
                className={cn(
                  "ml-auto h-4 w-4",
                  isPersonalWorkspace ? "opacity-100" : "opacity-0"
                )}
              />
              <DropdownMenuShortcut>⌘{0}</DropdownMenuShortcut>
            </DropdownMenuItem>
            {organizations.map((organization, index) => (
              <DropdownMenuItem
                key={organization.name}
                onClick={() => setCurrentOrganization(organization)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <Building2 className="size-3.5 shrink-0" />
                </div>
                {organization.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <CreateOrganizationModal
              onSuccess={() => {
                // Refresh organizations after creation
                refreshOrganizations();
              }}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
