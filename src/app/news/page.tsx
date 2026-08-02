import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Sparkles, Calendar, Clock, ArrowRight, Newspaper, Pin } from "lucide-react";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getNews() {
  try {
    const items = await prisma.news.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    });
    return items;
  } catch (e) {
    return [];
  }
}

export default async function NewsIndexPage() {
  const news = await getNews();

  const pinnedNews = news.filter((n) => n.isPinned);
  const regularNews = news.filter((n) => !n.isPinned);

  return (
    <div className="min-h-screen flex flex-col bg-surface-base text-foreground">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 w-full">
        {/* Header */}
        <div className="max-w-3xl mb-12 sm:mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Newspaper className="w-3.5 h-3.5" />
            Platform Announcements & Dispatches
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            News & Releases
          </h1>
          <p className="text-foreground-muted text-base sm:text-lg">
            Stay informed on recent architecture updates, security bulletins, and company announcements.
          </p>
        </div>

        {/* Pinned / Featured News */}
        {pinnedNews.length > 0 && (
          <div className="mb-12 space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-400 flex items-center gap-1.5">
              <Pin className="w-3.5 h-3.5" /> Featured Dispatches
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pinnedNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.slug}`}
                  className="p-8 rounded-3xl bg-gradient-to-br from-surface-elevated to-surface-base border border-brand-500/40 hover:border-brand-500 transition-all group flex flex-col justify-between shadow-lg shadow-brand-500/5 hover:scale-[1.01]"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-500/15 text-brand-300 border border-brand-500/30">
                        {item.category}
                      </span>
                      <span className="text-xs text-foreground-muted flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.publishedAt)}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-foreground group-hover:text-brand-300 transition-colors">
                      {item.title}
                    </h3>

                    {item.summary && (
                      <p className="text-sm text-foreground-muted leading-relaxed line-clamp-3">
                        {item.summary}
                      </p>
                    )}
                  </div>

                  <div className="pt-6 mt-6 border-t border-border/40 flex items-center justify-between">
                    <span className="text-xs text-foreground-muted">By {item.author?.name || "InertiaHub Team"}</span>
                    <span className="text-xs font-semibold text-brand-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read Full Story <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Regular News Grid */}
        <div className="space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-foreground-muted">
            All Articles ({regularNews.length})
          </h2>
          {regularNews.length === 0 && pinnedNews.length === 0 ? (
            <div className="p-12 rounded-3xl bg-surface-elevated/40 border border-border text-center text-foreground-muted">
              No news articles published yet. Check back soon!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {regularNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.slug}`}
                  className="p-6 rounded-2xl bg-surface-elevated/40 border border-border/70 hover:border-brand-500/40 hover:bg-surface-elevated/80 transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-surface-base border border-border text-foreground-subtle">
                        {item.category}
                      </span>
                      <span className="text-[11px] text-foreground-muted flex items-center gap-1">
                        {formatDate(item.publishedAt)}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground group-hover:text-brand-300 transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    {item.summary && (
                      <p className="text-xs text-foreground-muted leading-relaxed line-clamp-3">
                        {item.summary}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-border/40 flex items-center justify-between text-xs text-foreground-muted">
                    <span>{item.author?.name || "InertiaHub Team"}</span>
                    <span className="text-brand-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Read <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
