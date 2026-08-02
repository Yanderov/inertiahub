import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Calendar, Clock, ArrowLeft, Eye, Tag, Share2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getBlogPost(slug: string) {
  try {
    const post = await prisma.blogPost.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
        status: "PUBLISHED",
      },
      include: {
        author: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    if (post) {
      // Increment view count asynchronously
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { views: { increment: 1 } },
      }).catch(() => {});
    }

    return post;
  } catch (e) {
    return null;
  }
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-base text-foreground">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-semibold text-foreground-muted hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Engineering Blog
        </Link>

        {/* Header */}
        <header className="space-y-6 pb-8 border-b border-border/60">
          <div className="flex flex-wrap items-center gap-2">
            {post.tags.map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full text-xs font-bold bg-brand-500/15 text-brand-300 border border-brand-500/30"
              >
                #{t}
              </span>
            ))}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg text-foreground-subtle leading-relaxed font-medium">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold text-sm">
                {post.author?.name ? post.author.name[0] : "I"}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{post.author?.name || "Inertia Architect"}</p>
                <p className="text-xs text-foreground-muted">{formatDate(post.publishedAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-foreground-muted">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTime} min read
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {post.views + 1} views
              </span>
            </div>
          </div>
        </header>

        {/* Post Content */}
        <article className="py-10 prose prose-invert max-w-none prose-p:text-foreground-subtle prose-p:leading-relaxed prose-headings:text-foreground">
          <div className="whitespace-pre-wrap text-foreground-subtle leading-relaxed text-base space-y-4">
            {post.content}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
