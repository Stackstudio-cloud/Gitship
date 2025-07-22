import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertProjectSchema, insertDeploymentSchema } from "@shared/schema";
import { GitHubService } from "./github";
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

  // GitHub OAuth routes
  app.get('/api/auth/github', isAuthenticated, async (req, res) => {
    try {
      const authUrl = GitHubService.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      console.error("Error generating GitHub auth URL:", error);
      res.status(500).json({ message: "Failed to generate GitHub auth URL" });
    }
  });

  app.get('/api/auth/github/callback', isAuthenticated, async (req: any, res) => {
    try {
      const { code } = req.query;
      
      if (!code) {
        return res.status(400).json({ message: "Authorization code required" });
      }

      // Exchange code for access token
      const accessToken = await GitHubService.exchangeCodeForToken(code as string);
      
      // Get GitHub user info
      const githubService = new GitHubService(accessToken);
      const githubUser = await githubService.getCurrentUser();
      
      // Update user with GitHub info
      const userId = req.user.claims.sub;
      await storage.updateUserGitHubInfo(userId, {
        githubAccessToken: accessToken, // In production, encrypt this
        githubUsername: githubUser.login,
        githubId: githubUser.id.toString(),
      });

      res.redirect('/dashboard?github=connected');
    } catch (error) {
      console.error("Error in GitHub OAuth callback:", error);
      res.redirect('/dashboard?github=error');
    }
  });

  // GitHub repositories route
  app.get('/api/github/repositories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.githubAccessToken) {
        return res.status(400).json({ message: "GitHub account not connected" });
      }

      const githubService = new GitHubService(user.githubAccessToken);
      const repositories = await githubService.getUserRepositories();
      
      res.json(repositories);
    } catch (error) {
      console.error("Error fetching GitHub repositories:", error);
      res.status(500).json({ message: "Failed to fetch repositories" });
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

  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.githubAccessToken) {
        return res.status(400).json({ message: "GitHub account not connected. Please connect your GitHub account first." });
      }

      const projectData = insertProjectSchema.parse({
        ...req.body,
        userId,
      });

      // Parse GitHub repository info
      const repoInfo = GitHubService.parseRepositoryUrl(projectData.repositoryUrl);
      if (!repoInfo) {
        return res.status(400).json({ message: "Invalid GitHub repository URL" });
      }

      // Verify user has access to the repository
      const githubService = new GitHubService(user.githubAccessToken);
      try {
        const repoData = await githubService.getRepository(repoInfo.owner, repoInfo.repo);
        
        // Auto-detect framework if not specified
        let framework = projectData.framework;
        if (!framework) {
          framework = await githubService.detectFramework(repoInfo.owner, repoInfo.repo);
        }

        const project = await storage.createProject({
          ...projectData,
          githubOwner: repoInfo.owner,
          githubRepo: repoInfo.repo,
          githubRepoId: repoData.id.toString(),
          framework: framework || 'static',
        });

        // Create webhook for auto-deployments
        try {
          const webhookUrl = `${req.protocol}://${req.hostname}/api/webhooks/github`;
          await githubService.createWebhook(repoInfo.owner, repoInfo.repo, webhookUrl);
        } catch (webhookError) {
          console.warn("Failed to create webhook:", webhookError);
          // Continue without webhook - manual deployments will still work
        }

        // Create initial deployment
        const deployment = await storage.createDeployment({
          projectId: project.id,
          commitHash: 'initial',
          commitMessage: 'Initial deployment',
          branch: project.branch || 'main',
          status: 'queued',
          startedAt: new Date(),
        });

        res.json({ project, deployment });
      } catch (repoError: any) {
        if (repoError.status === 404) {
          return res.status(404).json({ message: "Repository not found or access denied" });
        }
        throw repoError;
      }
    } catch (error) {
      console.error("Error creating project:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
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
        commitHash: `deploy-${Date.now()}`,
        commitMessage: req.body.commitMessage || 'Manual deployment',
        branch: project.branch || 'main',
        status: 'queued',
        startedAt: new Date(),
      });
      
      // Start build process (simulated)
      setTimeout(async () => {
        try {
          await storage.updateDeployment(deployment.id, {
            status: 'building',
            buildLogs: 'Building project...\nInstalling dependencies...\nRunning build command...\n',
          });
          
          // Simulate build completion
          setTimeout(async () => {
            await storage.updateDeployment(deployment.id, {
              status: 'success',
              buildLogs: 'Building project...\nInstalling dependencies...\nRunning build command...\nBuild completed successfully!\n',
              deployUrl: `https://${project.name.toLowerCase()}-${deployment.id}.gitship.app`,
              previewUrl: `https://preview-${deployment.id}.gitship.app`,
              buildTime: Math.floor(Math.random() * 120) + 30,
              completedAt: new Date(),
            });
          }, 5000);
        } catch (error) {
          console.error("Build process failed:", error);
          await storage.updateDeployment(deployment.id, {
            status: 'failed',
            buildLogs: 'Building project...\nInstalling dependencies...\nRunning build command...\nError: Build failed\n',
            completedAt: new Date(),
          });
        }
      }, 1000);
      
      res.json(deployment);
    } catch (error) {
      console.error("Error creating deployment:", error);
      res.status(500).json({ message: "Failed to create deployment" });
    }
  });

  // Team secrets routes
  app.get('/api/team-secrets', isAuthenticated, async (req, res) => {
    try {
      const secrets = await storage.getTeamSecrets();
      // Don't return actual values for security
      const sanitizedSecrets = secrets.map(s => ({
        ...s,
        value: '***'
      }));
      res.json(sanitizedSecrets);
    } catch (error) {
      console.error("Error fetching team secrets:", error);
      res.status(500).json({ message: "Failed to fetch team secrets" });
    }
  });

  app.post('/api/team-secrets', isAuthenticated, async (req: any, res) => {
    try {
      const { key, value, description } = req.body;
      const userId = req.user.claims.sub;
      
      if (!key || !value) {
        return res.status(400).json({ message: "Key and value are required" });
      }
      
      const secret = await storage.setTeamSecret(key, value, description, userId);
      res.json({ ...secret, value: '***' });
    } catch (error) {
      console.error("Error creating team secret:", error);
      res.status(500).json({ message: "Failed to create team secret" });
    }
  });

  app.delete('/api/team-secrets/:key', isAuthenticated, async (req, res) => {
    try {
      const { key } = req.params;
      await storage.deleteTeamSecret(key);
      res.json({ message: "Team secret deleted successfully" });
    } catch (error) {
      console.error("Error deleting team secret:", error);
      res.status(500).json({ message: "Failed to delete team secret" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Add WebSocket support for real-time build logs
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'subscribe') {
          // Subscribe to deployment updates
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

  return httpServer;
}