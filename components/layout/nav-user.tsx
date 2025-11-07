"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { LogoutButton } from "../LogoutButton";
import { authClient } from "@/lib/auth-client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

export function NavUser() {
  const t = useTranslations('NavUser');
  const session = authClient.useSession();
  const [userPlan, setUserPlan] = useState<string>("Free");

  const user = session.data?.user;
  const { isMobile } = useSidebar();


  useEffect(() => {
    if (session.data?.user) {
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
    <>
      {user && <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={`${user.image}`} alt={user.name || user.email} />
                  <AvatarFallback className="rounded-lg">
                    {user.name.charAt(0) || user.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name || user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={`${user.image}`} alt={user.name} />
                    <AvatarFallback className="rounded-lg">{user.name.charAt(0) || user.email.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name || user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {
                userPlan !== 'Premium' &&
                <>
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/pricing">
                        <Sparkles />
                        {t('upgrade_to_pro')}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                </>
              }
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <BadgeCheck />
                    {t('account')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/billing">
                    <CreditCard />
                    {t('billing')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/billing">
                    <Bell />
                    {t('notifications')}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="w-full">
                <LogoutButton />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>}
    </>
  )
}
