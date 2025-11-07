"use client"
// import { Frame, Forward, Folder, Map, MoreHorizontal, PieChart, Trash2 } from "lucide-react"
import {
  Frame,
  PieChart,
  MoreHorizontal,
  Folder,
  Forward,
  Trash2,
  Map,
  type LucideIcon,
  Home,
  Users,
  Cog,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useOrganization } from "@/contexts/OrganizationContext";
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import Link from "next/link";



export function NavMain() {
  const { isMobile } = useSidebar()
  const { currentOrganization, isPersonalWorkspace, refreshOrganizations } = useOrganization();
  const pathname = usePathname();
  // This is sample data.
  const projects = [
    {
      name: "Accueil",
      url: "/dashboard",
      icon: Home,
    },
    {
      name: "Enquêtes",
      url: "/surveys",
      icon: PieChart,
    },
    {
      name: "Paramètres",
      url: `/organizations/${currentOrganization?.id}/settings`,
      icon: Cog,
    },
  ];


  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>MENU</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <Link href={item.url} className={clsx(
                'flex grow items-center justify-center gap-2 rounded-md bg-gray-50 text-base hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
                {
                  'bg-sky-100 text-blue-600': pathname.includes(item.url),
                },
              )}>
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
