import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Calendar, User, ArrowLeft, Share2, Eye, Tag } from "lucide-react";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getNewsArticle(slug: string) {
  try {
    const item = await prisma.news.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
        status: "PUBLISHED",
      },
      include: {
        author: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    if (item) {
      // Increment view count asynchronously
      await prisma.news.update({
        where: { id: item.id },
        data: { views: { increment: 1 } },
      }).catch(() => {});
    }

    return item;
  } catch (e) {
    return null;
  }
}

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const article = await getNewsArticle(params.slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-base text-foreground">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        {/* Back Link */}
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-xs font-semibold text-foreground-muted hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to News Dispatches
        </Link>

        {/* Article Header */}
        <header className="space-y-6 pb-8 border-b border-border/60">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-500/15 text-brand-300 border border-brand-500/30">
              {article.category}
            </span>
            <span className="text-xs text-foreground-muted flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(article.publishedAt)}
            </span>
            <span className="text-xs text-foreground-muted flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {article.views + 1} views
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            {article.title}
          </h1>

          {article.summary && (
            <p className="text-lg text-foreground-subtle leading-relaxed font-medium">
              {article.summary}
            </p>
          )}

          {/* Author Strip */}
          <div className="flex items-center gap-3 pt-2">
            <div className="w-10 h-10 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold text-sm">
              {article.author?.name ? article.author.name[0] : "I"}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{article.author?.name || "InertiaHub Editorial"}</p>
              <p className="text-xs text-foreground-muted">Platform Communications</p>
            </div>
          </div>
        </header>

        {/* Article Body */}
        <article className="py-10 prose prose-invert max-w-none prose-p:text-foreground-subtle prose-p:leading-relaxed prose-headings:text-foreground prose-strong:text-foreground">
          <div className="whitespace-pre-wrap text-foreground-subtle leading-relaxed text-base space-y-4">
            {article.content}
          </div>
        </article>

        {/* Footer Callout */}
        <div className="mt-12 p-8 rounded-3xl bg-surface-elevated/60 border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="font-bold text-foreground">Want more infrastructure insights?</h4>
            <p className="text-xs text-foreground-muted mt-1">Explore our engineering blog for deep architectural deep-dives.</p>
          </div>
          <Link
            href="/blog"
            className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-brand-500/10 text-brand-400 border border-brand-500/20 hover:bg-brand-500/20 transition-all shrink-0"
          >
            Visit Engineering Blog →
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
