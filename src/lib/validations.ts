import { z } from "zod";

// Auth schemas
export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  twoFactorCode: z.string().optional(),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const ResetPasswordRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

// News schemas
export const NewsSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  summary: z.string().min(5, "Summary is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  category: z.string().default("Announcements"),
  coverImage: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"]).default("PUBLISHED"),
  isPinned: z.boolean().default(false),
  publishedAt: z.string().or(z.date()).optional(),
});

// Blog schemas
export const BlogPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  excerpt: z.string().min(5, "Excerpt is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  tags: z.array(z.string()).default([]),
  coverImage: z.string().optional().nullable(),
  readingTime: z.number().int().positive().default(3),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"]).default("PUBLISHED"),
  publishedAt: z.string().or(z.date()).optional(),
});

// Changelog schemas
export const ChangelogSchema = z.object({
  version: z.string().min(1, "Version is required (e.g. v2.4.0)"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description is required"),
  changes: z.array(
    z.object({
      type: z.enum(["added", "fixed", "changed", "removed", "security"]),
      text: z.string().min(1, "Change description cannot be empty"),
    })
  ),
  releaseDate: z.string().or(z.date()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
});

// Announcement schemas
export const AnnouncementSchema = z.object({
  title: z.string().min(2, "Title is required"),
  content: z.string().min(5, "Content is required"),
  type: z.enum(["INFO", "WARNING", "ALERT", "SUCCESS"]).default("INFO"),
  link: z.string().optional().nullable(),
  linkText: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  priority: z.number().int().default(0),
  startDate: z.string().or(z.date()).optional().nullable(),
  endDate: z.string().or(z.date()).optional().nullable(),
});

// Dynamic Page schemas
export const PageSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().optional().nullable(),
  content: z.any(), // Flexible structured JSON blocks
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"]).default("PUBLISHED"),
  publishedAt: z.string().or(z.date()).optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoKeywords: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
});

// Contact message schemas
export const ContactMessageSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Newsletter schemas
export const NewsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
  source: z.string().optional().default("homepage"),
});

// Statistic schemas
export const StatisticSchema = z.object({
  key: z.string().min(1, "Unique key is required"),
  label: z.string().min(1, "Label is required"),
  value: z.string().min(1, "Value string is required"),
  numericValue: z.number().default(0),
  icon: z.string().optional().nullable(),
  suffix: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  isPublic: z.boolean().default(true),
  order: z.number().int().default(0),
});

// Site Setting schema
export const SiteSettingSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.any(),
  category: z.enum(["GENERAL", "BRANDING", "SEO", "SECURITY", "NOTIFICATIONS"]).default("GENERAL"),
});
