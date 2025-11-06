import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { HeroSection } from "@/components/marketing/hero-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations('HomePage');
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Logo />
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="outline">{t('sign_in')}</Button>
              </Link>
              <Link href="/register">
                <Button>{t('get_started')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-16">
        <HeroSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* Testimonials Section */}
        <TestimonialsSection />
      </main>
    </div>
  );
}
