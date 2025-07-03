import { weeklyReports, type WeeklyReport, type InsertWeeklyReport } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Weekly reports methods
  createWeeklyReport(report: InsertWeeklyReport): Promise<WeeklyReport>;
  getWeeklyReports(): Promise<WeeklyReport[]>;
  getWeeklyReportById(id: number): Promise<WeeklyReport | undefined>;
  deleteWeeklyReport(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async createWeeklyReport(insertReport: InsertWeeklyReport): Promise<WeeklyReport> {
    const [report] = await db
      .insert(weeklyReports)
      .values(insertReport)
      .returning();
    return report;
  }

  async getWeeklyReports(): Promise<WeeklyReport[]> {
    const reports = await db
      .select()
      .from(weeklyReports)
      .orderBy(desc(weeklyReports.createdAt));
    return reports;
  }

  async getWeeklyReportById(id: number): Promise<WeeklyReport | undefined> {
    const [report] = await db
      .select()
      .from(weeklyReports)
      .where(eq(weeklyReports.id, id));
    return report || undefined;
  }

  async deleteWeeklyReport(id: number): Promise<boolean> {
    const result = await db
      .delete(weeklyReports)
      .where(eq(weeklyReports.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
