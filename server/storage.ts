import { weeklyReports, type WeeklyReport, type InsertWeeklyReport } from "@shared/schema";

export interface IStorage {
  // Weekly reports methods
  createWeeklyReport(report: InsertWeeklyReport): Promise<WeeklyReport>;
  getWeeklyReports(): Promise<WeeklyReport[]>;
  getWeeklyReportById(id: number): Promise<WeeklyReport | undefined>;
  deleteWeeklyReport(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private weeklyReports: Map<number, WeeklyReport>;
  currentReportId: number;

  constructor() {
    this.weeklyReports = new Map();
    this.currentReportId = 1;
  }

  async createWeeklyReport(insertReport: InsertWeeklyReport): Promise<WeeklyReport> {
    const id = this.currentReportId++;
    const report: WeeklyReport = {
      ...insertReport,
      id,
      createdAt: new Date(),
    };
    this.weeklyReports.set(id, report);
    return report;
  }

  async getWeeklyReports(): Promise<WeeklyReport[]> {
    return Array.from(this.weeklyReports.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getWeeklyReportById(id: number): Promise<WeeklyReport | undefined> {
    return this.weeklyReports.get(id);
  }

  async deleteWeeklyReport(id: number): Promise<boolean> {
    return this.weeklyReports.delete(id);
  }
}

export const storage = new MemStorage();
