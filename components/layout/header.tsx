"use client";

import { useEffect, useState } from 'react'
import { useSession } from '@/lib/auth-client';
import { useTranslations } from 'next-intl';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from '../ui/button';
import { Bell, HelpCircle, Plus, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Header() {
  const { data: session } = useSession();
  const [userPlan, setUserPlan] = useState<string>("Free");
  const router = useRouter();

  const { currentOrganization, isPersonalWorkspace } = useOrganization();

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
    <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <div className="flex flex-1 items-center justify-end gap-3">

        {!isPersonalWorkspace && currentOrganization && (
          <>
            <Button
              variant="link"
              className="flex items-center gap-1"
              asChild
            >
              <Link href={`/organizations/${currentOrganization?.id}/settings`}>
                <Settings className="size-5" />
              </Link>
            </Button>
          </>
        )}

        <>
          <Button
            variant="link"
            className="flex items-center gap-1"
            asChild
          >
            <Link href={`/notifications`}>
              <Bell className="size-5" />
            </Link>
          </Button>
        </>

        <>
          <Button
            variant="link"
            className="flex items-center gap-1"
            asChild
          >
            <Link href={`/help`}>
              <HelpCircle className="size-5" />
            </Link>
          </Button>
        </>
      </div>
    </header>
  )
}
