import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertIssueSchema, insertCommentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all issues (for team dashboard)
  app.get('/api/issues', async (req, res) => {
    try {
      const issues = await storage.getAllIssues();
      res.json(issues);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch issues' });
    }
  });

  // Get issues by customer email (for customer view)
  app.get('/api/issues/customer/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const issues = await storage.getIssuesByCustomerEmail(email);
      res.json(issues);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch customer issues' });
    }
  });

  // Get single issue with comments
  app.get('/api/issues/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const issue = await storage.getIssue(id);
      if (!issue) {
        return res.status(404).json({ message: 'Issue not found' });
      }
      
      const comments = await storage.getCommentsByIssueId(id);
      res.json({ ...issue, comments });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch issue' });
    }
  });

  // Create new issue
  app.post('/api/issues', async (req, res) => {
    try {
      const validatedData = insertIssueSchema.parse(req.body);
      const issue = await storage.createIssue(validatedData);
      res.status(201).json(issue);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Failed to create issue' });
      }
    }
  });

  // Update issue
  app.patch('/api/issues/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const issue = await storage.updateIssue(id, updates);
      
      if (!issue) {
        return res.status(404).json({ message: 'Issue not found' });
      }
      
      res.json(issue);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update issue' });
    }
  });

  // Add comment to issue
  app.post('/api/issues/:id/comments', async (req, res) => {
    try {
      const { id } = req.params;
      const issue = await storage.getIssue(id);
      if (!issue) {
        return res.status(404).json({ message: 'Issue not found' });
      }
      
      const commentData = { ...req.body, issueId: id };
      const validatedData = insertCommentSchema.parse(commentData);
      const comment = await storage.createComment(validatedData);
      
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Failed to create comment' });
      }
    }
  });

  // Get issue statistics
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getIssueStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch statistics' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
