import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { LegalTableOfContents } from '@/components/legal/table-of-contents'

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations('Cookies')

  return {
    title: t('page_title'),
    description: t('meta_description'),
  }
}

const LAST_UPDATED = "November 6, 2025"

export default function CookiesPage() {
  const t = useTranslations('Cookies')

  const sections = [
    { id: 'overview', title: t('section_overview') },
    { id: 'what-are-cookies', title: t('section_what_are_cookies') },
    { id: 'cookies-we-use', title: t('section_cookies_we_use') },
    { id: 'manage-cookies', title: t('section_manage_cookies') },
    { id: 'contact', title: t('section_contact') },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar TOC */}
          <aside className="lg:w-64 flex-shrink-0">
            <LegalTableOfContents sections={sections} />
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-4xl">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <h1>{t('title')}</h1>
              <p className="text-muted-foreground text-sm">
                {t('last_updated')}: {LAST_UPDATED}
              </p>

              {/* Overview */}
              <section id="overview">
                <h2>{t('section_overview')}</h2>
                <p>{t('overview_p1')}</p>
                <p>{t('overview_p2')}</p>
              </section>

              {/* What Are Cookies */}
              <section id="what-are-cookies">
                <h2>{t('section_what_are_cookies')}</h2>
                <p>{t('what_are_cookies_p1')}</p>
                <p>{t('what_are_cookies_p2')}</p>
              </section>

              {/* Cookies We Use */}
              <section id="cookies-we-use">
                <h2>{t('section_cookies_we_use')}</h2>
                <p>{t('cookies_we_use_intro')}</p>

                <h3>{t('cookies_essential_title')}</h3>
                <p>{t('cookies_essential_desc')}</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left">{t('table_cookie_name')}</th>
                        <th className="px-4 py-2 text-left">{t('table_purpose')}</th>
                        <th className="px-4 py-2 text-left">{t('table_duration')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="px-4 py-2"><code>better-auth.session_token</code></td>
                        <td className="px-4 py-2">{t('cookie_session_purpose')}</td>
                        <td className="px-4 py-2">{t('cookie_session_duration')}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2"><code>better-auth.csrf_token</code></td>
                        <td className="px-4 py-2">{t('cookie_csrf_purpose')}</td>
                        <td className="px-4 py-2">{t('cookie_csrf_duration')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3>{t('cookies_analytics_title')}</h3>
                <p>{t('cookies_analytics_desc')}</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left">{t('table_cookie_name')}</th>
                        <th className="px-4 py-2 text-left">{t('table_purpose')}</th>
                        <th className="px-4 py-2 text-left">{t('table_duration')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="px-4 py-2"><code>_ga</code></td>
                        <td className="px-4 py-2">{t('cookie_ga_purpose')}</td>
                        <td className="px-4 py-2">{t('cookie_ga_duration')}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2"><code>_ga_*</code></td>
                        <td className="px-4 py-2">{t('cookie_ga_property_purpose')}</td>
                        <td className="px-4 py-2">{t('cookie_ga_property_duration')}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2"><code>ph_*</code></td>
                        <td className="px-4 py-2">{t('cookie_posthog_purpose')}</td>
                        <td className="px-4 py-2">{t('cookie_posthog_duration')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3>{t('cookies_preferences_title')}</h3>
                <p>{t('cookies_preferences_desc')}</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left">{t('table_cookie_name')}</th>
                        <th className="px-4 py-2 text-left">{t('table_purpose')}</th>
                        <th className="px-4 py-2 text-left">{t('table_duration')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="px-4 py-2"><code>NEXT_LOCALE</code></td>
                        <td className="px-4 py-2">{t('cookie_locale_purpose')}</td>
                        <td className="px-4 py-2">{t('cookie_locale_duration')}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2"><code>theme</code></td>
                        <td className="px-4 py-2">{t('cookie_theme_purpose')}</td>
                        <td className="px-4 py-2">{t('cookie_theme_duration')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Manage Cookies */}
              <section id="manage-cookies">
                <h2>{t('section_manage_cookies')}</h2>
                <p>{t('manage_cookies_intro')}</p>

                <h3>{t('manage_browser_title')}</h3>
                <ul>
                  <li><strong>Chrome:</strong> {t('manage_chrome')}</li>
                  <li><strong>Firefox:</strong> {t('manage_firefox')}</li>
                  <li><strong>Safari:</strong> {t('manage_safari')}</li>
                  <li><strong>Edge:</strong> {t('manage_edge')}</li>
                </ul>

                <h3>{t('manage_impact_title')}</h3>
                <p>{t('manage_impact_desc')}</p>
              </section>

              {/* Contact */}
              <section id="contact">
                <h2>{t('section_contact')}</h2>
                <p>{t('contact_intro')}</p>
                <ul>
                  <li><strong>{t('contact_email_label')}:</strong> <a href="mailto:privacy@survey.fatihoune.com">privacy@survey.fatihoune.com</a></li>
                  <li><strong>{t('contact_contact_form')}:</strong> <a href="/contact">{t('contact_form_link')}</a></li>
                </ul>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
