import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { BookOpen, Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getBlogPosts() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    });
    return posts;
  } catch (e) {
    return [];
  }
}

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();

  return (
    <div className="min-h-screen flex flex-col bg-surface-base text-foreground">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 w-full">
        {/* Header */}
        <div className="max-w-3xl mb-12 sm:mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent-500/10 text-accent-400 border border-accent-500/20">
            <BookOpen className="w-3.5 h-3.5" />
            Engineering & Infrastructure Deep Dives
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            Engineering Blog
          </h1>
          <p className="text-foreground-muted text-base sm:text-lg">
            Technical breakdowns, scaling patterns, zero-trust protocols, and distributed database architectures.
          </p>
        </div>

        {/* Blog Post Grid */}
        {posts.length === 0 ? (
          <div className="p-12 rounded-3xl bg-surface-elevated/40 border border-border text-center text-foreground-muted">
            No blog articles published yet. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="rounded-3xl bg-surface-elevated/50 border border-border/80 hover:border-brand-500/50 hover:bg-surface-elevated/80 transition-all duration-300 group flex flex-col justify-between p-7 overflow-hidden"
              >
                <div className="space-y-4">
                  {/* Tags & Reading Time */}
                  <div className="flex items-center justify-between text-xs text-foreground-muted">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {post.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md bg-surface-base border border-border text-[11px] font-medium text-foreground-subtle"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readingTime} min read
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-foreground group-hover:text-brand-300 transition-colors leading-snug">
                    {post.title}
                  </h3>

                  {post.excerpt && (
                    <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                </div>

                <div className="pt-6 mt-6 border-t border-border/40 flex items-center justify-between text-xs text-foreground-muted">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center text-[10px]">
                      {post.author?.name ? post.author.name[0] : "I"}
                    </div>
                    <span>{post.author?.name || "Inertia Staff"}</span>
                  </div>
                  <span className="text-brand-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Read Article <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
