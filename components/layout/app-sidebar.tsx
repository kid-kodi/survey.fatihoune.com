"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"

import { OrganizationSwitcher } from "./organization-switcher";
import { NavUser } from "./nav-user";
import { NavMain } from "./nav-main";
import { PlanBadge } from "../subscription/PlanBadge";
import { UpgradeButton } from "../subscription/UpgradeButton";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

export function AppSidebar() {
  const { data: session } = useSession();
  const [userPlan, setUserPlan] = useState<string>("Free");


  const t = useTranslations('Dashboard');

  // Fetch surveys and stats when component mounts or organization changes
  useEffect(() => {
    if (session?.user) {
      fetchUserPlan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);


  const fetchUserPlan = async () => {
    try {
      const response = await fetch("/api/user/plan");

      if (!response.ok) {
        throw new Error("Failed to fetch user plan");
      }

      const data = await response.json();
      setUserPlan(data.plan?.name || "Free");
    } catch (err) {
      console.error("Fetch user plan error:", err);
      // Default to Free if fetch fails
      setUserPlan("Free");
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <OrganizationSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <PlanBadge />
        <UpgradeButton currentPlan={userPlan} />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}