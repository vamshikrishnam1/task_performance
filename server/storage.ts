import { weeklyReports, type WeeklyReport, type InsertWeeklyReport } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Weekly reports methods
  createWeeklyReport(report: InsertWeeklyReport): Promise<WeeklyReport>;
  getWeeklyReports(): Promise<WeeklyReport[]>;
  getWeeklyReportById(id: number): Promise<WeeklyReport | undefined>;
  deleteWeeklyReport(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private weeklyReports: Map<number, WeeklyReport>;
  currentId: number;
  currentReportId: number;

  constructor() {
    this.users = new Map();
    this.weeklyReports = new Map();
    this.currentId = 1;
    this.currentReportId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
