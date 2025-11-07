"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"

// Define props type
interface SurveyTabsProps {
  surveyId: string
  t: (key: string, options?: Record<string, any>) => string
}

export function SurveyTabs({ surveyId, t }:SurveyTabsProps) {
  const pathname = usePathname()

  const tabs = [
    { name: t("responses"), href: `/surveys/${surveyId}/responses` },
    { name: t("invitations"), href: `/surveys/${surveyId}/invitations` },
    { name: t("analytics"), href: `/surveys/${surveyId}/analytics` },
  ]

  return (
    <div className="mb-6 border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              )}
            >
              {tab.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
