import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getCustomPage(slug: string) {
  // Reserved slugs that have their own routes
  const reserved = ["admin", "api", "auth", "blog", "news", "changelog", "status", "contact", "account", "pricing", "docs"];
  if (reserved.includes(slug.toLowerCase())) {
    return null;
  }

  try {
    const page = await prisma.page.findFirst({
      where: { slug, status: "PUBLISHED" },
    });
    return page;
  } catch (e) {
    return null;
  }
}

export default async function DynamicCustomPage({ params }: { params: { slug: string } }) {
  const page = await getCustomPage(params.slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-base text-foreground">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
        <header className="space-y-4 pb-8 border-b border-border/60">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            {page.title}
          </h1>
          <p className="text-xs text-foreground-muted">
            Last updated: {formatDate(page.updatedAt)}
          </p>
        </header>

        <article className="py-10 prose prose-invert max-w-none prose-p:text-foreground-subtle prose-p:leading-relaxed prose-headings:text-foreground">
          <div className="whitespace-pre-wrap text-foreground-subtle leading-relaxed text-base space-y-4">
            {typeof page.content === "string" ? page.content : JSON.stringify(page.content, null, 2)}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
