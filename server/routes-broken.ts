import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertProjectSchema, insertDeploymentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Project routes
  app.get('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projects = await storage.getUserProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.patch('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const updates = req.body;
      const updatedProject = await storage.updateProject(projectId, updates);
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      await storage.deleteProject(projectId);
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectData = insertProjectSchema.parse({
        ...req.body,
        userId,
      });
      
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // Deployment routes
  app.get('/api/projects/:id/deployments', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const deployments = await storage.getProjectDeployments(projectId);
      res.json(deployments);
    } catch (error) {
      console.error("Error fetching deployments:", error);
      res.status(500).json({ message: "Failed to fetch deployments" });
    }
  });

  app.post('/api/projects/:id/deploy', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Create new deployment
      const deployment = await storage.createDeployment({
        projectId,
        commitHash: req.body.commitHash || Math.random().toString(36).substring(7),
        commitMessage: req.body.commitMessage || "Manual deployment",
        branch: req.body.branch || project.branch || "main",
        status: "queued",
        startedAt: new Date(),
      });
      
      // Start build process asynchronously
      setImmediate(() => simulateBuild(deployment.id));
      
      res.json(deployment);
    } catch (error) {
      console.error("Error starting deployment:", error);
      res.status(500).json({ message: "Failed to start deployment" });
    }
  });

  // Functions routes
  app.get('/api/projects/:id/functions', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const functions = await storage.getProjectFunctions(projectId);
      res.json(functions);
    } catch (error) {
      console.error("Error fetching functions:", error);
      res.status(500).json({ message: "Failed to fetch functions" });
    }
  });

  // Analytics routes
  app.get('/api/projects/:id/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const days = parseInt(req.query.days as string) || 7;
      const analytics = await storage.getProjectAnalytics(projectId, days);
      
      // Generate mock analytics if none exist
      if (analytics.length === 0) {
        const mockData = {
          pageViews: Math.floor(Math.random() * 2000) + 500,
          uniqueVisitors: Math.floor(Math.random() * 1000) + 300,
          bandwidth: Math.floor(Math.random() * 5000000000) + 1000000000, // 1-5GB
          avgLoadTime: Math.floor(Math.random() * 2000) + 800, // 0.8-2.8s
        };
        
        await storage.updateAnalytics(projectId, mockData);
        res.json([{ ...mockData, date: new Date(), projectId }]);
      } else {
        res.json(analytics);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time build logs
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'subscribe' && data.deploymentId) {
          // Store deployment subscription
          (ws as any).deploymentId = data.deploymentId;
        }
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Store WebSocket server reference for build log streaming
  (httpServer as any).wss = wss;

  return httpServer;
}

// Simulate build process with real-time log streaming
async function simulateBuild(deploymentId: number) {
  const deployment = await storage.getDeployment(deploymentId);
  if (!deployment) return;

  const buildSteps = [
    { message: "Starting build process...", delay: 1000, status: "building" },
    { message: `Cloning repository: ${deployment.commitHash}`, delay: 2000 },
    { message: "Installing dependencies...", delay: 3000 },
    { message: "npm install", delay: 1000 },
    { message: "✓ Dependencies installed (742 packages)", delay: 5000 },
    { message: "Running build command: npm run build", delay: 1000 },
    { message: "> next build", delay: 2000 },
    { message: "info - Linting and checking validity of types...", delay: 3000 },
    { message: "info - Creating an optimized production build...", delay: 4000 },
    { message: "✓ Build completed successfully", delay: 2000 },
    { message: "Optimizing images...", delay: 1000 },
    { message: "✓ Images optimized (67% reduction)", delay: 2000 },
    { message: "Uploading to CDN...", delay: 3000 },
    { message: "✓ Deploy successful", delay: 1000, status: "success" },
    { message: `Site published to https://deploy-${deploymentId}.gitship.app`, delay: 500 },
  ];

  let logs = "";
  
  for (const step of buildSteps) {
    await new Promise(resolve => setTimeout(resolve, step.delay));
    
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${step.message}`;
    logs += logEntry + "\n";
    
    // Update deployment status if specified
    if (step.status) {
      await storage.updateDeployment(deploymentId, {
        status: step.status,
        buildLogs: logs,
        ...(step.status === "success" && {
          completedAt: new Date(),
          deployUrl: `https://deploy-${deploymentId}.gitship.app`,
          buildTime: Math.floor((Date.now() - deployment.startedAt!.getTime()) / 1000),
        }),
      });
    } else {
      await storage.updateDeployment(deploymentId, { buildLogs: logs });
    }
    
    // Broadcast log to connected WebSocket clients
    broadcastBuildLog(deploymentId, logEntry);
  }
}

function broadcastBuildLog(deploymentId: number, logEntry: string) {
  // This would be implemented with access to the WebSocket server
  // For now, we'll just log to console
  console.log(`[Deployment ${deploymentId}] ${logEntry}`);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Analytics routes
  app.get('/api/projects/:id/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const analytics = await storage.getProjectAnalytics(projectId);
      
      // If no analytics exist, create sample data for demonstration
      if (analytics.length === 0) {
        await storage.updateAnalytics(projectId, {
          pageViews: 1247,
          uniqueVisitors: 856,
          bandwidth: 2340000000, // 2.34 GB
          avgLoadTime: 1100, // 1.1s
        });
        
        const newAnalytics = await storage.getProjectAnalytics(projectId);
        return res.json(newAnalytics);
      }
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Environment variables routes
  app.get('/api/projects/:id/environment-variables', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const envVars = await storage.getEnvironmentVariables(projectId);
      res.json(envVars);
    } catch (error) {
      console.error("Error fetching environment variables:", error);
      res.status(500).json({ message: "Failed to fetch environment variables" });
    }
  });

  app.post('/api/projects/:id/environment-variables', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const { key, value } = req.body;
      const envVar = await storage.setEnvironmentVariable(projectId, key, value);
      res.json(envVar);
    } catch (error) {
      console.error("Error creating environment variable:", error);
      res.status(500).json({ message: "Failed to create environment variable" });
    }
  });

  app.delete('/api/projects/:id/environment-variables/:key', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      await storage.deleteEnvironmentVariable(projectId, req.params.key);
      res.json({ message: "Environment variable deleted successfully" });
    } catch (error) {
      console.error("Error deleting environment variable:", error);
      res.status(500).json({ message: "Failed to delete environment variable" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
