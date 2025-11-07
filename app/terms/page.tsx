import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { LegalTableOfContents } from '@/components/legal/table-of-contents'

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations('Terms')

  return {
    title: t('page_title'),
    description: t('meta_description'),
  }
}

const LAST_UPDATED = "November 6, 2025"

export default function TermsPage() {
  const t = useTranslations('Terms')

  const sections = [
    { id: 'acceptance', title: t('section_acceptance') },
    { id: 'accounts', title: t('section_accounts') },
    { id: 'subscription', title: t('section_subscription') },
    { id: 'content', title: t('section_content') },
    { id: 'prohibited', title: t('section_prohibited') },
    { id: 'liability', title: t('section_liability') },
    { id: 'termination', title: t('section_termination') },
    { id: 'changes', title: t('section_changes') },
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

              {/* Acceptance */}
              <section id="acceptance">
                <h2>{t('section_acceptance')}</h2>
                <p>{t('acceptance_p1')}</p>
                <p>{t('acceptance_p2')}</p>
              </section>

              {/* User Accounts */}
              <section id="accounts">
                <h2>{t('section_accounts')}</h2>
                <p>{t('accounts_intro')}</p>

                <h3>{t('accounts_registration_title')}</h3>
                <p>{t('accounts_registration_desc')}</p>

                <h3>{t('accounts_security_title')}</h3>
                <p>{t('accounts_security_desc')}</p>

                <h3>{t('accounts_responsibility_title')}</h3>
                <p>{t('accounts_responsibility_desc')}</p>
              </section>

              {/* Subscription & Billing */}
              <section id="subscription">
                <h2>{t('section_subscription')}</h2>

                <h3>{t('subscription_plans_title')}</h3>
                <p>{t('subscription_plans_desc')}</p>

                <h3>{t('subscription_billing_title')}</h3>
                <p>{t('subscription_billing_desc')}</p>

                <h3>{t('subscription_cancellation_title')}</h3>
                <p>{t('subscription_cancellation_desc')}</p>

                <h3>{t('subscription_refunds_title')}</h3>
                <p>{t('subscription_refunds_desc')}</p>

                <h3>{t('subscription_changes_title')}</h3>
                <p>{t('subscription_changes_desc')}</p>
              </section>

              {/* User Content */}
              <section id="content">
                <h2>{t('section_content')}</h2>

                <h3>{t('content_ownership_title')}</h3>
                <p>{t('content_ownership_desc')}</p>

                <h3>{t('content_license_title')}</h3>
                <p>{t('content_license_desc')}</p>

                <h3>{t('content_responsibility_title')}</h3>
                <p>{t('content_responsibility_desc')}</p>
              </section>

              {/* Prohibited Uses */}
              <section id="prohibited">
                <h2>{t('section_prohibited')}</h2>
                <p>{t('prohibited_intro')}</p>
                <ul>
                  <li>{t('prohibited_illegal')}</li>
                  <li>{t('prohibited_spam')}</li>
                  <li>{t('prohibited_malicious')}</li>
                  <li>{t('prohibited_privacy')}</li>
                  <li>{t('prohibited_security')}</li>
                  <li>{t('prohibited_impersonate')}</li>
                  <li>{t('prohibited_scrape')}</li>
                  <li>{t('prohibited_compete')}</li>
                </ul>
              </section>

              {/* Limitation of Liability */}
              <section id="liability">
                <h2>{t('section_liability')}</h2>
                <p>{t('liability_p1')}</p>
                <p>{t('liability_p2')}</p>
                <p>{t('liability_p3')}</p>
              </section>

              {/* Termination */}
              <section id="termination">
                <h2>{t('section_termination')}</h2>

                <h3>{t('termination_by_user_title')}</h3>
                <p>{t('termination_by_user_desc')}</p>

                <h3>{t('termination_by_us_title')}</h3>
                <p>{t('termination_by_us_desc')}</p>

                <h3>{t('termination_effect_title')}</h3>
                <p>{t('termination_effect_desc')}</p>
              </section>

              {/* Changes to Terms */}
              <section id="changes">
                <h2>{t('section_changes')}</h2>
                <p>{t('changes_p1')}</p>
                <p>{t('changes_p2')}</p>
              </section>

              {/* Contact */}
              <section id="contact">
                <h2>{t('section_contact')}</h2>
                <p>{t('contact_intro')}</p>
                <ul>
                  <li><strong>{t('contact_email_label')}:</strong> <a href="mailto:legal@survey.fatihoune.com">legal@survey.fatihoune.com</a></li>
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
