import { getTranslations } from "next-intl/server";

export async function FeatureHero() {
  const t = await getTranslations("Features");

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            {t("hero_heading")}
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
            {t("hero_subheading")}
          </p>
        </div>
      </div>
    </section>
  );
}
