import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Team member performance data
export const teamMemberData = z.object({
  assigned: z.number().min(0),
  completed: z.number().min(0),
  critical: z.number().min(0),
  major: z.number().min(0),
  minor: z.number().min(0),
  tcr: z.number().min(0).max(100),
  tpr: z.number().min(0).max(100)
});

// Weekly reports table
export const weeklyReports = pgTable("weekly_reports", {
  id: serial("id").primaryKey(),
  weekOwner: text("week_owner").notNull(),
  weekStart: text("week_start").notNull(),
  weekEnd: text("week_end").notNull(),
  teamData: jsonb("team_data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWeeklyReportSchema = createInsertSchema(weeklyReports).omit({
  id: true,
  createdAt: true,
}).extend({
  teamData: z.record(z.string(), teamMemberData)
});

export type InsertWeeklyReport = z.infer<typeof insertWeeklyReportSchema>;
export type WeeklyReport = typeof weeklyReports.$inferSelect;
export type TeamMemberData = z.infer<typeof teamMemberData>;

// Valid team members
export const TEAM_MEMBERS = [
  'deepak', 'jitin', 'minhaj', 'prateek', 'ashish', 'devops', 'qateam', 'vamshi'
] as const;

// Valid week owners
export const WEEK_OWNERS = [
  'deepak', 'jitin', 'minhaj', 'prateek', 'ashish', 'dheeraj', 'ravi', 'sahitya', 'abhishek', 'vamshi'
] as const;
