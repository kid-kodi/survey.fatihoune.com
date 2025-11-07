import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Users, FileText, CreditCard, TrendingUp } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const session = await auth.api.getSession({
    headers: await import('next/headers').then(h => h.headers()),
  })

  if (!session?.user) {
    redirect('/login')
  }

  // Check if user is sysadmin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user?.isSysAdmin) {
    redirect('/dashboard')
  }

  const t = await getTranslations('Analytics')

  // Fetch analytics data
  const [
    totalUsers,
    totalSurveys,
    totalResponses,
    activeSubscriptions,
    recentUsers,
    recentSurveys,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.survey.count(),
    prisma.response.count(),
    prisma.subscription.count({
      where: { status: 'active' },
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    }),
    prisma.survey.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    }),
  ])

  const stats = [
    {
      title: t('total_users'),
      value: totalUsers,
      icon: Users,
      description: `${recentUsers} ${t('new_this_month')}`,
    },
    {
      title: t('total_surveys'),
      value: totalSurveys,
      icon: FileText,
      description: `${recentSurveys} ${t('created_this_month')}`,
    },
    {
      title: t('total_responses'),
      value: totalResponses,
      icon: BarChart3,
      description: t('all_time'),
    },
    {
      title: t('active_subscriptions'),
      value: activeSubscriptions,
      icon: CreditCard,
      description: t('currently_active'),
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('page_title')}</h1>
        <p className="text-muted-foreground">
          {t('page_description')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('external_analytics')}</CardTitle>
            <CardDescription>
              {t('external_analytics_description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Google Analytics 4</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('ga4_description')}
                  </p>
                </div>
              </div>
              <a
                href="https://analytics.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {t('open')}
              </a>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">PostHog</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('posthog_description')}
                  </p>
                </div>
              </div>
              <a
                href={process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {t('open')}
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('quick_insights')}</CardTitle>
            <CardDescription>
              {t('quick_insights_description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t('avg_responses_per_survey')}
                </span>
                <span className="font-medium">
                  {totalSurveys > 0 ? Math.round(totalResponses / totalSurveys) : 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t('conversion_rate')}
                </span>
                <span className="font-medium">
                  {totalUsers > 0 ? ((activeSubscriptions / totalUsers) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t('user_growth_this_month')}
                </span>
                <span className="font-medium">
                  +{recentUsers}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
