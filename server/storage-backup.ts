import {
  users,
  projects,
  deployments,
  functions,
  analytics,
  environmentVariables,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type Deployment,
  type InsertDeployment,
  type Function,
  type InsertFunction,
  type Analytics,
  type EnvironmentVariable,
  type InsertEnvironmentVariable,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Project operations
  getUserProjects(userId: string): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: number): Promise<void>;
  
  // Deployment operations
  getProjectDeployments(projectId: number): Promise<Deployment[]>;
  getDeployment(id: number): Promise<Deployment | undefined>;
  createDeployment(deployment: InsertDeployment): Promise<Deployment>;
  updateDeployment(id: number, updates: Partial<InsertDeployment>): Promise<Deployment>;
  getLatestDeployment(projectId: number): Promise<Deployment | undefined>;
  
  // Function operations
  getProjectFunctions(projectId: number): Promise<Function[]>;
  createFunction(func: InsertFunction): Promise<Function>;
  updateFunction(id: number, updates: Partial<InsertFunction>): Promise<Function>;
  
  // Analytics operations
  getProjectAnalytics(projectId: number, days?: number): Promise<Analytics[]>;
  updateAnalytics(projectId: number, data: Partial<Analytics>): Promise<void>;
  
  // Environment variables operations
  getEnvironmentVariables(projectId: number): Promise<EnvironmentVariable[]>;
  setEnvironmentVariable(projectId: number, key: string, value: string): Promise<EnvironmentVariable>;
  deleteEnvironmentVariable(projectId: number, key: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Project operations
  async getUserProjects(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(and(eq(projects.userId, userId), eq(projects.isActive, true)))
      .orderBy(desc(projects.updatedAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values({
        name: project.name,
        description: project.description,
        repositoryUrl: project.repositoryUrl,
        githubRepoId: project.githubRepoId,
        branch: project.branch || "main",
        framework: project.framework,
        buildCommand: project.buildCommand || "npm run build",
        outputDirectory: project.outputDirectory || "dist",
        userId: project.userId,
        isActive: project.isActive ?? true,
        customDomain: project.customDomain,
        sslEnabled: project.sslEnabled ?? false,
      })
      .returning();
    return newProject;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: number): Promise<void> {
    await db
      .update(projects)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(projects.id, id));
  }

  // Deployment operations
  async getProjectDeployments(projectId: number): Promise<Deployment[]> {
    return await db
      .select()
      .from(deployments)
      .where(eq(deployments.projectId, projectId))
      .orderBy(desc(deployments.createdAt))
      .limit(20);
  }

  async getDeployment(id: number): Promise<Deployment | undefined> {
    const [deployment] = await db
      .select()
      .from(deployments)
      .where(eq(deployments.id, id));
    return deployment;
  }

  async createDeployment(deployment: InsertDeployment): Promise<Deployment> {
    const [newDeployment] = await db
      .insert(deployments)
      .values(deployment)
      .returning();
    return newDeployment;
  }

  async updateDeployment(id: number, updates: Partial<InsertDeployment>): Promise<Deployment> {
    const [deployment] = await db
      .update(deployments)
      .set(updates)
      .where(eq(deployments.id, id))
      .returning();
    return deployment;
  }

  async getLatestDeployment(projectId: number): Promise<Deployment | undefined> {
    const [deployment] = await db
      .select()
      .from(deployments)
      .where(eq(deployments.projectId, projectId))
      .orderBy(desc(deployments.createdAt))
      .limit(1);
    return deployment;
  }

  // Function operations
  async getProjectFunctions(projectId: number): Promise<Function[]> {
    return await db
      .select()
      .from(functions)
      .where(and(eq(functions.projectId, projectId), eq(functions.isActive, true)))
      .orderBy(desc(functions.createdAt));
  }

  async createFunction(func: InsertFunction): Promise<Function> {
    const [newFunction] = await db
      .insert(functions)
      .values(func)
      .returning();
    return newFunction;
  }

  async updateFunction(id: number, updates: Partial<InsertFunction>): Promise<Function> {
    const [func] = await db
      .update(functions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(functions.id, id))
      .returning();
    return func;
  }

  // Analytics operations
  async getProjectAnalytics(projectId: number, days: number = 7): Promise<Analytics[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await db
      .select()
      .from(analytics)
      .where(and(
        eq(analytics.projectId, projectId),
        // gte(analytics.date, startDate)
      ))
      .orderBy(desc(analytics.date))
      .limit(days);
  }

  async updateAnalytics(projectId: number, data: Partial<Analytics>): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await db
      .insert(analytics)
      .values({
        projectId,
        date: today,
        ...data,
      })
      .onConflictDoUpdate({
        target: [analytics.projectId, analytics.date],
        set: data,
      });
  }

  // Environment variables operations
  async getEnvironmentVariables(projectId: number): Promise<EnvironmentVariable[]> {
    return await db
      .select()
      .from(environmentVariables)
      .where(eq(environmentVariables.projectId, projectId))
      .orderBy(environmentVariables.key);
  }

  async setEnvironmentVariable(projectId: number, key: string, value: string): Promise<EnvironmentVariable> {
    const [envVar] = await db
      .insert(environmentVariables)
      .values({
        projectId,
        key,
        value, // In production, this should be encrypted
        isSecret: true,
      })
      .onConflictDoUpdate({
        target: [environmentVariables.projectId, environmentVariables.key],
        set: {
          value,
          updatedAt: new Date(),
        },
      })
      .returning();
    return envVar;
  }

  async deleteEnvironmentVariable(projectId: number, key: string): Promise<void> {
    await db
      .delete(environmentVariables)
      .where(and(
        eq(environmentVariables.projectId, projectId),
        eq(environmentVariables.key, key)
      ));
  }
}

export const storage = new DatabaseStorage();
        eq(environmentVariables.projectId, projectId),
        eq(environmentVariables.key, key)
      ));
  }
        ...data,
      })
      .onConflictDoUpdate({
        target: [analytics.projectId, analytics.date],
        set: data,
      });
  }
}

export const storage = new DatabaseStorage();
