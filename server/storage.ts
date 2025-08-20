import { type User, type InsertUser, type Issue, type InsertIssue, type Comment, type InsertComment, users, issues, comments } from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, asc, and, gte } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Issue management
  getAllIssues(): Promise<Issue[]>;
  getIssue(id: string): Promise<Issue | undefined>;
  getIssuesByCustomerEmail(email: string): Promise<Issue[]>;
  createIssue(issue: InsertIssue): Promise<Issue>;
  updateIssue(id: string, updates: Partial<InsertIssue>): Promise<Issue | undefined>;
  
  // Comment management
  getCommentsByIssueId(issueId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Statistics
  getIssueStats(): Promise<{
    openIssues: number;
    inProgress: number;
    resolvedToday: number;
    urgent: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private issues: Map<string, Issue>;
  private comments: Map<string, Comment>;

  constructor() {
    this.users = new Map();
    this.issues = new Map();
    this.comments = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllIssues(): Promise<Issue[]> {
    return Array.from(this.issues.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getIssue(id: string): Promise<Issue | undefined> {
    return this.issues.get(id);
  }

  async getIssuesByCustomerEmail(email: string): Promise<Issue[]> {
    return Array.from(this.issues.values())
      .filter(issue => issue.customerEmail === email)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createIssue(insertIssue: InsertIssue): Promise<Issue> {
    const id = randomUUID();
    const now = new Date();
    const issue: Issue = { 
      ...insertIssue,
      status: insertIssue.status || "open",
      priority: insertIssue.priority || "medium",
      assignedTo: insertIssue.assignedTo || null,
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.issues.set(id, issue);
    return issue;
  }

  async updateIssue(id: string, updates: Partial<InsertIssue>): Promise<Issue | undefined> {
    const issue = this.issues.get(id);
    if (!issue) return undefined;
    
    const updatedIssue: Issue = { 
      ...issue, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.issues.set(id, updatedIssue);
    return updatedIssue;
  }

  async getCommentsByIssueId(issueId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.issueId === issueId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = { 
      ...insertComment,
      isInternal: insertComment.isInternal || "false",
      id, 
      createdAt: new Date() 
    };
    this.comments.set(id, comment);
    return comment;
  }

  async getIssueStats(): Promise<{
    openIssues: number;
    inProgress: number;
    resolvedToday: number;
    urgent: number;
  }> {
    const issues = Array.from(this.issues.values());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return {
      openIssues: issues.filter(issue => issue.status === 'open').length,
      inProgress: issues.filter(issue => issue.status === 'in-progress').length,
      resolvedToday: issues.filter(issue => 
        issue.status === 'resolved' && 
        new Date(issue.updatedAt) >= today
      ).length,
      urgent: issues.filter(issue => issue.priority === 'urgent').length,
    };
  }
}

// Database storage implementation using Drizzle ORM
export class DatabaseStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required");
    }
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getAllIssues(): Promise<Issue[]> {
    return await this.db.select().from(issues).orderBy(desc(issues.createdAt));
  }

  async getIssue(id: string): Promise<Issue | undefined> {
    const result = await this.db.select().from(issues).where(eq(issues.id, id)).limit(1);
    return result[0];
  }

  async getIssuesByCustomerEmail(email: string): Promise<Issue[]> {
    return await this.db.select().from(issues)
      .where(eq(issues.customerEmail, email))
      .orderBy(desc(issues.createdAt));
  }

  async createIssue(insertIssue: InsertIssue): Promise<Issue> {
    const issueData = {
      ...insertIssue,
      status: insertIssue.status || "open",
      priority: insertIssue.priority || "medium",
      assignedTo: insertIssue.assignedTo || null,
    };
    const result = await this.db.insert(issues).values(issueData).returning();
    return result[0];
  }

  async updateIssue(id: string, updates: Partial<InsertIssue>): Promise<Issue | undefined> {
    const result = await this.db.update(issues)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(issues.id, id))
      .returning();
    return result[0];
  }

  async getCommentsByIssueId(issueId: string): Promise<Comment[]> {
    return await this.db.select().from(comments)
      .where(eq(comments.issueId, issueId))
      .orderBy(asc(comments.createdAt));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const commentData = {
      ...insertComment,
      isInternal: insertComment.isInternal || "false",
    };
    const result = await this.db.insert(comments).values(commentData).returning();
    return result[0];
  }

  async getIssueStats(): Promise<{
    openIssues: number;
    inProgress: number;
    resolvedToday: number;
    urgent: number;
  }> {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all issues for stats calculation
    const allIssues = await this.db.select().from(issues);
    
    return {
      openIssues: allIssues.filter(issue => issue.status === 'open').length,
      inProgress: allIssues.filter(issue => issue.status === 'in-progress').length,
      resolvedToday: allIssues.filter(issue => 
        issue.status === 'resolved' && 
        new Date(issue.updatedAt) >= today
      ).length,
      urgent: allIssues.filter(issue => issue.priority === 'urgent').length,
    };
  }
}

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();
