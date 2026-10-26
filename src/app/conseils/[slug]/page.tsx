import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { htmlLang, localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { env } from "@/lib/env";
import { getArticle, listArticleSlugs } from "@/modules/content";
import { messagesFor } from "@/modules/content/messages";
import {
  ArticleBody,
  ArticleHeader,
  JsonLd,
  articleJsonLd,
  localizedArticle,
} from "@/modules/content/view";

type ArticlePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listArticleSlugs("conseils").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const m = messagesFor(locale);
  const article = getArticle("conseils", slug);
  if (!article) {
    return { title: m.common.errorTitle };
  }
  const localized = localizedArticle(article, locale);
  return {
    title: localized.title,
    description: localized.description,
    alternates: {
      canonical: localePath(article.path, locale),
      languages: { "fr-CA": article.path, "en-CA": `/en${article.path}` },
    },
    openGraph: {
      type: "article",
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      title: localized.title,
      description: localized.description,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
    other: { "content-language": htmlLang[locale] },
  };
}

export default async function ConseilArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticle("conseils", slug);
  if (!article) {
    notFound();
  }
  const locale = await getLocale();

  return (
    <>
      <JsonLd data={articleJsonLd(article, env.SITE_URL, locale)} />
      <ArticleHeader article={article} locale={locale} />
      <ArticleBody article={article} locale={locale} />
    </>
  );
}
