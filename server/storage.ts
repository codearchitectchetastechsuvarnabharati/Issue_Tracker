import { type User, type InsertUser, type Issue, type InsertIssue, type Comment, type InsertComment } from "@shared/schema";
import { randomUUID } from "crypto";

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

export const storage = new MemStorage();
