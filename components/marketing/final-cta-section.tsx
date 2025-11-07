import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export async function FinalCtaSection() {
  const t = await getTranslations("Landing");

  return (
    <section className="bg-gradient-to-r from-primary to-primary/80 py-16 md:py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
          {t("final_cta_heading")}
        </h2>
        <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
          {t("final_cta_subheading")}
        </p>
        <Button
          size="lg"
          variant="secondary"
          asChild
          className="w-full md:w-auto px-8 py-6 text-lg font-semibold"
        >
          <Link href="/register">{t("get_started_no_cc")}</Link>
        </Button>
      </div>
    </section>
  );
}
