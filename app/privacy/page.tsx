import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { LegalTableOfContents } from '@/components/legal/table-of-contents'

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations('Privacy')

  return {
    title: t('page_title'),
    description: t('meta_description'),
  }
}

const LAST_UPDATED = "November 6, 2025"

export default function PrivacyPage() {
  const t = useTranslations('Privacy')

  const sections = [
    { id: 'overview', title: t('section_overview') },
    { id: 'data-collection', title: t('section_data_collection') },
    { id: 'data-usage', title: t('section_data_usage') },
    { id: 'data-storage', title: t('section_data_storage') },
    { id: 'user-rights', title: t('section_user_rights') },
    { id: 'cookies', title: t('section_cookies') },
    { id: 'third-party', title: t('section_third_party') },
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

              {/* Data Collection */}
              <section id="data-collection">
                <h2>{t('section_data_collection')}</h2>
                <p>{t('data_collection_intro')}</p>

                <h3>{t('data_collection_account_title')}</h3>
                <ul>
                  <li>{t('data_collection_account_name')}</li>
                  <li>{t('data_collection_account_email')}</li>
                  <li>{t('data_collection_account_password')}</li>
                </ul>

                <h3>{t('data_collection_survey_title')}</h3>
                <ul>
                  <li>{t('data_collection_survey_content')}</li>
                  <li>{t('data_collection_survey_responses')}</li>
                  <li>{t('data_collection_survey_settings')}</li>
                </ul>

                <h3>{t('data_collection_usage_title')}</h3>
                <ul>
                  <li>{t('data_collection_usage_pages')}</li>
                  <li>{t('data_collection_usage_clicks')}</li>
                  <li>{t('data_collection_usage_browser')}</li>
                  <li>{t('data_collection_usage_ip')}</li>
                </ul>

                <h3>{t('data_collection_payment_title')}</h3>
                <p>{t('data_collection_payment_info')}</p>
              </section>

              {/* Data Usage */}
              <section id="data-usage">
                <h2>{t('section_data_usage')}</h2>
                <p>{t('data_usage_intro')}</p>
                <ul>
                  <li><strong>{t('data_usage_service_title')}:</strong> {t('data_usage_service_desc')}</li>
                  <li><strong>{t('data_usage_improve_title')}:</strong> {t('data_usage_improve_desc')}</li>
                  <li><strong>{t('data_usage_support_title')}:</strong> {t('data_usage_support_desc')}</li>
                  <li><strong>{t('data_usage_security_title')}:</strong> {t('data_usage_security_desc')}</li>
                  <li><strong>{t('data_usage_legal_title')}:</strong> {t('data_usage_legal_desc')}</li>
                </ul>
              </section>

              {/* Data Storage */}
              <section id="data-storage">
                <h2>{t('section_data_storage')}</h2>
                <p>{t('data_storage_intro')}</p>
                <ul>
                  <li><strong>{t('data_storage_encryption_title')}:</strong> {t('data_storage_encryption_desc')}</li>
                  <li><strong>{t('data_storage_database_title')}:</strong> {t('data_storage_database_desc')}</li>
                  <li><strong>{t('data_storage_access_title')}:</strong> {t('data_storage_access_desc')}</li>
                  <li><strong>{t('data_storage_retention_title')}:</strong> {t('data_storage_retention_desc')}</li>
                </ul>
              </section>

              {/* User Rights */}
              <section id="user-rights">
                <h2>{t('section_user_rights')}</h2>
                <p>{t('user_rights_intro')}</p>
                <ul>
                  <li><strong>{t('user_rights_access_title')}:</strong> {t('user_rights_access_desc')}</li>
                  <li><strong>{t('user_rights_correction_title')}:</strong> {t('user_rights_correction_desc')}</li>
                  <li><strong>{t('user_rights_deletion_title')}:</strong> {t('user_rights_deletion_desc')}</li>
                  <li><strong>{t('user_rights_export_title')}:</strong> {t('user_rights_export_desc')}</li>
                  <li><strong>{t('user_rights_withdraw_title')}:</strong> {t('user_rights_withdraw_desc')}</li>
                  <li><strong>{t('user_rights_object_title')}:</strong> {t('user_rights_object_desc')}</li>
                </ul>
                <p>{t('user_rights_exercise')}</p>
              </section>

              {/* Cookies */}
              <section id="cookies">
                <h2>{t('section_cookies')}</h2>
                <p>{t('cookies_intro')}</p>
                <ul>
                  <li><strong>{t('cookies_essential_title')}:</strong> {t('cookies_essential_desc')}</li>
                  <li><strong>{t('cookies_analytics_title')}:</strong> {t('cookies_analytics_desc')}</li>
                  <li><strong>{t('cookies_preferences_title')}:</strong> {t('cookies_preferences_desc')}</li>
                </ul>
                <p>{t('cookies_manage')}</p>
              </section>

              {/* Third-Party Services */}
              <section id="third-party">
                <h2>{t('section_third_party')}</h2>
                <p>{t('third_party_intro')}</p>

                <h3>{t('third_party_stripe_title')}</h3>
                <p>{t('third_party_stripe_desc')}</p>

                <h3>{t('third_party_analytics_title')}</h3>
                <p>{t('third_party_analytics_desc')}</p>

                <h3>{t('third_party_email_title')}</h3>
                <p>{t('third_party_email_desc')}</p>
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
